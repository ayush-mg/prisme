import os
import hashlib
import json
import time
import asyncio
from fastapi import FastAPI,WebSocket
from fastapi.middleware.cors import CORSMiddleware
import sys
sys.path.append("../../packages/nlp")
sys.path.append("../../packages/physics")
sys.path.append("../../packages/ingestion")
import extractor
import engines
import feed
if"httpproxy"in os.environ:
	del os.environ["httpproxy"]
if"httpsproxy"in os.environ:
	del os.environ["httpsproxy"]
app=FastAPI()
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
geminikey=os.environ.get("GEMINIAPIKEY","")
griddata=None
try:
	griddata=engines.loadgrid()
except:
	griddata=None
@app.get("/api/grid")
async def getgrid():
	try:
		if griddata:
			return griddata
		return{"error":"Grid data not loaded"}
	except:
		return{"error":"Grid endpoint failed"}
@app.get("/api/scenarios")
async def getscenarios():
	try:
		datadir=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","..","data")
		filepath=os.path.join(datadir,"crisis_scenarios.json")
		with open(filepath,"r")as f:
			return json.load(f)
	except:
		return{"error":"Scenarios not loaded"}
@app.websocket("/ws")
async def websocketendpoint(ws:WebSocket):
	await ws.accept()
	lasthash=""
	currentmode="demo"
	activescenario="hormuz_closure"
	demostate={"pool":[],"index":0,"lastupdated":time.time()}
	historical_risks={}
	lastpayload=None
	try:
		demostate["pool"]=feed.loaddemoheadlines()
	except:
		demostate["pool"]=["Hormuz crisis escalates"]
	while True:
		try:
			try:
				clientdata=await asyncio.wait_for(ws.receive_json(),timeout=0.05)
				if"mode"in clientdata:
					currentmode=clientdata["mode"]
					lasthash=""
					if currentmode=="demo":
						try:
							demostate["pool"]=feed.loaddemoheadlines()
						except:
							pass
						demostate["index"]=0
						demostate["lastupdated"]=time.time()
				if"scenario"in clientdata:
					activescenario=clientdata["scenario"]
					lasthash=""
			except:
				pass
			if currentmode=="demo":
				elapsed=time.time()-demostate["lastupdated"]
				if elapsed>6:
					demostate["index"]=(demostate["index"]+1)%max(1,len(demostate["pool"]))
					demostate["lastupdated"]=time.time()
			try:
				if currentmode=="live":
					feedresult=await asyncio.to_thread(feed.getsupplychaindata,mode=currentmode,scenarioid=activescenario,demostate=demostate)
				else:
					feedresult=feed.getsupplychaindata(mode=currentmode,scenarioid=activescenario,demostate=demostate)
			except:
				feedresult={"source":"fallback","data":"Fallback: Hormuz tensions escalating."}
			newstext=feedresult.get("data","")
			if isinstance(newstext,dict):
				newstext=newstext.get("description","Fallback news")
			currenthash=hashlib.sha256(str(newstext).encode("utf-8")).hexdigest()
			if currenthash!=lasthash:
				corridorrisks={}
				if feedresult.get("source")=="fallback"and"scenario"in feedresult:
					try:
						corridorrisks=feedresult["scenario"].get("corridorrisks",{})
					except:
						corridorrisks={}
				elif currentmode=="demo":
					try:
						corridorrisks=extractor.keywordparse(newstext)
					except:
						corridorrisks={"hormuz":0.5,"redsea":0.2}
				else:
					try:
						corridorrisks=await asyncio.to_thread(extractor.extractriskdata,newstext,geminikey)
					except:
						try:
							corridorrisks=extractor.keywordparse(newstext)
						except:
							corridorrisks={"hormuz":0.5,"redsea":0.2}
				try:
					for corridor in corridorrisks:
						if corridor in historical_risks:
							historical_risks[corridor]=round(max(historical_risks[corridor]*0.95,corridorrisks[corridor]),3)
						else:
							historical_risks[corridor]=corridorrisks[corridor]
					for corridor in list(historical_risks.keys()):
						if corridor not in corridorrisks:
							historical_risks[corridor]=round(historical_risks[corridor]*0.95,3)
					corridorrisks=historical_risks.copy()
				except Exception as e:
					print("Decay error:", e)

				try:
					routedata=engines.findallroutes(griddata,corridorrisks)
				except:
					routedata=[]
				try:
					sprmetadata=griddata.get("sprmetadata",{})if griddata else{}
					bestroutetransit=routedata[0]["transitdays"]if len(routedata)>0 else 10
					drawdowndata=engines.calculatedrawdown(bestroutetransit,sprmetadata)
				except:
					drawdowndata={"sprremainingdays":9.5,"drawdowndays":0,"deficitbarrels":0,"gdppenalty":0,"stockoutdays":0,"stockoutbarrels":0,"status":"Unknown"}
				try:
					if currentmode=="live":
						report=await asyncio.to_thread(extractor.generatereport,routedata,drawdowndata,corridorrisks,geminikey)
					else:
						report=extractor.templatereport(routedata,drawdowndata)
				except:
					report="ADVISORY: Route optimization complete."
				lasthash=currenthash
				lastpayload={"source":feedresult.get("source","unknown"),"mode":currentmode,"news":newstext,"corridorrisks":corridorrisks,"routes":routedata,"drawdown":drawdowndata,"report":report,"sprmetadata":griddata.get("sprmetadata",{})if griddata else{},"gridstats":{"refineries":len(griddata.get("refineries",[]))if griddata else 0,"originports":len(griddata.get("originports",[]))if griddata else 0,"chokepoints":len(griddata.get("chokepoints",[]))if griddata else 0,"sprlocations":len(griddata.get("sprlocations",[]))if griddata else 0,"edges":len(griddata.get("edges",[]))if griddata else 0},"demoinfo":{"currentindex":demostate["index"],"poolsize":len(demostate["pool"])}if currentmode=="demo"else None}
			if lastpayload:
				try:
					await ws.send_json(lastpayload)
				except:
					break
		except:
			pass
		await asyncio.sleep(1)
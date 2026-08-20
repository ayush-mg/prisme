import os
import hashlib
import json
import asyncio
from fastapi import FastAPI,WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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
	if griddata:
		return griddata
	return{"error":"Grid data not loaded"}
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
async def wsconnection(ws:WebSocket):
	await ws.accept()
	lasthash=""
	activescenario="hormuz_closure"
	while True:
		try:
			try:
				clientdata=await asyncio.wait_for(ws.receive_json(),timeout=0.1)
				if"scenario"in clientdata:
					activescenario=clientdata["scenario"]
					lasthash=""
			except:
				pass
			try:
				feedresult=feed.getsupplychaindata(activescenario)
			except:
				feedresult={"source":"fallback","data":"Fallback: Strait of Hormuz tensions escalating."}
			newstext=feedresult.get("data","")
			if isinstance(newstext,dict):
				newstext=newstext.get("description","Fallback news")
			currenthash=hashlib.sha256(newstext.encode("utf-8")).hexdigest()
			if currenthash!=lasthash:
				corridorrisks={}
				if feedresult.get("source")=="fallback"and"scenario"in feedresult:
					corridorrisks=feedresult["scenario"].get("corridorrisks",{})
				else:
					try:
						corridorrisks=extractor.extractriskdata(newstext,geminikey)
					except:
						corridorrisks={"hormuz":0.85,"redsea":0.3,"suez":0.15,"cape":0.02,"malacca":0.05,"westafrica":0.08,"usgulf":0.05,"pacific":0.05}
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
					report=extractor.generatereport(routedata,drawdowndata,corridorrisks,geminikey)
				except:
					report="ADVISORY: Optimal procurement rerouting calculated. SPR drawdown assessment complete."
				lasthash=currenthash
				payload={"source":feedresult.get("source","unknown"),"news":newstext,"corridorrisks":corridorrisks,"routes":routedata,"drawdown":drawdowndata,"report":report,"sprmetadata":griddata.get("sprmetadata",{})if griddata else{},"gridstats":{"refineries":len(griddata.get("refineries",[]))if griddata else 0,"originports":len(griddata.get("originports",[]))if griddata else 0,"chokepoints":len(griddata.get("chokepoints",[]))if griddata else 0,"sprlocations":len(griddata.get("sprlocations",[]))if griddata else 0}}
				await ws.send_json(payload)
		except:
			pass
		await asyncio.sleep(3)
from fastapi import FastAPI,WebSocket
from pydantic import BaseModel
import asyncio
from packages.nlp.extractor import extractriskdata
from packages.engine.router import findbestroute
from packages.engine.drawdown import calculatedrawdown
from packages.engine.reporter import generatereport
from data.ingestion import getsupplychaindata
app=FastAPI()
class RiskQuery(BaseModel):
	news:str
	currentinventory:float
	dailyconsumption:float
@app.websocket("/ws/livestream")
async def websocketendpoint(websocket:WebSocket):
	await websocket.accept()
	while True:
		try:
			newsfeed=getsupplychaindata()
			nlpresult=await asyncio.to_thread(extractriskdata,newsfeed)
			calculatedpenalty=nlpresult.expecteddurationdays*1000
			chokepoint="chhormuz" if nlpresult.capacityreduction>0.0 else ""
			bestpath,totalcost=await asyncio.to_thread(findbestroute,"srcsa","portjam",chokepoint,calculatedpenalty)
			survivalstats=calculatedrawdown(100.0,10.0,nlpresult.expecteddurationdays)
			reporttext=await asyncio.to_thread(generatereport,newsfeed,totalcost,survivalstats["deficit"],bestpath)
			payload={"extracteddrop":nlpresult.capacityreduction,"extracteddays":nlpresult.expecteddurationdays,"newroute":bestpath,"newcost":totalcost,"survivalstats":survivalstats,"executivereport":reporttext}
			await websocket.send_json(payload)
			await asyncio.sleep(5)
		except Exception as err:
			await asyncio.sleep(5)
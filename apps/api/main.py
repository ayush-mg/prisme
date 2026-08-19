from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
from packages.nlp.extractor import extractriskdata
from packages.engine.router import findbestroute
from packages.engine.drawdown import calculatedrawdown
from packages.engine.reporter import generatereport
app=FastAPI()
class RiskQuery(BaseModel):
	news:str
	currentinventory:float
	dailyconsumption:float
@app.post("/api/v1/analyze")
async def analyzerisk(query:RiskQuery):
	nlpresult=await asyncio.to_thread(extractriskdata,query.news)
	calculatedpenalty=nlpresult.expecteddurationdays*1000
	chokepoint="chhormuz" if nlpresult.capacityreduction>0.0 else ""
	bestpath,totalcost=await asyncio.to_thread(findbestroute,"srcsa","portjam",chokepoint,calculatedpenalty)
	survivalstats=calculatedrawdown(query.currentinventory,query.dailyconsumption,nlpresult.expecteddurationdays)
	reporttext=await asyncio.to_thread(generatereport,query.news,totalcost,survivalstats["deficit"],bestpath)
	return {"extracteddrop":nlpresult.capacityreduction,"extracteddays":nlpresult.expecteddurationdays,"newroute":bestpath,"newcost":totalcost,"survivalstats":survivalstats,"executivereport":reporttext}
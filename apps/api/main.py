from fastapi import FastAPI
from pydantic import BaseModel
from packages.nlp.extractor import extractriskdata
from packages.engine.router import findbestroute
app=FastAPI()
class RiskQuery(BaseModel):
	news:str
@app.post("/api/v1/analyze")
def analyzerisk(query:RiskQuery):
	nlpresult=extractriskdata(query.news)
	calculatedpenalty=nlpresult.expecteddurationdays*1000
	chokepoint="chhormuz" if nlpresult.capacityreduction>0.0 else ""
	bestpath,totalcost=findbestroute(startid="srcsa",endid="portjam",disruptednode=chokepoint,penalty=calculatedpenalty)
	return {"extracteddrop":nlpresult.capacityreduction,"extracteddays":nlpresult.expecteddurationdays,"newroute":bestpath,"newcost":totalcost}
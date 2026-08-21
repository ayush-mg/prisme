import os
import urllib.request
import json
if"httpproxy"in os.environ:
	del os.environ["httpproxy"]
if"httpsproxy"in os.environ:
	del os.environ["httpsproxy"]
KEYWORDRISKMAP={
	"hormuz":[("hormuz",0.9),("iran",0.6),("persian gulf",0.5),("irgc",0.8),("kharg",0.7),("basra",0.5),("kuwait",0.4),("naval mine",0.85),("tanker seiz",0.8)],
	"redsea":[("red sea",0.9),("houthi",0.85),("bab el",0.9),("yemen",0.7),("aden",0.6),("anti-ship missile",0.8),("yanbu",0.4),("jeddah",0.3)],
	"suez":[("suez",0.9),("canal block",0.95),("canal clos",0.95),("egypt",0.3),("mediterran",0.2),("novorossiysk",0.3),("ceyhan",0.3),("murmansk",0.2),("primorsk",0.2),("ust-luga",0.2)],
	"cape":[("cape of good",0.3),("cape route",0.2),("south africa",0.15)],
	"malacca":[("malacca",0.8),("strait of malacca",0.9),("singapore",0.3),("south china sea",0.4),("taiwan",0.3),("piracy",0.4)],
	"westafrica":[("nigeria",0.6),("bonny",0.7),("angola",0.5),("luanda",0.5),("escravos",0.6),("ghana",0.4),("tema",0.4),("west afric",0.5),("pipeline vandal",0.7)],
	"usgulf":[("houston",0.5),("loop terminal",0.6),("us gulf",0.5),("gulf of mexico",0.4),("hurricane",0.6),("guaymas",0.3)],
	"pacific":[("kozmino",0.6),("pacific",0.3),("arctic",0.3),("northern sea route",0.4)],
	"americas":[("venezuela",0.6),("puerto la cruz",0.7),("jose terminal",0.7),("caracas",0.5),("pdvsa",0.6),("brazil",0.3),("guyana",0.2),("angra dos reis",0.3)]
}
def keywordparse(text):
	lowered=text.lower()
	risks={}
	for corridor,keywords in KEYWORDRISKMAP.items():
		maxrisk=0.0
		for keyword,weight in keywords:
			if keyword in lowered:
				maxrisk=max(maxrisk,weight)
		risks[corridor]=round(min(maxrisk,1.0),2)
	if"blockade"in lowered or"closure"in lowered or"closed"in lowered:
		for corridor in risks:
			if risks[corridor]>0.3:
				risks[corridor]=min(risks[corridor]+0.2,1.0)
	if"suspend"in lowered or"halt"in lowered:
		for corridor in risks:
			if risks[corridor]>0.2:
				risks[corridor]=min(risks[corridor]+0.15,1.0)
	if"90 percent"in lowered or"100 percent"in lowered or"100%"in lowered:
		for corridor in risks:
			if risks[corridor]>0.2:
				risks[corridor]=min(risks[corridor]+0.25,1.0)
	return risks
def extractriskdata(articletext,apikey):
	if not apikey or len(apikey)<10:
		return keywordparse(articletext)
	url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+apikey
	prompt="You are a maritime geopolitical risk analyst. From the following news, extract disruption probability scores (0.0 to 1.0) for each corridor. Return ONLY valid JSON with these keys: hormuz, redsea, suez, cape, malacca, westafrica, usgulf, pacific, americas. News: "+articletext[:800]
	payload={"contents":[{"parts":[{"text":prompt}]}]}
	data=json.dumps(payload).encode("utf-8")
	req=urllib.request.Request(url,data=data,headers={"Content-Type":"application/json"})
	try:
		with urllib.request.urlopen(req,timeout=10)as response:
			result=json.loads(response.read().decode("utf-8"))
			text=result["candidates"][0]["content"]["parts"][0]["text"]
			text=text.replace("```json","").replace("```","").strip()
			parsed=json.loads(text)
			return parsed
	except:
		return keywordparse(articletext)
def generatereport(routedata,drawdowndata,corridorrisks,apikey):
	if not apikey or len(apikey)<10:
		return templatereport(routedata,drawdowndata)
	url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+apikey
	bestroute=routedata[0]if len(routedata)>0 else{}
	context=json.dumps({"bestroute":{"origin":bestroute.get("origin","Unknown"),"destination":bestroute.get("destination","Unknown"),"transitdays":bestroute.get("transitdays",0),"totalcost":bestroute.get("totalcost",0),"chokepoints":bestroute.get("chokepoints",[])},"sprstatus":{"remaining":drawdowndata.get("sprremainingdays",9.5),"status":drawdowndata.get("status","Unknown"),"gdpimpact":drawdowndata.get("gdppenalty",0)},"routesanalyzed":len(routedata)})
	prompt="You are a senior energy security advisor briefing the Indian Cabinet Committee on Security. Write exactly 2 sentences. First sentence: the recommended procurement action. Second sentence: the SPR reserve status. Be specific with numbers. Data: "+context
	payload={"contents":[{"parts":[{"text":prompt}]}]}
	data=json.dumps(payload).encode("utf-8")
	req=urllib.request.Request(url,data=data,headers={"Content-Type":"application/json"})
	try:
		with urllib.request.urlopen(req,timeout=10)as response:
			result=json.loads(response.read().decode("utf-8"))
			text=result["candidates"][0]["content"]["parts"][0]["text"]
			return text
	except:
		return templatereport(routedata,drawdowndata)
def templatereport(routedata,drawdowndata):
	if len(routedata)==0:
		return"ADVISORY: No viable routes calculated. Immediate SPR drawdown authorized."
	best=routedata[0]
	origin=best.get("origin","Unknown")
	dest=best.get("destination","Unknown")
	days=best.get("transitdays",0)
	sprdays=drawdowndata.get("sprremainingdays",9.5)
	status=drawdowndata.get("status","Unknown")
	return"ADVISORY: Optimal procurement rerouting via "+origin+" to "+dest+" at "+str(days)+" transit days across "+str(len(routedata))+" analyzed routes. SPR reserves at "+str(sprdays)+" days coverage, status: "+status+"."
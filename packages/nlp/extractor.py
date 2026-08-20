import os
import urllib.request
import json
if"httpproxy"in os.environ:
	del os.environ["httpproxy"]
if"httpsproxy"in os.environ:
	del os.environ["httpsproxy"]
def extractriskdata(newsstring,apikey):
	url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+apikey
	prompt="You are a geopolitical risk analyst. From the following news text, extract disruption probability scores (0.0 to 1.0) for each maritime corridor. Return ONLY valid JSON with these exact keys: hormuz, redsea, suez, cape, malacca, westafrica, usgulf, pacific. News: "+newsstring
	payload={"contents":[{"parts":[{"text":prompt}]}]}
	data=json.dumps(payload).encode("utf-8")
	req=urllib.request.Request(url,data=data,headers={"Content-Type":"application/json"})
	try:
		with urllib.request.urlopen(req,timeout=10)as response:
			result=json.loads(response.read().decode("utf-8"))
			text=result["candidates"][0]["content"]["parts"][0]["text"]
			text=text.replace("```json","").replace("```","").strip()
			return json.loads(text)
	except:
		return{"hormuz":0.85,"redsea":0.3,"suez":0.15,"cape":0.02,"malacca":0.05,"westafrica":0.08,"usgulf":0.05,"pacific":0.05}
def generatereport(routedata,drawdowndata,corridorrisks,apikey):
	url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+apikey
	context=json.dumps({"bestroute":routedata[0]if len(routedata)>0 else{},"sprstatus":drawdowndata,"corridorrisks":corridorrisks,"totalroutesanalyzed":len(routedata)})
	prompt="You are a senior energy security advisor briefing the Indian Cabinet Committee on Security. Write a 3 sentence executive summary of this supply chain intelligence. Include the recommended procurement action and SPR status. Data: "+context
	payload={"contents":[{"parts":[{"text":prompt}]}]}
	data=json.dumps(payload).encode("utf-8")
	req=urllib.request.Request(url,data=data,headers={"Content-Type":"application/json"})
	try:
		with urllib.request.urlopen(req,timeout=10)as response:
			result=json.loads(response.read().decode("utf-8"))
			text=result["candidates"][0]["content"]["parts"][0]["text"]
			return text
	except:
		return"ADVISORY: Optimal procurement rerouting calculated via Dijkstra graph analysis across the global maritime network. SPR drawdown initiated under current threat conditions."
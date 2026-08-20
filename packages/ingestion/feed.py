import os
import json
import xml.etree.ElementTree as ET
import urllib.request
if"httpproxy"in os.environ:
	del os.environ["httpproxy"]
if"httpsproxy"in os.environ:
	del os.environ["httpsproxy"]
RSSFEEDS=[
	"https://news.google.com/rss/search?q=strait+of+hormuz+OR+red+sea+shipping+OR+oil+tanker+attack+OR+iran+sanctions+crude&hl=en-US&gl=US&ceid=US:en",
	"https://news.google.com/rss/search?q=india+crude+oil+import+OR+suez+canal+disruption+OR+energy+crisis&hl=en-US&gl=US&ceid=US:en"
]
DATADIR=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","..","data")
def fetchlivenews():
	headlines=[]
	for feedurl in RSSFEEDS:
		try:
			req=urllib.request.Request(feedurl,headers={"User-Agent":"Mozilla/5.0"})
			with urllib.request.urlopen(req,timeout=5)as response:
				xmldata=response.read().decode("utf-8")
				root=ET.fromstring(xmldata)
				for item in root.findall(".//item")[:5]:
					title=item.find("title")
					desc=item.find("description")
					headline=title.text if title is not None else""
					detail=desc.text if desc is not None else""
					if headline:
						headlines.append(headline+" "+detail)
		except:
			pass
	if len(headlines)>0:
		return" | ".join(headlines[:8])
	return None
def loadfallbackscenario(scenarioid="hormuz_closure"):
	try:
		filepath=os.path.join(DATADIR,"crisis_scenarios.json")
		with open(filepath,"r")as f:
			data=json.load(f)
		for scenario in data["scenarios"]:
			if scenario["id"]==scenarioid:
				return scenario
		return data["scenarios"][0]
	except:
		return{"id":"fallback","name":"Fallback","description":"Tensions in the Strait of Hormuz have escalated significantly. Maritime insurance suspended for all Hormuz transits.","corridorrisks":{"hormuz":0.95,"redsea":0.2,"suez":0.1,"cape":0.05,"malacca":0.05,"westafrica":0.1,"usgulf":0.08,"pacific":0.05},"estimateddurationdays":30,"pricespikepercent":45}
def getsupplychaindata(scenarioid="hormuz_closure"):
	livenews=fetchlivenews()
	if livenews is not None:
		return{"source":"live","data":livenews}
	fallback=loadfallbackscenario(scenarioid)
	return{"source":"fallback","data":fallback["description"],"scenario":fallback}

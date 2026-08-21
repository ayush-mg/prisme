import os
import json
import random
import time
import xml.etree.ElementTree as ET
import urllib.request
if"httpproxy"in os.environ:
	del os.environ["httpproxy"]
if"httpsproxy"in os.environ:
	del os.environ["httpsproxy"]
DATADIR=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","..","data")
RSSFEEDS=[
	"https://news.google.com/rss/search?q=strait+of+hormuz+OR+red+sea+shipping+OR+oil+tanker+attack+OR+iran+sanctions+crude&hl=en-US&gl=US&ceid=US:en",
	"https://news.google.com/rss/search?q=india+crude+oil+import+OR+suez+canal+disruption+OR+energy+crisis&hl=en-US&gl=US&ceid=US:en"
]
def loaddemoheadlines():
	try:
		filepath=os.path.join(DATADIR,"demo_headlines.json")
		with open(filepath,"r")as f:
			allheadlines=json.load(f)
		random.shuffle(allheadlines)
		return allheadlines[:55]
	except:
		return["Strait of Hormuz tensions escalate as Iran deploys naval assets","Red Sea shipping suspended after Houthi missile strikes","Russia oil exports halted by new Western sanctions package"]
def loadfallbackscenario(scenarioid):
	try:
		filepath=os.path.join(DATADIR,"crisis_scenarios.json")
		with open(filepath,"r")as f:
			data=json.load(f)
		for scenario in data["scenarios"]:
			if scenario["id"]==scenarioid:
				return scenario
		return data["scenarios"][0]
	except:
		return{"id":"fallback","name":"Fallback","description":"Hormuz transit suspended.","corridorrisks":{"hormuz":0.95,"redsea":0.2,"suez":0.1,"cape":0.05,"malacca":0.05,"westafrica":0.1,"usgulf":0.08,"pacific":0.05,"americas":0.05}}
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
					if title is not None and title.text:
						headlines.append(title.text)
		except:
			pass
	if len(headlines)>0:
		return" | ".join(headlines[:8])
	return None
def getsupplychaindata(mode="live",scenarioid="hormuz_closure",demostate=None):
	if mode=="demo"and demostate is not None:
		idx=demostate.get("index",0)
		pool=demostate.get("pool",[])
		if len(pool)==0:
			return{"source":"demo","data":"Demo mode active. No headlines loaded.","headline":"No data"}
		headline=pool[idx%len(pool)]
		return{"source":"demo","data":headline,"headline":headline}
	livenews=fetchlivenews()
	if livenews is not None:
		return{"source":"live","data":livenews}
	fallback=loadfallbackscenario(scenarioid)
	return{"source":"fallback","data":fallback["description"],"scenario":fallback}

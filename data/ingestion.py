import requests
import random
def fetchlivenews()->str:
	apiurl="https://api.livenews.com/v1/maritime"
	try:
		apiresponse=requests.get(apiurl,timeout=5)
		if apiresponse.ok:
			apidata=apiresponse.json()
			return apidata.get("headline","")
	except:
		pass
	return ""
def getdemodata()->str:
	demolist=["Strait of Hormuz military blockade reducing capacity by 90 percent for 15 days.","Suez Canal completely blocked by grounded vessel for 30 days.","Port of Jebel Ali experiencing severe labor strikes reducing throughput by 50 percent for 7 days.","Bab el Mandeb strait piracy surge forces total rerouting adding 20 days.","Severe typhoon damages Shanghai port cranes cutting capacity by 40 percent for 10 days.","Panama canal drought reduces daily transits by 40 percent for 60 days.","Cyberattack on major European port halts terminal operations for 3 days."]
	return random.choice(demolist)
def getsupplychaindata()->str:
	livedata=fetchlivenews()
	if not livedata:
		return getdemodata()
	return livedata
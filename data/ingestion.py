import requests
import random
import re
def striphtmltags(rawtext:str)->str:
	tagcleaner=re.compile('<.*?>')
	cleantext=re.sub(tagcleaner,'',rawtext)
	return cleantext.strip()
def fetchliverss()->str:
	rssfeeds=["https://www.maritime-executive.com/api/rss","https://gcaptain.com/feed/"]
	for targeturl in rssfeeds:
		try:
			apiresponse=requests.get(targeturl,timeout=5)
			if apiresponse.ok:
				rawcontent=apiresponse.text
				sanitizeddata=striphtmltags(rawcontent)
				return sanitizeddata[:1500]
		except Exception as err:
			continue
	return ""
def getdemodata()->str:
	demolist=["Strait of Hormuz military blockade reducing capacity by 90 percent for 15 days.","Suez Canal completely blocked by grounded vessel for 30 days.","Port of Jebel Ali experiencing severe labor strikes reducing throughput by 50 percent for 7 days.","Bab el Mandeb strait piracy surge forces total rerouting adding 20 days.","Severe typhoon damages Shanghai port cranes cutting capacity by 40 percent for 10 days.","Panama canal drought reduces daily transits by 40 percent for 60 days.","Cyberattack on major European port halts terminal operations for 3 days."]
	return random.choice(demolist)
def getsupplychaindata()->str:
	livedata=fetchliverss()
	if not livedata:
		return getdemodata()
	return livedata
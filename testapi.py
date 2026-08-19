import requests
def runapiproof():
	apiurl="http://127.0.0.1:8000/api/v1/analyze"
	payload={"news":"The Strait of Hormuz is experiencing military blockades reducing capacity by 90 percent for 15 days.","currentinventory":100.0,"dailyconsumption":10.0}
	noproxy={"http":None,"https":None}
	response=requests.post(apiurl,json=payload,proxies=noproxy)
	if response.status_code==200:
		print("Proof of Phase 4 Integration:")
		print(response.json())
	else:
		print("API CRASH DETECTED")
		print(response.text)
if __name__=="__main__":
	runapiproof()
import requests
def runapiproof():
	apiurl="http://127.0.0.1:8000/api/v1/analyze"
	payload={"news":"The Strait of Hormuz is experiencing military blockades reducing capacity by 90 percent for 15 days."}
	noproxy={"http":None,"https":None}
	print("Bypassing system proxy to contact Digital Twin...")
	response=requests.post(apiurl,json=payload,proxies=noproxy)
	print(f"Server Status Code: {response.status_code}")
	if response.status_code==200:
		print("Proof of End-to-End API Integration:")
		print(response.json())
	else:
		print("API CRASH DETECTED")
		print(response.text)
if __name__=="__main__":
	runapiproof()
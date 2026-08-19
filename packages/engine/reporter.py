import os
from google import genai
def generatereport(disruptiontext,costval,deficitval,routedata):
	apikey=os.getenv("geminiapikey")
	client=genai.Client(api_key=apikey)
	prompt=f"Explain disruption:{disruptiontext},cost:{costval},deficit:{deficitval},route:{routedata} detailing risk and fix."
	response=client.models.generate_content(model="gemini-2.5-flash",contents=prompt)
	return response.text
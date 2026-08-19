import os
import json
from google import genai
from google.genai import types
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()
class EventData(BaseModel):
	eventid:str
	capacityreduction:float
	expecteddurationdays:int
def extractriskdata(articletext:str)->EventData:
	geminiapikey=os.getenv("geminiapikey")
	client=genai.Client(api_key=geminiapikey)
	prompt=f"Extract capacity reduction percentage as float decimal and duration in days as integer. Return strict JSON with keys capacityreduction and expecteddurationdays. Text: {articletext}"
	config=types.GenerateContentConfig(response_mime_type="application/json")
	rawresponse=client.models.generate_content(model='gemini-2.5-flash',contents=prompt,config=config)
	extracteddict=json.loads(rawresponse.text)
	capacityreduction=float(extracteddict.get("capacityreduction",0.0))
	expecteddurationdays=int(extracteddict.get("expecteddurationdays",0))
	return EventData(eventid="evt01",capacityreduction=capacityreduction,expecteddurationdays=expecteddurationdays)
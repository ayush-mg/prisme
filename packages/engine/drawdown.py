def calculatedrawdown(currentinventory:float,dailyconsumption:float,disruptiondays:int,leadtime:int=2)->dict:
	totalneeded=dailyconsumption*disruptiondays
	deficit=totalneeded-currentinventory
	survives=deficit<=0
	daysleft=currentinventory/dailyconsumption if dailyconsumption>0 else 0
	optimalorder=deficit+(dailyconsumption*leadtime) if deficit>0 else 0
	return {"survives":survives,"deficit":deficit if deficit>0 else 0,"daysleft":daysleft,"suggestedorder":optimalorder}
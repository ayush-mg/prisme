def calculatedrawdown(currentinventory:float,dailyconsumption:float,disruptiondays:int)->dict:
	totalneeded=dailyconsumption*disruptiondays
	deficit=totalneeded-currentinventory
	survives=deficit<=0
	daysleft=currentinventory/dailyconsumption if dailyconsumption>0 else 0
	return {"survives":survives,"deficit":deficit if deficit>0 else 0,"daysleft":daysleft}
from packages.engine.router import findbestroute
def runroutingproof():
	normalpath,normallength=findbestroute(startid="srcsa",endid="portjam")
	print("Proof of Normal Route:")
	print(f"Path: {normalpath}")
	print(f"Distance/Cost: {normallength}")
	print("====================================")
	disruptedpath,disruptedlength=findbestroute(startid="srcsa",endid="portjam",disruptednode="chhormuz",penalty=10000)
	print("Proof of Disrupted Route:")
	print(f"Path: {disruptedpath}")
	print(f"Distance/Cost: {disruptedlength}")
if __name__=="__main__":
	runroutingproof()
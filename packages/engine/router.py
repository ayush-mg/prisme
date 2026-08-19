import networkx as nx
import random
def findbestroute(startid:str,endid:str,disruptednode:str,penalty:int)->tuple:
	graphobj=nx.Graph()
	graphobj.add_edge("srcsa","chhormuz",baseweight=2000)
	graphobj.add_edge("chhormuz","portjam",baseweight=2000)
	graphobj.add_edge("srcsa","chbab",baseweight=1500)
	graphobj.add_edge("chbab","portjam",baseweight=2000)
	pathcounts={}
	for simrun in range(100):
		tempmap=graphobj.copy()
		for nodeu,nodev,edgedata in tempmap.edges(data=True):
			variance=random.uniform(0.8,1.2)
			tempmap[nodeu][nodev]["weight"]=edgedata["baseweight"]*variance
		if disruptednode in tempmap.nodes:
			for neighbor in tempmap.neighbors(disruptednode):
				tempmap[disruptednode][neighbor]["weight"]+=penalty
		currentpath=tuple(nx.shortest_path(tempmap,source=startid,target=endid,weight="weight"))
		pathcounts[currentpath]=pathcounts.get(currentpath,0)+1
	bestpath=max(pathcounts,key=pathcounts.get)
	totalcost=nx.shortest_path_length(tempmap,source=startid,target=endid,weight="weight")
	return list(bestpath),totalcost
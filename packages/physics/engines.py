import os
import json
import networkx as nx
DATADIR=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","..","data")
def loadgrid():
	filepath=os.path.join(DATADIR,"india_energy_grid.json")
	with open(filepath,"r")as f:
		return json.load(f)
def buildgraph(griddata,corridorrisks):
	G=nx.Graph()
	allnodes={}
	for r in griddata.get("refineries",[]):
		allnodes[r["name"]]=r
		G.add_node(r["name"],lat=r["lat"],lng=r["lng"],nodetype="refinery",capacity=r.get("capacity",0))
	for s in griddata.get("sprlocations",[]):
		allnodes[s["name"]]=s
		G.add_node(s["name"],lat=s["lat"],lng=s["lng"],nodetype="spr",capacity=s.get("capacity",0))
	for o in griddata.get("originports",[]):
		allnodes[o["name"]]=o
		G.add_node(o["name"],lat=o["lat"],lng=o["lng"],nodetype="origin",corridor=o.get("corridor",""))
	for c in griddata.get("chokepoints",[]):
		allnodes[c["name"]]=c
		G.add_node(c["name"],lat=c["lat"],lng=c["lng"],nodetype="chokepoint",baserisk=c.get("baserisk",0))
	for w in griddata.get("maritimewaypoints",[]):
		allnodes[w["name"]]=w
		G.add_node(w["name"],lat=w["lat"],lng=w["lng"],nodetype="waypoint")
	for edge in griddata.get("edges",[]):
		fromnode=edge["from"]
		tonode=edge["to"]
		if fromnode not in G.nodes or tonode not in G.nodes:
			continue
		basecost=edge.get("distancenm",500)
		transitdays=edge.get("transitdays",2)
		riskmultiplier=1.0
		fromdata=allnodes.get(fromnode,{})
		todata=allnodes.get(tonode,{})
		if fromdata.get("type")=="chokepoint":
			chokename=fromnode.lower()
			for corridor,risk in corridorrisks.items():
				if corridor in chokename:
					riskmultiplier=max(riskmultiplier,1.0+risk*10)
		if todata.get("type")=="chokepoint":
			chokename=tonode.lower()
			for corridor,risk in corridorrisks.items():
				if corridor in chokename:
					riskmultiplier=max(riskmultiplier,1.0+risk*10)
		fromcorridor=fromdata.get("corridor","")
		tocorridor=todata.get("corridor","")
		if fromcorridor in corridorrisks:
			riskmultiplier=max(riskmultiplier,1.0+corridorrisks[fromcorridor]*5)
		if tocorridor in corridorrisks:
			riskmultiplier=max(riskmultiplier,1.0+corridorrisks[tocorridor]*5)
		weightedcost=basecost*riskmultiplier
		G.add_edge(fromnode,tonode,weight=weightedcost,distancenm=basecost,transitdays=transitdays,riskmultiplier=riskmultiplier)
	return G,allnodes
def findallroutes(griddata,corridorrisks):
	try:
		G,allnodes=buildgraph(griddata,corridorrisks)
		origins=[n for n in G.nodes if G.nodes[n].get("nodetype")=="origin"]
		refineries=[n for n in G.nodes if G.nodes[n].get("nodetype")=="refinery"]
		allroutes=[]
		for origin in origins:
			for refinery in refineries:
				try:
					path=nx.dijkstra_path(G,origin,refinery,weight="weight")
					pathcost=nx.dijkstra_path_length(G,origin,refinery,weight="weight")
					totaltransit=0
					totaldistance=0
					for i in range(len(path)-1):
						edgedata=G.edges[path[i],path[i+1]]
						totaltransit+=edgedata.get("transitdays",0)
						totaldistance+=edgedata.get("distancenm",0)
					coordinates=[]
					for nodename in path:
						nodedata=allnodes.get(nodename,{})
						coordinates.append([nodedata.get("lat",0),nodedata.get("lng",0)])
					chokesinpath=[]
					for nodename in path:
						if G.nodes[nodename].get("nodetype")=="chokepoint":
							chokesinpath.append(nodename)
					origincorridor=allnodes.get(origin,{}).get("corridor","unknown")
					origincountry=allnodes.get(origin,{}).get("country","Unknown")
					refinecapacity=allnodes.get(refinery,{}).get("capacity",0)
					allroutes.append({"origin":origin,"destination":refinery,"origincountry":origincountry,"origincorridor":origincorridor,"refinecapacity":refinecapacity,"path":path,"coordinates":coordinates,"chokepoints":chokesinpath,"totalcost":round(pathcost,1),"transitdays":round(totaltransit,1),"distancenm":round(totaldistance,1)})
				except nx.NetworkXNoPath:
					pass
				except:
					pass
		allroutes.sort(key=lambda x:(x["totalcost"],x["transitdays"]))
		return allroutes[:20]
	except:
		return[{"origin":"Fallback","destination":"Jamnagar (RIL)","origincountry":"Unknown","origincorridor":"unknown","refinecapacity":0,"path":[],"coordinates":[[26.2,50.2],[22.3,70.0]],"chokepoints":[],"totalcost":9999,"transitdays":999,"distancenm":9999}]
def calculatedrawdown(bestroutetransitdays,sprmetadata):
	try:
		coveragedays=sprmetadata.get("coveragedays",9.5)
		consumptionbpd=sprmetadata.get("nationalconsumptionbpd",5000000)
		gdpperbarrel=sprmetadata.get("gdpimpactperbarrel",85)
		standardtransit=10
		if bestroutetransitdays>standardtransit:
			extradays=bestroutetransitdays-standardtransit
			drawdowndays=min(extradays,coveragedays)
			deficitbarrels=drawdowndays*consumptionbpd
			remainingdays=max(0,coveragedays-drawdowndays)
			gdppenalty=deficitbarrels*gdpperbarrel
			if extradays>coveragedays:
				stockoutdays=extradays-coveragedays
				stockoutbarrels=stockoutdays*consumptionbpd
				return{"sprremainingdays":round(remainingdays,1),"drawdowndays":round(drawdowndays,1),"deficitbarrels":round(deficitbarrels),"gdppenalty":round(gdppenalty),"stockoutdays":round(stockoutdays,1),"stockoutbarrels":round(stockoutbarrels),"status":"Stockout"}
			return{"sprremainingdays":round(remainingdays,1),"drawdowndays":round(drawdowndays,1),"deficitbarrels":round(deficitbarrels),"gdppenalty":round(gdppenalty),"stockoutdays":0,"stockoutbarrels":0,"status":"Critical"}
		return{"sprremainingdays":coveragedays,"drawdowndays":0,"deficitbarrels":0,"gdppenalty":0,"stockoutdays":0,"stockoutbarrels":0,"status":"Stable"}
	except:
		return{"sprremainingdays":9.5,"drawdowndays":0,"deficitbarrels":0,"gdppenalty":0,"stockoutdays":0,"stockoutbarrels":0,"status":"Unknown"}

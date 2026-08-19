import networkx
from packages.common.database import sessionlocal
from packages.common.models import Node
def findbestroute(startid:str,endid:str,disruptednode:str="",penalty:int=0):
	dbsession=sessionlocal()
	allnodes=dbsession.query(Node).all()
	routegraph=networkx.Graph()
	for n in allnodes:
		routegraph.add_node(n.id,name=n.name)
	routegraph.add_edge("srcru","portjam",weight=5000)
	routegraph.add_edge("srcsa","chhormuz",weight=800)
	routegraph.add_edge("chhormuz","portjam",weight=1200)
	routegraph.add_edge("srcsa","chbab",weight=1000)
	routegraph.add_edge("chbab","portjam",weight=2500)
	if disruptednode in routegraph.nodes:
		for neighbor in list(routegraph.neighbors(disruptednode)):
			routegraph[disruptednode][neighbor]['weight']+=penalty
	shortestpath=networkx.shortest_path(routegraph,source=startid,target=endid,weight="weight")
	pathlength=networkx.shortest_path_length(routegraph,source=startid,target=endid,weight="weight")
	dbsession.close()
	return shortestpath,pathlength
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__),"..")))
from packages.common.database import engine,sessionlocal
from packages.common.models import Base,Node
def seeddatabase():
	Base.metadata.create_all(bind=engine)
	dbsession=sessionlocal()
	nodesdata=[
		{"id":"srcru","type":"supplier","name":"Russia","lat":55.75,"lon":37.62},
		{"id":"srcsa","type":"supplier","name":"Saudi Arabia","lat":24.71,"lon":46.68},
		{"id":"chhormuz","type":"chokepoint","name":"Strait of Hormuz","lat":26.57,"lon":56.25},
		{"id":"chbab","type":"chokepoint","name":"Bab el-Mandeb","lat":12.58,"lon":43.33},
		{"id":"portjam","type":"port","name":"Jamnagar","lat":22.47,"lon":70.07},
		{"id":"sprman","type":"reserve","name":"Mangalore SPR","lat":12.92,"lon":74.86}
	]
	for nodedict in nodesdata:
		existing=dbsession.query(Node).filter(Node.id==nodedict["id"]).first()
		if not existing:
			newnode=Node(id=nodedict["id"],type=nodedict["type"],name=nodedict["name"],lat=nodedict["lat"],lon=nodedict["lon"],geom=f"SRID=4326;POINT({nodedict['lon']} {nodedict['lat']})")
			dbsession.add(newnode)
	dbsession.commit()
	dbsession.close()
	print("Database tables created and seeded successfully")
if __name__=="__main__":
	seeddatabase()
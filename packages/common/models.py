from sqlalchemy.orm import Mapped,mapped_column
from sqlalchemy import String,Float,Boolean,ForeignKey
from geoalchemy2 import Geometry
from packages.common.database import Base
class Node(Base):
	__tablename__="nodes"
	id:Mapped[str]=mapped_column(String,primary_key=True)
	type:Mapped[str]=mapped_column(String,nullable=False)
	name:Mapped[str]=mapped_column(String,nullable=False)
	lat:Mapped[float]=mapped_column(Float)
	lon:Mapped[float]=mapped_column(Float)
	geom=mapped_column(Geometry('POINT',srid=4326))
class Edge(Base):
	__tablename__="edges"
	id:Mapped[str]=mapped_column(String,primary_key=True)
	fromnode:Mapped[str]=mapped_column(String,ForeignKey("nodes.id"))
	tonode:Mapped[str]=mapped_column(String,ForeignKey("nodes.id"))
	mode:Mapped[str]=mapped_column(String)
	distancenm:Mapped[float]=mapped_column(Float)
	basedays:Mapped[float]=mapped_column(Float)
	basecostusdperbbl:Mapped[float]=mapped_column(Float)
	riskmultiplier:Mapped[float]=mapped_column(Float,default=1.0)
	active:Mapped[bool]=mapped_column(Boolean,default=True)
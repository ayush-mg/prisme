import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,DeclarativeBase
from dotenv import load_dotenv
load_dotenv()
databaseurl=os.getenv("databaseurl")
engine=create_engine(databaseurl)
sessionlocal=sessionmaker(autocommit=False,autoflush=False,bind=engine)
class Base(DeclarativeBase):
	pass
def getdb():
	db=sessionlocal()
	try:
		yield db
	finally:
		db.close()
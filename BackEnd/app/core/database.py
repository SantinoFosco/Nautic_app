from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import DATABASE_URL 

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal() #Crea una nueva sesión con la base de datos
    try:
        yield db #La “cede” temporalmente a FastAPI para usarla dentro del endpoint
    finally:
        db.close() #Cierra la sesión al finalizar la petición
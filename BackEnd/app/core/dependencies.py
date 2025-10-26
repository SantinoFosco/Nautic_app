# app/core/dependencies.py
from app.core.database import SessionLocal
from sqlalchemy.orm import Session

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

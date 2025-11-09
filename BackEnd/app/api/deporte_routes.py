from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Deporte

router = APIRouter(prefix="/deporte", tags=["Deporte"])

@router.get("/list")
def get_deportes(db: Session = Depends(get_db)):
    deportes = db.query(Deporte).filter(Deporte.activo == True).all()
    return [
        {"id": d.id, "nombre": d.nombre, "codigo": d.codigo, "descripcion": d.descripcion}
        for d in deportes
    ]
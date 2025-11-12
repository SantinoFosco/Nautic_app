# app/services/auth_session.py
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Usuario

SESSION_USER_ID = "user_id"
SESSION_USER_TYPE = "user_type"
SESSION_EMAIL = "email"

def start_session(request: Request, user: Usuario):
    request.session.clear()
    request.session["user_id"] = user.id
    request.session["user_email"] = user.email
    request.session["tipo_usuario"] = user.tipo_usuario or "owner"

def clear_session(request: Request):
    request.session.clear()

def get_current_user(request: Request, db: Session = Depends(get_db)) -> Usuario:
    uid = request.session.get("user_id")
    if not uid:
        raise HTTPException(status_code=401, detail="No autenticado")
    user = db.query(Usuario).filter(Usuario.id == uid).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario inválido")
    return user

def require_admin(user: Usuario = Depends(get_current_user)) -> Usuario:
    if (user.tipo_usuario or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Solo admin")
    return user

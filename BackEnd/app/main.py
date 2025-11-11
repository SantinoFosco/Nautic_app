import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api import spot_routes, business_owner_routes, admin_routes, test_routes, user_routes, deporte_routes
from app.core.database import Base, engine

app = FastAPI(title="Nautic API", version="1.0")

app.add_middleware(
    SessionMiddleware,
    secret_key="change_me",
    same_site="lax",         # OK si usás localhost/localhost
    https_only=False,        # Dev en HTTP
)

# ---- CORS correcto (ver punto 2) ----
ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(spot_routes.router)
app.include_router(business_owner_routes.router)
app.include_router(user_routes.router)
app.include_router(admin_routes.router)
app.include_router(test_routes.router)
app.include_router(deporte_routes.router)
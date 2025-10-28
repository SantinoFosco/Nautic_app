from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import spot_routes, business_owner_routes, admin_routes, test_routes

app = FastAPI(title="Nautic API", version="1.0")

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar endpoints
app.include_router(spot_routes.router)
#app.include_router(business_owner_routes.router)
#app.include_router(admin_routes.router)
app.include_router(test_routes.router)

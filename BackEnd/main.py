from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 🔹 Permitir que tu frontend (React/Vite) se comunique con el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Podés restringirlo a ["http://localhost:5173"] si usás Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Tu lista de spots
spots = [
    {"name": "San Clemente del Tuyú", "lat": -36.3567, "lon": -56.7233, "sports": ["kite"]},
    {"name": "San Bernardo", "lat": -36.7000, "lon": -56.7000, "sports": ["kite"]},
    {"name": "Villa Gesell", "lat": -37.2645, "lon": -56.9729, "sports": ["surf", "kite"]},
    {"name": "Mar del Plata", "lat": -38.0055, "lon": -57.5426, "sports": ["surf", "kite"]},
    {"name": "Miramar", "lat": -38.2667, "lon": -57.8333, "sports": ["surf"]},
    {"name": "Necochea", "lat": -38.5545, "lon": -58.7390, "sports": ["surf"]},
    {"name": "Claromecó", "lat": -38.8667, "lon": -60.0833, "sports": ["surf"]},
    {"name": "Monte Hermoso", "lat": -38.9833, "lon": -61.2833, "sports": ["surf"]},
]

@app.get("/spots")
async def get_spots():
    return spots
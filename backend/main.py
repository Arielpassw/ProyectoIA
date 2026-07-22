"""
Punto de entrada de FastAPI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import router


app = FastAPI(
    title="Fashion AI API",
    description="""
API REST para clasificar imágenes de prendas.

Funciones disponibles:

- Clasificación de prendas
- Detección aproximada de colores
- Historial de clasificaciones
- Estado del modelo
- Entrenamiento y métricas administrativas
""",
    version="2.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(router)
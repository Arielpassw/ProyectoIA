"""
Punto de entrada de la aplicación FastAPI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import router

# CREAR APLICACIÓN

app = FastAPI(
    title="Clasificación de Imágenes IA",
    description="""
API REST para entrenar y utilizar un modelo de clasificación
de imágenes basado en Fashion MNIST.

Funciones principales:

- Entrenar el modelo CNN
- Configurar parámetros
- Consultar métricas
- Clasificar nuevas imágenes
- Consultar el estado del modelo
""",
    version="1.0.0"
)

# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RUTAS

app.include_router(router)
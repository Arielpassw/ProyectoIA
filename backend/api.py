"""
api.py
API REST para el clasificador de prendas.
"""

from pathlib import Path
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.config import (
    DEFAULT_CONFIG,
    MODEL_PATH,
    IMAGES_DIR
)

from backend.train import train_model
from backend.predict import predict_image
from backend.utils import load_history

# Configuración API

app = FastAPI(
    title="Clasificador de Prendas IA",
    version="1.0.0",
    description="API para entrenar y utilizar un modelo CNN basado en Fashion MNIST."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración actual (editable)
current_config = DEFAULT_CONFIG.copy()

# Información

@app.get("/")
def root():
    return {
        "name": "Clasificador de Prendas IA",
        "version": "1.0",
        "status": "running"
    }

# Health

@app.get("/health")
def health():
    return {
        "status": "OK"
    }

# Estado del modelo

@app.get("/status")
def status():

    trained = MODEL_PATH.exists()

    return {

        "trained": trained,

        "model_loaded": trained,

        "model": MODEL_PATH.name if trained else None,

        "classes": 10 if trained else 0

    }

# Configuración

@app.get("/config")
def get_config():
    return current_config


@app.post("/config")
def update_config(config: dict):

    current_config.update(config)

    return {

        "success": True,

        "config": current_config

    }

# Entrenar modelo

@app.post("/train")
def train():

    result = train_model(current_config)

    return result

# Métricas

@app.get("/metrics")
def metrics():

    history = load_history()

    if history is None:

        raise HTTPException(
            status_code=404,
            detail="No existen métricas."
        )

    return history

# Predicción

@app.post("/predict")
def predict(file: UploadFile = File(...)):

    if not MODEL_PATH.exists():

        raise HTTPException(

            status_code=400,

            detail="Debe entrenar el modelo primero."

        )

    IMAGES_DIR.mkdir(exist_ok=True)

    image_path = IMAGES_DIR / file.filename

    with open(image_path, "wb") as buffer:

        shutil.copyfileobj(file.file, buffer)

    return predict_image(image_path)
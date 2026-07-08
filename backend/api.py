"""
Endpoints de la API REST.
"""

import shutil
from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

from backend.config import (
    TrainConfig,
    DEFAULT_CONFIG,
    IMAGES_DIR
)

from backend.train import train_model
from backend.predict import predict_image
from backend.utils import (
    load_history,
    model_exists
)

# ROUTER

router = APIRouter()

# Configuración actual
current_config = DEFAULT_CONFIG.model_copy()


# INICIO

@router.get(
    "/",
    tags=["General"]
)
def root():

    return {

        "project": "Clasificación de Imágenes IA",

        "version": "1.0.0",

        "status": "running"

    }


# HEALTH

@router.get(
    "/health",
    tags=["General"]
)
def health():

    return {

        "status": "OK"

    }


# STATUS

@router.get(
    "/status",
    tags=["Modelo"]
)
def status():

    trained = model_exists()

    return {

        "trained": trained,

        "model_loaded": trained,

        "classes": 10 if trained else 0

    }


# CONFIGURACIÓN

@router.get(
    "/config",
    tags=["Configuración"]
)
def get_config():

    return current_config


@router.post(
    "/config",
    tags=["Configuración"]
)
def update_config(config: TrainConfig):

    global current_config

    current_config = config

    return {

        "success": True,

        "message": "Configuración actualizada.",

        "config": current_config.model_dump()

    }


# ENTRENAMIENTO

@router.post(
    "/train",
    tags=["Entrenamiento"]
)
def train():

    try:

        result = train_model(current_config)

        return result

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


# MÉTRICAS

@router.get(
    "/metrics",
    tags=["Entrenamiento"]
)
def metrics():

    history = load_history()

    if history is None:

        raise HTTPException(

            status_code=404,

            detail="No existen métricas. Entrene el modelo primero."

        )

    return history


# PREDICCIÓN

@router.post(
    "/predict",
    tags=["Predicción"]
)
def predict(
    file: UploadFile = File(...)
):

    if not model_exists():

        raise HTTPException(

            status_code=400,

            detail="Debe entrenar el modelo antes de realizar predicciones."

        )

    IMAGES_DIR.mkdir(

        parents=True,

        exist_ok=True

    )

    image_path = IMAGES_DIR / file.filename

    with open(image_path, "wb") as buffer:

        shutil.copyfileobj(

            file.file,

            buffer

        )

    try:

        result = predict_image(image_path)

        return result

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )
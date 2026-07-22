"""
Configuración general del proyecto.
"""

from pathlib import Path

from pydantic import BaseModel, Field


# RUTAS DEL PROYECTO

BASE_DIR = Path(__file__).resolve().parent.parent

BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
IMAGES_DIR = BASE_DIR / "images"
METRICS_DIR = BASE_DIR / "metrics"
DATA_DIR = BASE_DIR / "data"

MODEL_PATH = BACKEND_DIR / "model.keras"
LABELS_PATH = BACKEND_DIR / "labels.json"
HISTORY_PATH = METRICS_DIR / "historial.json"

# Historial de clasificaciones realizadas por los usuarios
PREDICTIONS_HISTORY_PATH = DATA_DIR / "predictions_history.json"


# MODELO

IMAGE_WIDTH = 28
IMAGE_HEIGHT = 28
IMAGE_CHANNELS = 1
NUM_CLASSES = 10


# ARCHIVOS

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp"
}

ALLOWED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

# 5 MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024

# Cantidad máxima de registros almacenados
MAX_PREDICTION_HISTORY = 50


# CONFIGURACIÓN DEL ENTRENAMIENTO

class TrainConfig(BaseModel):

    epochs: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Número de épocas"
    )

    batch_size: int = Field(
        default=32,
        ge=1,
        le=512,
        description="Tamaño del lote"
    )

    learning_rate: float = Field(
        default=0.001,
        gt=0,
        description="Learning rate"
    )

    optimizer: str = Field(
        default="adam",
        description="Optimizador"
    )

    dropout: float = Field(
        default=0.30,
        ge=0,
        le=0.9,
        description="Dropout"
    )


DEFAULT_CONFIG = TrainConfig()
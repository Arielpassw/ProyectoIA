from pathlib import Path

# Rutas del proyecto

# Carpeta raíz del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Carpetas principales
BACKEND_DIR = BASE_DIR / "backend"
METRICS_DIR = BASE_DIR / "metrics"
IMAGES_DIR = BASE_DIR / "images"

# Archivos
MODEL_PATH = BACKEND_DIR / "model.keras"
LABELS_PATH = BACKEND_DIR / "labels.json"
HISTORY_PATH = METRICS_DIR / "historial.json"

# Configuración del modelo

IMAGE_SIZE = (28, 28)
NUM_CLASSES = 10

# Valores por defecto
DEFAULT_CONFIG = {
    "epochs": 10,
    "batch_size": 32,
    "learning_rate": 0.001,
    "optimizer": "adam",
    "dropout": 0.30
}
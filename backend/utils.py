import json
from pathlib import Path

from config import HISTORY_PATH


def save_history(history: dict):
    """
    Guarda el historial de entrenamiento en formato JSON.
    """

    HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)

    with open(HISTORY_PATH, "w", encoding="utf-8") as file:
        json.dump(history, file, indent=4)


def load_history():
    """
    Devuelve el historial de entrenamiento.
    """

    if not HISTORY_PATH.exists():
        return None

    with open(HISTORY_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def model_exists(model_path: Path):
    """
    Verifica si existe el modelo entrenado.
    """
    return model_path.exists()
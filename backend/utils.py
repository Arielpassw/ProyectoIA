"""
Funciones auxiliares del proyecto.
"""

import json
from datetime import datetime
from pathlib import Path

from backend.config import (
    HISTORY_PATH,
    LABELS_PATH,
    MODEL_PATH
)


# HISTORIAL

def save_history(history: dict):
    """
    Guarda las métricas del entrenamiento.
    """

    HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)

    history["date"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(HISTORY_PATH, "w", encoding="utf-8") as file:
        json.dump(history, file, indent=4, ensure_ascii=False)


def load_history():
    """
    Carga el historial del entrenamiento.
    """

    if not HISTORY_PATH.exists():
        return None

    with open(HISTORY_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


# MODELO

def model_exists() -> bool:
    """
    Verifica si existe el modelo entrenado.
    """

    return MODEL_PATH.exists()


# ETIQUETAS

def load_labels():
    """
    Carga las etiquetas del dataset.
    """

    with open(LABELS_PATH, "r", encoding="utf-8") as file:
        return json.load(file)

import json

from datetime import datetime
from pathlib import Path
from typing import Any

from backend.config import (
    HISTORY_PATH,
    LABELS_PATH,
    MODEL_PATH,
    PREDICTIONS_HISTORY_PATH,
    MAX_PREDICTION_HISTORY
)


# UTILIDAD JSON

def read_json_file(
    path: Path,
    default: Any = None
):

    if not path.exists():
        return default

    try:
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)

    except (json.JSONDecodeError, OSError):
        return default


def write_json_file(
    path: Path,
    data: Any
):
   
    path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(path, "w", encoding="utf-8") as file:
        json.dump(
            data,
            file,
            indent=4,
            ensure_ascii=False
        )


# HISTORIAL DEL ENTRENAMIENTO

def save_history(history: dict):
    """
    Guarda las métricas del último entrenamiento.
    """

    history["date"] = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    write_json_file(
        HISTORY_PATH,
        history
    )


def load_history():
   
    return read_json_file(
        HISTORY_PATH,
        None
    )


# HISTORIAL DE PREDICCIONES

def load_predictions_history() -> list[dict]:
    
    history = read_json_file(
        PREDICTIONS_HISTORY_PATH,
        []
    )

    return history if isinstance(history, list) else []


def save_prediction_history(
    prediction_data: dict
):
    
    history = load_predictions_history()

    history.insert(
        0,
        prediction_data
    )

    history = history[
        :MAX_PREDICTION_HISTORY
    ]

    write_json_file(
        PREDICTIONS_HISTORY_PATH,
        history
    )


def clear_predictions_history():

    write_json_file(
        PREDICTIONS_HISTORY_PATH,
        []
    )


# MODELO

def model_exists() -> bool:
    """
    Verifica si existe el modelo entrenado.
    """

    return MODEL_PATH.exists()


# ETIQUETAS

def load_labels() -> dict:
   
    labels = read_json_file(
        LABELS_PATH,
        None
    )

    if not isinstance(labels, dict):
        raise FileNotFoundError(
            "No se pudo cargar el archivo labels.json."
        )

    return labels
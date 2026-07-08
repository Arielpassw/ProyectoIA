"""
Predicción de imágenes utilizando el modelo entrenado.
"""

from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image

from backend.config import (
    MODEL_PATH,
    IMAGE_WIDTH,
    IMAGE_HEIGHT
)

from backend.utils import load_labels, model_exists

# CARGA DEL MODELO

_model = None


def load_model():
    """
    Carga el modelo entrenado una única vez.
    """

    global _model

    if _model is None:

        if not model_exists():
            raise FileNotFoundError(
                "No existe un modelo entrenado."
            )

        _model = tf.keras.models.load_model(MODEL_PATH)

    return _model


# PREPROCESAMIENTO

def preprocess_image(image_path: Path):

    image = Image.open(image_path)

    image = image.convert("L")

    image = image.resize(
        (
            IMAGE_WIDTH,
            IMAGE_HEIGHT
        )
    )

    image = np.array(image)

    image = image.astype("float32") / 255.0

    image = image.reshape(
        1,
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        1
    )

    return image


# PREDICCIÓN

def predict_image(image_path: Path):

    model = load_model()

    labels = load_labels()

    image = preprocess_image(image_path)

    predictions = model.predict(
        image,
        verbose=0
    )[0]

    predicted_index = int(np.argmax(predictions))

    predicted_label = labels[str(predicted_index)]

    confidence = round(
        float(predictions[predicted_index] * 100),
        2
    )

    probabilities = {}

    for index, probability in enumerate(predictions):

        probabilities[
            labels[str(index)]
        ] = round(
            float(probability * 100),
            2
        )

    return {

        "success": True,

        "prediction": predicted_label,

        "confidence": confidence,

        "probabilities": probabilities

    }
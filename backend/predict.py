"""
predict.py
Realiza predicciones utilizando el modelo entrenado.
"""

import json

import numpy as np
import tensorflow as tf

from PIL import Image

from config import (
    MODEL_PATH,
    LABELS_PATH,
    IMAGE_SIZE
)


# Cargar modelo

_model = None


def load_model():
    """
    Carga el modelo entrenado una sola vez.
    """

    global _model

    if _model is None:

        _model = tf.keras.models.load_model(MODEL_PATH)

    return _model


# Cargar etiquetas

def load_labels():

    with open(LABELS_PATH, "r", encoding="utf-8") as file:

        return json.load(file)


# Preprocesar imagen

def preprocess_image(image_path):

    image = Image.open(image_path)

    image = image.convert("L")

    image = image.resize(IMAGE_SIZE)

    image = np.array(image)

    image = image.astype("float32") / 255.0

    image = np.expand_dims(image, axis=-1)

    image = np.expand_dims(image, axis=0)

    return image


# Predicción

def predict_image(image_path):

    model = load_model()

    labels = load_labels()

    image = preprocess_image(image_path)

    predictions = model.predict(image, verbose=0)

    probabilities = predictions[0]

    predicted_index = int(np.argmax(probabilities))

    predicted_label = labels[str(predicted_index)]

    confidence = float(probabilities[predicted_index] * 100)

    probabilities_dict = {}

    for i, probability in enumerate(probabilities):

        probabilities_dict[labels[str(i)]] = round(
            float(probability * 100),
            2
        )

    return {

        "success": True,

        "prediction": predicted_label,

        "confidence": round(confidence, 2),

        "probabilities": probabilities_dict

    }
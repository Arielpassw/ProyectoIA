
from pathlib import Path

import numpy as np
import tensorflow as tf

from PIL import Image, UnidentifiedImageError

from backend.config import (
    MODEL_PATH,
    IMAGE_WIDTH,
    IMAGE_HEIGHT
)

from backend.utils import (
    load_labels,
    model_exists
)


# MODELO EN MEMORIA

_model = None


def load_model():
    """
    Carga el modelo una sola vez.
    """

    global _model

    if _model is None:

        if not model_exists():
            raise FileNotFoundError(
                "No existe un modelo entrenado."
            )

        _model = tf.keras.models.load_model(
            MODEL_PATH
        )

    return _model


# PALETA PARA CLASIFICAR COLORES

COLOR_PALETTE = {
    "Negro": (20, 20, 20),
    "Blanco": (240, 240, 240),
    "Gris": (128, 128, 128),
    "Rojo": (210, 45, 45),
    "Naranja": (235, 125, 35),
    "Amarillo": (230, 205, 45),
    "Verde": (45, 145, 70),
    "Azul": (45, 90, 190),
    "Celeste": (95, 180, 220),
    "Morado": (120, 70, 165),
    "Rosado": (225, 125, 165),
    "Marrón": (115, 75, 50),
    "Beige": (205, 185, 145)
}


# VALIDACIÓN DE IMAGEN

def validate_image_file(
    image_path: Path
):
    

    try:

        with Image.open(image_path) as image:
            image.verify()

    except (
        UnidentifiedImageError,
        OSError
    ) as error:

        raise ValueError(
            "El archivo enviado no es una imagen válida."
        ) from error


# PREPROCESAMIENTO DEL MODELO

def preprocess_image(
    image_path: Path
) -> np.ndarray:
    

    with Image.open(image_path) as image:

        image = image.convert("L")

        image = image.resize(
            (
                IMAGE_WIDTH,
                IMAGE_HEIGHT
            )
        )

        image_array = np.asarray(
            image,
            dtype=np.float32
        )

    image_array /= 255.0

    return image_array.reshape(
        1,
        IMAGE_HEIGHT,
        IMAGE_WIDTH,
        1
    )


# CONFIANZA

def get_confidence_level(
    confidence: float
) -> str:
    
    if confidence >= 80:
        return "Alta"

    if confidence >= 50:
        return "Media"

    return "Baja"


# ANÁLISIS DE COLOR

def rgb_to_lab_approximation(
    rgb: np.ndarray
) -> np.ndarray:
   
    rgb = rgb.astype(np.float32) / 255.0

    return np.where(
        rgb <= 0.04045,
        rgb / 12.92,
        ((rgb + 0.055) / 1.055) ** 2.4
    )


def nearest_color_name(
    rgb_pixel: np.ndarray
) -> str:
    

    pixel_normalized = rgb_to_lab_approximation(
        rgb_pixel
    )

    nearest_name = "No identificado"
    smallest_distance = float("inf")

    for name, reference_rgb in COLOR_PALETTE.items():

        reference_normalized = rgb_to_lab_approximation(
            np.asarray(reference_rgb)
        )

        distance = np.linalg.norm(
            pixel_normalized - reference_normalized
        )

        if distance < smallest_distance:

            smallest_distance = distance
            nearest_name = name

    return nearest_name


def is_background_pixel(
    pixel: np.ndarray
) -> bool:
   
    red, green, blue = [
        int(value)
        for value in pixel
    ]

    brightness = (
        0.299 * red
        + 0.587 * green
        + 0.114 * blue
    )

    channel_difference = (
        max(red, green, blue)
        - min(red, green, blue)
    )

    return (
        brightness >= 242
        and channel_difference <= 18
    )


def rgb_to_hex(
    rgb: tuple[int, int, int]
) -> str:
    
    return "#{:02X}{:02X}{:02X}".format(
        rgb[0],
        rgb[1],
        rgb[2]
    )


def detect_dominant_colors(
    image_path: Path,
    limit: int = 3
) -> list[dict]:
    
    with Image.open(image_path) as image:

        image = image.convert("RGB")

        image.thumbnail(
            (160, 160)
        )

        pixels = np.asarray(
            image,
            dtype=np.uint8
        ).reshape(-1, 3)

    usable_pixels = np.asarray([
        pixel
        for pixel in pixels
        if not is_background_pixel(pixel)
    ])

    if usable_pixels.size == 0:
        usable_pixels = pixels

    color_counts: dict[str, int] = {
        name: 0
        for name in COLOR_PALETTE
    }

    for pixel in usable_pixels:

        color_name = nearest_color_name(
            pixel
        )

        color_counts[color_name] += 1

    ordered_colors = sorted(
        color_counts.items(),
        key=lambda item: item[1],
        reverse=True
    )

    total_pixels = len(usable_pixels)
    results = []

    for color_name, count in ordered_colors:

        if count <= 0:
            continue

        percentage = round(
            count / total_pixels * 100,
            2
        )

        reference_rgb = COLOR_PALETTE[
            color_name
        ]

        results.append({
            "name": color_name,
            "percentage": percentage,
            "hex": rgb_to_hex(reference_rgb)
        })

        if len(results) >= limit:
            break

    return results


# PREDICCIÓN

def predict_image(
    image_path: Path
) -> dict:
   

    validate_image_file(
        image_path
    )

    model = load_model()
    labels = load_labels()

    processed_image = preprocess_image(
        image_path
    )

    model_output = model.predict(
        processed_image,
        verbose=0
    )[0]

    predicted_index = int(
        np.argmax(model_output)
    )

    predicted_label = labels[
        str(predicted_index)
    ]

    confidence = round(
        float(
            model_output[predicted_index]
            * 100
        ),
        2
    )

    all_probabilities = []

    for index, probability in enumerate(
        model_output
    ):

        all_probabilities.append({
            "label": labels[str(index)],
            "probability": round(
                float(probability * 100),
                2
            )
        })

    all_probabilities.sort(
        key=lambda item: item["probability"],
        reverse=True
    )

    alternatives = all_probabilities[1:5]

    detected_colors = detect_dominant_colors(
        image_path,
        limit=3
    )

    dominant_color = (
        detected_colors[0]
        if detected_colors
        else None
    )

    confidence_level = get_confidence_level(
        confidence
    )

    characteristics = [
        {
            "type": "category",
            "label": predicted_label
        },
        {
            "type": "confidence",
            "label": f"Confianza {confidence_level.lower()}"
        },
        {
            "type": "model",
            "label": "Fashion-MNIST"
        }
    ]

    if dominant_color:

        characteristics.insert(
            0,
            {
                "type": "color",
                "label": dominant_color["name"],
                "hex": dominant_color["hex"]
            }
        )

    return {
        "success": True,
        "prediction": {
            "label": predicted_label,
            "confidence": confidence,
            "confidence_level": confidence_level
        },
        "dominant_color": dominant_color,
        "colors": detected_colors,
        "characteristics": characteristics,
        "alternatives": alternatives,
        "probabilities": all_probabilities
    }
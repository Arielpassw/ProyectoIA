
import shutil
import uuid

from datetime import datetime
from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    status as http_status
)

from backend.config import (
    TrainConfig,
    DEFAULT_CONFIG,
    IMAGES_DIR,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_IMAGE_SIZE
)

from backend.train import train_model
from backend.predict import predict_image

from backend.utils import (
    load_history,
    model_exists,
    load_predictions_history,
    save_prediction_history,
    clear_predictions_history
)


router = APIRouter()

current_config = DEFAULT_CONFIG.model_copy()


# GENERAL

@router.get(
    "/",
    tags=["General"]
)
def root():

    return {
        "success": True,
        "project": "Fashion AI",
        "description": "Clasificador inteligente de prendas",
        "version": "2.0.0",
        "status": "running",
        "documentation": "/docs"
    }


@router.get(
    "/health",
    tags=["General"]
)
def health():

    return {
        "success": True,
        "status": "OK"
    }


@router.get(
    "/about",
    tags=["General"]
)
def about():

    return {
        "success": True,
        "name": "Fashion AI",
        "description": (
            "Aplicación para clasificar imágenes de prendas "
            "mediante una red neuronal convolucional."
        ),
        "dataset": "Fashion-MNIST",
        "classes": [
            "Camiseta",
            "Pantalón",
            "Suéter",
            "Vestido",
            "Abrigo",
            "Sandalia",
            "Camisa",
            "Zapatilla",
            "Bolso",
            "Bota"
        ],
        "image_requirements": {
            "formats": [
                "JPG",
                "PNG",
                "WEBP"
            ],
            "maximum_size_mb": 5,
            "recommendation": (
                "Utilice una imagen centrada, con una sola "
                "prenda y un fondo sencillo."
            )
        },
        "limitations": (
            "El modelo fue entrenado con el conjunto de datos Fashion-MNIST, compuesto por imágenes en escala de grises de 28 × 28 píxeles. Por este motivo, las fotografías reales a color pueden presentar una menor precisión en la clasificación."
        )
    }


# ESTADO DEL MODELO

@router.get(
    "/status",
    tags=["Modelo"]
)
def model_status():

    trained = model_exists()

    return {
        "success": True,
        "trained": trained,
        "model_loaded": trained,
        "classes": 10 if trained else 0,
        "ready_for_predictions": trained
    }


# CONFIGURACIÓN DEL ADMINISTRADOR

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
def update_config(
    config: TrainConfig
):

    global current_config

    current_config = config

    return {
        "success": True,
        "message": "Configuración actualizada.",
        "config": current_config.model_dump()
    }


# ENTRENAMIENTO DEL ADMINISTRADOR

@router.post(
    "/train",
    tags=["Entrenamiento"]
)
def train():

    try:

        result = train_model(
            current_config
        )

        return result

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Error de entrenamiento: {str(error)}"
        ) from error


@router.get(
    "/metrics",
    tags=["Entrenamiento"]
)
def metrics():

    history = load_history()

    if history is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "No existen métricas. "
                "Entrene el modelo primero."
            )
        )

    return history


# VALIDACIÓN DE ARCHIVOS

def validate_uploaded_file(
    file: UploadFile
):
    """
    Verifica el tipo y la extensión del archivo.
    """

    if not file.filename:

        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Debe seleccionar una imagen."
        )

    if file.content_type not in ALLOWED_IMAGE_TYPES:

        raise HTTPException(
            status_code=http_status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "Formato no permitido. "
                "Use una imagen JPG, PNG o WEBP."
            )
        )

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension not in ALLOWED_IMAGE_EXTENSIONS:

        raise HTTPException(
            status_code=http_status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "La extensión del archivo no está permitida."
            )
        )

    return extension


# PREDICCIÓN

@router.post(
    "/predict",
    tags=["Predicción"]
)
async def predict(
    file: UploadFile = File(...)
):

    if not model_exists():

        raise HTTPException(
            status_code=http_status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "El modelo no está disponible. "
                "Comuníquese con el administrador."
            )
        )

    extension = validate_uploaded_file(
        file
    )

    file_content = await file.read()

    if not file_content:

        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="La imagen está vacía."
        )

    if len(file_content) > MAX_IMAGE_SIZE:

        raise HTTPException(
            status_code=http_status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                "La imagen supera el tamaño máximo de 5 MB."
            )
        )

    IMAGES_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    temporary_name = (
        f"{uuid.uuid4().hex}{extension}"
    )

    image_path = (
        IMAGES_DIR / temporary_name
    )

    try:

        with open(image_path, "wb") as buffer:
            buffer.write(file_content)

        result = predict_image(
            image_path
        )

        prediction_record = {
            "id": uuid.uuid4().hex,
            "date": datetime.now().isoformat(),
            "original_filename": file.filename,
            "prediction": result["prediction"],
            "dominant_color": result["dominant_color"],
            "alternatives": result["alternatives"]
        }

        save_prediction_history(
            prediction_record
        )

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        ) from error

    except Exception as error:

        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "No se pudo analizar la imagen: "
                f"{str(error)}"
            )
        ) from error

    finally:

        await file.close()

        if image_path.exists():
            image_path.unlink()


# HISTORIAL DEL USUARIO

@router.get(
    "/predictions/history",
    tags=["Predicción"]
)
def prediction_history():

    history = load_predictions_history()

    return {
        "success": True,
        "total": len(history),
        "items": history
    }


@router.delete(
    "/predictions/history",
    tags=["Predicción"]
)
def delete_prediction_history():

    clear_predictions_history()

    return {
        "success": True,
        "message": "Historial eliminado correctamente."
    }
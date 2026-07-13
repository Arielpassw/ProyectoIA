"""
Entrenamiento del modelo CNN para Fashion MNIST.
"""

import time

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
from tensorflow.keras.datasets import fashion_mnist

from backend.config import (
    MODEL_PATH,
    TrainConfig,
    DEFAULT_CONFIG,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    IMAGE_CHANNELS,
    NUM_CLASSES
)

from backend.utils import save_history


# DATASET

def load_dataset():
    """
    Descarga automáticamente el dataset Fashion MNIST.
    """

    (x_train, y_train), (x_test, y_test) = fashion_mnist.load_data()

    return (x_train, y_train), (x_test, y_test)


# PREPROCESAMIENTO

def preprocess_data(x_train, x_test):
    """
    Normaliza las imágenes y agrega el canal.
    """

    x_train = x_train.astype("float32") / 255.0
    x_test = x_test.astype("float32") / 255.0

    x_train = x_train.reshape(
        -1,
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        IMAGE_CHANNELS
    )

    x_test = x_test.reshape(
        -1,
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        IMAGE_CHANNELS
    )

    return x_train, x_test

# MODELO CNN

def build_model(config: TrainConfig):
    """Construye y compila una CNN usando la configuración recibida.

    La arquitectura permanece fija para que los experimentos comparen los
    hiperparámetros expuestos en la interfaz: optimizador, learning rate y
    dropout. La capa softmax devuelve una probabilidad para cada clase.
    """

    model = models.Sequential([

        layers.Input(
            shape=(
                IMAGE_WIDTH,
                IMAGE_HEIGHT,
                IMAGE_CHANNELS
            )
        ),

        layers.Conv2D(
            filters=32,
            kernel_size=(3, 3),
            activation="relu"
        ),

        layers.MaxPooling2D((2, 2)),

        layers.Conv2D(
            filters=64,
            kernel_size=(3, 3),
            activation="relu"
        ),

        layers.MaxPooling2D((2, 2)),

        layers.Flatten(),

        layers.Dense(
            128,
            activation="relu"
        ),

        layers.Dropout(config.dropout),

        layers.Dense(
            NUM_CLASSES,
            activation="softmax"
        )

    ])

    # Elegimos el optimizador
    if config.optimizer.lower() == "adam":

        optimizer = optimizers.Adam(
            learning_rate=config.learning_rate
        )

    else:

        optimizer = optimizers.SGD(
            learning_rate=config.learning_rate
        )

    model.compile(

        optimizer=optimizer,

        loss="sparse_categorical_crossentropy",

        metrics=["accuracy"]

    )

    return model


# ENTRENAMIENTO

def train_model(config: TrainConfig | None = None):
    """Ejecuta el ciclo completo de entrenamiento y persiste sus resultados.

    Si no se proporciona una configuración, utiliza los valores por defecto.
    La función carga y prepara Fashion-MNIST, crea un modelo nuevo, lo entrena,
    guarda ``model.keras`` y registra las métricas por época en JSON. Al final
    invalida la caché de predicción para que la próxima inferencia cargue el
    modelo recién generado.

    Args:
        config: Hiperparámetros validados por ``TrainConfig``.

    Returns:
        Un diccionario serializable con las métricas finales, el tiempo de
        entrenamiento y la ubicación del modelo guardado.
    """

    if config is None:
        config = DEFAULT_CONFIG

    start_time = time.time()

    (x_train, y_train), (x_test, y_test) = load_dataset()

    x_train, x_test = preprocess_data(
        x_train,
        x_test
    )

    model = build_model(config)

    history = model.fit(

        x_train,

        y_train,

        validation_data=(x_test, y_test),

        epochs=config.epochs,

        batch_size=config.batch_size,

        verbose=1

    )

    MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    model.save(MODEL_PATH)

    from backend import predict

    predict._model = None  # Reiniciamos el modelo cargado en memoria

    history_data = {

        "accuracy": history.history["accuracy"],

        "val_accuracy": history.history["val_accuracy"],

        "loss": history.history["loss"],

        "val_loss": history.history["val_loss"],

        "config": config.model_dump()

    }

    save_history(history_data)

    training_time = round(
        time.time() - start_time,
        2
    )

    return {

        "success": True,

        "message": "Modelo entrenado correctamente.",

        "model": str(MODEL_PATH),

        "training_time": training_time,

        "epochs": config.epochs,

        "accuracy": round(
            history.history["accuracy"][-1],
            4
        ),

        "val_accuracy": round(
            history.history["val_accuracy"][-1],
            4
        ),

        "loss": round(
            history.history["loss"][-1],
            4
        ),

        "val_loss": round(
            history.history["val_loss"][-1],
            4
        )

    }


# EJECUCIÓN DIRECTA

if __name__ == "__main__":

    resultado = train_model()

    print(resultado)

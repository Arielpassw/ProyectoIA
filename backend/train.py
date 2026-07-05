import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
from tensorflow.keras.datasets import fashion_mnist

from config import (
    MODEL_PATH,
    DEFAULT_CONFIG,
)

from utils import save_history


# Cargar Dataset

def load_dataset():
    """
    Descarga automáticamente Fashion MNIST.
    """

    (x_train, y_train), (x_test, y_test) = fashion_mnist.load_data()

    return (x_train, y_train), (x_test, y_test)


# Preprocesamiento

def preprocess_data(x_train, x_test):
    """
    Normaliza las imágenes y agrega el canal.
    """

    x_train = x_train.astype("float32") / 255.0
    x_test = x_test.astype("float32") / 255.0

    x_train = x_train[..., tf.newaxis]
    x_test = x_test[..., tf.newaxis]

    return x_train, x_test


# Construcción del Modelo

def build_model(config):

    model = models.Sequential([

        layers.Input(shape=(28, 28, 1)),

        layers.Conv2D(
            filters=32,
            kernel_size=(3,3),
            activation="relu"
        ),

        layers.MaxPooling2D((2,2)),

        layers.Conv2D(
            filters=64,
            kernel_size=(3,3),
            activation="relu"
        ),

        layers.MaxPooling2D((2,2)),

        layers.Flatten(),

        layers.Dense(
            128,
            activation="relu"
        ),

        layers.Dropout(
            config["dropout"]
        ),

        layers.Dense(
            10,
            activation="softmax"
        )

    ])

    optimizer = optimizers.Adam(
        learning_rate=config["learning_rate"]
    )

    model.compile(

        optimizer=optimizer,

        loss="sparse_categorical_crossentropy",

        metrics=["accuracy"]

    )

    return model


# Entrenamiento

def train_model(config=None):

    if config is None:
        config = DEFAULT_CONFIG

    (x_train, y_train), (x_test, y_test) = load_dataset()

    x_train, x_test = preprocess_data(x_train, x_test)

    model = build_model(config)

    history = model.fit(

        x_train,

        y_train,

        validation_data=(x_test, y_test),

        epochs=config["epochs"],

        batch_size=config["batch_size"],

        verbose=1

    )

    model.save(MODEL_PATH)

    history_data = {

        "accuracy": history.history["accuracy"],

        "val_accuracy": history.history["val_accuracy"],

        "loss": history.history["loss"],

        "val_loss": history.history["val_loss"]

    }

    save_history(history_data)

    return {

        "success": True,

        "accuracy": history_data["accuracy"][-1],

        "val_accuracy": history_data["val_accuracy"][-1],

        "loss": history_data["loss"][-1],

        "val_loss": history_data["val_loss"][-1]

    }


if __name__ == "__main__":

    result = train_model()

    print(result)
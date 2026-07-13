# Documentación de la API REST

## Información general

- **URL local:** `http://localhost:8000`
- **Formato habitual:** `application/json`
- **Carga de imagen:** `multipart/form-data`
- **Swagger UI:** `/docs`
- **Autenticación:** no implementada

## Resumen de endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Información del proyecto |
| GET | `/health` | Salud de la API |
| GET | `/status` | Estado del modelo |
| GET | `/config` | Configuración actual |
| POST | `/config` | Actualizar configuración |
| POST | `/train` | Entrenar y guardar el modelo |
| GET | `/metrics` | Consultar la última corrida |
| POST | `/predict` | Clasificar una imagen |

## `GET /`

Devuelve información básica.

```json
{
  "project": "Clasificación de Imágenes IA",
  "version": "1.0.0",
  "status": "running"
}
```

## `GET /health`

Comprueba si el proceso responde. Respuesta `200`:

```json
{"status": "OK"}
```

## `GET /status`

Comprueba la existencia de `backend/model.keras`.

```json
{
  "trained": false,
  "model_loaded": false,
  "classes": 0
}
```

Cuando el archivo existe, ambos indicadores son `true` y `classes` vale 10. `model_loaded` refleja actualmente la existencia del archivo, no si TensorFlow ya lo cargó en memoria.

## `GET /config`

Devuelve la configuración vigente en memoria.

```json
{
  "epochs": 10,
  "batch_size": 32,
  "learning_rate": 0.001,
  "optimizer": "adam",
  "dropout": 0.3
}
```

## `POST /config`

Reemplaza la configuración vigente. Todos los campos son esperados por el modelo Pydantic.

```json
{
  "epochs": 15,
  "batch_size": 64,
  "learning_rate": 0.0005,
  "optimizer": "adam",
  "dropout": 0.4
}
```

Respuesta `200`:

```json
{
  "success": true,
  "message": "Configuración actualizada.",
  "config": {
    "epochs": 15,
    "batch_size": 64,
    "learning_rate": 0.0005,
    "optimizer": "adam",
    "dropout": 0.4
  }
}
```

Una entrada fuera de los límites produce `422 Unprocessable Entity` con el detalle generado por Pydantic.

Ejemplo:

```bash
curl -X POST http://localhost:8000/config \
  -H "Content-Type: application/json" \
  -d '{"epochs":10,"batch_size":32,"learning_rate":0.001,"optimizer":"adam","dropout":0.3}'
```

## `POST /train`

Entrena de forma síncrona con la configuración actual. No necesita cuerpo. Puede tardar varios minutos.

Respuesta `200` de ejemplo:

```json
{
  "success": true,
  "message": "Modelo entrenado correctamente.",
  "model": "C:\\ruta\\ProyectoIA\\backend\\model.keras",
  "training_time": 180.42,
  "epochs": 10,
  "accuracy": 0.9401,
  "val_accuracy": 0.9153,
  "loss": 0.1581,
  "val_loss": 0.2585
}
```

Un error de descarga, TensorFlow o escritura responde `500` con `{"detail":"..."}`.

## `GET /metrics`

Devuelve el historial completo de la última ejecución:

```json
{
  "accuracy": [0.8194, 0.8806, 0.8953],
  "val_accuracy": [0.8653, 0.8918, 0.8988],
  "loss": [0.4963, 0.3265, 0.2849],
  "val_loss": [0.3675, 0.2978, 0.2781],
  "config": {
    "epochs": 3,
    "batch_size": 32,
    "learning_rate": 0.001,
    "optimizer": "adam",
    "dropout": 0.3
  },
  "date": "2026-07-07 22:35:25"
}
```

Si no existe el historial, responde `404`:

```json
{"detail": "No existen métricas. Entrene el modelo primero."}
```

## `POST /predict`

Recibe el campo `file` como imagen multipart. Requiere un modelo guardado.

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@images/camisa.jpg"
```

Respuesta `200` (valores ilustrativos):

```json
{
  "success": true,
  "prediction": "Camisa",
  "confidence": 87.42,
  "probabilities": {
    "Camiseta": 5.12,
    "Pantalón": 0.01,
    "Suéter": 2.40,
    "Vestido": 0.03,
    "Abrigo": 3.96,
    "Sandalia": 0.00,
    "Camisa": 87.42,
    "Zapatilla": 0.00,
    "Bolso": 1.05,
    "Bota": 0.01
  }
}
```

> Los valores anteriores solo ilustran el contrato; no representan una predicción verificada para el archivo incluido.

Errores principales:

- `400`: no existe un modelo entrenado.
- `422`: falta el campo `file`.
- `500`: imagen inválida, modelo incompatible o error de inferencia.

## Códigos HTTP

| Código | Significado en el sistema |
|---:|---|
| 200 | Operación correcta |
| 400 | La operación requiere entrenar primero |
| 404 | No existe historial de métricas |
| 422 | La solicitud no cumple el esquema |
| 500 | Error interno durante entrenamiento o predicción |

## Observaciones de integración

- La configuración se mantiene solo en memoria y vuelve a los valores predeterminados al reiniciar la API.
- `/train` mantiene abierta la conexión hasta terminar.
- El frontend espera porcentajes en `/predict`, pero valores entre 0 y 1 en el historial y la respuesta de entrenamiento.
- No se implementan versionado de API, autenticación ni rate limiting.


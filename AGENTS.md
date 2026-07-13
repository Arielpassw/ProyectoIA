# Guía del repositorio para agentes y colaboradores

## Objetivo

Este repositorio implementa un clasificador académico de prendas Fashion-MNIST con un backend FastAPI/TensorFlow y un frontend estático.

## Mapa del código

- `backend/main.py`: crea la aplicación y configura CORS.
- `backend/api.py`: define los endpoints REST.
- `backend/config.py`: centraliza rutas, dimensiones y parámetros validados.
- `backend/train.py`: descarga datos, preprocesa, construye y entrena la CNN.
- `backend/predict.py`: carga el modelo y clasifica una imagen.
- `backend/utils.py`: lee y escribe etiquetas, historial y modelo.
- `frontend/`: interfaz HTML/CSS/JavaScript.
- `metrics/historial.json`: última ejecución registrada.
- `docs/`: documentos académicos, técnicos y funcionales.

## Comandos principales

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload
python -m http.server 5500 --directory frontend
```

## Verificaciones recomendadas

```powershell
python -m compileall backend
python -c "from backend.main import app; print(app.title)"
```

Con la API activa, comprobar `GET /health`, `GET /status` y `GET /config`. El entrenamiento completo descarga datos, consume tiempo y escribe el modelo y las métricas; no debe ejecutarse como prueba rápida sin indicarlo.

## Convenciones

- Ejecutar comandos desde la raíz del repositorio para que funcionen los imports `backend.*`.
- Mantener rutas en `backend/config.py` y evitar rutas absolutas.
- Conservar las respuestas JSON compatibles con `frontend/script.js`.
- Documentar cualquier endpoint nuevo en `docs/API.md`.
- No versionar `venv/`, `__pycache__/` ni `backend/model.keras`.
- No sustituir las capturas reales por imágenes generadas.


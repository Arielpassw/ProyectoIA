# Clasificador de prendas con inteligencia artificial

Proyecto académico de la asignatura **Fundamentos de Inteligencia Artificial**. El sistema permite configurar, entrenar y utilizar una red neuronal convolucional (CNN) basada en el conjunto de datos Fashion-MNIST.

## Funcionalidades

- Configuración de épocas, tamaño de lote, tasa de aprendizaje, optimizador y dropout.
- Entrenamiento de una CNN desde una API REST.
- Consulta del estado del modelo y las métricas de la última ejecución.
- Visualización de accuracy y loss por época.
- Clasificación de imágenes de prendas y presentación de probabilidades por clase.
- Documentación interactiva de la API mediante Swagger UI.

## Tecnologías

- Python 3
- FastAPI y Uvicorn
- TensorFlow/Keras
- NumPy y Pillow
- HTML5, CSS3 y JavaScript
- Chart.js

## Estructura

```text
ProyectoIA/
├── backend/                 API, entrenamiento y predicción
│   ├── api.py               Endpoints REST
│   ├── config.py            Configuración y rutas
│   ├── main.py              Aplicación FastAPI
│   ├── predict.py           Preprocesamiento e inferencia
│   ├── train.py             Dataset, CNN y entrenamiento
│   ├── utils.py             Persistencia y utilidades
│   └── labels.json          Clases de Fashion-MNIST
├── frontend/                Interfaz web
├── images/                  Imágenes de prueba
├── metrics/                 Historial del último entrenamiento
├── docs/                    Documentación del proyecto
└── requirements.txt         Dependencias de Python
```

## Instalación

Desde PowerShell, en la raíz del proyecto:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

> TensorFlow 2.19 requiere una versión de Python compatible. Si la instalación falla, comprueba la tabla de compatibilidad oficial de TensorFlow y crea el entorno con una versión admitida.

## Ejecución

Inicia la API desde la raíz del repositorio:

```powershell
.\venv\Scripts\Activate.ps1
uvicorn backend.main:app --reload
```

La API estará disponible en `http://localhost:8000` y Swagger UI en `http://localhost:8000/docs`.

En otra terminal, sirve el frontend:

```powershell
python -m http.server 5500 --directory frontend
```

Abre `http://localhost:5500`. La interfaz usa por defecto `http://localhost:8000` como URL de la API.

## Flujo de uso

1. Verifica que la interfaz muestre el estado **Conectado**.
2. Ajusta los parámetros de entrenamiento o conserva los valores predeterminados.
3. Pulsa **Entrenar modelo** y espera a que finalice el proceso.
4. Revisa las métricas y gráficas.
5. Selecciona una imagen de una prenda y pulsa **Predecir**.

La primera ejecución descarga Fashion-MNIST. El entrenamiento genera `backend/model.keras` y actualiza `metrics/historial.json`.

## Documentación

-
- [Índice de capturas](docs/capturas/README.md)

### Versiones editables en Word

- [Informe final en Word](docs/word/INFORME_FINAL.docx)
- [Manual técnico en Word](docs/word/MANUAL_TECNICO.docx)
- [Documentación del sistema en Word](docs/word/DOCUMENTACION_SISTEMA.docx)
- [Referencia de la API en Word](docs/word/API.docx)
- [Guía para desarrolladores en Word](docs/word/GUIA_DESARROLLADORES.docx)

## Resultados registrados

El historial incluido corresponde a una ejecución de 10 épocas, batch size 32, learning rate 0.001, Adam y dropout 0.30. El resultado final registrado fue:

| Métrica | Entrenamiento | Validación |
|---|---:|---:|
| Accuracy | 94.01 % | 91.53 % |
| Loss | 0.1581 | 0.2585 |

## Consideraciones

- El endpoint de entrenamiento es síncrono; la solicitud permanece abierta hasta finalizar.
- Solo se conserva el historial de la última ejecución.
- Las imágenes externas se convierten a escala de grises y tamaño 28 × 28.
- Para producción deben restringirse CORS, nombres de archivo, tamaño y tipo de las cargas.

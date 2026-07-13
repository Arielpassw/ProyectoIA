# Manual técnico

## 1. Propósito

Este manual permite instalar, ejecutar, mantener y verificar el clasificador de prendas. Está dirigido a desarrolladores, docentes y personal técnico con conocimientos básicos de Python, HTTP y aprendizaje automático.

## 2. Requisitos

### Hardware recomendado

- Procesador de 64 bits con al menos cuatro núcleos.
- 8 GB de RAM como mínimo; 16 GB recomendados.
- Aproximadamente 3 GB libres para entorno, dependencias, dataset y modelo.
- GPU compatible opcional; el sistema puede entrenar con CPU.

### Software

- Windows 10/11, Linux o macOS.
- Python en una versión compatible con `tensorflow==2.19.0`.
- Navegador web moderno.
- Acceso a Internet durante la instalación y la primera descarga de Fashion-MNIST.

## 3. Instalación paso a paso

Abra PowerShell en la raíz del proyecto.

### 3.1 Crear el entorno virtual

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Si PowerShell bloquea la activación, consulte la política de ejecución de su institución. También puede llamar directamente a `.\venv\Scripts\python.exe` y `.\venv\Scripts\pip.exe`.

### 3.2 Instalar dependencias

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Compruebe la instalación:

```powershell
python -c "import fastapi, tensorflow, PIL; print('Dependencias correctas')"
```

## 4. Puesta en marcha

### 4.1 Backend

Ejecute desde la raíz, no desde `backend/`:

```powershell
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Direcciones importantes:

- API: `http://localhost:8000`
- Salud: `http://localhost:8000/health`
- Swagger UI: `http://localhost:8000/docs`
- Esquema OpenAPI: `http://localhost:8000/openapi.json`

### 4.2 Frontend

En una segunda terminal:

```powershell
python -m http.server 5500 --directory frontend
```

Abra `http://localhost:5500`. No se recomienda abrir `index.html` directamente porque un servidor local reproduce mejor el comportamiento HTTP real.

## 5. Configuración

La clase `TrainConfig` valida los parámetros:

| Campo | Predeterminado | Restricción | Descripción |
|---|---:|---|---|
| `epochs` | 10 | 1 a 100 | Pasadas completas sobre los datos |
| `batch_size` | 32 | 1 a 512 | Muestras procesadas por actualización |
| `learning_rate` | 0.001 | mayor que 0 | Tamaño del ajuste de pesos |
| `optimizer` | `adam` | texto | `adam`; cualquier otro valor usa SGD en la implementación actual |
| `dropout` | 0.30 | 0 a 0.9 | Fracción desactivada en entrenamiento |

Las rutas y dimensiones se centralizan en `backend/config.py`. Las imágenes de entrada del modelo son de 28 × 28 con un canal.

## 6. Componentes internos

### `backend/main.py`

Crea `FastAPI`, configura CORS e incluye el router.

### `backend/api.py`

Expone salud, estado, configuración, entrenamiento, métricas y predicción. Convierte excepciones de operaciones principales en respuestas HTTP 500.

### `backend/train.py`

Carga Fashion-MNIST, normaliza las matrices, construye la CNN, ejecuta `model.fit`, guarda el modelo y registra las métricas.

### `backend/predict.py`

Mantiene una caché del modelo. Cada imagen se convierte a gris, se redimensiona, se normaliza y se transforma a `(1, 28, 28, 1)`.

### `backend/utils.py`

Administra la persistencia JSON y comprueba la existencia del modelo.

### `frontend/`

`index.html` contiene la estructura, `styles.css` la presentación y `script.js` la comunicación con la API, las gráficas y el estado interactivo.

## 7. Archivos generados

| Archivo | Origen | Función |
|---|---|---|
| `backend/model.keras` | Entrenamiento | Pesos y arquitectura del modelo |
| `metrics/historial.json` | Entrenamiento | Métricas, configuración y fecha |
| `images/<archivo>` | Predicción | Copia de la última imagen enviada con ese nombre |

`model.keras` está ignorado por Git debido a su tamaño y a que puede regenerarse.

## 8. Operación y pruebas rápidas

Con el servidor activo:

```powershell
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/status
Invoke-RestMethod http://localhost:8000/config
```

Actualizar configuración:

```powershell
$body = @{
  epochs = 10
  batch_size = 32
  learning_rate = 0.001
  optimizer = 'adam'
  dropout = 0.3
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri http://localhost:8000/config `
  -ContentType 'application/json' `
  -Body $body
```

Entrenar consume varios minutos y puede descargar el dataset:

```powershell
Invoke-RestMethod -Method Post http://localhost:8000/train
```

Predecir con `curl.exe`:

```powershell
curl.exe -X POST http://localhost:8000/predict -F "file=@images/camisa.jpg"
```

## 9. Solución de problemas

### `ModuleNotFoundError`

Active el entorno correcto e instale `requirements.txt`. Verifique con `python -m pip --version` que `pip` pertenece al mismo intérprete.

### TensorFlow no se instala

Compruebe la compatibilidad entre TensorFlow, Python y el sistema operativo. Cree nuevamente el entorno con una versión de Python admitida.

### No conecta la interfaz

Confirme `/health`, el puerto 8000 y la URL escrita en la caja de conexión. Revise la consola del navegador y que no exista otro proceso usando el puerto.

### No existen métricas

`GET /metrics` responde 404 hasta que exista `metrics/historial.json`. Ejecute un entrenamiento o conserve el historial entregado.

### No permite predecir

Debe existir `backend/model.keras`. El historial por sí solo no equivale a un modelo entrenado.

### Baja precisión con fotografías

Fashion-MNIST contiene prendas centradas, pequeñas y con un estilo visual uniforme. Recorte la prenda, use fondo sencillo y alto contraste. Para uso real se requiere reentrenar con fotografías representativas.

## 10. Mantenimiento

- Actualizar versiones primero en un entorno de prueba.
- Mantener sincronizados `labels.json`, `NUM_CLASSES` y la salida del modelo.
- Actualizar la documentación de la API al modificar respuestas.
- Conservar copias de modelos importantes fuera del repositorio.
- Registrar nuevas métricas sin sobrescribir si se necesita trazabilidad.
- Revisar CORS y validación de cargas antes de desplegar.

## 11. Respaldo y recuperación

Para conservar una corrida, respalde `backend/model.keras` y `metrics/historial.json` como una unidad. Para recuperar, detenga la API, restaure ambos archivos y reinicie el proceso para limpiar el modelo almacenado en memoria.

## 12. Cierre del servicio

En cada terminal que ejecuta Uvicorn o el servidor estático, presione `Ctrl+C`. El modelo y las métricas ya guardados permanecen en disco.


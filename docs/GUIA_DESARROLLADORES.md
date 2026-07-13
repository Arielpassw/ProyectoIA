# Guía paso a paso para nuevos desarrolladores

## 1. Primer recorrido

1. Lea el [README principal](../README.md).
2. Revise `backend/config.py` para comprender rutas y límites.
3. Siga el flujo `frontend/script.js` → `backend/api.py` → `train.py` o `predict.py`.
4. Consulte el contrato completo en [API.md](API.md).
5. Instale las dependencias según [MANUAL_TECNICO.md](MANUAL_TECNICO.md).

## 2. Preparar el entorno

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Ejecute backend y frontend en terminales separadas:

```powershell
uvicorn backend.main:app --reload
```

```powershell
python -m http.server 5500 --directory frontend
```

## 3. Flujo de una solicitud

### Entrenamiento

```text
Formulario → POST /config → TrainConfig
          → POST /train → load_dataset
                        → preprocess_data
                        → build_model
                        → model.fit
                        → model.keras + historial.json
          → GET /metrics → gráficas
```

### Predicción

```text
Archivo → POST /predict → guardar en images/
                        → preprocess_image
                        → load_model (caché)
                        → model.predict
                        → etiqueta + probabilidades
```

## 4. Cómo modificar el proyecto

### Añadir un parámetro de entrenamiento

1. Añada y valide el campo en `TrainConfig`.
2. Úselo en `build_model` o `train_model`.
3. Añada el control en `index.html`.
4. Inclúyalo en el objeto `config` de `script.js`.
5. Documente el campo en README, manual y API.
6. Pruebe el valor predeterminado, límites y error 422.

### Añadir un endpoint

1. Defina ruta y esquema en `backend/api.py`.
2. Mantenga separada la lógica compleja en otro módulo.
3. Use códigos HTTP coherentes y respuestas JSON estables.
4. Compruebe automáticamente `/docs`.
5. Añada ejemplos a `docs/API.md`.

### Cambiar las clases

No basta con editar `labels.json`. También debe adaptar el dataset, `NUM_CLASSES`, la salida de la red y volver a entrenar. Un orden incorrecto produce nombres de clase erróneos aunque el modelo funcione.

## 5. Estilo y prácticas

- Use nombres descriptivos y docstrings en funciones públicas.
- Centralice constantes y rutas.
- No mezcle procesamiento del modelo con endpoints.
- Capture excepciones específicas cuando sea posible.
- Evite introducir rutas absolutas o valores secretos.
- Mantenga las unidades claras: accuracy del historial está entre 0 y 1; confianza de predicción está entre 0 y 100.
- Actualice documentación y pruebas en el mismo cambio.

## 6. Pruebas sugeridas

### Comprobación sintáctica

```powershell
python -m compileall backend
```

### Importación de la aplicación

```powershell
python -c "from backend.main import app; print(app.title)"
```

### Casos mínimos de API

- `GET /health` devuelve 200.
- `POST /config` acepta límites válidos y rechaza valores inválidos.
- `GET /metrics` devuelve listas del mismo tamaño.
- `POST /predict` devuelve 400 sin modelo.
- Con modelo, probabilidades contiene diez clases.

Para automatizar, se recomienda `pytest`, `fastapi.testclient.TestClient` y pruebas unitarias que sustituyan dataset y modelo por dobles ligeros, evitando entrenar en cada ejecución.

## 7. Puntos delicados

- `current_config` es global al proceso; no persiste ni está diseñado para múltiples usuarios.
- `_model` es una caché global. Después de entrenar se reinicia para cargar el archivo nuevo.
- Entrenar dentro de un endpoint síncrono bloquea ese trabajador.
- El archivo subido conserva el nombre proporcionado por el cliente.
- `optimizer` no está restringido por un enum: cualquier texto distinto de `adam` selecciona SGD.
- El conjunto `x_test` se usa como validación; una evaluación científica debería reservar una prueba independiente.

## 8. Lista antes de enviar cambios

- [ ] El backend compila.
- [ ] La aplicación importa con las dependencias instaladas.
- [ ] Los endpoints modificados conservan o documentan el contrato.
- [ ] La interfaz no muestra errores en consola.
- [ ] No se añadió el entorno virtual ni el modelo a Git.
- [ ] Se actualizaron README y documentos relacionados.
- [ ] Las capturas siguen representando el sistema actual.


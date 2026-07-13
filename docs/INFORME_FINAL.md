# Informe final del proyecto

## Tecnología Superior en Desarrollo de Software

### Proyecto del segundo bimestre

**Sistema:** Clasificador de prendas con inteligencia artificial  
**Asignatura:** Fundamentos de Inteligencia Artificial  
**Estudiante(s):** _Completar_  
**Docente:** _Completar_  
**Institución:** _Completar_  
**Periodo académico:** _Completar_  
**Fecha de entrega:** _Completar_

---

## 1. Resumen ejecutivo

El proyecto consiste en una aplicación web capaz de entrenar y utilizar una red neuronal convolucional para reconocer prendas de vestir. El sistema emplea Fashion-MNIST, un conjunto de 70 000 imágenes en escala de grises distribuidas en diez clases. La solución integra una API REST desarrollada con FastAPI, un modelo creado con TensorFlow/Keras y una interfaz web implementada con HTML, CSS y JavaScript.

Desde la interfaz, el usuario puede modificar los principales hiperparámetros, iniciar el entrenamiento, consultar las métricas obtenidas y enviar una imagen para su clasificación. El backend normaliza los datos, construye la red, guarda el modelo entrenado y devuelve la clase estimada junto con su confianza y las probabilidades de cada categoría.

El historial incluido en el repositorio registra una exactitud final de 94,01 % sobre entrenamiento y 91,53 % sobre validación después de diez épocas. Estos valores demuestran que el modelo aprende patrones relevantes, aunque existe una diferencia moderada entre ambos conjuntos que debe vigilarse como posible señal de sobreajuste.

## 2. Planteamiento del problema

La clasificación manual de imágenes consume tiempo y no escala cuando el volumen de datos aumenta. En el contexto académico se requiere comprender cómo una aplicación puede transformar píxeles en una predicción útil, conectar un modelo de aprendizaje automático con una API y presentar sus resultados en una interfaz comprensible.

El problema abordado es la identificación automática de una prenda entre las siguientes clases: camiseta, pantalón, suéter, vestido, abrigo, sandalia, camisa, zapatilla, bolso y bota.

## 3. Objetivos

### 3.1 Objetivo general

Desarrollar un sistema web que permita entrenar, evaluar y utilizar un modelo CNN para clasificar imágenes de prendas del conjunto Fashion-MNIST.

### 3.2 Objetivos específicos

- Preparar y normalizar las imágenes del conjunto de datos.
- Diseñar una CNN adecuada para imágenes de 28 × 28 píxeles en escala de grises.
- Permitir la configuración de hiperparámetros desde la interfaz.
- Exponer entrenamiento, métricas y predicción mediante endpoints REST.
- Mostrar gráficamente la evolución de accuracy y loss.
- Guardar el modelo y el historial de la última ejecución.
- Elaborar documentación técnica y funcional reproducible.

## 4. Alcance

La versión actual cubre el entrenamiento local con Fashion-MNIST, la persistencia de un modelo Keras, la consulta de métricas y la predicción individual de archivos de imagen. Está orientada a fines educativos y se ejecuta en un equipo local.

Quedan fuera del alcance actual el registro de usuarios, una base de datos, el entrenamiento distribuido, el despliegue productivo, el procesamiento masivo y la clasificación de prendas fuera de las diez clases de Fashion-MNIST.

## 5. Metodología de desarrollo

El trabajo se dividió en cinco etapas:

1. **Análisis:** definición de clases, entradas, salidas y flujo del usuario.
2. **Preparación:** carga de Fashion-MNIST, normalización a valores entre 0 y 1 y adición del canal de color.
3. **Modelado:** construcción y compilación de una CNN configurable.
4. **Integración:** creación de endpoints y conexión del frontend mediante `fetch`.
5. **Evaluación:** revisión de accuracy, loss y comportamiento con imágenes nuevas.

## 6. Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
|---|---|
| Python | Lógica del backend y aprendizaje automático |
| FastAPI | API REST, validación y Swagger UI |
| Uvicorn | Servidor ASGI de desarrollo |
| TensorFlow/Keras | Dataset, CNN, entrenamiento y predicción |
| NumPy | Conversión y manipulación numérica de imágenes |
| Pillow | Apertura, conversión y redimensionamiento |
| Pydantic | Validación de la configuración |
| HTML/CSS/JavaScript | Interfaz web |
| Chart.js | Gráficas de métricas |
| JSON | Etiquetas e historial de entrenamiento |

## 7. Arquitectura de la solución

```text
Usuario
  │
  ▼
Frontend (HTML, CSS, JavaScript)
  │ solicitudes HTTP/JSON y multipart/form-data
  ▼
API REST (FastAPI)
  ├── Configuración (Pydantic)
  ├── Entrenamiento (TensorFlow/Keras)
  ├── Predicción (Pillow + NumPy + Keras)
  └── Persistencia local
       ├── backend/model.keras
       ├── backend/labels.json
       └── metrics/historial.json
```

El frontend y el backend están desacoplados. JavaScript consume la API configurada en pantalla, mientras FastAPI coordina las operaciones del modelo. Las rutas se centralizan en `backend/config.py` para evitar dependencias de la ubicación desde la que se ejecuta el proyecto.

## 8. Diseño del modelo de inteligencia artificial

La entrada tiene forma `(28, 28, 1)`. La arquitectura es secuencial:

1. Convolución de 32 filtros de 3 × 3 con activación ReLU.
2. Max pooling de 2 × 2.
3. Convolución de 64 filtros de 3 × 3 con activación ReLU.
4. Max pooling de 2 × 2.
5. Aplanamiento de características.
6. Capa densa de 128 neuronas con ReLU.
7. Dropout configurable.
8. Capa de salida de diez neuronas con softmax.

Se utiliza `sparse_categorical_crossentropy` porque las etiquetas son enteros, y `accuracy` como métrica principal. El usuario puede seleccionar Adam o SGD y configurar la tasa de aprendizaje.

## 9. Funcionamiento general

Al iniciar, la interfaz consulta la salud de la API, el estado del modelo y las métricas previas. Para entrenar, primero envía la configuración y luego solicita `/train`. El backend descarga o recupera Fashion-MNIST, normaliza los datos, crea un modelo nuevo, entrena con el conjunto de prueba como validación, guarda el archivo Keras y escribe el historial.

Para predecir, el usuario carga un archivo. La API lo almacena en `images/`, lo convierte a escala de grises, lo redimensiona a 28 × 28, normaliza sus valores y ejecuta el modelo. La respuesta contiene la clase con mayor probabilidad, su confianza y el detalle por clase.

## 10. Resultados

La última ejecución registrada el 7 de julio de 2026 utilizó 10 épocas, batch size 32, learning rate 0.001, Adam y dropout 0.30.

| Métrica final | Valor |
|---|---:|
| Accuracy de entrenamiento | 0.9401 (94,01 %) |
| Accuracy de validación | 0.9153 (91,53 %) |
| Loss de entrenamiento | 0.1581 |
| Loss de validación | 0.2585 |

El accuracy de entrenamiento aumentó de 81,94 % a 94,01 %, mientras que el de validación pasó de 86,53 % a 91,53 %. La mejora confirma el aprendizaje del modelo. La brecha final de aproximadamente 2,48 puntos porcentuales y la estabilización de la pérdida de validación sugieren que entrenar muchas más épocas sin regularización adicional podría incrementar el sobreajuste.

## 11. Pruebas y validación

La validación funcional debe cubrir:

- Conexión correcta e incorrecta con la API.
- Rechazo de configuraciones fuera de los límites de Pydantic.
- Consulta de métricas antes y después de entrenar.
- Bloqueo de predicción cuando no existe el modelo.
- Carga de imágenes JPEG, PNG o WebP válidas.
- Correspondencia entre respuesta de la API y representación visual.
- Persistencia del modelo y del historial al reiniciar el servidor.

La guía reproducible se encuentra en [MANUAL_TECNICO.md](MANUAL_TECNICO.md).

## 12. Seguridad y limitaciones

- CORS está abierto a todos los orígenes y debe restringirse antes de publicar.
- El nombre del archivo cargado se utiliza directamente; debe sanearse para un entorno productivo.
- No existen límites explícitos de tamaño o validación estricta del MIME de la imagen.
- El entrenamiento es síncrono y puede bloquear un trabajador de la API.
- El conjunto de prueba se utiliza como validación durante el entrenamiento; para una evaluación rigurosa conviene separar validación y prueba.
- El preprocesamiento de fotografías reales no reproduce necesariamente el fondo y contraste de Fashion-MNIST, por lo que la precisión fuera del dominio puede disminuir.
- Solo se conserva el historial de la última corrida.

## 13. Mejoras futuras

- Ejecutar el entrenamiento como tarea en segundo plano y reportar progreso.
- Separar conjuntos de entrenamiento, validación y prueba.
- Aplicar aumento de datos y parada temprana.
- Incorporar matriz de confusión, precision, recall y F1 por clase.
- Versionar modelos y almacenar múltiples ejecuciones en una base de datos.
- Validar tipo, tamaño y nombre de los archivos cargados.
- Añadir pruebas automatizadas de API y lógica del modelo.
- Empaquetar la solución con Docker y configurar despliegue seguro.

## 14. Conclusiones

El proyecto logró integrar los componentes esenciales de un sistema de inteligencia artificial: adquisición y preparación de datos, construcción de un modelo, entrenamiento, evaluación, persistencia, API e interfaz de usuario. La arquitectura modular facilita entender la responsabilidad de cada archivo y permite ampliar la solución.

Los resultados registrados son adecuados para una práctica con Fashion-MNIST y evidencian que la CNN puede generalizar a imágenes del mismo dominio. A la vez, las limitaciones identificadas muestran que convertir un prototipo académico en un servicio productivo requiere reforzar seguridad, evaluación, pruebas, trazabilidad y procesamiento asíncrono.

## 15. Evidencias

La captura principal del sistema se incorpora en la documentación funcional:

![Interfaz principal del sistema](capturas/interfaz-principal.png)

El procedimiento para actualizar las evidencias se encuentra en [capturas/README.md](capturas/README.md).

## 16. Referencias

- Documentación de TensorFlow y Keras.
- Documentación de FastAPI.
- Fashion-MNIST, creado por Zalando Research.
- Documentación de Pydantic, Pillow y Chart.js.

> Antes de entregar, complete los datos de portada y adapte el formato de referencias al estilo solicitado por la institución.


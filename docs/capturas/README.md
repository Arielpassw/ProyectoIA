# Evidencias y capturas de pantalla

Esta carpeta contiene imágenes reales de la interfaz destinadas al informe.

## Capturas previstas

| Archivo | Evidencia |
|---|---|
| `interfaz-principal.png` | Vista general de los tres paneles |
| `swagger-api.png` | Swagger UI con los endpoints (captura manual recomendada) |
| `resultado-entrenamiento.png` | Métricas y gráficas tras una corrida (captura manual) |
| `resultado-prediccion.png` | Clase y probabilidades para una imagen (captura manual) |

La documentación incluye automáticamente `interfaz-principal.png`. Las demás deben producirse con el backend activo porque dependen del estado real del modelo.

## Procedimiento para completar la evidencia

1. Instale las dependencias y ejecute la API.
2. Sirva `frontend/` en el puerto 5500.
3. Abra la interfaz a un tamaño aproximado de 1600 × 1000.
4. Capture la pantalla inicial y guárdela como `interfaz-principal.png`.
5. Entrene el modelo y capture las métricas como `resultado-entrenamiento.png`.
6. Cargue una imagen, ejecute la predicción y guarde `resultado-prediccion.png`.
7. Abra `http://localhost:8000/docs` y guarde `swagger-api.png`.
8. Compruebe que las capturas no muestren datos personales, rutas privadas ni errores.

## Reglas para el informe

- Utilice capturas del sistema real, sin generar resultados ficticios.
- Añada número, título y explicación debajo de cada figura.
- Mantenga visibles los controles relevantes y use una resolución legible.
- Si cambia la interfaz o la API, renueve las evidencias.


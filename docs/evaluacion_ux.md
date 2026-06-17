# Evaluación de la Experiencia de Usuario (UX)

Este documento presenta una evaluación detallada de la aplicación **BigQuery Release Notes Viewer** desde la perspectiva de la usabilidad, rendimiento, feedback y accesibilidad, acompañada de una propuesta de mejoras específicas.

---

## 1. Análisis de Estado Actual

### A. Usabilidad (Facilidad de Uso)
*   **Puntos Fuertes:**
    *   **Simplicidad:** La disposición de la aplicación en una sola página con secciones claras (Header, Grid y Drawer) reduce la carga cognitiva.
    *   **Flujo Directo:** La posibilidad de copiar y tuitear desde la misma tarjeta ahorra pasos intermedios.
    *   **Selección Múltiple:** El sistema agrupa dinámicamente varios lanzamientos en un solo Tweet de forma automática.
*   **Puntos de Mejora:**
    *   No hay una forma rápida de ver el recuento total de notas seleccionadas a menos que el drawer esté visible.
    *   Falta un botón de "Limpiar selección" para desmarcar todas las tarjetas de una sola vez.

### B. Capacidad de Respuesta (Rendimiento)
*   **Puntos Fuertes:**
    *   **Estados Skeleton:** Previene el redibujado brusco de la página (*Layout Shift*) al cargar las notas, mejorando la percepción de velocidad.
    *   **Transiciones Suaves:** El uso de animaciones fluidas al pasar el cursor sobre las tarjetas y al abrir el drawer da sensación de robustez.
*   **Puntos de Mejora:**
    *   Cada vez que se hace clic en "Actualizar", el backend realiza una petición externa a Google Cloud. Si la conexión con el servidor de feeds es lenta, el usuario experimentará retraso.

### C. Feedback (Mensajes y Control de Errores)
*   **Puntos Fuertes:**
    *   **Feedback Inmediato:** El botón de copiar cambia temporalmente a "¡Copiado!" con un cambio de color de borde muy visual.
    *   **Gestión de Errores Estilizada:** Si la API falla, se muestra una tarjeta roja integrada en el diseño en lugar de dejar la pantalla en blanco o lanzar un error de consola críptico.
*   **Puntos de Mejora:**
    *   La aplicación utiliza el método `alert()` nativo del navegador cuando no hay datos para exportar a CSV, lo cual interrumpe la navegación y rompe la estética de la app.

---

## 2. Lista de Mejoras Propuestas

| Categoría | Propuesta de Mejora | Impacto en UX | Complejidad |
| :--- | :--- | :--- | :--- |
| **Usabilidad** | **Botón "Desmarcar Todo"**<br>Permitir limpiar la selección de notas activa con un solo botón en el panel flotante o el encabezado. | Alto | Baja |
| **Rendimiento** | **Caché en Servidor (Flask-Caching)**<br>Guardar el feed en caché (ej. 15 minutos) para evitar llamadas constantes a la API externa de Google en accesos repetidos. | Alto | Media |
| **Feedback** | **Notificaciones Toast no intrusivas**<br>Reemplazar el `alert()` del navegador por notificaciones flotantes temporales (toasts) personalizadas para eventos de exportación, copia o errores. | Medio | Baja |
| **Accesibilidad** | **Indicador de Focus Claro**<br>Asegurar un contorno altamente visible (`outline`) al navegar mediante la tecla `TAB` en todos los botones e inputs. | Alto | Baja |
| **Interactividad** | **Filtrado por Palabras Clave o Categorías**<br>Añadir un buscador simple en la cabecera para filtrar notas de lanzamiento por términos como "SQL", "Security", "BigLake", etc. | Muy Alto | Media |

---

## 3. Próximos Pasos Recomendados

> [!TIP]
> Priorizar la implementación del **Buscador/Filtro de notas** y las **Notificaciones Toast**. Estas dos adiciones elevarán la aplicación a un estándar de calidad comercial sin requerir cambios estructurales pesados.

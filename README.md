# BigQuery Release Notes Viewer & Tweet Sharer

Una aplicación web moderna y elegante construida con **Python Flask** en el backend y **HTML, CSS y JavaScript puros** en el frontend. Permite visualizar las últimas notas de lanzamiento de Google Cloud BigQuery directamente desde su feed oficial y compartirlas en Twitter de manera individual o agrupada.

## Características

- **Visualización en Tiempo Real:** Obtiene y parsea directamente el feed XML de notas de lanzamiento oficial de BigQuery.
- **Diseño Premium:** Interfaz de usuario moderna con tema oscuro, efectos glassmorphism, microanimaciones suaves y soporte de carga con estados skeleton.
- **Actualización Dinámica:** Botón de actualización integrado con indicador de carga animado (spinner).
- **Integración con Twitter (X):** 
  - Permite redactar y previsualizar tweets individuales de cualquier actualización con un solo clic.
  - Ofrece selección múltiple de notas para generar automáticamente un tweet recopilatorio con viñetas.
  - Contador de caracteres en tiempo real con límite de 280 caracteres y control de validación.

## Estructura del Proyecto

```text
bq-releases-notes/
├── .gitignore             # Exclusiones de Git
├── app.py                 # Servidor Flask y parser de feed XML
├── requirements.txt       # Dependencias de Python
├── README.md              # Documentación del proyecto
├── static/
│   ├── script.js          # Control de eventos, Fetch API e integración con Twitter
│   └── style.css          # Estilos CSS premium y animaciones
└── templates/
    └── index.html         # Interfaz de usuario HTML5 semántica
```

## Requisitos

- Python 3.12 o superior
- Conexión a Internet (para descargar el feed de notas de lanzamiento)

## Instalación y Uso Local

1. **Clonar el repositorio o descargar los archivos:**
   ```bash
   git clone https://github.com/andres20980/antigravity-event-talks-app.git
   cd bq-releases-notes
   ```

2. **Crear e iniciar el entorno virtual:**
   ```bash
   python -m venv .venv
   # En Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   # En Linux/macOS:
   source .venv/bin/activate
   ```

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Ejecutar la aplicación:**
   ```bash
   python app.py
   ```

5. **Acceder en el navegador:**
   Abra [http://127.0.0.1:5000](http://127.0.0.1:5000) para ver la aplicación web.

## Tecnologías Utilizadas

- **Backend:** Python, Flask, Requests, XML ElementTree.
- **Frontend:** Vanilla HTML5, Vanilla CSS3 (Variables, CSS Grid, Flexbox, Animations), Vanilla JavaScript (ES6, Fetch API, DOM Manipulation).

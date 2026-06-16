# Sistema de Detección de Cáncer de Mama / Breast Cancer Detection System

[![Spanish](https://img.shields.io/badge/lang-Español-blue.svg)](#español)
[![English](https://img.shields.io/badge/lang-English-red.svg)](#english)

---

<a name="español"></a>
## 🇪🇸 Descripción del Proyecto
Este proyecto es una solución integral diseñada para la **detección y análisis de cáncer de mama en tejidos histológicos**. El sistema permite a los usuarios cargar imágenes de tejido (con dimensiones de 50x50 píxeles), las cuales son procesadas por modelos de aprendizaje profundo para obtener resultados diagnósticos automatizados.

### 📥 Configuración Inicial
1. **Descarga los recursos:** Accede al [enlace de Google Drive del proyecto](https://drive.google.com/drive/folders/1aNT_6z5iHrFOSZCK5WoSKxxA5V0enuCb?usp=drive_link).
2. **Organización de archivos:**
   * **Modelos:** Mueve el contenido de la carpeta `modelo` a: `histologico_backend/modelo/scripts/modelos/`
   * **Fuentes (Fonts):** Mueve el contenido de la carpeta `fonts` a: `histologico_frontend/public/assets/fonts/`

### ⚙️ Cómo funciona el sistema
1. **Entrada de datos:** El usuario sube una imagen de tejido histológico de 50x50 píxeles desde el frontend.
2. **Procesamiento:** El backend recibe la imagen y utiliza los modelos pre-entrenados para realizar el análisis.
3. **Predicción:** El sistema devuelve los resultados del diagnóstico.

### 📋 Requisitos
* Asegúrate de que las rutas de los archivos coincidan exactamente con la estructura mencionada.
* El sistema espera imágenes de entrada de **50x50 píxeles**.
* *Nota: Se recomienda añadir las carpetas de modelos a tu archivo `.gitignore` si los archivos son muy pesados.*

---

<a name="english"></a>
## 🇬🇧 Project Description
This project is an integrated solution designed for the **detection and analysis of breast cancer in histological tissues**. The system allows users to upload tissue images (50x50 pixels), which are processed by deep learning models to obtain automated diagnostic results.

### 📥 Initial Setup
1. **Download resources:** Access the [Google Drive project link](https://drive.google.com/drive/folders/1aNT_6z5iHrFOSZCK5WoSKxxA5V0enuCb?usp=drive_link).
2. **File Organization:**
   * **Models:** Move the contents of the `modelo` folder to: `histologico_backend/modelo/scripts/modelos/`
   * **Fonts:** Move the contents of the `fonts` folder to: `histologico_frontend/public/assets/fonts/`

### ⚙️ How it works
1. **Data Input:** The user uploads a 50x50 pixel histological image from the frontend.
2. **Processing:** The backend receives the image and uses pre-trained models to perform the analysis.
3. **Prediction:** The system returns the diagnostic results.

### 📋 Requirements
* Ensure the file paths match the structure mentioned above exactly.
* The system expects **50x50 pixel** input images.
* *Note: It is recommended to add the model folders to your `.gitignore` file if the files are too heavy.*
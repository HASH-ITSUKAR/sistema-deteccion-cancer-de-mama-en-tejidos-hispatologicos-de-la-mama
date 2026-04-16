import sys, os
from PIL import Image
import json

# --- Agregar la carpeta raíz al sys.path ---
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# --- Importar la función ---
from modelo.hibrido_transformers import predecir_hibrido_transformers

# --- Ruta de la imagen dentro de la carpeta prueba ---
imagen_path = os.path.join(os.path.dirname(__file__), "prueba", "13.png")

if not os.path.exists(imagen_path):
    raise FileNotFoundError(f"No se encontró la imagen de prueba en: {imagen_path}")

# --- Abrir imagen ---
imagen = Image.open(imagen_path)

# --- Ejecutar predicción ---
resultado = predecir_hibrido_transformers(imagen)

# --- Mostrar resultados ---
print(json.dumps(resultado, indent=4))

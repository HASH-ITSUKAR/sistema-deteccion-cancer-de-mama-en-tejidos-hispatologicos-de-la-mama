from flask import Flask, request, jsonify
from PIL import Image
import sys, os

# --- Ajustar sys.path para poder importar ---
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# --- Importar tu modelo ---
from modelo.hibrido_transformers import predecir_hibrido_transformers

# Inicializar la aplicación Flask
app = Flask(__name__)

from flask_cors import CORS
CORS(app)

# Endpoint de prueba
@app.route('/hola', methods=['GET'])
def hola_mundo():
    return jsonify({"mensaje": "hola mundo"})

# Endpoint para predicción
@app.route('/predecir', methods=['POST'])
def predecir():
    if "imagen" not in request.files:
        return jsonify({"error": "Debes enviar una imagen en el campo 'imagen'"}), 400

    archivo = request.files["imagen"]

    try:
        imagen = Image.open(archivo.stream)  # Abrir directo desde el archivo recibido
        resultado = predecir_hibrido_transformers(imagen)
        return jsonify(resultado)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ejecutar la app
if __name__ == '__main__':
    app.run(debug=True, port=5000)

import os
import joblib
import numpy as np
import torch # Aunque los scripts manejen sus tensores, lo dejamos por si acaso

# --- IMPORTACIÓN DE TUS SCRIPTS INDIVIDUALES ---
# Asumiendo que están en la misma carpeta o paquete
from .scripts.CaiT import analizar_cait
from .scripts.DeiT import analizar_deit
from .scripts.DenseNet import analizar_densenet
from .scripts.EfficientNet import analizar_efficientnet
from .scripts.Inception import analizar_inception
from .scripts.PVT import analizar_pvt
from .scripts.Swin import analizar_swin
from .scripts.ViT import analizar_vit

from .scripts.transformacion import obtener_imagen_procesada_base64

# --- CONFIGURACIÓN DE RUTAS ---
directorio_actual = os.path.dirname(os.path.abspath(__file__))
ruta_xgb = os.path.join(directorio_actual, "scripts", "modelos", "xgb.pkl")

if not os.path.exists(ruta_xgb):
    raise FileNotFoundError(f"No se encontró el archivo del modelo XGBoost en: {ruta_xgb}")

# --- CARGA DEL ENSAMBLE (Único modelo cargado en la raíz) ---
xgb_modelo = joblib.load(ruta_xgb)
features_xgb = ["Swin", "DeiT", "Inception", "ViT", "CaiT", "EfficientNet", "DenseNet", "PVT"]

# --- FUNCIÓN DEL ENDPOINT ---
def predecir_hibrido_transformers(imagen_pil):
    """
    Orquesta las funciones analíticas de cada script individual,
    recopila sus mapas de calor/probabilidades y calcula el ensamble XGBoost.
    """
    resultados = {}

    # 1. Obtener la imagen de auditoría procesada (224x224 con CLAHE) en Base64
    try:
        imagen_procesada_b64 = obtener_imagen_procesada_base64(imagen_pil)
    except Exception as e:
        print(f"⚠️ Alerta: No se pudo generar la imagen base64 de auditoría: {e}")
        imagen_procesada_b64 = None

    # 2. Llamar secuencialmente a cada script pasando la imagen limpia
    resultados["CaiT"] = analizar_cait(imagen_pil)
    resultados["DeiT"] = analizar_deit(imagen_pil)
    resultados["DenseNet"] = analizar_densenet(imagen_pil)
    resultados["EfficientNet"] = analizar_efficientnet(imagen_pil)
    resultados["Inception"] = analizar_inception(imagen_pil)
    resultados["PVT"] = analizar_pvt(imagen_pil)
    resultados["Swin"] = analizar_swin(imagen_pil)
    resultados["ViT"] = analizar_vit(imagen_pil)

    # 3. Extraer las probabilidades de la clase 1 en el orden correcto para XGBoost
    try:
        xgb_input = [resultados[m]["probabilidades"]["clase_1"] for m in features_xgb]
    except KeyError as e:
        raise KeyError(f"Error al recopilar probabilidades para XGBoost. Verifica el retorno del script de {e}")

    # 4. Predicción del Ensamble
    input_array = np.array(xgb_input).reshape(1, -1)
    xgb_pred = int(xgb_modelo.predict(input_array)[0])
    xgb_prob = xgb_modelo.predict_proba(input_array)[0]

    # 5. Respuesta JSON final unificada y anidada de forma limpia
    respuesta_final = {
        "imagen_procesada_modelo": imagen_procesada_b64,
        "resultados_individuales": resultados,
        "XGBoost_ensamble": {
            "prediccion": xgb_pred,
            "probabilidades": {
                "clase_0": float(xgb_prob[0]),
                "clase_1": float(xgb_prob[1])
            }
        }
    }

    return respuesta_final

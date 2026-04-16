import torch
import torch.nn.functional as F
from timm import create_model
from .transformacion import preprocesar_imagen_pil
import os
from collections import OrderedDict
import joblib
import numpy as np

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- RUTAS DE LOS MODELOS ---
directorio_actual = os.path.dirname(os.path.abspath(__file__))
modelos_paths = {
    "CaiT": os.path.join(directorio_actual, "modelos", "CaiT.pth"),
    "DeiT": os.path.join(directorio_actual, "modelos", "DeiT.pth"),
    "DenseNet": os.path.join(directorio_actual, "modelos", "DenseNet.pth"),
    "EfficientNet": os.path.join(directorio_actual, "modelos", "EfficientNet.pth"),
    "Inception": os.path.join(directorio_actual, "modelos", "Inception.pth"),
    "PVT": os.path.join(directorio_actual, "modelos", "PVT.pth"),
    "Swin": os.path.join(directorio_actual, "modelos", "Swin.pth"),
    "ViT": os.path.join(directorio_actual, "modelos", "ViT.pth"),
    "XGBoost": os.path.join(directorio_actual, "modelos", "xgb.pkl"),
}

# --- DEFINICIONES DE MODELOS ---
modelos_def = {
    "Swin": "swin_tiny_patch4_window7_224",
    "DeiT": "deit_tiny_patch16_224",
    "Inception": "inception_next_small",
    "ViT": "vit_tiny_patch16_224",
    "CaiT": "cait_xxs24_224",
    "EfficientNet": "efficientnet_b0",
    "DenseNet": "densenet121",
    "PVT": "pvt_v2_b0",
}

# --- CARGA DE MODELOS ---
modelos = OrderedDict()
for nombre, modelo_name in modelos_def.items():
    ruta = modelos_paths[nombre]
    if not os.path.exists(ruta):
        raise FileNotFoundError(f"No se encontró el archivo del modelo: {ruta}")
    
    modelo = create_model(modelo_name, pretrained=False, num_classes=2)
    modelo.load_state_dict(torch.load(ruta, map_location=device))
    modelo.to(device).eval()
    modelos[nombre] = modelo

# --- CARGA DE XGBOOST ---
xgb_modelo = joblib.load(modelos_paths["XGBoost"])
features_xgb = ["Swin","DeiT","Inception","ViT","CaiT","EfficientNet","DenseNet","PVT"]

# --- FUNCIÓN DE PREDICCIÓN ---
def predecir_hibrido_transformers(imagen_pil):
    """
    Retorna un JSON con las predicciones de todos los modelos
    y la predicción final del ensamble XGBoost
    """
    # Preprocesar imagen
    tensor = preprocesar_imagen_pil(imagen_pil).unsqueeze(0).to(device)

    resultados = {}

    with torch.no_grad():
        # Predicciones individuales
        for nombre, modelo in modelos.items():
            salida = modelo(tensor)
            probabilidades = F.softmax(salida, dim=1).cpu().numpy()[0]
            pred = int(probabilidades.argmax())  # clase 0 o 1
            resultados[nombre] = {
                "prediccion": pred,
                "probabilidades": {
                    "clase_0": float(probabilidades[0]),
                    "clase_1": float(probabilidades[1]),
                }
            }

    # Predicción XGBoost usando los 8 mejores modelos
    xgb_input = [resultados[m]["probabilidades"]["clase_1"] for m in features_xgb]
    xgb_pred = int(xgb_modelo.predict(np.array(xgb_input).reshape(1, -1))[0])
    xgb_prob = xgb_modelo.predict_proba(np.array(xgb_input).reshape(1, -1))[0]

    resultados["XGBoost_ensamble"] = {
        "prediccion": xgb_pred,
        "probabilidades": {
            "clase_0": float(xgb_prob[0]),
            "clase_1": float(xgb_prob[1])
        }
    }

    return resultados

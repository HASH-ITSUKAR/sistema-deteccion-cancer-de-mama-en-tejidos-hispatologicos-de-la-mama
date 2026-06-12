import os
import io
import cv2
import base64
import numpy as np
import torch
import torch.nn.functional as F
from timm import create_model
from .transformacion import preprocesar_imagen_pil
from PIL import Image

# Configuración del dispositivo y rutas
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
directorio_actual = os.path.dirname(os.path.abspath(__file__))
ruta_cait = os.path.join(directorio_actual, "modelos", "CaiT.pth")

# Inicialización del modelo CaiT
modelo = create_model("cait_xxs24_224", pretrained=False, num_classes=2, img_size=224)
modelo.load_state_dict(torch.load(ruta_cait, map_location=device))
modelo.to(device).eval()

# Hook para capturar los pesos de atención de la última capa
atencion_capturada = {}
def hook_atencion_cait(module, input, output):
    atencion_capturada['pesos'] = output

# Registrar el hook en la capa de atención del último bloque
handle = modelo.blocks[-1].attn.attn_drop.register_forward_hook(hook_atencion_cait)

def analizar_cait(imagen_pil):
    """
    Analiza una imagen usando CaiT, calcula el mapa de calor de atención 
    sobre la imagen procesada de 224x224 y devuelve el resultado con la 
    imagen superpuesta codificada en Base64.
    """
    # 1. Escalar la imagen de entrada a la vista del modelo (224x224) para la visualización
    imagen_procesada_vista = imagen_pil.resize((224, 224))
    
    # 2. Preprocesar la imagen para obtener el tensor de inferencia
    tensor = preprocesar_imagen_pil(imagen_pil).unsqueeze(0).to(device)
    
    # Inferencia del modelo sin calcular gradientes
    with torch.no_grad():
        salida = modelo(tensor)
        probabilidades = F.softmax(salida, dim=1).cpu().numpy()[0]
        pred = int(probabilidades.argmax())

    imagen_base64 = None
    
    # 3. Procesamiento del mapa de atención si se capturaron los pesos
    if 'pesos' in atencion_capturada:
        pesos = atencion_capturada['pesos'].cpu().numpy()[0]
        mapa_promedio = np.mean(pesos, axis=0)
        attn_clase = mapa_promedio[0, 1:]  # Atención del token CLS a los parches de la imagen
        
        # Calcular dimensiones del grid de parches (normalmente 14x14 para 224x224 con parches de 16x16)
        lado_grid = int(np.sqrt(len(attn_clase)))
        mapa_2d = attn_clase[:lado_grid*lado_grid].reshape(lado_grid, lado_grid)
        
        # Normalizar la matriz de atención entre 0 y 255
        mapa_min, mapa_max = mapa_2d.min(), mapa_2d.max()
        mapa_normalizado = ((mapa_2d - mapa_min) / (mapa_max - mapa_min + 1e-8) * 255).astype(np.uint8)
        
        # Redimensionar el mapa de parches (14x14) a la resolución del modelo (224x224)
        mapa_escalado = cv2.resize(mapa_normalizado, (224, 224), interpolation=cv2.INTER_CUBIC)
        
        # Aplicar el mapa de color JET (Azul = Baja atención, Rojo = Alta atención)
        mapa_color = cv2.applyColorMap(mapa_escalado, cv2.COLORMAP_JET)
        mapa_color_rgb = cv2.cvtColor(mapa_color, cv2.COLOR_BGR2RGB)
        imagen_mapa_calor_pil = Image.fromarray(mapa_color_rgb)
        
        # Superponer la imagen que vio el modelo con el mapa de calor (50% de opacidad cada una)
        imagen_superpuesta_pil = Image.blend(imagen_procesada_vista, imagen_mapa_calor_pil, alpha=0.5)
        
        # 4. Codificar la imagen resultante a formato Base64 para salida JSON estructurada
        buffer = io.BytesIO()
        imagen_superpuesta_pil.save(buffer, format="PNG")
        imagen_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    # Retorno final limpio y serializable en JSON
    return {
        "modelo": "CaiT",
        "prediccion": pred,
        "probabilidades": {
            "clase_0": float(probabilidades[0]), 
            "clase_1": float(probabilidades[1])
        },
        "tipo_explicacion": "atencion",
        "mapa_calor": f"data:image/png;base64,{imagen_base64}"
    }
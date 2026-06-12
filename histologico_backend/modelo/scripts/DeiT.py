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
ruta_deit = os.path.join(directorio_actual, "modelos", "DeiT.pth")

# Inicialización del modelo DeiT Tiny
modelo = create_model("deit_tiny_patch16_224", pretrained=False, num_classes=2, img_size=224)
modelo.load_state_dict(torch.load(ruta_deit, map_location=device))
modelo.to(device).eval()

# Hook para capturar y replicar el cálculo de la matriz de atención de DeiT
atencion_capturada = {}
def hook_atencion_deit(module, input, output):
    x = input[0]
    B, N, C = x.shape
    num_heads = module.num_heads
    head_dim = C // num_heads
    scale = head_dim ** -0.5
    qkv = module.qkv(x).reshape(B, N, 3, num_heads, head_dim).permute(2, 0, 3, 1, 4)
    q, k, v = qkv[0], qkv[1], qkv[2]
    attn = (q @ k.transpose(-2, -1)) * scale
    atencion_capturada['pesos'] = attn.softmax(dim=-1)

# Registrar el hook en la capa de atención del último bloque
handle = modelo.blocks[-1].attn.register_forward_hook(hook_atencion_deit)

def analizar_deit(imagen_pil):
    """
    Analiza una imagen usando DeiT, calcula el mapa de calor de atención 
    sobre la imagen procesada de 224x224 (gestionando tokens CLS/Distill)
    y devuelve el resultado con la imagen superpuesta codificada en Base64.
    """
    # 1. Escalar la imagen de entrada a la vista del modelo (224x224) para la visualización
    imagen_procesada_vista = imagen_pil.resize((224, 224))
    
    # 2. Preprocesar la imagen para obtener el tensor de inferencia
    tensor = preprocesar_imagen_pil(imagen_pil).unsqueeze(0).to(device)
    
    # Inferencia sin gradientes
    with torch.no_grad():
        salida = modelo(tensor)
        probabilidades = F.softmax(salida, dim=1).cpu().numpy()[0]
        pred = int(probabilidades.argmax())

    imagen_base64 = None
    
    # 3. Procesamiento del mapa de atención si se capturaron los pesos
    if 'pesos' in atencion_capturada:
        pesos = atencion_capturada['pesos'].cpu().numpy()[0]
        mapa_promedio = np.mean(pesos, axis=0)
        num_tokens = mapa_promedio.shape[0]
        
        # Identificar los parches de la imagen saltando tokens especiales (CLS o CLS + Distill)
        attn_clase = mapa_promedio[0, 2:] if num_tokens == 198 else mapa_promedio[0, 1:]
        
        # Calcular dimensiones del grid
        lado_grid = int(np.sqrt(len(attn_clase)))
        mapa_2d = attn_clase[:lado_grid*lado_grid].reshape(lado_grid, lado_grid)
        
        # Normalizar la matriz entre 0 y 255
        mapa_min, mapa_max = mapa_2d.min(), mapa_2d.max()
        mapa_normalizado = ((mapa_2d - mapa_min) / (mapa_max - mapa_min + 1e-8) * 255).astype(np.uint8)
        
        # Redimensionar el mapa a la resolución exacta del modelo (224x224)
        mapa_escalado = cv2.resize(mapa_normalizado, (224, 224), interpolation=cv2.INTER_CUBIC)
        
        # Aplicar el mapa de color JET y corregir canales a RGB para PIL
        mapa_color = cv2.applyColorMap(mapa_escalado, cv2.COLORMAP_JET)
        mapa_color_rgb = cv2.cvtColor(mapa_color, cv2.COLOR_BGR2RGB)
        imagen_mapa_calor_pil = Image.fromarray(mapa_color_rgb)
        
        # Superposición: Imagen procesada (50%) + Mapa de Calor (50%)
        imagen_superpuesta_pil = Image.blend(imagen_procesada_vista, imagen_mapa_calor_pil, alpha=0.5)
        
        # 4. Codificar la imagen resultante a formato Base64 para JSON
        buffer = io.BytesIO()
        imagen_superpuesta_pil.save(buffer, format="PNG")
        imagen_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    # Retorno estructurado listo para APIs
    return {
        "modelo": "DeiT",
        "prediccion": pred,
        "probabilidades": {
            "clase_0": float(probabilidades[0]), 
            "clase_1": float(probabilidades[1])
        },
        "tipo_explicacion": "atencion",
        "mapa_calor": f"data:image/png;base64,{imagen_base64}"
    }
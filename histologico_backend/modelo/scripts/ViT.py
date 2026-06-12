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
ruta_vit = os.path.join(directorio_actual, "modelos", "ViT.pth")

# Inicialización del modelo ViT Tiny
modelo = create_model("vit_tiny_patch16_224", pretrained=False, num_classes=2, img_size=224)
modelo.load_state_dict(torch.load(ruta_vit, map_location=device))
modelo.to(device).eval()

# Variables globales para Grad-CAM
activaciones_bloque = None
gradientes_bloque = None

def hook_activaciones_vit(module, input, output):
    global activaciones_bloque
    activaciones_bloque = output

def hook_gradientes_vit(module, grad_input, grad_output):
    global gradientes_bloque
    gradientes_bloque = grad_output[0]

# Registrar los hooks en la norma del último bloque para capturar características y gradientes espaciales
handle_act = modelo.blocks[-1].norm1.register_forward_hook(hook_activaciones_vit)
handle_grad = modelo.blocks[-1].norm1.register_full_backward_hook(hook_gradientes_vit)

def generar_mapa_clase_vit(clase_id, logits, imagen_procesada_vista):
    """Genera el mapa de calor discriminativo para una clase específica en ViT usando Grad-CAM"""
    global activaciones_bloque, gradientes_bloque
    
    modelo.zero_grad()
    score = logits[0, clase_id]
    # retain_graph=True es crucial para preservar el grafo de computación para la siguiente clase
    score.backward(retain_graph=True)
    
    if gradientes_bloque is None or activaciones_bloque is None:
        return None
        
    grads = gradientes_bloque.cpu().data.numpy()[0]
    acts = activaciones_bloque.cpu().data.numpy()[0]
    
    # Omitimos el token CLS (índice 0) para quedarnos únicamente con los 196 parches de información espacial
    grads = grads[1:, :]
    acts = acts[1:, :]
    
    # Ponderación de importancia del mapa basándose en los gradientes promedio
    pesos = np.mean(grads, axis=0)
    mapa_cam = np.zeros(acts.shape[0], dtype=np.float32)
    
    for i, w in enumerate(pesos):
        mapa_cam += w * acts[:, i]
        
    # Reconstrucción bidimensional del grid (14x14) y paso por la rectificación ReLU
    lado_grid = int(np.sqrt(len(mapa_cam)))
    mapa_2d = mapa_cam.reshape(lado_grid, lado_grid)
    mapa_2d = np.maximum(mapa_2d, 0)
    
    # Normalización del mapa de calor a formato de imagen estándar (0 - 255)
    mapa_min, mapa_max = mapa_2d.min(), mapa_2d.max()
    mapa_normalizado = ((mapa_2d - mapa_min) / (mapa_max - mapa_min + 1e-8) * 255).astype(np.uint8)
    
    # Redimensionar el mapa de parches al tamaño de visualización estándar (224x224)
    mapa_escalado = cv2.resize(mapa_normalizado, (224, 224), interpolation=cv2.INTER_CUBIC)
    
    # Mapeo cromático JET y cambio de canales a RGB para procesamiento con PIL
    mapa_color = cv2.applyColorMap(mapa_escalado, cv2.COLORMAP_JET)
    mapa_color_rgb = cv2.cvtColor(mapa_color, cv2.COLOR_BGR2RGB)
    
    imagen_mapa_calor_pil = Image.fromarray(mapa_color_rgb)
    imagen_superpuesta_pil = Image.blend(imagen_procesada_vista, imagen_mapa_calor_pil, alpha=0.5)
    
    # Serialización en string codificado Base64 para transferencia en formato JSON
    buffer = io.BytesIO()
    imagen_superpuesta_pil.save(buffer, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}"

def analizar_vit(imagen_pil):
    """
    Analiza una imagen usando ViT y devuelve las probabilidades numéricas
    junto a dos mapas de calor independientes diferenciados por clase.
    """
    # 1. Escalar la imagen de entrada a la vista del modelo (224x224) para la visualización
    imagen_procesada_vista = imagen_pil.resize((224, 224))
    
    # 2. Preprocesar la imagen para obtener el tensor de inferencia (con rastreo de gradiente activo)
    tensor = preprocesar_imagen_pil(imagen_pil).unsqueeze(0).to(device)
    tensor.requires_grad_()
    
    # Inferencia
    salida = modelo(tensor)
    probabilidades = F.softmax(salida, dim=1)
    
    with torch.no_grad():
        prob_numpy = probabilidades.cpu().numpy()[0]
        pred = int(prob_numpy.argmax())
        
    # Generar de forma paralela y limpia los mapas para Clase 0 y Clase 1
    mapa_clase_0 = generar_mapa_clase_vit(0, salida, imagen_procesada_vista)
    mapa_clase_1 = generar_mapa_clase_vit(1, salida, imagen_procesada_vista)
    
    return {
        "modelo": "ViT",
        "prediccion": pred,
        "probabilidades": {
            "clase_0": float(probabilidades[0, 0].item()), 
            "clase_1": float(probabilidades[0, 1].item())
        },
        "tipo_explicacion": "grad_cam_por_clase",
        "mapa_calor_clase_0": mapa_clase_0,
        "mapa_calor_clase_1": mapa_clase_1
    }
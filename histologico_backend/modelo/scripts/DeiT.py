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

# Variables globales para Grad-CAM
activaciones_bloque = None
gradientes_bloque = None

def hook_activaciones_deit(module, input, output):
    global activaciones_bloque
    activaciones_bloque = output

def hook_gradientes_deit(module, grad_input, grad_output):
    global gradientes_bloque
    gradientes_bloque = grad_output[0]

# Registramos los hooks en la norma del último bloque para capturar los mapas de características espaciales
handle_act = modelo.blocks[-1].norm1.register_forward_hook(hook_activaciones_deit)
handle_grad = modelo.blocks[-1].norm1.register_full_backward_hook(hook_gradientes_deit)

def generar_mapa_clase_deit(clase_id, logits, imagen_procesada_vista):
    """Genera el mapa de calor discriminativo para una clase específica en DeiT usando Grad-CAM"""
    global activaciones_bloque, gradientes_bloque
    
    modelo.zero_grad()
    score = logits[0, clase_id]
    score.backward(retain_graph=True)
    
    # Extraemos gradientes y activaciones del tensor [Batch, Num_Tokens, Canales]
    grads = gradientes_bloque.cpu().data.numpy()[0]
    acts = activaciones_bloque.cpu().data.numpy()[0]
    num_tokens = grads.shape[0]
    
    # Manejo de tokens especiales de DeiT (197 significa 1 CLS + 196 parches; 198 significa 1 CLS + 1 Distill + 196 parches)
    if num_tokens == 198:
        grads = grads[2:, :]
        acts = acts[2:, :]
    elif num_tokens == 197:
        grads = grads[1:, :]
        acts = acts[1:, :]
        
    # Ponderación de Grad-CAM
    pesos = np.mean(grads, axis=0)
    mapa_cam = np.zeros(acts.shape[0], dtype=np.float32)
    
    for i, w in enumerate(pesos):
        mapa_cam += w * acts[:, i]
        
    # Reconstrucción 2D (14x14) y paso por ReLU
    lado_grid = int(np.sqrt(len(mapa_cam)))
    mapa_2d = mapa_cam.reshape(lado_grid, lado_grid)
    mapa_2d = np.maximum(mapa_2d, 0)
    
    # Normalización del mapa de calor
    mapa_min, mapa_max = mapa_2d.min(), mapa_2d.max()
    mapa_normalizado = ((mapa_2d - mapa_min) / (mapa_max - mapa_min + 1e-8) * 255).astype(np.uint8)
    
    # Redimensionamiento y renderizado visual
    mapa_escalado = cv2.resize(mapa_normalizado, (224, 224), interpolation=cv2.INTER_CUBIC)
    mapa_color = cv2.applyColorMap(mapa_escalado, cv2.COLORMAP_JET)
    mapa_color_rgb = cv2.cvtColor(mapa_color, cv2.COLOR_BGR2RGB)
    
    imagen_mapa_calor_pil = Image.fromarray(mapa_color_rgb)
    imagen_superpuesta_pil = Image.blend(imagen_procesada_vista, imagen_mapa_calor_pil, alpha=0.5)
    
    # Guardado en buffer a Base64
    buffer = io.BytesIO()
    imagen_superpuesta_pil.save(buffer, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}"

def analizar_deit(imagen_pil):
    """
    Analiza una imagen usando DeiT y devuelve las probabilidades junto con dos
    mapas de calor independientes (uno por cada clase diagnóstica).
    """
    imagen_procesada_vista = imagen_pil.resize((224, 224))
    tensor = preprocesar_imagen_pil(imagen_pil).unsqueeze(0).to(device)
    
    # Activamos el rastreo de gradientes para computar el paso backward de Grad-CAM
    tensor.requires_grad_()
    salida = modelo(tensor)
    
    with torch.no_grad():
        probabilidades = F.softmax(salida, dim=1).cpu().numpy()[0]
        pred = int(probabilidades.argmax())
        
    # Generar mapas de calor específicos para Clase 0 y Clase 1
    mapa_clase_0 = generar_mapa_clase_deit(0, salida, imagen_procesada_vista)
    mapa_clase_1 = generar_mapa_clase_deit(1, salida, imagen_procesada_vista)
    
    return {
        "modelo": "DeiT",
        "prediccion": pred,
        "probabilidades": {
            "clase_0": float(probabilidades[0]), 
            "clase_1": float(probabilidades[1])
        },
        "tipo_explicacion": "grad_cam_por_clase",
        "mapa_calor_clase_0": mapa_clase_0,
        "mapa_calor_clase_1": mapa_clase_1
    }
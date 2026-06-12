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

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
directorio_actual = os.path.dirname(os.path.abspath(__file__))
ruta_cait = os.path.join(directorio_actual, "modelos", "CaiT.pth")

modelo = create_model("cait_xxs24_224", pretrained=False, num_classes=2, img_size=224)
modelo.load_state_dict(torch.load(ruta_cait, map_location=device))
modelo.to(device).eval()

# Variables globales para almacenar activaciones y gradientes de los bloques finales
activaciones_bloque = None
gradientes_bloque = None

def hook_activaciones(module, input, output):
    global activaciones_bloque
    # En CaiT, tomamos las salidas de los parches antes del pooling/CLS final
    activaciones_bloque = output

def hook_gradientes(module, grad_input, grad_output):
    global gradientes_bloque
    gradientes_bloque = grad_output[0]

# Registramos en el último bloque norm del Transformer para capturar características espaciales
# Nota: La capa exacta depende de cómo exponga timm el feature map de CaiT. norm1 o norm suelen funcionar bien.
handle_act = modelo.blocks[-1].norm1.register_forward_hook(hook_activaciones)
handle_grad = modelo.blocks[-1].norm1.register_full_backward_hook(hook_gradientes)

def generar_mapa_clase(clase_id, logits, imagen_procesada_vista):
    """Genera el mapa de calor específico para una clase usando Grad-CAM"""
    global activaciones_bloque, gradientes_bloque
    
    modelo.zero_grad()
    # Seleccionamos el score de la clase objetivo
    score = logits[0, clase_id]
    score.backward(retain_graph=True)
    
    # Grad-CAM clásico adaptado a los tokens de los Transformers
    # Extraemos la información de los parches (omitimos el token CLS si está incluido en el feature map)
    # Para timm Transformers, la forma suele ser [Batch, Secuencia, Canales] (1, 196, Canales)
    grads = gradientes_bloque.cpu().data.numpy()[0]
    acts = activaciones_bloque.cpu().data.numpy()[0]
    
    # Si incluye el token CLS al inicio, cortamos el primer elemento [1:]
    if grads.shape[0] == 197:  # 14x14 + 1 CLS token
        grads = grads[1:, :]
        acts = acts[1:, :]
        
    pesos = np.mean(grads, axis=0)
    mapa_cam = np.zeros(acts.shape[0], dtype=np.float32)
    
    for i, w in enumerate(pesos):
        mapa_cam += w * acts[:, i]
        
    # Pasar a 2D (14x14) y aplicar ReLU
    lado_grid = int(np.sqrt(len(mapa_cam)))
    mapa_2d = mapa_cam.reshape(lado_grid, lado_grid)
    mapa_2d = np.maximum(mapa_2d, 0) # ReLU
    
    # Normalización
    mapa_min, mapa_max = mapa_2d.min(), mapa_2d.max()
    mapa_normalizado = ((mapa_2d - mapa_min) / (mapa_max - mapa_min + 1e-8) * 255).astype(np.uint8)
    
    # Procesamiento visual
    mapa_escalado = cv2.resize(mapa_normalizado, (224, 224), interpolation=cv2.INTER_CUBIC)
    mapa_color = cv2.applyColorMap(mapa_escalado, cv2.COLORMAP_JET)
    mapa_color_rgb = cv2.cvtColor(mapa_color, cv2.COLOR_BGR2RGB)
    
    imagen_mapa_calor_pil = Image.fromarray(mapa_color_rgb)
    imagen_superpuesta_pil = Image.blend(imagen_procesada_vista, imagen_mapa_calor_pil, alpha=0.5)
    
    # Codificación Base64
    buffer = io.BytesIO()
    imagen_superpuesta_pil.save(buffer, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}"

def analizar_cait(imagen_pil):
    """
    Analiza la imagen y devuelve las métricas junto con dos mapas de calor:
    uno correspondiente a la Clase 0 y otro a la Clase 1.
    """
    imagen_procesada_vista = imagen_pil.resize((224, 224))
    tensor = preprocesar_imagen_pil(imagen_pil).unsqueeze(0).to(device)
    
    # Habilitamos gradientes temporalmente para poder computar Grad-CAM por clase
    tensor.requires_grad_()
    salida = modelo(tensor)
    
    with torch.no_grad():
        probabilidades = F.softmax(salida, dim=1).cpu().numpy()[0]
        pred = int(probabilidades.argmax())
        
    # Generar mapas de calor discriminativos por clase
    mapa_clase_0 = generar_mapa_clase(0, salida, imagen_procesada_vista)
    mapa_clase_1 = generar_mapa_clase(1, salida, imagen_procesada_vista)
    
    return {
        "modelo": "CaiT",
        "prediccion": pred,
        "probabilidades": {
            "clase_0": float(probabilidades[0]), 
            "clase_1": float(probabilidades[1])
        },
        "tipo_explicacion": "grad_cam_por_clase",
        "mapa_calor_clase_0": mapa_clase_0,
        "mapa_calor_clase_1": mapa_clase_1
    }
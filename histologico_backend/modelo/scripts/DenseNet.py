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
ruta_densenet = os.path.join(directorio_actual, "modelos", "DenseNet.pth")

# Inicialización del modelo DenseNet
modelo = create_model("densenet121", pretrained=False, num_classes=2)
modelo.load_state_dict(torch.load(ruta_densenet, map_location=device))
modelo.to(device).eval()

# Diccionarios globales para los hooks de Grad-CAM
activaciones = {}
gradientes = {}
def hook_forward(module, input, output): activaciones['data'] = output
def hook_backward(module, grad_input, grad_output): gradientes['data'] = grad_output[0]

# Registrar los hooks en la última capa de normalización antes del clasificador
target_layer = modelo.features.norm5 if hasattr(modelo, 'features') and hasattr(modelo.features, 'norm5') else modelo.norm5
handle_f = target_layer.register_forward_hook(hook_forward)
handle_b = target_layer.register_full_backward_hook(hook_backward)

def analizar_densenet(imagen_pil):
    """
    Analiza una imagen usando DenseNet121, calcula el mapa de calor Grad-CAM 
    sobre la imagen procesada de 224x224 y devuelve el resultado con la 
    imagen superpuesta codificada en Base64.
    """
    # 1. Escalar la imagen de entrada a la vista del modelo (224x224) para la visualización
    imagen_procesada_vista = imagen_pil.resize((224, 224))
    
    # 2. Preprocesar la imagen para obtener el tensor de inferencia (requiere gradientes para Grad-CAM)
    tensor = preprocesar_imagen_pil(imagen_pil).unsqueeze(0).to(device)
    tensor.requires_grad_() 

    # Inferencia
    salida = modelo(tensor)
    probabilidades = F.softmax(salida, dim=1)
    pred = int(probabilidades.argmax(dim=1).item())
    prob_0 = probabilidades[0, 0].item()
    prob_1 = probabilidades[0, 1].item()

    # Viaje hacia atrás (Backward pass) para obtener los gradientes respecto a la clase predicha
    modelo.zero_grad()
    score = salida[0, pred]
    score.backward()

    imagen_base64 = None
    
    # 3. Procesamiento de Grad-CAM si se capturaron activaciones y gradientes
    if 'data' in gradientes and 'data' in activaciones:
        grads = gradientes['data'].cpu().data.numpy()[0]
        acts = activaciones['data'].cpu().data.numpy()[0]
        
        # Promedio global de los gradientes por canal (pesos de importancia)
        pesos = np.mean(grads, axis=(1, 2))
        
        # Combinación lineal ponderada de los mapas de activación
        cam = np.zeros(acts.shape[1:], dtype=np.float32)
        for i, w in enumerate(pesos): 
            cam += w * acts[i, :, :]
            
        # Pasar por una función ReLU (solo conservar características de impacto positivo)
        cam = np.maximum(cam, 0)
        
        # Normalizar el mapa Grad-CAM (de tamaño 7x7) entre 0 y 255
        if cam.max() > 0:
            cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        mapa_normalizado = (cam * 255).astype(np.uint8)
        
        # Redimensionar el mapa de 7x7 a la resolución exacta del modelo (224x224)
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

    # Retorno estructurado consistente con las respuestas anteriores
    return {
        "modelo": "DenseNet",
        "prediccion": pred,
        "probabilidades": {
            "clase_0": prob_0, 
            "clase_1": prob_1
        },
        "tipo_explicacion": "gradcam",
        "mapa_calor": f"data:image/png;base64,{imagen_base64}"
    }
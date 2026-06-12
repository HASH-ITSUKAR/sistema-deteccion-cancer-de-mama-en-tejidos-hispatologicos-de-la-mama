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
ruta_pvt = os.path.join(directorio_actual, "modelos", "PVT.pth")

# Inicialización del modelo PVT v2 B0
modelo = create_model("pvt_v2_b0", pretrained=False, num_classes=2)
modelo.load_state_dict(torch.load(ruta_pvt, map_location=device))
modelo.to(device).eval()

# Diccionarios globales para registrar activaciones y gradientes de Grad-CAM
activaciones = {}
gradientes = {}
def hook_forward(module, input, output): activaciones['data'] = output
def hook_backward(module, grad_input, grad_output): gradientes['data'] = grad_output[0]

# Registrar hooks en la última etapa (stage) de la pirámide de PVT
handle_f = modelo.stages[-1].register_forward_hook(hook_forward)
handle_b = modelo.stages[-1].register_full_backward_hook(hook_backward)

def analizar_pvt(imagen_pil):
    """
    Analiza una imagen usando PVT v2, calcula el mapa de calor Grad-CAM 
    sobre la imagen procesada de 224x224 manejando el formato espacial plano
    y devuelve el resultado con la imagen superpuesta codificada en Base64.
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

    # Viaje hacia atrás (Backward pass) enfocado en la neurona que predijo el modelo
    modelo.zero_grad()
    salida[0, pred].backward()

    imagen_base64 = None

    # 3. Procesamiento de Grad-CAM si se capturaron los datos de la última capa
    if 'data' in gradientes and 'data' in activaciones:
        grads_pvt = gradientes['data'].cpu().data.numpy()[0]
        acts_pvt = activaciones['data'].cpu().data.numpy()[0]
        
        # Redimensionamiento plano robusto a formato (Canales, Alto, Ancho)
        grads_flat = grads_pvt.flatten()
        acts_flat = acts_pvt.flatten()
        
        canales, lado_spatial = 256, 7
        try:
            grads = grads_flat.reshape(canales, lado_spatial, lado_spatial)
            acts = acts_flat.reshape(canales, lado_spatial, lado_spatial)
        except ValueError:
            grads = grads_flat.reshape(lado_spatial, lado_spatial, canales).transpose(2, 0, 1)
            acts = acts_flat.reshape(lado_spatial, lado_spatial, canales).transpose(2, 0, 1)

        # Promedio global de los gradientes (pesos de importancia)
        pesos = np.mean(grads, axis=(1, 2))
        
        # Combinación lineal ponderada de las activaciones
        cam = np.zeros(acts.shape[1:], dtype=np.float32)
        for i, w in enumerate(pesos): 
            cam += w * acts[i, :, :]
            
        # Rectificación lineal (ReLU) para conservar solo impactos positivos
        cam = np.maximum(cam, 0)
        
        # Normalizar el mapa final obtenido entre rango 0 y 255
        if cam.max() > 0: 
            cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        mapa_normalizado = (cam * 255).astype(np.uint8)

        # Redimensionar el mapa de características (7x7) al tamaño de la imagen del modelo (224x224)
        mapa_escalado = cv2.resize(mapa_normalizado, (224, 224), interpolation=cv2.INTER_CUBIC)
        
        # Aplicar el mapa de color JET y reestructurar canales a RGB para PIL
        mapa_color = cv2.applyColorMap(mapa_escalado, cv2.COLORMAP_JET)
        mapa_color_rgb = cv2.cvtColor(mapa_color, cv2.COLOR_BGR2RGB)
        imagen_mapa_calor_pil = Image.fromarray(mapa_color_rgb)
        
        # Superposición: Imagen procesada (50%) + Mapa de Calor (50%)
        imagen_superpuesta_pil = Image.blend(imagen_procesada_vista, imagen_mapa_calor_pil, alpha=0.5)
        
        # 4. Codificar la imagen resultante a formato Base64 para el JSON de la API
        buffer = io.BytesIO()
        imagen_superpuesta_pil.save(buffer, format="PNG")
        imagen_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    # Retorno unificado consistente con todo el pipeline de modelos
    return {
        "modelo": "PVT",
        "prediccion": pred,
        "probabilidades": {
            "clase_0": probabilidades[0, 0].item(), 
            "clase_1": probabilidades[0, 1].item()
        },
        "tipo_explicacion": "gradcam",
        "mapa_calor": f"data:image/png;base64,{imagen_base64}"
    }
import numpy as np
import torch
from PIL import Image
from torchvision import transforms
import cv2
import io
import base64

transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def preprocesar_imagen_pil(imagen_pil):
    """
    Procesa una imagen PIL siguiendo los pasos:
    1. Convertir PIL a array BGR
    2. Redimensionar a 224x224
    3. Convertir a LAB
    4. CLAHE en canal L
    5. Reconstrucción LAB
    6. Convertir a BGR
    7. Convertir a RGB
    8. ToTensor + Normalize (estilo ImageNet)

    Retorna:
        imagen_tensor: torch.Tensor con shape (3, 224, 224)
    """
    # Paso 1. PIL → numpy RGB → luego BGR
    imagen_rgb = np.array(imagen_pil)
    imagen_bgr = cv2.cvtColor(imagen_rgb, cv2.COLOR_RGB2BGR)

    # Paso 2. Redimensionar a 224x224
    imagen_bgr = cv2.resize(imagen_bgr, (224, 224))

    # Paso 3. Convertir de BGR a LAB
    imagen_lab = cv2.cvtColor(imagen_bgr, cv2.COLOR_BGR2LAB)

    # Paso 4. Aplicar CLAHE al canal L
    l, a, b = cv2.split(imagen_lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_clahe = clahe.apply(l)

    # Paso 5. Reconstruir LAB
    imagen_lab_clahe = cv2.merge((l_clahe, a, b))

    # Paso 6. LAB → BGR
    imagen_bgr_mejorada = cv2.cvtColor(imagen_lab_clahe, cv2.COLOR_LAB2BGR)

    # Paso 7. BGR → RGB
    imagen_rgb_mejorada = cv2.cvtColor(imagen_bgr_mejorada, cv2.COLOR_BGR2RGB)

    # Paso 8. ToTensor + Normalize
    imagen_tensor = transform(imagen_rgb_mejorada)

    return imagen_tensor

def obtener_imagen_procesada_base64(imagen_pil):
    """
    Aplica el preprocesamiento matemático, revierte la normalización de ImageNet
    para que los colores sean legibles y retorna un string Base64 (PNG 224x224).
    """
    with torch.no_grad():
        # 1. Obtener el tensor (3, 224, 224) directamente de la función de arriba
        tensor = preprocesar_imagen_pil(imagen_pil).cpu()
        
        # Clonamos para evitar modificar el tensor original por referencia
        t = tensor.clone() 
        
        # 2. Des-normalizar los canales RGB usando la media/std inversa de ImageNet
        mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
        t = t * std + mean
        
        # 3. Forzar límites válidos [0, 1] y pasar a formato estándar PIL (H, W, C) de 0 a 255
        t = torch.clamp(t, 0, 1)
        t = t.permute(1, 2, 0).numpy()
        t = (t * 255).astype('uint8')
        
        # 4. Guardar en memoria como PNG binario y codificar a Base64
        img_resultado = Image.fromarray(t)
        buffer = io.BytesIO()
        img_resultado.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return f"data:image/png;base64,{img_str}"
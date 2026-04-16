import numpy as np
import torch
from PIL import Image
from torchvision import transforms
import cv2

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

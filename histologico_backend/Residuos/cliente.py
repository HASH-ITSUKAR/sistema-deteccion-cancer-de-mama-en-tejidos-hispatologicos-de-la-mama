import requests
from tabulate import tabulate

# URL del endpoint
url = "http://localhost:5000/predecir"

# Enviar la imagen al endpoint
with open("prueba/13.png", "rb") as f:
    res = requests.post(url, files={"imagen": f})

# Obtener la respuesta en JSON
respuesta = res.json()

# Crear tabla con los resultados
tabla = []
for modelo, datos in respuesta.items():
    tabla.append([
        modelo,
        datos["prediccion"],
        round(datos["probabilidades"]["clase_0"], 4),
        round(datos["probabilidades"]["clase_1"], 4)
    ])

# Mostrar tabla en consola
# print(tabulate(tabla, headers=["Modelo", "Predicción", "Clase 0", "Clase 1"], tablefmt="fancy_grid"))
print(respuesta)
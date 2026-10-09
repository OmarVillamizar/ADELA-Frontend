"""Genera las copias web del avatar Nelse a partir de los PNG originales.

Por cada `src/assets/nelse_mascot/*.png` (1024 x 1024, fondo transparente)
escribe `src/assets/nelse_mascot/web/<mismo nombre>.webp`:

1. Recorta al dibujo: quita el margen transparente. Se toma como dibujo todo
   píxel con alfa > 24, para que el halo casi invisible del borde no cuente.
2. Escala a 360 px de alto, conservando la proporción (LANCZOS). Basta para
   mostrarlo hasta 180 px de alto en pantallas de doble densidad.
3. Guarda en WebP con transparencia, calidad 86 y method=6 (la compresión
   más lenta y pequeña).

Resultado: de 400-660 KB por PNG a 21-31 KB por WebP.

Uso, desde ADELA-Frontend (requiere Pillow: `pip install pillow`):

    python scripts/mascota-web.py

Volver a correrlo tras agregar o cambiar un PNG; sobrescribe los WebP.
"""
import glob
import os

from PIL import Image

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
ORIGEN = os.path.join(RAIZ, "src", "assets", "nelse_mascot")
DESTINO = os.path.join(ORIGEN, "web")
ALTO = 360
UMBRAL_ALFA = 24

os.makedirs(DESTINO, exist_ok=True)
for ruta in sorted(glob.glob(os.path.join(ORIGEN, "*.png"))):
    im = Image.open(ruta).convert("RGBA")
    dibujo = im.getchannel("A").point(lambda a: 255 if a > UMBRAL_ALFA else 0)
    im = im.crop(dibujo.getbbox())
    im = im.resize((round(im.width * ALTO / im.height), ALTO), Image.LANCZOS)
    salida = os.path.join(DESTINO, os.path.splitext(os.path.basename(ruta))[0] + ".webp")
    im.save(salida, "WEBP", quality=86, method=6)
    print(f"{os.path.basename(salida)}  {im.width}x{im.height}  {os.path.getsize(salida) // 1024} KB")

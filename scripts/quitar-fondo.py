"""Quita el fondo blanco (y barras negras laterales) de un PNG del avatar.

Rellena desde los bordes de la imagen todo píxel casi blanco o casi negro
conectado al borde y lo vuelve transparente; lo blanco o negro encerrado en el
dibujo (ojos, camiseta, logo) no se toca. Luego suaviza el borde 1 px para no
dejar halo blanco.

Dos casos se ajustan a mano, mirando una vista previa:

- seed=y,x       hueco blanco cerrado que también es fondo (entre brazo y
                 cuerpo, bajo la barbilla): un punto dentro del hueco.
- keep=x0,y0,x1,y1  línea blanca fina que toca el borde y debe quedar (la
                 costura de la cabeza): la zona donde está. Se conserva el
                 fondo que tenga dibujo a menos de 12 px a ambos lados.

Uso (requiere Pillow y numpy):

    python scripts/quitar-fondo.py entrada.png salida.png [seed=y,x ...] [keep=x0,y0,x1,y1 ...]

Después, `python scripts/mascota-web.py` regenera las copias WebP.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
extras = sys.argv[3:]
img = Image.open(src).convert("RGBA")
a = np.array(img)
rgb = a[..., :3].astype(int)
h, w = rgb.shape[:2]

# Candidato a fondo: casi blanco o casi negro.
cand = (rgb.min(axis=2) > 225) | (rgb.max(axis=2) < 35)

bg = np.zeros((h, w), bool)
q = deque()


def sembrar(y, x):
    if cand[y, x] and not bg[y, x]:
        bg[y, x] = True
        q.append((y, x))


for x in range(w):
    sembrar(0, x)
    sembrar(h - 1, x)
for y in range(h):
    sembrar(y, 0)
    sembrar(y, w - 1)
for s in extras:
    if s.startswith("seed="):
        sembrar(*map(int, s[5:].split(",")))

while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w:
            sembrar(ny, nx)

for s in extras:
    if s.startswith("keep="):
        x0, y0, x1, y1 = map(int, s[5:].split(","))
        for y in range(y0, y1):
            fila = bg[y]
            for x in range(x0, x1):
                if fila[x] and (~fila[max(0, x - 12):x]).any() and (~fila[x + 1:x + 13]).any():
                    bg[y, x] = False

alfa = np.where(bg, 0, 255).astype(np.uint8)
suave = Image.fromarray(alfa).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))
a[..., 3] = np.minimum(alfa, np.array(suave))
Image.fromarray(a).save(dst)
print(f"fondo: {bg.sum()} de {h * w} px")

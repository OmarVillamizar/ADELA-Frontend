# Nelse, el avatar de ADELA

## Archivos

| Ruta | Qué es | Peso |
| --- | --- | --- |
| `nelse_<pose>_<left\|right>.png` | Originales: 1024 × 1024 px, fondo transparente, con margen vacío alrededor | 400–660 KB |
| `web/nelse_<pose>_<left\|right>.webp` | Copias para la web: recortadas al dibujo, 360 px de alto, WebP con transparencia | 21–31 KB |

El sufijo indica hacia dónde mira: `_left` mira a la izquierda y va a la
**derecha** del contenido; `_right` mira a la derecha y va a la **izquierda**.
Así siempre mira hacia lo que acompaña.

Poses: `happy` (saluda), `primary` (de pie), `think` (piensa), `thinkglasses`
(con libreta), `readingbookglasses` (lee), `report` (muestra un gráfico),
`questtionarieOK` (cuestionario listo).

## Cómo se generan las copias web

```bash
# desde ADELA-Frontend; requiere Pillow (pip install pillow)
python scripts/mascota-web.py
```

Por cada PNG, el script [`scripts/mascota-web.py`](../../../scripts/mascota-web.py):

1. **Recorta** el margen transparente. Cuenta como dibujo todo píxel con alfa
   mayor que 24, para que el halo casi invisible del borde no agrande el recorte.
   Por eso el personaje llena su caja y alinea bien junto a un globo de texto.
2. **Escala** a 360 px de alto, conservando la proporción (filtro LANCZOS).
   Alcanza para mostrarlo hasta 180 px de alto en pantallas de doble densidad.
3. **Guarda** en WebP con alfa, calidad 86 y `method=6` (la compresión más
   pequeña).

Hay que volver a correrlo al agregar o cambiar un PNG; sobrescribe los WebP.

## Cuál usar

En la interfaz conviene usar siempre `web/*.webp`: carga unas 20 veces menos.
Los PNG quedan como fuente de alta resolución.

```jsx
import piensa from '../../../assets/nelse_mascot/web/nelse_think_left.webp'

<img src={piensa} alt="" aria-hidden="true" style={{ height: 104 }} />
```

Como la imagen ya viene recortada, se fija solo el **alto** (`height`) y el ancho
sale solo. Es decorativa: `alt=""` y `aria-hidden`.

Dónde se usa hoy:

- `views/profesorVistaCuestionarios/crear/Nelse.jsx` (WebP): avatar y globo con
  consejo en el asistente de creación y en su página de entrada. Las poses se
  eligen por nombre (`feliz`, `piensa`, `lee`, `anota`, `reporte`, `listo`) y el
  lado se decide solo según hacia dónde mira.
- `components/NelseLados.jsx` y `components/NelseMensaje.jsx` (todavía PNG):
  Login, ingreso de código de cápsula y Mi cuenta. Pasarlos a `web/*.webp`
  aligera esas pantallas sin cambiar su aspecto.

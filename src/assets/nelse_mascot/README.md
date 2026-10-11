# Nelse, el avatar de ADELA

Nelse es la mascota de la app y el avatar del asistente de creación de
cuestionarios: acompaña pantallas (login, cápsulas, Mi cuenta) y da consejos
en el asistente. Es decorativo: el mensaje siempre va en el texto.

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

## Componentes

Para un sitio nuevo, reusar uno de estos; no crear CSS por vista. Todos usan
`web/*.webp`.

| Componente | Qué hace | Dónde |
| --- | --- | --- |
| `views/profesorVistaCuestionarios/crear/Nelse.jsx` | Avatar y globo con consejo. Poses por nombre (`feliz`, `piensa`, `lee`, `anota`, `reporte`, `listo`); el lado sale de hacia dónde mira | Asistente de creación y su entrada |
| `components/NelseLados.jsx` | Un Nelse a cada lado del contenido (`izquierda` = `_right`, `derecha` = `_left`, `tamano` `normal`/`grande`). Solo desde 992 px; la página necesita `overflow-x: clip` | Login, `/c` y `/r` |
| `components/NelseMensaje.jsx` | Mensaje a la izquierda y Nelse a la derecha (imágenes `_left`). El hijo es un `CAlert` o un `div.nelse-burbuja` (`nelse-burbuja-exito` = verde). Bajo 576 px se apila | Mi cuenta: la pose cambia con el estado de la cuenta |

Los estilos de `NelseLados` y `NelseMensaje` están en `src/scss/adela-marca.css`
(tamaño por alto con `--nelse-tamano`; animaciones `nelse-entra` y
`nelse-flota`, apagadas con `prefers-reduced-motion`).

## Herramientas (`scripts/`)

| Script | Para qué |
| --- | --- |
| `mascota-web.py` | Regenera `web/*.webp` desde los PNG |
| `quitar-fondo.py` | Quita el fondo blanco de un PNG nuevo (ver su docstring para huecos y costuras) |
| `capturas.sh` + `marco-movil.html` | Capturas del responsive con Chrome headless, escritorio a celular |

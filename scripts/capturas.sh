#!/bin/sh
# Capturas de una ruta del front en varios tamaños con Chrome headless, para
# revisar el responsive sin abrir el navegador. Requiere `npm run dev` (:3000).
#
#   sh scripts/capturas.sh /login antes [carpeta]
#
# Escritorio y tablet: una captura por tamaño. Celulares: Chrome headless no
# baja de ~500 px de ventana, así que se usan iframes de ancho real en
# scripts/marco-movil.html (320, 360, 390 y 430 px) en una sola captura.
# Las rutas con sesión (Mi cuenta, profesor) no cargan: piden login.
# Si un iframe sale con solo el spinner, repetir: la carga es intermitente.
RUTA="$1"; PRE="${2:-captura}"; OUT="${3:-${TMPDIR:-/tmp}/adela-capturas}"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
# pwd -W da la ruta Windows (D:/...) en Git Bash; Chrome no entiende /d/...
DIR="$(cd "$(dirname "$0")" && (pwd -W 2>/dev/null || pwd))"
PERFIL="$OUT/.chrome-perfil"
mkdir -p "$OUT"
foto() { # ancho alto archivo url
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --user-data-dir="$PERFIL" --virtual-time-budget=10000 \
    --window-size="$1,$2" --screenshot="$3" "$4" >/dev/null 2>&1
  echo "$3"
}
for t in 1920x950 1536x730 1280x680 1024x700 820x1050; do
  foto "${t%x*}" "${t#*x}" "$OUT/${PRE}_$t.png" "http://localhost:3000$RUTA"
done
foto 1640 980 "$OUT/${PRE}_moviles.png" "file:///$DIR/marco-movil.html#$RUTA"

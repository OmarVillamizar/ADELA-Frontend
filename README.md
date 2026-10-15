# ADELA — Frontend

Interfaz de ADELA (Aplicativo para la Detección del Estilo de Aprendizaje): React 18,
Vite 5 y la plantilla CoreUI. Habla con el backend `ADELA-Backend` por HTTP.

## Arranque local

Requiere Node 18 o superior.

```sh
npm install
npm run dev        # http://localhost:3000
```

El backend debe estar corriendo y con `ALLOWED_ORIGINS` incluyendo
`http://localhost:3000`, o el login con Google responde 400.

## Variables de entorno

En `.env` (no se versiona; la plantilla es `.env.example`):

| Variable | Ejemplo | Para qué |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:8091` | Origen del backend, sin barra final |

Todo lo que empieza por `VITE_` queda incrustado en el bundle público: nunca pongas
secretos ahí.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `build/` |
| `npm run serve` | Sirve el build localmente |
| `npm run lint` | ESLint sobre `src/**/*.{js,jsx}` |

## Despliegue (Vercel)

`vercel.json` define la reescritura SPA y las cabeceras de seguridad (CSP,
`X-Frame-Options`, `Referrer-Policy`…). Solo se aplican en Vercel: `npm run dev`
y `npm run serve` no las envían.

**Antes del primer despliegue:** reemplaza `https://TODO-DOMINIO-BACKEND` en la
`connect-src` de la CSP por el origen real del backend, o el navegador bloqueará
todas las llamadas a la API.

## Imágenes y mascota

- Nelse, la mascota: guía en `src/assets/nelse_mascot/README.md`. En la UI se usan
  siempre las versiones `web/*.webp`.
- Herramientas en `scripts/`: `quitar-fondo.py` (fondo blanco a transparente),
  `mascota-web.py` (PNG a WebP) y `capturas.sh` (capturas responsive con Chrome headless).

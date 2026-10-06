/**
 * Utilidades de las páginas públicas de cápsulas.
 */

const CLAVE = 'adela.capsulas'

/** "k7qm-2xpa 9dtr" → "K7QM2XPA9DTR", igual que normaliza el backend. */
export const normalizarCodigo = (codigo) =>
  (codigo ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')

/**
 * "K7QM2XPA9DTR" → "K7QM-2XPA-9DTR" (resultado) o "K7QM2X" → "K7Q-M2X"
 * (cápsula, grupo 3), para leerlo o dictarlo.
 */
export const formatearCodigo = (codigo, grupo = 4) =>
  normalizarCodigo(codigo)
    .match(new RegExp(`.{1,${grupo}}`, 'g'))
    ?.join('-') ?? ''

/**
 * UUID v4 del intento. crypto.randomUUID solo existe en contextos seguros
 * (https o localhost); quien abre la cápsula por la IP de la red local no lo
 * tiene, pero getRandomValues sí.
 */
export const nuevoIntento = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  const b = window.crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

/**
 * Último resultado obtenido en este navegador para cada cápsula. Es solo una
 * comodidad: en modo privado o con el almacenamiento bloqueado no hay nada y la
 * página funciona igual.
 */
const leer = () => {
  try {
    return JSON.parse(window.localStorage.getItem(CLAVE)) ?? {}
  } catch {
    return {}
  }
}

export const resultadoRecordado = (codigoCapsula) =>
  leer()[normalizarCodigo(codigoCapsula)] ?? null

export const recordarResultado = (codigoCapsula, codigoResultado) => {
  try {
    const todos = leer()
    todos[normalizarCodigo(codigoCapsula)] = codigoResultado
    window.localStorage.setItem(CLAVE, JSON.stringify(todos))
  } catch {
    // Sin almacenamiento: el código sigue visible en pantalla y en el PDF.
  }
}

/**
 * Nombres de las categorías con mayor puntaje normalizado a su rango, con el
 * mismo criterio que el reporte del profesor. Empates devuelven varias.
 */
export const estilosPredominantes = (categorias) => {
  const normalizado = categorias.map((c) => {
    const rango = c.valorMaximo - c.valorMinimo
    return rango > 0 ? (c.valor - c.valorMinimo) / rango : c.valor
  })
  const max = Math.max(...normalizado)
  if (!Number.isFinite(max) || categorias.every((c) => !c.valor)) return []
  return categorias
    .filter((_, i) => max - normalizado[i] < 1e-9)
    .map((c) => c.nombre)
}

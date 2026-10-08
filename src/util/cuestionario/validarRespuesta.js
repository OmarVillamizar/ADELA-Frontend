/**
 * Reglas de una respuesta válida por formato de pregunta. Son el espejo de
 * ValidadorRespuesta en el servidor: si se apartan, el estudiante ve un error
 * del servidor que el formulario no le dejó anticipar.
 *
 * La respuesta a una pregunta es un objeto { opcionId: cantidad }: 1 por
 * opción marcada (única, múltiple), el rango (jerarquía) o los puntos
 * (reparto). Una opción sin cantidad no aparece.
 */

export const FORMATO = {
  UNICA: 'UNICA',
  MULTIPLE: 'MULTIPLE',
  JERARQUIA: 'JERARQUIA',
  REPARTO: 'REPARTO',
}

/** Marca junto al enunciado en las vistas de consulta; la única no lleva. */
export const ETIQUETA_FORMATO = {
  MULTIPLE: '(Selección Múltiple)',
  JERARQUIA: '(Jerarquía)',
  REPARTO: '(Reparto)',
}

const conCantidad = (p) =>
  p.formato === FORMATO.JERARQUIA || p.formato === FORMATO.REPARTO

/** Mínimo y máximo de opciones marcadas cuando se responde. */
export const limitesSeleccion = (p) => {
  const k = p.opciones.length
  if (p.formato !== FORMATO.MULTIPLE) return { min: 1, max: 1 }
  return {
    min: Math.max(p.minSelecciones ?? 0, p.obligatoria ? 1 : 0),
    max: p.maxSelecciones == null ? k : Math.min(p.maxSelecciones, k),
  }
}

/** Qué falta para que la respuesta sea válida, o null si lo es. */
export const errorPregunta = (p, respuesta) => {
  const valores = Object.values(respuesta)
  if (valores.length === 0) return p.obligatoria ? 'Sin responder' : null

  if (p.formato === FORMATO.JERARQUIA) {
    const k = p.opciones.length
    const completa =
      valores.length === k &&
      new Set(valores).size === k &&
      valores.every((v) => Number.isInteger(v) && v >= 1 && v <= k)
    return completa ? null : `Asigna cada número del 1 al ${k} una sola vez`
  }

  if (p.formato === FORMATO.REPARTO) {
    const suma = valores.reduce((a, b) => a + b, 0)
    return suma === p.puntosRepartir
      ? null
      : `Reparte exactamente ${p.puntosRepartir} puntos (llevas ${suma})`
  }

  const { min, max } = limitesSeleccion(p)
  const t = valores.length
  if (t >= min && t <= max) return null
  return min === max
    ? `Elige ${min} ${min === 1 ? 'opción' : 'opciones'}`
    : `Elige entre ${min} y ${max} opciones`
}

/**
 * Cuerpo de la petición: las opciones de única y múltiple van como lista de
 * ids; los rangos y puntos, en cantidades.
 */
export const armarEnvio = (preguntas, respuestas) => {
  const opcionesSeleccionadasId = []
  const cantidades = {}
  preguntas.forEach((p, idx) => {
    Object.entries(respuestas[idx]).forEach(([id, cantidad]) => {
      if (conCantidad(p)) cantidades[id] = cantidad
      else opcionesSeleccionadasId.push(Number(id))
    })
  })
  return { opcionesSeleccionadasId, cantidades }
}

/** Mensaje de un error de la API con el detalle por pregunta, si lo trae. */
export const detalleError = (e) => {
  const campos = e?.fields ? Object.values(e.fields) : []
  return campos.length > 0 ? campos.join('\n') : e?.message
}

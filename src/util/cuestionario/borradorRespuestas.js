/**
 * Respuestas a medio camino guardadas en el navegador. Si la página se cierra,
 * se recarga o el envío falla, quien responde retoma donde iba en vez de
 * empezar de cero. Se guarda por id de pregunta y de opción: si el cuestionario
 * cambió entre visitas, lo que ya no existe se descarta al leer.
 */

const PREFIJO = 'adela:respuestas:'
const VIGENCIA_MS = 30 * 24 * 60 * 60 * 1000

/** { respuestas, indice } listo para el formulario, o null si no hay nada útil. */
export const leerBorrador = (clave, preguntas) => {
  try {
    const guardado = JSON.parse(window.localStorage.getItem(PREFIJO + clave))
    if (!guardado || Date.now() - guardado.t > VIGENCIA_MS) return null
    const respuestas = preguntas.map((p) => {
      const ids = new Set(p.opciones.map((o) => String(o.id)))
      return Object.fromEntries(
        Object.entries(guardado.respuestas?.[p.id] ?? {}).filter(
          ([id, cantidad]) =>
            ids.has(id) && Number.isInteger(cantidad) && cantidad > 0,
        ),
      )
    })
    if (respuestas.every((r) => Object.keys(r).length === 0)) return null
    const indice = Math.min(
      Math.max(0, Number(guardado.indice) || 0),
      preguntas.length - 1,
    )
    return { respuestas, indice }
  } catch {
    return null
  }
}

/** Devuelve false si el navegador no deja guardar (modo privado, cuota llena). */
export const guardarBorrador = (clave, preguntas, respuestas, indice) => {
  try {
    const porPregunta = Object.fromEntries(
      preguntas.map((p, i) => [p.id, respuestas[i]]),
    )
    window.localStorage.setItem(
      PREFIJO + clave,
      JSON.stringify({ t: Date.now(), indice, respuestas: porPregunta }),
    )
    return true
  } catch {
    return false
  }
}

export const borrarBorrador = (clave) => {
  try {
    window.localStorage.removeItem(PREFIJO + clave)
  } catch {
    // Sin acceso al almacenamiento no hay nada que borrar.
  }
}

/** Al cerrar sesión: la clave lleva el correo y en un equipo compartido quedaba a la vista. */
export const borrarTodosLosBorradores = () => {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIJO))
      .forEach((k) => window.localStorage.removeItem(k))
  } catch {
    // Sin acceso al almacenamiento no hay nada que borrar.
  }
}

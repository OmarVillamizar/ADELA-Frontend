/**
 * Herramientas solo de desarrollo para no contestar cuestionarios a mano. Quien
 * las usa las condiciona a import.meta.env.DEV, así que no llegan al build de
 * producción.
 */
import api from '../services/api'
import { FORMATO, limitesSeleccion } from '../cuestionario/validarRespuesta'

const barajar = (lista) => {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/**
 * Una respuesta válida al azar por pregunta, en el formato de
 * PreguntasCuestionario: { opcionId: cantidad }. Uniforme: el cuestionario que
 * recibe el estudiante no trae los pesos, así que no hay estilos a los que
 * sesgarla.
 */
export const respuestasAlAzar = (preguntas) =>
  preguntas.map((p) => {
    const ids = barajar(p.opciones.map((o) => o.id))
    if (p.formato === FORMATO.JERARQUIA)
      return Object.fromEntries(ids.map((id, i) => [id, i + 1]))
    if (p.formato === FORMATO.REPARTO) {
      const puntos = Object.fromEntries(ids.map((id) => [id, 0]))
      for (let i = 0; i < p.puntosRepartir; i++)
        puntos[ids[Math.floor(Math.random() * ids.length)]]++
      return puntos
    }
    // Como una persona: casi siempre una marca, a veces dos (igual que el backend).
    const { min, max } = limitesSeleccion(p)
    let t = Math.max(min, 1)
    while (t < max && Math.random() < 0.35) t++
    return Object.fromEntries(ids.slice(0, t).map((id) => [id, 1]))
  })

/**
 * Crea `cantidad` estudiantes ficticios en el grupo con el cuestionario ya
 * respondido. Requiere DEV_SIMULACION=true en el backend; si no, 404.
 */
export const simularGrupo = async (idCuestionario, idGrupo, cantidad) => {
  const response = await api.post(
    `/api/dev/grupos/${idGrupo}/simular/${idCuestionario}`,
    {},
    { params: { cantidad } },
  )
  return response.data
}

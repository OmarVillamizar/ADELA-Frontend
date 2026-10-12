import api from './api'

const BASE = '/api/ia/cuestionarios'

// La generación corre en el servidor como un trabajo; estas llamadas solo lo
// crean y lo consultan, así que responden rápido. La subida del PDF es la
// única que puede tardar (hasta 15 MB).
const RAPIDA = 15000
const SUBIDA = 120000

/** {habilitada, maxMb, maxPaginas, cuotaRestante} */
export const estadoIa = async () => {
  const response = await api.get(`${BASE}/estado`, { timeout: RAPIDA })
  return response.data
}

/** Inicia un trabajo con el PDF y/o las instrucciones. Devuelve su id. */
export const crearTrabajo = async (archivo, instrucciones) => {
  const datos = new FormData()
  if (archivo) datos.append('archivo', archivo)
  if (instrucciones) datos.append('instrucciones', instrucciones)
  const response = await api.post(`${BASE}/trabajos`, datos, {
    timeout: SUBIDA,
  })
  return response.data.id
}

/** {id, estado, fase, progreso, version, refinado, resultado, error, aviso, preguntasAlProfesor} */
export const consultarTrabajo = async (id) => {
  const response = await api.get(`${BASE}/trabajos/${id}`, { timeout: RAPIDA })
  return response.data
}

/** El único ajuste del trabajo: {respuestas: [{pregunta, respuesta}], texto}. */
export const refinarTrabajo = async (id, solicitud) => {
  await api.post(`${BASE}/trabajos/${id}/refinar`, solicitud, {
    timeout: RAPIDA,
  })
}

export const cancelarTrabajo = async (id) => {
  await api.delete(`${BASE}/trabajos/${id}`, { timeout: RAPIDA })
}

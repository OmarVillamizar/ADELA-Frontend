import api from './api'

const envuelto = (response) => ({
  ok: response.status >= 200 && response.status < 300,
  data: response.data,
  status: response.status,
})

// Crear Cuestionario
export const crearCuestionario = async (cuestionario) => {
  const response = await api.post('/api/cuestionarios', cuestionario)
  return envuelto(response)
}

// Listar Cuestionarios
export const listarCuestionarios = async () => {
  const response = await api.get('/api/cuestionarios')
  return response.data
}

// Obtener Cuestionario por ID
export const obtenerCuestionario = async (id) => {
  const response = await api.get(`/api/cuestionarios/${id}`)
  return response.data
}

// Eliminar Cuestionario
export const eliminarCuestionario = async (id) => {
  const response = await api.delete(`/api/cuestionarios/${id}`)
  return response.status === 204
}

// Obtener Cuestionarios por Grupo
// Lectura de resultados (esquema, niveles, escalones). Solo administrador.
export const obtenerInterpretacion = async (id) => {
  const response = await api.get(`/api/cuestionarios/${id}/interpretacion`)
  return response.data
}

export const guardarInterpretacion = async (id, interpretacion) => {
  const response = await api.put(
    `/api/cuestionarios/${id}/interpretacion`,
    interpretacion,
  )
  return response.data
}

export const obtenerCuestionariosPorGrupo = async (idGrupo) => {
  const response = await api.get(`/api/cuestionarios/reporte/grupo/${idGrupo}`)
  return response.data
}

// Asignar Cuestionario a Grupo
export const asignarCuestionarioAGrupo = async (idCuestionario, idGrupo) => {
  const response = await api.post(
    `/api/cuestionarios/${idCuestionario}/asignargrupo/${idGrupo}`,
    {},
  )
  return response.status === 201
}

// Asignar Cuestionario a Estudiante
export const asignarCuestionarioAEstudiante = async (
  idCuestionario,
  estudianteEmail,
) => {
  const response = await api.post(
    `/api/cuestionarios/${idCuestionario}/asignarestudiante`,
    { email: estudianteEmail },
  )
  return response.status === 201
}

// Responder Cuestionario
export const responderCuestionario = async (respuesta) => {
  const response = await api.post('/api/cuestionarios/responder', respuesta)
  return response.status === 201
}

export const getMisCuestionarios = async () => {
  const response = await api.get('/api/cuestionarios/mis-cuestionarios')
  return envuelto(response)
}

export const obtenerReporteGrupo = async (idCuestionario, idGrupo) => {
  if (!idCuestionario || !idGrupo) {
    throw new Error('Los parámetros idCuestionario e idGrupo son obligatorios.')
  }
  const response = await api.get(
    `/api/cuestionarios/reporte/${idCuestionario}/grupo/${idGrupo}`,
  )
  return response.data
}

/**
 * Descarga el CSV del grupo. Va por axios y no por un enlace porque la ruta
 * exige el token; el archivo se entrega al navegador desde un blob.
 * formato: 'excel' (punto y coma, coma decimal) o 'rfc4180' (coma, punto).
 */
export const descargarCsvGrupo = async (
  idCuestionario,
  idGrupo,
  formato,
  nombreArchivo,
) => {
  const response = await api.get(
    `/api/cuestionarios/reporte/${idCuestionario}/grupo/${idGrupo}/csv`,
    { params: { formato }, responseType: 'blob' },
  )
  const url = URL.createObjectURL(response.data)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

export const getCuestionarioResultado = async (id) => {
  const response = await api.get(
    `/api/cuestionarios/mis-cuestionarios/resuelto/${id}`,
  )
  return envuelto(response)
}

export const getReporteEstudiante = async (id) => {
  const response = await api.get(`/api/cuestionarios/reporte-estudiante/${id}`)
  return envuelto(response)
}

export const toggleReporteGrupo = async (idCuestionario, idGrupo) => {
  if (!idCuestionario || !idGrupo) {
    throw new Error('Los parámetros idCuestionario e idGrupo son obligatorios.')
  }
  await api.patch(
    `/api/cuestionarios/reporte/${idCuestionario}/grupo/${idGrupo}`,
    {},
  )
}

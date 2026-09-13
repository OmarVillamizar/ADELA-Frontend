import api from './api'

// Obtener información de los grupos
export const getGroups = async () => {
  const response = await api.get('/api/grupos')
  return response.data
}

// Obtener información de los profesores
// Obtener información de los estudiantes
// Busqueda paginada: el servidor devuelve como mucho `size` coincidencias.
// Antes se descargaba la tabla entera para filtrar en el navegador.
export const buscarEstudiantes = async (q, size = 20) => {
  const response = await api.get('/api/estudiantes', { params: { q, size } })
  return response.data
}

// Eliminar un grupo
export const deleteGrupo = async (grupoId) => {
  const response = await api.delete(`/api/grupos/${grupoId}`)
  return response.data
}

export const createGrupo = async (grupoDTO) => {
  const response = await api.post('/api/grupos', grupoDTO)
  return response.data
}

// Añadir estudiantes a un grupo
export const addStudentsToGroup = async (grupoId, estudiantes) => {
  const response = await api.post(
    `/api/grupos/${grupoId}/estudiantes`,
    estudiantes,
  )
  return response.data
}

// Eliminar un estudiante de un grupo
export const deleteStudentFromGroup = async (grupoId, estudianteEmail) => {
  const response = await api.delete(
    `/api/grupos/${grupoId}/estudiantes/${estudianteEmail}`,
  )
  return response.data
}

// Obtener la información de un grupo actualizado
export const getGroupById = async (grupoId) => {
  const response = await api.get(`/api/grupos/${grupoId}`)
  return response.data
}

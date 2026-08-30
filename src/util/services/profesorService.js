import api from './api'

// Listar Profesores
export const listarProfesores = async () => {
  const response = await api.get('/api/profesores')
  return response.data
}

// Consultar Profesor por Correo
export const consultarPorCorreo = async (email) => {
  const response = await api.get(`/api/profesores/${email}`)
  return response.data
}

// Desactivar Profesor: vuelve a la lista de pendientes
export const eliminarProfesor = async (email) => {
  const response = await api.delete(`/api/profesores/deactivate/${email}`)
  return response.data
}

// Activar Cuenta de Profesor
export const activarCuentaProfesor = async (email) => {
  const response = await api.put(`/api/profesores/activate/${email}`, null)
  return response.data
}

// Elevar Cuenta de Profesor a Administrador
export const elevarCuentaProfesor = async (email) => {
  const response = await api.put(`/api/profesores/elevate/${email}`, null)
  return response.data
}

// Degradar Cuenta de Administrador a Profesor
export const bajarCuentaProfesor = async (email) => {
  const response = await api.put(`/api/profesores/demote/${email}`, null)
  return response.data
}

// Rechazar Solicitud de Cuenta de Profesor
export const rechazarSolicitudCuentaProfesor = async (email) => {
  const response = await api.delete(`/api/profesores/reject/${email}`)
  return response.data
}

// Actualizar Profesor
export const actualizarProfesor = async (profesorDTO) => {
  const response = await api.put('/api/profesores', profesorDTO)
  return response.data
}

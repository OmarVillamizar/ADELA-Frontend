import api from './api'

/** URL pública que se comparte por enlace o QR. */
export const enlaceCapsula = (codigo) => `${window.location.origin}/c/${codigo}`

export const listarCapsulas = async () => {
  const response = await api.get('/api/capsulas')
  return response.data
}

export const crearCapsula = async (capsula) => {
  const response = await api.post('/api/capsulas', capsula)
  return response.data
}

export const obtenerCapsula = async (id) => {
  const response = await api.get(`/api/capsulas/${id}`)
  return response.data
}

/** Solo nombre y abierta son editables. */
export const actualizarCapsula = async (id, cambios) => {
  const response = await api.patch(`/api/capsulas/${id}`, cambios)
  return response.data
}

export const obtenerReporteCapsula = async (id) => {
  const response = await api.get(`/api/capsulas/${id}/reporte`)
  return response.data
}

export const eliminarCapsula = async (id) => {
  await api.delete(`/api/capsulas/${id}`)
}

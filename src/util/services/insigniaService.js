import api from './api'

export const obtenerInsignias = async () => {
  const response = await api.get('/api/insignias')
  return response.data
}

export const marcarInsigniaCelebrada = async (codigo) => {
  await api.patch(`/api/insignias/${codigo}/celebrada`)
}

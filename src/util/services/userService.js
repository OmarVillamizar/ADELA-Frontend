import api from './api'
import { dateFromStringToMsUTC } from '../dateUtils'

export const getUserInfo = async () => {
  const response = await api.get('/api/user/info')
  return response.data
}

export const updateUserInfo = async (user) => {
  user.fechaNacimiento = dateFromStringToMsUTC(user.fechaNacimiento)

  const endpoint =
    user.tipoUsuario === 'ESTUDIANTE' ? 'estudiantes' : 'profesores'

  const response = await api.put(`/api/${endpoint}`, user)
  return { ok: response.status === 200, data: response.data, status: response.status }
}

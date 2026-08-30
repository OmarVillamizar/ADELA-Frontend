import api from './api'

export const callTest = async (url, body, method) => {
  const path = `/api/${url}`

  switch (method) {
    case 'POST':
      return api.post(path, body)
    case 'GET':
      return api.get(path)
    case 'DELETE':
      return api.delete(path)
    case 'PUT':
      return api.put(path, body)
    default:
      throw new Error(`Metodo ${method} invalido`)
  }
}

import axios from 'axios'
import { ApiError } from './ApiError'

/**
 * Cliente sin token para las rutas /api/publico. No reutiliza `api`: si el
 * navegador guarda un token vencido, el backend respondería 401 aun en una ruta
 * abierta, y el interceptor de sesión no tiene sentido para quien no tiene cuenta.
 */
const publicApi = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL })

publicApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(ApiError.from(error)),
)

export const obtenerCapsulaPublica = async (codigo) => {
  const response = await publicApi.get(
    `/api/publico/capsulas/${encodeURIComponent(codigo)}`,
  )
  return response.data
}

export const responderCapsula = async (codigo, respuesta) => {
  const response = await publicApi.post(
    `/api/publico/capsulas/${encodeURIComponent(codigo)}/respuestas`,
    respuesta,
  )
  return response.data
}

export const obtenerResultadoCapsula = async (codigo) => {
  const response = await publicApi.get(
    `/api/publico/resultados/${encodeURIComponent(codigo)}`,
  )
  return response.data
}

// Una sola vez: el backend rechaza cambiarla después.
export const responderComplementariaCapsula = async (codigo, opcionId) => {
  const response = await publicApi.post(
    `/api/publico/resultados/${encodeURIComponent(codigo)}/complementaria`,
    { opcionId },
  )
  return response.data
}

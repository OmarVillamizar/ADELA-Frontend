import axios from 'axios'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ApiError } from './ApiError'

/**
 * Instancia unica de axios para toda la aplicacion.
 *
 * Antes cada uno de los 35 puntos de llamada repetia a mano la URL base y la
 * cabecera Authorization, y ninguno distinguia un 401 de un 500: al caducar el
 * token la interfaz mostraba errores genericos en lugar de cerrar sesion.
 */
const [getToken, , removeToken] = useLocalStorage('authToken')

const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Paginas de capsulas, abiertas sin cuenta. Alguien con un token vencido en
 * localStorage las abre igual: AuthProvider pide /api/user/info, recibe 401 y,
 * sin esta excepcion, el participante acababa expulsado al login.
 */
const esRutaPublica = (ruta) =>
  ruta === '/c' ||
  ruta.startsWith('/c/') ||
  ruta === '/r' ||
  ruta.startsWith('/r/')

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sesion invalida o caducada: limpiar y volver al login. El guard evita el
    // bucle cuando la propia pantalla de login recibe un 401.
    if (
      error.response?.status === 401 &&
      window.location.pathname !== '/login' &&
      !esRutaPublica(window.location.pathname)
    ) {
      removeToken()
      window.location.assign('/login')
    }
    return Promise.reject(ApiError.from(error))
  },
)

export default api

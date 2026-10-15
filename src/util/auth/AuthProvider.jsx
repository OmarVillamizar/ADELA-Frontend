import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getUserInfo } from '../services/userService'
import { borrarTodosLosBorradores } from '../cuestionario/borradorRespuestas'
import { borrar as borrarBorradorCuestionario } from '../../views/profesorVistaCuestionarios/crear/useBorrador'

const AuthContext = React.createContext({
  user: null,
  cargando: true,
  signin: () => {},
  signout: () => {},
})

/**
 * Resuelve la sesión una sola vez y la comparte por contexto.
 *
 * Antes declaraba el estado `user` pero no lo exponía en `value`, así que nadie
 * podía leerlo: RequireAuth y AppSidebar pedían `/api/user/info` por su cuenta en
 * cada navegación, dos peticiones por pantalla para un dato que no cambia
 * mientras dure la sesión.
 */
function AuthProvider({ children }) {
  const [getToken, setToken, removeToken] = useLocalStorage('authToken')
  const [user, setUser] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setCargando(false)
      return
    }
    getUserInfo()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setCargando(false))
    // Solo al montar: el token no cambia sin pasar por signin o signout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signin = useCallback(
    (token, callback) => {
      setToken(token)
      setCargando(true)
      getUserInfo()
        .then((data) => {
          setUser(data)
          callback()
        })
        .catch(() => setUser(null))
        .finally(() => setCargando(false))
    },
    [setToken],
  )

  const signout = useCallback(
    (callback) => {
      removeToken()
      // Borradores de esta sesión: no deben quedar para quien use el equipo después.
      borrarTodosLosBorradores()
      borrarBorradorCuestionario()
      setUser(null)
      callback()
    },
    [removeToken],
  )

  const value = { user, cargando, signin, signout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}

function useAuth() {
  return React.useContext(AuthContext)
}

export default AuthProvider
export { AuthContext, useAuth }

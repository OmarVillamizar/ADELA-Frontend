import React, { useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getUserInfo } from '../services/userService'

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
      setUser(null)
      callback()
    },
    [removeToken],
  )

  const value = { user, cargando, signin, signout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  return React.useContext(AuthContext)
}

export default AuthProvider
export { AuthContext, useAuth }

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../auth/AuthProvider'
import {
  marcarInsigniaCelebrada,
  obtenerInsignias,
} from '../services/insigniaService'

const InsigniasContext = React.createContext({
  insignias: [],
  pendiente: null,
  verificar: () => {},
  terminarCelebracion: () => {},
})

/**
 * Una sola consulta al entrar; después solo se vuelve a pedir cuando una acción
 * pudo otorgar una insignia que aún no se tiene. Con todas ganadas, cero
 * peticiones extra. Profesores y administradores no consultan nunca.
 */
function InsigniasProvider({ children }) {
  const { user } = useAuth()
  const habilitado =
    user?.tipoUsuario === 'ESTUDIANTE' && user?.estado !== 'INACTIVA'
  const [insignias, setInsignias] = useState([])

  const cargar = useCallback(() => {
    // Las insignias son un extra: si fallan, la pantalla sigue sin ellas.
    obtenerInsignias()
      .then(setInsignias)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (habilitado) cargar()
  }, [habilitado, cargar])

  // Por ref: verificar no cambia de identidad con cada carga, así las vistas
  // pueden llamarlo desde un efecto sin volver a dispararlo en bucle.
  const insigniasRef = useRef(insignias)
  insigniasRef.current = insignias

  const verificar = useCallback(
    (codigo) => {
      if (
        habilitado &&
        !insigniasRef.current.some((i) => i.codigo === codigo)
      ) {
        cargar()
      }
    },
    [habilitado, cargar],
  )

  const terminarCelebracion = useCallback((codigo) => {
    setInsignias((previas) =>
      previas.map((i) => (i.codigo === codigo ? { ...i, celebrada: true } : i)),
    )
  }, [])

  const pendiente = insignias.find((i) => !i.celebrada) ?? null
  const codigoPendiente = pendiente?.codigo

  // Se marca en el servidor al empezar a mostrarla: si el usuario cierra la
  // pestaña a mitad de la animación no se le repite en cada visita.
  useEffect(() => {
    if (codigoPendiente)
      marcarInsigniaCelebrada(codigoPendiente).catch(() => {})
  }, [codigoPendiente])

  const value = useMemo(
    () => ({ insignias, pendiente, verificar, terminarCelebracion }),
    [insignias, pendiente, verificar, terminarCelebracion],
  )

  return (
    <InsigniasContext.Provider value={value}>
      {children}
    </InsigniasContext.Provider>
  )
}

InsigniasProvider.propTypes = {
  children: PropTypes.node,
}

function useInsignias() {
  return React.useContext(InsigniasContext)
}

export default InsigniasProvider
export { useInsignias }

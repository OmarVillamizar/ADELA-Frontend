import React, { useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { getRole, Roles } from '../../util/userUtils'

const Dashboard = () => {
  const user = useOutletContext() // Obtén la información del usuario del contexto
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      try {
        const role = getRole(user)
        switch (role) {
          case Roles.ESTUDIANTE_INACTIVO:
          case Roles.ESTUDIANTE_INCOMPLETO:
            navigate('/cuenta/actualizar-cuenta-estudiante')
            break
          case Roles.PROFESOR_INACTIVO:
          case Roles.PROFESOR_INCOMPLETO:
            navigate('/cuenta/actualizar-cuenta-profesor')
            break
          case Roles.PROFESOR_ACTIVO:
          case Roles.ADMINISTRADOR:
          case Roles.SUPERADMIN:
            navigate('/grupos')
            break
          case Roles.ESTUDIANTE_ACTIVO:
            navigate('/cuestionarios')
            break
          default:
            navigate('/')
            break
        }
      } catch (error) {
        console.error('Error determining user role:', error)
        navigate('/')
      }
    }
  }, [user, navigate])

  return <></>
}

export default Dashboard

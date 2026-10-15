import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { useEffect } from 'react'
import { CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'
import { getRole, tieneRol } from '../userUtils'

function RequireAuth({ roles }) {
  const { user, cargando } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (cargando) return
    if (!user) {
      navigate('/login')
      return
    }
    // Un usuario en un estado que getRole no sabe clasificar no debe quedarse en
    // una pantalla a la que quiza no tiene acceso: se trata como sesion invalida.
    try {
      if (!tieneRol(getRole(user), roles)) {
        navigate('/')
      }
    } catch (error) {
      console.error('No se pudo determinar el rol del usuario:', error)
      navigate('/login')
    }
  }, [user, cargando, roles, navigate])

  return cargando ? <CSpinner variant="grow" /> : <Outlet context={user} />
}

RequireAuth.propTypes = {
  // Valores de Roles que pueden entrar a la ruta.
  roles: PropTypes.arrayOf(PropTypes.number).isRequired,
}

export default RequireAuth

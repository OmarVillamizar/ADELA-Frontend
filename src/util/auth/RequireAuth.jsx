import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { useEffect } from 'react'
import { CSpinner } from '@coreui/react'
import { getRole } from '../userUtils'

function RequireAuth({ roles }) {
  const { user, cargando } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (cargando) return
    if (!user) {
      navigate('/login')
      return
    }
    if (!roles.includes(getRole(user))) {
      navigate('/')
    }
  }, [user, cargando, roles, navigate])

  return cargando ? <CSpinner variant="grow" /> : <Outlet context={user} />
}

export default RequireAuth

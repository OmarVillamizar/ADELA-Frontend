import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilAccountLogout } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'
import { useAuth } from '../../util/auth/AuthProvider'
import { useNavigate } from 'react-router-dom'

const AppHeaderDropdown = () => {
  const auth = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    auth.signout(() => navigate('/login'))
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle
        aria-label="Menú de sesión"
        placement="bottom-end"
        className="py-0 pe-0 adela-tactil"
        caret={false}
      >
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          Sesión
        </CDropdownHeader>
        <CDropdownDivider />
        <CDropdownItem onClick={() => handleLogout()}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Cerrar sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown

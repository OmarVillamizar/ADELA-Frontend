import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useAuth } from '../util/auth/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { cilMenu, cilAccountLogout } from '@coreui/icons'

import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const headerRef = useRef()

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    const alDesplazar = () => {
      headerRef.current &&
        headerRef.current.classList.toggle(
          'shadow-sm',
          document.documentElement.scrollTop > 0,
        )
    }
    document.addEventListener('scroll', alDesplazar)
    return () => document.removeEventListener('scroll', alDesplazar)
  }, [])

  const handleLogout = (e) => {
    e.preventDefault()
    auth.signout(() => navigate('/login'))
  }

  return (
    <CHeader
      position="sticky"
      className="mb-4 p-0 adela-header-franja"
      ref={headerRef}
    >
      <CContainer className="px-4" fluid>
        <CHeaderToggler
          className="adela-tactil"
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
          aria-label="Mostrar u ocultar el menú"
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderNav className="align-items-center">
          <AppHeaderDropdown />

          <li className="nav-item py-1 align-self-stretch">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <CNavItem>
            <CNavLink
              href="#"
              onClick={handleLogout}
              className="adela-tactil adela-header-accion"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <CIcon icon={cilAccountLogout} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader

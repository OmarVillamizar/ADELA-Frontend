import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'

// sidebar nav config
import navigation from '../_nav'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../util/auth/AuthProvider'
import { getRole } from '../util/userUtils'
import CHAEA_BAR from 'src/assets/images/chaea_bar.png'
const AppSidebar = () => {
  const dispatch = useDispatch()
  // El usuario llega del contexto: antes esta vista repetia /api/user/info en
  // cada navegacion, duplicando la que ya hacia RequireAuth.
  const { user, cargando } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (cargando) return
    if (!user) {
      navigate('/login')
    }
  }, [user, cargando, navigate])
  // En el render: si getRole lanza, se lleva por delante toda la pantalla.
  let rol = []
  try {
    if (user) rol = getRole(user)
  } catch (error) {
    console.error('No se pudo determinar el rol del usuario:', error)
  }
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <img
            src={CHAEA_BAR}
            alt="CHAEA Logo"
            className="img-fluid"
            style={{ height: '8vh', width: '100vw' }}
          />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} rol={rol} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() =>
            dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })
          }
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)

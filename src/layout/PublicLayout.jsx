import React from 'react'
import { Outlet } from 'react-router-dom'
import { CContainer, CFooter, CHeader } from '@coreui/react'
import AdelaTitle from 'src/assets/images/ADELA.png'
import logoUfps from 'src/assets/images/logo_ufps.png'
import './PublicLayout.css'

/**
 * Marco de las páginas sin cuenta (cápsulas). Va fuera de DefaultLayout, cuya
 * barra lateral redirige al login a quien no tiene sesión. Pensado primero para
 * el celular: la mayoría llega escaneando un QR.
 */
const PublicLayout = () => (
  <div className="bg-body-tertiary min-vh-100 d-flex flex-column">
    <CHeader className="publico-header">
      <CContainer className="d-flex align-items-center justify-content-between">
        <img src={AdelaTitle} alt="ADELA" className="publico-logo" />
        <span className="publico-titulo d-none d-sm-inline">
          Aplicativo para la Detección de Estilo del Aprendizaje
        </span>
        <img src={logoUfps} alt="UFPS" className="publico-logo-ufps" />
      </CContainer>
    </CHeader>

    <CContainer className="flex-grow-1 py-3 px-3">
      <Outlet />
    </CContainer>

    <CFooter className="bg-light p-3">
      <CContainer className="text-center">
        <small className="text-muted">
          © {new Date().getFullYear()} ADELA - Aplicativo para la Detección de
          Estilo del Aprendizaje
        </small>
      </CContainer>
    </CFooter>
  </div>
)

export default PublicLayout

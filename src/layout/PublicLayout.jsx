import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { CContainer, CFooter, CHeader } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHome } from '@coreui/icons'
import AdelaTitle from 'src/assets/images/ADELA.png'
import logoUfps from 'src/assets/images/logo_ufps.png'
import './PublicLayout.css'

/**
 * Marco de las páginas sin cuenta (cápsulas). Va fuera de DefaultLayout, cuya
 * barra lateral redirige al login a quien no tiene sesión. Pensado primero para
 * el celular: la mayoría llega escaneando un QR.
 */
const PublicLayout = () => (
  <div className="adela-fondo min-vh-100 d-flex flex-column">
    <CHeader className="publico-header adela-header-franja">
      {/* Tres columnas: los lados miden igual y el título queda en el centro. */}
      <CContainer className="publico-header-grid">
        <Link
          to="/"
          className="publico-inicio adela-tactil"
          aria-label="Volver al inicio"
        >
          <CIcon icon={cilHome} />
          <span className="d-none d-sm-inline">Inicio</span>
        </Link>
        <div className="publico-centro">
          <img src={AdelaTitle} alt="ADELA" className="publico-logo" />
          <span className="publico-titulo d-none d-md-block">
            Aplicativo para la Detección de Estilo del Aprendizaje
          </span>
        </div>
        <img src={logoUfps} alt="UFPS" className="publico-logo-ufps" />
      </CContainer>
    </CHeader>

    <CContainer className="flex-grow-1 d-flex flex-column py-3 px-3">
      <Outlet />
    </CContainer>

    <CFooter className="adela-footer">
      <CContainer className="text-center">
        <p className="adela-footer-texto">
          © {new Date().getFullYear()} <strong>ADELA</strong> · Aplicativo para
          la Detección de Estilo del Aprendizaje
        </p>
      </CContainer>
    </CFooter>
  </div>
)

export default PublicLayout

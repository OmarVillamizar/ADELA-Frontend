import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CRow,
  CHeader,
  CHeaderBrand,
  CFooter,
} from '@coreui/react'
import logoUfps from 'src/assets/images/logo_ufps.png'
import ingSistemas from 'src/assets/images/ingSistemas.png'
import adelalogo from 'src/assets/images/adelalogo.png'
import AdelaTitle from 'src/assets/images/ADELA.png'
import nelseLeyendo from 'src/assets/nelse_mascot/web/nelse_readingbookglasses_right.webp'
import nelsePrincipal from 'src/assets/nelse_mascot/web/nelse_primary_left.webp'
import NelseLados from 'src/components/NelseLados'
import Swal from 'sweetalert2'
import { decodeJwt } from 'jose'
import { useLocalStorage } from '../../../util/hooks/useLocalStorage'
import { useAuth } from '../../../util/auth/AuthProvider'
import './login.css'

const HOST = import.meta.env.VITE_BACKEND_URL

// "G" oficial de Google en sus cuatro colores; nítida a cualquier tamaño.
const GoogleG = () => (
  <svg viewBox="0 0 48 48" className="login-btn-google" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
)

const Login = () => {
  const [baseurl, setBaseurl] = useState('')
  const auth = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      Swal.fire('Error', error, 'error')
      navigate('/login')
    } else if (token) {
      const info = decodeJwt(token)
      auth.signin(token, () => navigate('/'))
    }

    setBaseurl(
      window.location.protocol + '//' + window.location.host + '/' + 'login',
    )
  }, [searchParams, navigate])

  // Cada rol toma un color del logo: verde el estudiante, azul el profesor.
  const LoginButton = ({ userType, title, description }) => (
    <CCard className={`login-card login-card-${userType}`}>
      <CCardBody className="d-flex">
        <div className="d-flex flex-column align-items-center text-center login-card-content">
          <div className="mb-3">
            <h2 className="login-card-title">{title}</h2>
            <p className="login-card-description">{description}</p>
          </div>
          <div className="mt-auto w-100">
            <CRow>
              <CCol xs={12} className="text-center">
                <a
                  href={`${HOST}/oauth2/authorization/google?userType=${userType}&redirect_to=${baseurl}`}
                  className="login-btn adela-tactil"
                >
                  <GoogleG />
                  <span className="login-btn-text">
                    Iniciar Sesión como {title}
                  </span>
                </a>
              </CCol>
            </CRow>
          </div>
        </div>
      </CCardBody>
    </CCard>
  )

  return (
    <div className="adela-fondo min-vh-100 d-flex flex-column login-pagina">
      <CHeader className="login-header adela-header-franja">
        <CContainer fluid>
          <CHeaderBrand className="header-brand d-flex align-items-center justify-content-between w-100">
            {/* Desktop layout - logos on sides, title in center */}
            <div className="d-none d-lg-flex align-items-center header-side">
              <img
                src={logoUfps}
                alt="UFPS Logo"
                className="img-fluid me-3"
                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
              />
              <img
                src={ingSistemas}
                alt="Ingeniería de Sistemas"
                className="img-fluid"
                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
              />
            </div>

            {/* Center title section - responsive */}
            <div className="text-center flex-grow-1 d-flex flex-column align-items-center header-center">
              <img
                src={AdelaTitle}
                alt="Adela Title"
                className="img-fluid adela-logo"
                style={{
                  width: '120px',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              <h2 className="mt-1 app-title">
                Aplicativo para la Detección de Estilo del Aprendizaje
              </h2>
            </div>

            {/* Desktop right logo */}
            <div className="d-none d-lg-block header-side header-side-end">
              <img
                src={adelalogo}
                alt="ADELA Logo"
                className="img-fluid"
                style={{ width: '96px', height: '96px', objectFit: 'contain' }}
              />
            </div>

            {/* Mobile logos row */}
            <div className="d-lg-none w-100 mobile-logos">
              <div className="d-flex justify-content-center align-items-center gap-3">
                <img
                  src={logoUfps}
                  alt="UFPS Logo"
                  className="img-fluid mobile-logo"
                />
                <img
                  src={ingSistemas}
                  alt="Ingeniería de Sistemas"
                  className="img-fluid mobile-logo"
                />
                <img
                  src={adelalogo}
                  alt="ADELA Logo"
                  className="img-fluid mobile-logo-large"
                />
              </div>
            </div>
          </CHeaderBrand>
        </CContainer>
      </CHeader>

      <CContainer className="flex-grow-1 d-flex align-items-center login-container">
        <CRow className="flex-grow-1 justify-content-center">
          <CCol md={10} lg={9} xl={8}>
            <NelseLados izquierda={nelseLeyendo} derecha={nelsePrincipal}>
              <CCardGroup className="card-group login-card-group">
                <LoginButton
                  userType="estudiante"
                  title="Estudiante"
                  description="Entra y resuelve los cuestionarios de perfiles de aprendizaje asignados por tu profesor"
                />
                <LoginButton
                  userType="profesor"
                  title="Profesor"
                  description="Entra y crea grupos, asígnales cuestionarios y analiza sus resultados"
                />
              </CCardGroup>
            </NelseLados>
            {/* Cápsulas: se responden sin cuenta, con el código del expositor. */}
            <div className="text-center mt-3">
              <Link to="/c" className="capsula-acceso adela-tactil">
                ¿Tienes el código de una cápsula? Haz clic aquí para ingresar
              </Link>
            </div>
          </CCol>
        </CRow>
      </CContainer>

      <CFooter className="adela-footer login-footer">
        <CContainer fluid>
          <CRow>
            <CCol className="text-center">
              <p className="adela-footer-texto footer-text">
                © {new Date().getFullYear()} <strong>ADELA</strong> ·
                Aplicativo para la Detección de Estilo del Aprendizaje
              </p>
            </CCol>
          </CRow>
        </CContainer>
      </CFooter>
    </div>
  )
}

export default Login

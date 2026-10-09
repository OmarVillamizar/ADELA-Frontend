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
import googleIcon from 'src/assets/images/google.png'
import logoUfps from 'src/assets/images/logo_ufps.png'
import ingSistemas from 'src/assets/images/ingSistemas.png'
import chaealogo from 'src/assets/images/chaealogo.png'
import AdelaTitle from 'src/assets/images/ADELA.png'
import Swal from 'sweetalert2'
import { decodeJwt } from 'jose'
import { useLocalStorage } from '../../../util/hooks/useLocalStorage'
import { useAuth } from '../../../util/auth/AuthProvider'
import './login.css'

const HOST = import.meta.env.VITE_BACKEND_URL

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

  const LoginButton = ({ userType, title, description }) => (
    <CCard
      className={`h-100 ${userType === 'estudiante' ? 'p-4' : 'text-white bg-primary p-4'} login-card`}
    >
      <CCardBody className="d-flex align-items-center justify-content-center">
        <div className="d-flex flex-column align-items-center justify-content-center text-center login-card-content">
          <div className="mb-3">
            <h2 className="login-card-title">{title}</h2>
            <p
              className={`login-card-description ${userType === 'estudiante' ? 'text-body-secondary' : 'text-white'}`}
            >
              {description}
            </p>
          </div>
          <div className="mt-auto w-100">
            <CRow>
              <CCol xs={12} className="text-center">
                <a
                  href={`${HOST}/oauth2/authorization/google?userType=${userType}&redirect_to=${baseurl}`}
                  className="btn btn-light px-4 login-btn"
                  style={{
                    color: '#DB4437',
                    backgroundColor: 'white',
                    border: '1px solid #DB4437',
                  }}
                >
                  <img
                    src={googleIcon}
                    alt="Google Logo"
                    className="me-2"
                    style={{ width: '20px' }}
                  />
                  <span className="login-btn-text">Iniciar Sesión como {title}</span>
                </a>
              </CCol>
            </CRow>
          </div>
        </div>
      </CCardBody>
    </CCard>
  )

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-column">
      <CHeader className="login-header">
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
                style={{ width: '120px', height: 'auto', objectFit: 'contain', display: 'block' }}
              />
              <h2 className="mt-1 app-title">Aplicativo para la Detección de Estilo del Aprendizaje</h2>
            </div>

            {/* Desktop right logo */}
            <div className="d-none d-lg-block header-side header-side-end">
              <img
                src={chaealogo}
                alt="CHAEA Logo"
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
                  src={chaealogo}
                  alt="CHAEA Logo"
                  className="img-fluid mobile-logo-large"
                />
              </div>
            </div>
          </CHeaderBrand>
        </CContainer>
      </CHeader>

      <CContainer className="flex-grow-1 d-flex align-items-center login-container">
        <CRow className="flex-grow-1 justify-content-center">
          <CCol md={10} lg={8}>
            <CCardGroup className="h-100 card-group login-card-group">
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
            {/* Cápsulas: se responden sin cuenta, con el código del expositor. */}
            <div className="text-center mt-3">
              <Link to="/c" className="capsula-acceso">
                ¿Tienes el código de una cápsula? Haz clic aquí para ingresar
              </Link>
            </div>
          </CCol>
        </CRow>
      </CContainer>

      <CFooter className="bg-light p-3 login-footer">
        <CContainer fluid>
          <CRow>
            <CCol className="text-center">
              <p className="text-muted mb-0 footer-text">
                © {new Date().getFullYear()} ADELA - Aplicativo para la Detección de Estilo del Aprendizaje
              </p>
            </CCol>
          </CRow>
        </CContainer>
      </CFooter>
    </div>
  )
}

export default Login
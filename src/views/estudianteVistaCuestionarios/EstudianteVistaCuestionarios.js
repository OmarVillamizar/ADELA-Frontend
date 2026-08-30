import React, { useEffect, useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  CAlert,
  CCard,
  CCardBody,
  CCardTitle,
  CCol,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTabPane,
  CButton,
  CBadge,
  CCardHeader,
  CSpinner,
} from '@coreui/react'
import { getMisCuestionarios } from '../../util/services/cuestionarioService'
import { dateFromMsToString } from '../../util/dateUtils'
import { cilBook, cilCheckCircle, cilClock } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import './VistaCuestionario.css'

const EstudianteVistaCuestionario = () => {
  const user = useOutletContext()
  const [activeTab, setActiveTab] = useState(0)
  const [pendientes, setPendientes] = useState([])
  const [resueltos, setResueltos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMisCuestionarios()
      .then((response) => {
        setPendientes(response.data.pendientes)
        setResueltos(response.data.resueltos)
      })
      .catch((err) => {
        console.error('Error fetching cuestionarios:', err)
        setError(err)
      })
      .finally(() => setCargando(false))
  }, [])

  const Aviso = ({ color, children }) => (
    <CAlert color={color} className="mt-3">
      {children}
    </CAlert>
  )
  Aviso.propTypes = {
    color: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  }

  const renderEstado = (lista, vacio) => {
    if (cargando) return <CSpinner color="primary" className="mt-3" />
    if (error)
      return (
        <Aviso color="danger">
          No se pudieron cargar tus cuestionarios. {error.message}
        </Aviso>
      )
    if (lista.length === 0) return <Aviso color="info">{vacio}</Aviso>
    return null
  }

  return (
    <div>
      <CAlert
        color="info"
        className="mb-4 d-flex align-items-center shadow-sm"
        style={{
          backgroundColor: '#d3d3d3',
          borderColor: '#d3d3d3',
        }}
      >
        <CIcon
          icon={cilBook}
          className="flex-shrink-0 me-2"
          width={24}
          height={24}
        />
        <div className="fw-semibold text-black" style={{}}>
          Bienvenid@ Estudiante {user.nombre}
        </div>
      </CAlert>

      <CNav
        variant="underline-border"
        role="tablist"
        style={{
          marginBottom: '0.5rem',
          borderBottom: '2px solid #e9ecef',
        }}
      >
        <CNavItem>
          <CNavLink
            active={activeTab === 0}
            onClick={() => setActiveTab(0)}
            className="d-flex align-items-center"
          >
            <CIcon icon={cilClock} className="me-2" />
            Pendientes
            {!cargando && !error && pendientes.length > 0 && (
              <CBadge color="danger" shape="rounded-pill" className="ms-2">
                {pendientes.length}
              </CBadge>
            )}
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            active={activeTab === 1}
            onClick={() => setActiveTab(1)}
            className="d-flex align-items-center"
          >
            <CIcon icon={cilCheckCircle} className="me-2" />
            Resueltos
          </CNavLink>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane visible={activeTab === 0}>
          {renderEstado(pendientes, 'Aún no tienes cuestionarios asignados.')}
          <CRow className="gy-4" xs={{ cols: 1 }} sm={{ cols: 2 }}>
            {pendientes.map((el, id) => (
              <CCol key={id + 'pendiente'} xs={12} md={6} lg={4}>
                <CCard className="h-100 shadow-sm hover-shadow">
                  <CCardHeader
                    className="bg-light text-center"
                    style={{
                      backgroundColor: '#e6f3ff !important',
                      borderBottom: '1px solid #d1e9ff',
                    }}
                  >
                    <div className="h5 m-0">{el.cuestionario.nombre}</div>
                    <div className="h9 m-0">{el.grupo.nombre}</div>
                  </CCardHeader>
                  <CCardBody>
                    <div className="mb-3">
                      <p className="text-medium-emphasis mb-2">
                        Número de preguntas: {el.cuestionario.numPreguntas}
                      </p>
                      <p className="text-medium-emphasis mb-0">
                        Asignado el: {dateFromMsToString(el.fechaAplicacion)}
                      </p>
                    </div>
                    <div className="text-center mt-3">
                      <Link
                        to={`/cuestionario/${el.cuestionario.id}/responder?asignacion=${el.id}`}
                      >
                        <CButton
                          color="primary"
                          style={{
                            backgroundColor: '#e6f3ff',
                            borderColor: '#d1e9ff',
                            color: '#0056b3',
                            width: '100%',
                          }}
                          className="hover-button"
                        >
                          Iniciar Cuestionario
                        </CButton>
                      </Link>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </CTabPane>

        <CTabPane visible={activeTab === 1}>
          {renderEstado(resueltos, 'Todavía no has resuelto ningún cuestionario.')}
          <CRow className="gy-4" xs={{ cols: 1 }} sm={{ cols: 2 }}>
            {resueltos.map((el, id) => (
              <CCol key={id + 'resuelto'} xs={12} md={6} lg={4}>
                <CCard className="h-100 shadow-sm hover-shadow">
                  <CCardHeader
                    className="bg-light text-center"
                    style={{
                      backgroundColor: '#e6f3ff !important',
                      borderBottom: '1px solid #d1e9ff',
                    }}
                  >
                    <div className="h5 m-0">{el.cuestionario.nombre}</div>
                    <div className="h9 m-0">{el.grupo.nombre}</div>
                  </CCardHeader>
                  <CCardBody>
                    <div className="mb-3">
                      <p className="text-medium-emphasis mb-2">
                        Número de preguntas: {el.cuestionario.numPreguntas}
                      </p>
                      <p className="text-medium-emphasis mb-2">
                        Asignado el: {dateFromMsToString(el.fechaAplicacion)}
                      </p>
                      <p className="text-success mb-0">
                        Resuelto el: {dateFromMsToString(el.fechaResolucion)}
                      </p>
                    </div>
                    <div className="text-center mt-3">
                      <Link to={`/cuestionario/${el.id}/resultado`}>
                        <CButton
                          color="success"
                          style={{
                            backgroundColor: '#dcfce7',
                            borderColor: '#bbf7d0',
                            color: '#15803d',
                            width: '100%',
                          }}
                          className="hover-button-success"
                        >
                          Ver resultados
                        </CButton>
                      </Link>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </CTabPane>
      </CTabContent>
    </div>
  )
}

export default EstudianteVistaCuestionario
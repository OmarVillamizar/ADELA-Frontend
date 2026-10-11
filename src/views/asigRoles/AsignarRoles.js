import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowBottom,
  cilArrowTop,
  cilCheckAlt,
  cilPeople,
  cilUserFollow,
  cilX,
} from '@coreui/icons'
import Swal from 'sweetalert2'
import {
  listarProfesores,
  activarCuentaProfesor,
  elevarCuentaProfesor,
  rechazarSolicitudCuentaProfesor,
  bajarCuentaProfesor,
} from '../../util/services/profesorService'
import { useOutletContext } from 'react-router-dom'

const AsignarRoles = () => {
  const [profesoresActivos, setProfesoresActivos] = useState([])
  const [profesoresInactivos, setProfesoresInactivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = useOutletContext()
  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const data = await listarProfesores()
        const activos = data.filter(
          (profesor) => profesor.estadoProfesor === 'ACTIVA',
        )
        const inactivos = data.filter(
          (profesor) => profesor.estadoProfesor === 'INACTIVA',
        )
        setProfesoresActivos(activos)
        setProfesoresInactivos(inactivos)
        setLoading(false)
      } catch (error) {
        setError('Error al cargar los datos')
        setLoading(false)
      }
    }

    fetchProfesores()
  }, [])

  const handleActivar = async (email) => {
    try {
      await activarCuentaProfesor(email)
      Swal.fire(
        '¡Activado!',
        'La cuenta del profesor ha sido activada.',
        'success',
      )
      setProfesoresInactivos(
        profesoresInactivos.filter((profesor) => profesor.email !== email),
      )
      // También puedes actualizar la lista de profesores activos si es necesario
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al activar la cuenta.', 'error')
    }
  }

  const handleElevar = async (email, rol) => {
    if (rol === 'ADMINISTRADOR') {
      Swal.fire('Advertencia', 'Este profesor ya es administrador.', 'info')
      return
    }
    try {
      await elevarCuentaProfesor(email)
      Swal.fire(
        '¡Elevado!',
        'El profesor ha sido elevado a administrador.',
        'success',
      )
      // Actualizar la lista de profesores activos si es necesario
      const nuevosActivos = profesoresActivos.map((profesor) =>
        profesor.email === email
          ? { ...profesor, rol: 'ADMINISTRADOR' }
          : profesor,
      )
      setProfesoresActivos(nuevosActivos)
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al elevar la cuenta.', 'error')
    }
  }

  const handleBajar = async (email, rol) => {
    if (rol === 'PROFESOR') {
      Swal.fire('Advertencia', 'Este profesor no es administrador.', 'info')
      return
    }
    try {
      await bajarCuentaProfesor(email)
      Swal.fire(
        '¡Correcto!',
        'Se han quitado permisos de administrador al profesor.',
        'success',
      )
      // Actualizar la lista de profesores activos si es necesario
      const nuevosActivos = profesoresActivos.map((profesor) =>
        profesor.email === email ? { ...profesor, rol: 'PROFESOR' } : profesor,
      )
      setProfesoresActivos(nuevosActivos)
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al bajar la cuenta.', 'error')
    }
  }

  const handleRechazar = async (email) => {
    try {
      await rechazarSolicitudCuentaProfesor(email)
      Swal.fire(
        '¡Rechazado!',
        'La solicitud del profesor ha sido rechazada.',
        'success',
      )
      setProfesoresInactivos(
        profesoresInactivos.filter((profesor) => profesor.email !== email),
      )
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al rechazar la solicitud.', 'error')
    }
  }

  // Estado de carga y error comunes a las dos tablas.
  const contenido = (tabla, vacio) => {
    if (loading)
      return (
        <div className="text-center py-3">
          <CSpinner color="primary" />
        </div>
      )
    if (error) return <p className="text-danger mb-0">{error}</p>
    return tabla.length === 0 ? (
      <p className="text-body-secondary mb-0">{vacio}</p>
    ) : null
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex align-items-center gap-2">
          <CIcon icon={cilPeople} />
          <span className="fw-semibold">Profesores activos</span>
          {!loading && (
            <CBadge color="success" shape="rounded-pill">
              {profesoresActivos.length}
            </CBadge>
          )}
        </CCardHeader>
        <CCardBody>
          {contenido(profesoresActivos, 'No hay profesores activos.') ?? (
            <CTable hover responsive align="middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Nombre</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {profesoresActivos.map((profesor) => (
                  <CTableRow key={profesor.email}>
                    <CTableDataCell>{profesor.nombre}</CTableDataCell>
                    <CTableDataCell>{profesor.email}</CTableDataCell>
                    <CTableDataCell>
                      {profesor.rol !== 'ADMINISTRADOR' ? (
                        <CButton
                          color="warning"
                          className="adela-tactil"
                          onClick={() =>
                            handleElevar(profesor.email, profesor.rol)
                          }
                        >
                          <CIcon icon={cilArrowTop} className="me-1" />
                          Elevar a Admin
                        </CButton>
                      ) : profesor.email !== user.email ? (
                        <CButton
                          color="warning"
                          variant="outline"
                          className="adela-tactil"
                          onClick={() =>
                            handleBajar(profesor.email, profesor.rol)
                          }
                        >
                          <CIcon icon={cilArrowBottom} className="me-1" />
                          Quitar Admin
                        </CButton>
                      ) : (
                        <CBadge color="success" className="px-3 py-2">
                          Administrador (tú)
                        </CBadge>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader className="d-flex align-items-center gap-2">
          <CIcon icon={cilUserFollow} />
          <span className="fw-semibold">Solicitudes de profesor</span>
          {!loading && (
            <CBadge color="warning" shape="rounded-pill">
              {profesoresInactivos.length}
            </CBadge>
          )}
        </CCardHeader>
        <CCardBody>
          {contenido(profesoresInactivos, 'No hay solicitudes pendientes.') ?? (
            <CTable hover responsive align="middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Nombre</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {profesoresInactivos.map((profesor) => (
                  <CTableRow key={profesor.email}>
                    <CTableDataCell>{profesor.nombre}</CTableDataCell>
                    <CTableDataCell>{profesor.email}</CTableDataCell>
                    <CTableDataCell>
                      <div className="adela-acciones">
                        <CButton
                          color="success"
                          className="text-white adela-tactil"
                          onClick={() => handleActivar(profesor.email)}
                        >
                          <CIcon icon={cilCheckAlt} className="me-1" />
                          Activar
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          className="adela-tactil"
                          onClick={() => handleRechazar(profesor.email)}
                        >
                          <CIcon icon={cilX} className="me-1" />
                          Rechazar
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default AsignarRoles

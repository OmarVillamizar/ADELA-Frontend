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
} from '@coreui/react'
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
      Swal.fire('Advertencia', 'Este profesor ya es administrador.', 'info')
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
        profesor.email === email
          ? { ...profesor, rol: 'PROFESOR' }
          : profesor,
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

  return (
    <CCard>
      <CCardHeader>Asignar Roles</CCardHeader>
      <CCardBody>
        <h5>Profesores Activos</h5>
        {loading ? (
          <CSpinner color="primary" />
        ) : error ? (
          <p>{error}</p>
        ) : (
          <CTable hover responsive>
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
                        size="sm"
                        onClick={() =>
                          handleElevar(profesor.email, profesor.rol)
                        }
                        style={{ marginRight: '10px' }}
                      >
                        Elevar a Admin
                      </CButton>
                    ) : profesor.email !== user.email ? (
                      <CButton
                        color="warning"
                        size="sm"
                        onClick={() =>
                          handleBajar(profesor.email, profesor.rol)
                        }
                        style={{ marginRight: '10px' }}
                      >
                        Quitar Admin
                      </CButton>
                    ) : (
                      <CButton
                        color="success"
                        disabled
                        size="sm"
                        style={{ marginRight: '10px' }}
                      >
                        Administrador (tú)
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}

        <hr />

        <h5>Profesores Inactivos</h5>
        {loading ? (
          <CSpinner color="primary" />
        ) : error ? (
          <p>{error}</p>
        ) : (
          <CTable hover responsive>
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
                    <CButton
                      color="success"
                      size="sm"
                      onClick={() => handleActivar(profesor.email)}
                      style={{ marginRight: '10px' }}
                    >
                      Activar
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      onClick={() => handleRechazar(profesor.email)}
                    >
                      Rechazar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default AsignarRoles

import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

import {
  CCard,
  CCardBody,
  CCol,
  CCardHeader,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  getGroups,
  deleteGrupo,
  createGrupo,
} from '../../util/services/grupoService'
import SelectorEstudiantes from './SelectorEstudiantes'

const ProfesorGrupos = () => {
  const user = useOutletContext()
  const [nombre, setNombre] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [grupos, setGrupos] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [creando, setCreando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getGroups()
      .then((data) => setGrupos(data))
      .catch((error) => {
        console.error('Error fetching grupos:', error)
      })
  }, [])

  const handleDelete = (grupo) => {
    Swal.fire({
      title: `¿Estás seguro que quieres eliminar el grupo ${grupo.nombre} con ${grupo.numEstudiantes} estudiantes?`,
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteGrupo(grupo.id)
          .then(() => {
            setGrupos(grupos.filter((g) => g.id !== grupo.id))
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El grupo ha sido eliminado.',
              icon: 'success',
            })
          })
          .catch((error) => {
            console.error('Error deleting grupo:', error)
            Swal.fire({
              title: 'Error',
              text: 'Hubo un error al eliminar el grupo.',
              icon: 'error',
            })
          })
      }
    })
  }

  const nombreLimpio = nombre.trim()
  const nombreRepetido = grupos.some(
    (g) => g.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase(),
  )

  // Un grupo puede crearse vacío: la lista de clase suele llegar después.
  const handleCreateGroup = (e) => {
    e.preventDefault()
    if (!nombreLimpio || nombreRepetido || creando) return

    const grupoDTO = {
      nombre: nombreLimpio,
      estudiantes: selectedStudents.map(({ email, nombre }) => ({
        email,
        nombre,
      })),
    }

    setCreando(true)
    createGrupo(grupoDTO)
      .then((response) => {
        setGrupos(
          [
            ...grupos,
            { ...response, numEstudiantes: response.estudiantes.length },
          ].sort((a, b) => a.nombre.localeCompare(b.nombre)),
        )
        cerrarModal()
        Swal.fire({
          title: '¡Grupo creado!',
          text:
            response.estudiantes.length === 0
              ? 'Puedes añadir estudiantes desde el detalle del grupo.'
              : `Se creó con ${response.estudiantes.length} estudiante${response.estudiantes.length !== 1 ? 's' : ''}.`,
          icon: 'success',
        })
      })
      .catch((error) => {
        console.error('Error creando el grupo:', error.message || error)
        Swal.fire({
          title: 'Error',
          text: error.message || 'Hubo un error al crear el grupo.',
          icon: 'error',
        })
      })
      .finally(() => setCreando(false))
  }

  const cerrarModal = () => {
    setModalVisible(false)
    setNombre('')
    setSelectedStudents([])
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CAlert color="info" className="mb-4 adela-bienvenida">
            Bienvenid@ Profesor <strong>{user.nombre}</strong>
          </CAlert>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>Listado de Grupos</span>
              <CButton
                color="success"
                className="text-white adela-tactil"
                onClick={() => setModalVisible(true)}
              >
                <CIcon icon={cilPlus} className="me-1" />
                Añadir Grupo
              </CButton>
            </CCardHeader>
            <CCardBody>
              {grupos.length === 0 ? (
                <p>No hay grupos disponibles</p>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Nombre</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">
                        Número de Estudiantes
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-center">
                        Administrar Cuestionarios
                      </CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {grupos.map((grupo) => (
                      <React.Fragment key={grupo.id}>
                        <CTableRow
                          onClick={() => navigate(`/grupos/${grupo.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <CTableDataCell>{grupo.nombre}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            {grupo.numEstudiantes}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              color="warning"
                              className="adela-tactil"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/resultado/${grupo.id}`)
                              }}
                            >
                              Cuestionarios
                            </CButton>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="danger"
                              className="adela-tactil adela-btn-icono adela-btn-eliminar"
                              aria-label={`Eliminar el grupo ${grupo.nombre}`}
                              title="Eliminar grupo"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(grupo)
                              }}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      </React.Fragment>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CModal
        visible={modalVisible}
        alignment="center"
        className="adela-modal"
        onClose={cerrarModal}
      >
        <CModalHeader>
          <CModalTitle>Crear Nuevo Grupo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm id="formCrearGrupo" onSubmit={handleCreateGroup}>
            <div className="mb-3">
              <CFormLabel htmlFor="nombre">Nombre del Grupo</CFormLabel>
              <CFormInput
                type="text"
                id="nombre"
                placeholder="Ej.: Cálculo I - Grupo A"
                maxLength={100}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                invalid={nombreRepetido}
                feedbackInvalid="Ya tienes un grupo con este nombre."
              />
            </div>

            <SelectorEstudiantes
              seleccionados={selectedStudents}
              onChange={setSelectedStudents}
            />
          </CForm>
        </CModalBody>
        <CModalFooter className="justify-content-between">
          <CButton
            color="secondary"
            variant="outline"
            className="adela-tactil"
            onClick={cerrarModal}
          >
            Cancelar
          </CButton>
          <CButton
            type="submit"
            form="formCrearGrupo"
            color="success"
            className="text-white adela-tactil"
            disabled={!nombreLimpio || nombreRepetido || creando}
          >
            {creando && <CSpinner size="sm" className="me-2" />}
            {selectedStudents.length === 0
              ? 'Crear grupo vacío'
              : `Crear grupo (${selectedStudents.length})`}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProfesorGrupos

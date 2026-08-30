import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CAlert,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormSwitch,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect,
  CSpinner,
  CBadge,
} from '@coreui/react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import Swal from 'sweetalert2'
import { getGroupById } from '../../util/services/grupoService'
import {
  listarCuestionarios,
  obtenerCuestionariosPorGrupo,
  asignarCuestionarioAGrupo,
  obtenerCuestionario,
  toggleReporteGrupo,
} from '../../util/services/cuestionarioService'
import './ModalVistaPreguntas.css'
import { cilInfo, cilList, cilArrowRight } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

// Función para formatear la fecha
const dateFromMsToString = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString() // Ajusta el formato según sea necesario
}

const ResultadosGrupo = () => {
  const user = useOutletContext()
  const { id } = useParams()
  const currentGrupoId = id
  const [grupo, setGrupo] = useState({ cuestionarios: [] })
  const [cuestionarios, setCuestionarios] = useState([])
  const [selectedCuestionario, setSelectedCuestionario] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [questionsModalVisible, setQuestionsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchDatos = async () => {
    try {
      const grupoData = await getGroupById(currentGrupoId)

      const cuestionariosData =
        await obtenerCuestionariosPorGrupo(currentGrupoId)

      setGrupo({ ...grupoData, cuestionarios: cuestionariosData })

      const allCuestionarios = await listarCuestionarios()
      setCuestionarios(allCuestionarios)
    } catch (error) {
      console.error('Error fetching datos:', error.code, error.message)
    }
  }

  useEffect(() => {
    fetchDatos()
  }, [currentGrupoId])

  const handleToggleBloqueo = async (idx) => {
    try {
      const cuestionarioId = grupo.cuestionarios[idx].cuestionario.id
      await toggleReporteGrupo(cuestionarioId, currentGrupoId)
      const cuestionarios = grupo.cuestionarios
      cuestionarios[idx].bloqueado = !cuestionarios[idx].bloqueado
      setGrupo({ ...grupo, cuestionarios: cuestionarios })
    } catch (error) {
      console.error('Error fetching datos:', error.code, error.message)
    }
  }

  const handleAsignar = async () => {
    if (selectedCuestionario) {
      // Comprobar si el cuestionario ya está asignado al grupo
      const cuestionarioAsignado = grupo.cuestionarios.some(
        (item) => item.cuestionario.id === selectedCuestionario.id,
      )

      if (cuestionarioAsignado) {
        Swal.fire(
          'Advertencia',
          'El cuestionario ya está asignado a este grupo.',
          'warning',
        )
        return
      }

      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas asignar el cuestionario "${selectedCuestionario.nombre}" al grupo "${grupo.nombre}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, asignar',
        cancelButtonText: 'Cancelar',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await asignarCuestionarioAGrupo(
              selectedCuestionario.id,
              currentGrupoId,
            )
            Swal.fire(
              'Asignado!',
              `El cuestionario "${selectedCuestionario.nombre}" ha sido asignado al grupo "${grupo.nombre}".`,
              'success',
            )
            setModalVisible(false)
            // Refresh data after assigning
            fetchDatos()
          } catch (error) {
            console.error('Error asignando cuestionario:', error)
            Swal.fire(
              'Error!',
              'Hubo un problema asignando el cuestionario.',
              'error',
            )
          }
        }
      })
    } else {
      Swal.fire(
        'Advertencia',
        'Por favor, selecciona un cuestionario.',
        'warning',
      )
    }
  }

  const handleViewDetails = async (id) => {
    setLoading(true)
    try {
      const data = await obtenerCuestionario(id)
      setSelectedCuestionario(data)
      setDetailsModalVisible(true)
      setLoading(false)
    } catch (error) {
      console.error('Error obteniendo detalles del cuestionario:', error)
      setLoading(false)
    }
  }

  const handleViewQuestions = () => {
    setDetailsModalVisible(false)
    setQuestionsModalVisible(true)
  }

  return (
    <CRow className="justify-content-center mt-4">
      <CCol xs={12}>
        {grupo ? (
          <>
            <CAlert
              color="info"
              className="mb-2 d-flex justify-content-between align-items-center"
              style={{
                backgroundColor: '#d3d3d3',
                border: '#d3d3d3',
                color: 'black',
                padding: '0.5rem',
                margin: '0',
              }}
            >
              <span>
                Profesor {user.nombre} - Grupo {grupo.nombre}
              </span>
              <CButton
                color="secondary"
                className="ml-auto"
                onClick={() => navigate('/grupos/')}
              >
                Volver
              </CButton>
            </CAlert>
            <CCard className="mt-1">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <span>CUESTIONARIOS ASIGNADOS A {grupo.nombre}</span>
                <CButton
                  color="success"
                  onClick={() => setModalVisible(true)}
                  style={{ color: 'white' }}
                >
                  {' '}
                  Asignar Nuevo Cuestionario{' '}
                </CButton>
              </CCardHeader>
              <CCardBody>
                {grupo.cuestionarios.length > 0 ? (
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Nombre</CTableHeaderCell>
                        <CTableHeaderCell>Fecha de Asignación</CTableHeaderCell>
                        <CTableHeaderCell>Bloqueado</CTableHeaderCell>
                        <CTableHeaderCell>Ver Resultados</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {grupo.cuestionarios.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            {item.cuestionario.nombre}
                          </CTableDataCell>
                          <CTableDataCell>
                            Asignado el:{' '}
                            {dateFromMsToString(item.fechaAplicacion)}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormSwitch
                              className={'mx-1'}
                              variant={'3d'}
                              color={'danger'}
                              checked={item.bloqueado}
                              onChange={() => handleToggleBloqueo(index)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="warning"
                              onClick={() => {
                                if (item.cuestionario.id && currentGrupoId) {
                                  navigate(
                                    `/reporte/${item.cuestionario.id}/grupo/${currentGrupoId}`,
                                  )
                                } else {
                                  console.error(
                                    'Valores inválidos:',
                                    item.cuestionario.id,
                                    currentGrupoId,
                                  )
                                  Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'No se pueden generar resultados con datos inválidos.',
                                  })
                                }
                              }}
                            >
                              Ver Resultados
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                ) : (
                  <div className="text-center">
                    <p>No hay cuestionarios asignados a este grupo.</p>
                  </div>
                )}
              </CCardBody>
            </CCard>
            {/* Modal de Asignación de Cuestionario */}
            <CModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              alignment="center"
              size="lg"
            >
              <CModalHeader
                onClose={() => setModalVisible(false)}
                className="bg-light"
              >
                <CModalTitle className="h5 mb-0">
                  Asignar Cuestionario
                </CModalTitle>
              </CModalHeader>
              <CModalBody className="py-4">
                <CFormSelect
                  id="cuestionario"
                  value={selectedCuestionario ? selectedCuestionario.id : ''}
                  onChange={(e) => {
                    const selected = cuestionarios.find(
                      (q) => q.id === parseInt(e.target.value),
                    )
                    setSelectedCuestionario(selected)
                  }}
                  className="mb-3"
                >
                  <option value="">Selecciona un cuestionario</option>
                  {cuestionarios.map((cuestionario) => (
                    <option key={cuestionario.id} value={cuestionario.id}>
                      {cuestionario.nombre}
                    </option>
                  ))}
                </CFormSelect>
                {selectedCuestionario && (
                  <div className="p-3 bg-light rounded">
                    <div className="mb-2">
                      <span className="fw-bold">Número de Preguntas:</span>
                      <span className="ms-2">
                        {selectedCuestionario.numPreguntas ??
                          selectedCuestionario.preguntas?.length ??
                          0}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="fw-bold">Autor:</span>
                      <span className="ms-2">{selectedCuestionario.autor}</span>
                    </div>
                    <CButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(selectedCuestionario.id)}
                      className="w-100"
                      style={{
                        backgroundColor: '#e6f3ff',
                        borderColor: '#d1e9ff',
                        color: '#0056b3',
                      }}
                    >
                      <CIcon icon={cilInfo} className="me-2" />
                      Ver Detalles
                    </CButton>
                  </div>
                )}
              </CModalBody>
              <CModalFooter className="bg-light">
                <CButton
                  color="secondary"
                  variant="outline"
                  onClick={() => setModalVisible(false)}
                >
                  Cancelar
                </CButton>
                <CButton color="primary" onClick={handleAsignar}>
                  Asignar Cuestionario
                </CButton>
              </CModalFooter>
            </CModal>

            {/* Modal de Detalles */}
            <CModal
              visible={detailsModalVisible}
              onClose={() => setDetailsModalVisible(false)}
              alignment="center"
              size="lg"
            >
              <CModalHeader
                onClose={() => setDetailsModalVisible(false)}
                className="bg-light"
              >
                <CModalTitle className="h5 mb-0">
                  Detalles del Cuestionario
                </CModalTitle>
              </CModalHeader>
              <CModalBody className="py-4">
                {loading ? (
                  <div className="text-center p-4">
                    <CSpinner color="primary" />
                  </div>
                ) : (
                  selectedCuestionario && (
                    <div className="p-2">
                      <div className="mb-3">
                        <h6 className="text-primary mb-2">
                          Información General
                        </h6>
                        <div className="p-3 bg-light rounded">
                          <div className="mb-2">
                            <span className="fw-bold">Título:</span>
                            <span className="ms-2">
                              {selectedCuestionario.nombre}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="fw-bold">Autor:</span>
                            <span className="ms-2">
                              {selectedCuestionario.autor}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="fw-bold">Versión:</span>
                            <span className="ms-2">
                              {selectedCuestionario.version}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="fw-bold">
                              Número de Preguntas:
                            </span>
                            <span className="ms-2">
                              {selectedCuestionario.preguntas?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-primary mb-2">Descripción</h6>
                        <div className="p-3 bg-light rounded">
                          {selectedCuestionario.descripcion}
                        </div>
                      </div>
                      <CButton
                        variant="outline"
                        onClick={handleViewQuestions}
                        className="w-100"
                        style={{
                          backgroundColor: '#e6f3ff',
                          borderColor: '#d1e9ff',
                          color: '#0056b3',
                        }}
                      >
                        <CIcon icon={cilList} className="me-2" />
                        Ver Preguntas
                      </CButton>
                    </div>
                  )
                )}
              </CModalBody>
              <CModalFooter className="bg-light">
                <CButton
                  color="secondary"
                  onClick={() => setDetailsModalVisible(false)}
                >
                  Cerrar
                </CButton>
              </CModalFooter>
            </CModal>

            {/* Modal de Preguntas */}
            <CModal
              visible={questionsModalVisible}
              onClose={() => setQuestionsModalVisible(false)}
              portal={true}
              alignment="center"
              size="xl"
            >
              <CModalHeader
                onClose={() => setQuestionsModalVisible(false)}
                className="bg-light"
              >
                <CModalTitle className="h5 mb-0">
                  Preguntas del Cuestionario
                </CModalTitle>
              </CModalHeader>
              <CModalBody className="py-4">
                {loading ? (
                  <div className="text-center p-4">
                    <CSpinner color="primary" />
                  </div>
                ) : (
                  selectedCuestionario &&
                  selectedCuestionario.preguntas && (
                    <div className="questions-container p-2">
                      <div className="mb-4">
                        {selectedCuestionario.preguntas.map(
                          (pregunta, index) => (
                            <div
                              key={index}
                              className="card mb-3 border-0 shadow-sm"
                            >
                              <div className="card-body">
                                <p className="question-text mb-3">
                                  <span className="badge bg-primary me-2">
                                    {index + 1}
                                  </span>
                                  {pregunta.pregunta}{' '}
                                  {pregunta.opcionMultiple
                                    ? '(Selección Múltiple)'
                                    : ''}
                                </p>
                                <ul className="list-unstyled ms-4">
                                  {pregunta.opciones.map(
                                    (opcion, opcionIndex) => (
                                      <li
                                        key={opcionIndex}
                                        className="mb-2 text-muted"
                                      >
                                        <CIcon
                                          icon={cilArrowRight}
                                          className="me-2"
                                          size="sm"
                                        />
                                        {opcion.respuesta}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            </div>
                          ),
                        )}
                      </div>

                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <h6 className="text-primary mb-3">
                            Estilos de Aprendizaje
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {selectedCuestionario.categorias.map(
                              (categoria, index) => (
                                <CBadge
                                  key={index}
                                  color="light"
                                  className="text-dark"
                                >
                                  {categoria.nombre}
                                </CBadge>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </CModalBody>
              <CModalFooter className="bg-light">
                <CButton
                  color="secondary"
                  onClick={() => setQuestionsModalVisible(false)}
                >
                  Cerrar
                </CButton>
              </CModalFooter>
            </CModal>
          </>
        ) : (
          <div className="text-center">
            <p>Cargando datos del grupo...</p>
          </div>
        )}
      </CCol>
    </CRow>
  )
}

export default ResultadosGrupo
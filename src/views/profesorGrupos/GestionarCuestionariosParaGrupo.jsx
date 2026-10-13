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
  CFormLabel,
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
import '../profesorVistaCuestionarios/ModalVistaPreguntas.css'
import {
  cilArrowLeft,
  cilArrowRight,
  cilChartPie,
  cilCheckAlt,
  cilInfo,
  cilList,
  cilPlus,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { ETIQUETA_FORMATO } from '../../util/cuestionario/validarRespuesta'

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
              className="mb-3 py-2 d-flex justify-content-between align-items-center flex-wrap gap-2 adela-bienvenida"
            >
              <span>
                Profesor <strong>{user.nombre}</strong> - Grupo {grupo.nombre}
              </span>
              <CButton
                color="dark"
                variant="outline"
                className="adela-tactil"
                onClick={() => navigate('/grupos/')}
              >
                <CIcon icon={cilArrowLeft} className="me-1" />
                Volver
              </CButton>
            </CAlert>
            <CCard className="mb-4">
              <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="fw-semibold">
                  Cuestionarios asignados a {grupo.nombre}
                </span>
                <CButton
                  color="success"
                  className="text-white adela-tactil"
                  onClick={() => {
                    setSelectedCuestionario(null)
                    setModalVisible(true)
                  }}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Asignar Nuevo Cuestionario
                </CButton>
              </CCardHeader>
              <CCardBody>
                {grupo.cuestionarios.length > 0 ? (
                  <CTable hover responsive align="middle">
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
                              className="mx-1"
                              color="danger"
                              checked={item.bloqueado}
                              aria-label={`Bloquear ${item.cuestionario.nombre}`}
                              onChange={() => handleToggleBloqueo(index)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="warning"
                              className="adela-tactil"
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
                              <CIcon icon={cilChartPie} className="me-1" />
                              Ver Resultados
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                ) : (
                  <p className="text-center text-body-secondary my-3">
                    No hay cuestionarios asignados a este grupo.
                  </p>
                )}
              </CCardBody>
            </CCard>
            {/* Modal de Asignación de Cuestionario */}
            <CModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              alignment="center"
              size="lg"
              className="adela-modal"
            >
              <CModalHeader>
                <CModalTitle>Asignar Cuestionario</CModalTitle>
              </CModalHeader>
              <CModalBody className="py-4">
                <CFormLabel htmlFor="cuestionario" className="fw-semibold">
                  Cuestionario
                </CFormLabel>
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
                  {cuestionarios.map((cuestionario) => {
                    const asignado = grupo.cuestionarios.some(
                      (item) => item.cuestionario.id === cuestionario.id,
                    )
                    return (
                      <option
                        key={cuestionario.id}
                        value={cuestionario.id}
                        disabled={asignado}
                      >
                        {cuestionario.nombre}
                        {asignado ? ' (ya asignado)' : ''}
                      </option>
                    )
                  })}
                </CFormSelect>
                {selectedCuestionario && (
                  <>
                    <dl className="adela-ficha mb-3">
                      <dt>Preguntas</dt>
                      <dd>
                        {selectedCuestionario.numPreguntas ??
                          selectedCuestionario.preguntas?.length ??
                          0}
                      </dd>
                      <dt>Autor</dt>
                      <dd>{selectedCuestionario.autor}</dd>
                    </dl>
                    <CButton
                      onClick={() => handleViewDetails(selectedCuestionario.id)}
                      className="w-100 adela-tactil adela-btn-suave"
                    >
                      <CIcon icon={cilInfo} className="me-2" />
                      Ver Detalles
                    </CButton>
                  </>
                )}
              </CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  variant="outline"
                  className="adela-tactil"
                  onClick={() => setModalVisible(false)}
                >
                  Cancelar
                </CButton>
                <CButton
                  color="primary"
                  className="adela-tactil"
                  disabled={!selectedCuestionario}
                  onClick={handleAsignar}
                >
                  <CIcon icon={cilCheckAlt} className="me-1" />
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
              className="adela-modal"
            >
              <CModalHeader>
                <CModalTitle>Detalles del Cuestionario</CModalTitle>
              </CModalHeader>
              <CModalBody className="py-4">
                {loading ? (
                  <div className="text-center p-4">
                    <CSpinner color="primary" />
                  </div>
                ) : (
                  selectedCuestionario && (
                    <>
                      <h6 className="adela-subtitulo mt-0">
                        Información general
                      </h6>
                      <dl className="adela-ficha">
                        <dt>Título</dt>
                        <dd>{selectedCuestionario.nombre}</dd>
                        <dt>Autor</dt>
                        <dd>{selectedCuestionario.autor}</dd>
                        <dt>Versión</dt>
                        <dd>{selectedCuestionario.version}</dd>
                        <dt>Preguntas</dt>
                        <dd>{selectedCuestionario.preguntas?.length || 0}</dd>
                      </dl>
                      <h6 className="adela-subtitulo">Descripción</h6>
                      <p className="mb-3">{selectedCuestionario.descripcion}</p>
                      <CButton
                        onClick={handleViewQuestions}
                        className="w-100 adela-tactil adela-btn-suave"
                      >
                        <CIcon icon={cilList} className="me-2" />
                        Ver Preguntas
                      </CButton>
                    </>
                  )
                )}
              </CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  variant="outline"
                  className="adela-tactil"
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
              className="questions-modal adela-modal"
            >
              <CModalHeader>
                <CModalTitle>Preguntas del Cuestionario</CModalTitle>
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
                                  {ETIQUETA_FORMATO[pregunta.formato] ?? ''}
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
                            {selectedCuestionario.estilos.map(
                              (estilo, index) => (
                                <CBadge
                                  key={index}
                                  color="light"
                                  className="text-dark"
                                >
                                  {estilo.nombre}
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
              <CModalFooter>
                <CButton
                  color="secondary"
                  variant="outline"
                  className="adela-tactil"
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
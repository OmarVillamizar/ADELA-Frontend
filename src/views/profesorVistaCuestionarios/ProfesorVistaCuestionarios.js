import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CCol,
  CRow,
  CButtonGroup,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import {
  listarCuestionarios,
  obtenerCuestionario,
  eliminarCuestionario,
} from '../../util/services/cuestionarioService'
import Swal from 'sweetalert2'
import { ETIQUETA_FORMATO } from '../../util/cuestionario/validarRespuesta'
import './ModalVistaPreguntas.css'

const ProfesorVistaCuestionarios = () => {
  const navigate = useNavigate()
  const [cuestionarios, setCuestionarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCuestionario, setSelectedCuestionario] = useState(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [questionsModalVisible, setQuestionsModalVisible] = useState(false)

  useEffect(() => {
    const cargarCuestionarios = async () => {
      setLoading(true)
      try {
        const data = await listarCuestionarios()
        setCuestionarios(data)
        setLoading(false)
      } catch (error) {
        setError('Error cargando cuestionarios')
        setLoading(false)
      }
    }

    cargarCuestionarios()
  }, [])

  const handleCreateCuestionario = () => {
    setLoading(true)
    navigate('/crear-cuestionarios/')
  }

  const handleViewDetails = async (id) => {
    setLoading(true)
    try {
      const data = await obtenerCuestionario(id)
      setSelectedCuestionario(data)
      setDetailsModalVisible(true)
      setLoading(false)
    } catch (error) {
      setError('Error obteniendo detalles del cuestionario')
      setLoading(false)
    }
  }

  const handleViewQuestions = () => {
    setQuestionsModalVisible(true)
  }

  const handleDeleteCuestionario = (id, nombre, numPreguntas) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas borrar el cuestionario ${nombre} con ${numPreguntas} preguntas?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true)
        try {
          await eliminarCuestionario(id)
          setCuestionarios(
            cuestionarios.filter((cuestionario) => cuestionario.id !== id),
          )
          setLoading(false)
          Swal.fire('Borrado!', 'El cuestionario ha sido borrado.', 'success')
        } catch (error) {
          setError('Error borrando el cuestionario')
          setLoading(false)
        }
      }
    })
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>Lista de Cuestionarios Creados</span>
              <CButtonGroup
                role="group"
                aria-label="Basic mixed styles example"
              >
                <CButton color="success" onClick={handleCreateCuestionario}>
                  {' '}
                  +{' '}
                </CButton>
              </CButtonGroup>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div className="d-flex justify-content-center">
                  <CSpinner color="primary" />
                </div>
              ) : error ? (
                <p>{error}</p>
              ) : cuestionarios.length === 0 ? (
                <p>No hay cuestionarios disponibles</p>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>
                        Nombre del Cuestionario
                      </CTableHeaderCell>
                      <CTableHeaderCell>Número de Preguntas</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {cuestionarios.map((cuestionario) => (
                      <CTableRow key={cuestionario.id}>
                        <CTableDataCell>{cuestionario.nombre}</CTableDataCell>
                        <CTableDataCell>
                          {cuestionario.numPreguntas || 0} preguntas
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="primary"
                            size="sm"
                            onClick={() => handleViewDetails(cuestionario.id)}
                            style={{
                              marginRight: '10px',
                              backgroundColor: '#d3d3d3',
                              borderColor: '#d3d3d3',
                              color: 'black',
                            }}
                          >
                            Ver Detalles
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() =>
                              handleDeleteCuestionario(
                                cuestionario.id,
                                cuestionario.nombre,
                                cuestionario.numPreguntas,
                              )
                            }
                          >
                            X
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
      >
        <CModalHeader onClose={() => setDetailsModalVisible(false)}>
          <CModalTitle>Detalles del Cuestionario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedCuestionario && (
            <div>
              <p>
                <strong>Título:</strong> {selectedCuestionario.nombre}
              </p>
              <p>
                <strong>Autor:</strong> {selectedCuestionario.autor}
              </p>
              <p>
                <strong>Versión:</strong> {selectedCuestionario.version}
              </p>
              <p>
                <strong>Número de Preguntas:</strong>{' '}
                {selectedCuestionario.preguntas?.length || 0}
              </p>
              <p>
                <strong>Descripción:</strong> {selectedCuestionario.descripcion}
              </p>
              <CButton
                color="info"
                size="sm"
                onClick={handleViewQuestions}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#d3d3d3',
                  borderColor: '#d3d3d3',
                  color: 'black',
                }}
              >
                Ver Preguntas
              </CButton>
              {/* Si la fecha de creación estuviera disponible en el backend */}
              {/* <p><strong>Fecha de Creación:</strong> {selectedCuestionario.fechaCreacion}</p> */}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setDetailsModalVisible(false)}
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={questionsModalVisible}
        onClose={() => setQuestionsModalVisible(false)}
        size="xl"
        className="questions-modal"
        portal={true}
      >
        <CModalHeader
          onClose={() => setQuestionsModalVisible(false)}
          className="modal-header"
        >
          <CModalTitle className="modal-title">
            Preguntas del Cuestionario
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="modal-body">
          {selectedCuestionario && (
            <div className="questions-container">
              {selectedCuestionario.preguntas.map((pregunta, index) => (
                <div key={index} className="question-item">
                  <p className="question-text">
                    <span className="question-number">{index + 1}.</span>
                    {pregunta.pregunta}{' '}
                    {ETIQUETA_FORMATO[pregunta.formato] ?? ''}
                  </p>
                  <ul className="options-list">
                    {pregunta.opciones.map((opcion, opcionIndex) => (
                      <li key={opcionIndex} className="option-item">
                        {opcion.respuesta}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="learning-styles-section">
                <h5 className="section-title">Estilos de Aprendizaje:</h5>
                <ul className="categories-list">
                  {selectedCuestionario.estilos.map((estilo, index) => (
                    <li key={index} className="category-item">
                      {estilo.nombre}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter className="modal-footer">
          <CButton
            color="secondary"
            onClick={() => setQuestionsModalVisible(false)}
            className="close-button"
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProfesorVistaCuestionarios
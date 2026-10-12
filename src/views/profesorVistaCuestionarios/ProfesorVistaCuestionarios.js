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
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilList, cilPlus, cilTrash } from '@coreui/icons'
import {
  listarCuestionarios,
  obtenerCuestionario,
  eliminarCuestionario,
} from '../../util/services/cuestionarioService'
import Swal from 'sweetalert2'
import { ETIQUETA_FORMATO } from '../../util/cuestionario/validarRespuesta'
import './ModalVistaPreguntas.css'
import NelseMensaje from 'src/components/NelseMensaje'
import nelseFeliz from 'src/assets/nelse_mascot/web/nelse_happy_left.webp'

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
      <NelseMensaje imagen={nelseFeliz}>
        <div className="nelse-burbuja">
          <strong>¿Creamos un cuestionario juntos?</strong>
          <p className="mb-3">
            Te guío paso a paso: eliges cómo responden tus estudiantes, partes
            de un modelo si quieres y te muestro cómo se calculará cada
            resultado antes de crearlo.
          </p>
          <CButton
            color="success"
            size="lg"
            className="text-white adela-tactil"
            onClick={handleCreateCuestionario}
          >
            <CIcon icon={cilPlus} className="me-1" />
            Crear cuestionario
          </CButton>
        </div>
      </NelseMensaje>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>Lista de Cuestionarios Creados</CCardHeader>
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
                          <div className="adela-acciones">
                            <CButton
                              className="adela-tactil adela-btn-suave"
                              onClick={() => handleViewDetails(cuestionario.id)}
                            >
                              <CIcon icon={cilInfo} className="me-1" />
                              Ver Detalles
                            </CButton>
                            <CButton
                              color="secondary"
                              variant="outline"
                              className="adela-tactil"
                              onClick={() =>
                                navigate(
                                  `/administrar-cuestionarios/${cuestionario.id}/interpretacion`,
                                )
                              }
                            >
                              Lectura de resultados
                            </CButton>
                            <CButton
                              color="danger"
                              className="adela-tactil adela-btn-icono adela-btn-eliminar"
                              aria-label={`Eliminar el cuestionario ${cuestionario.nombre}`}
                              title="Eliminar cuestionario"
                              onClick={() =>
                                handleDeleteCuestionario(
                                  cuestionario.id,
                                  cuestionario.nombre,
                                  cuestionario.numPreguntas,
                                )
                              }
                            >
                              <CIcon icon={cilTrash} />
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
        </CCol>
      </CRow>

      <CModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        alignment="center"
        className="adela-modal"
      >
        <CModalHeader>
          <CModalTitle>Detalles del Cuestionario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedCuestionario && (
            <>
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
                className="w-100 adela-tactil adela-btn-suave"
                onClick={handleViewQuestions}
              >
                <CIcon icon={cilList} className="me-2" />
                Ver Preguntas
              </CButton>
            </>
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

      <CModal
        visible={questionsModalVisible}
        onClose={() => setQuestionsModalVisible(false)}
        size="xl"
        alignment="center"
        className="questions-modal adela-modal"
        portal={true}
      >
        <CModalHeader>
          <CModalTitle>Preguntas del Cuestionario</CModalTitle>
        </CModalHeader>
        <CModalBody>
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
  )
}

export default ProfesorVistaCuestionarios

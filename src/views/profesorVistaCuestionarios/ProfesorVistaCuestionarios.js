import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
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
import {
  cilGlobeAlt,
  cilInbox,
  cilInfo,
  cilList,
  cilPlus,
  cilUser,
} from '@coreui/icons'
import {
  listarCuestionarios,
  obtenerCuestionario,
  eliminarCuestionario,
} from '../../util/services/cuestionarioService'
import Swal from 'sweetalert2'
import { ETIQUETA_FORMATO } from '../../util/cuestionario/validarRespuesta'
import './ModalVistaPreguntas.css'
import nelseConstruye from 'src/assets/nelse_mascot/web/nelse_buildingquestionnarie_right.webp'

/** Pestañas: los generales son de ADELA; los personales, solo de quien los creó. */
const GENERALES = 0
const PROPIOS = 1

const ProfesorVistaCuestionarios = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // Al volver de crear se abre la pestaña donde quedó el cuestionario nuevo.
  const [pestana, setPestana] = useState(location.state?.pestana ?? GENERALES)
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

  // Archivar, no borrar: el servidor conserva los resultados ya respondidos.
  const handleDeleteCuestionario = ({ id, nombre, general }) => {
    Swal.fire({
      title: `¿Archivar «${nombre}»?`,
      text: `${general ? 'Dejará de estar disponible para todos los profesores' : 'Dejará de aparecer en tu lista'} y no se podrá aplicar de nuevo. Las asignaciones sin responder se retiran; los resultados que tus estudiantes ya respondieron se conservan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, archivar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true)
        try {
          await eliminarCuestionario(id)
          setCuestionarios((lista) => lista.filter((c) => c.id !== id))
          setLoading(false)
          Swal.fire('Archivado', 'El cuestionario quedó archivado.', 'success')
        } catch (error) {
          setError('Error archivando el cuestionario')
          setLoading(false)
        }
      }
    })
  }

  const generales = cuestionarios.filter((c) => c.general)
  const propios = cuestionarios.filter((c) => !c.general)
  const lista = pestana === GENERALES ? generales : propios

  const pestanaDe = (valor, icono, texto, total) => (
    <CNavItem>
      <CNavLink
        active={pestana === valor}
        onClick={() => setPestana(valor)}
        className="d-flex align-items-center"
        role="tab"
        aria-selected={pestana === valor}
      >
        <CIcon icon={icono} className="me-2" />
        {texto}
        {!loading && !error && (
          <CBadge color="secondary" shape="rounded-pill" className="ms-2">
            {total}
          </CBadge>
        )}
      </CNavLink>
    </CNavItem>
  )

  return (
    <>
      <div className="nelse-invita">
        <img
          src={nelseConstruye}
          alt=""
          aria-hidden="true"
          className="nelse-mensaje-img"
        />
        <div className="nelse-burbuja">
          <strong>¿Creamos un cuestionario juntos?</strong>
          Te guío paso a paso y te muestro cómo se calculará cada resultado.
        </div>
        <CButton
          color="success"
          className="text-white adela-tactil nelse-invita-accion"
          onClick={handleCreateCuestionario}
        >
          <CIcon icon={cilPlus} className="me-1" />
          Crear cuestionario
        </CButton>
      </div>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="pb-0 border-bottom-0">
              <CNav variant="underline-border" role="tablist">
                {pestanaDe(
                  GENERALES,
                  cilGlobeAlt,
                  'Generales de ADELA',
                  generales.length,
                )}
                {pestanaDe(
                  PROPIOS,
                  cilUser,
                  'Mis cuestionarios',
                  propios.length,
                )}
              </CNav>
            </CCardHeader>
            <CCardBody>
              <p className="text-body-secondary small mb-3">
                {pestana === GENERALES
                  ? 'Disponibles para todos los profesores en sus grupos.'
                  : 'Solo tú los ves y los aplicas a tus grupos.'}
              </p>
              {loading ? (
                <div className="d-flex justify-content-center">
                  <CSpinner color="primary" />
                </div>
              ) : error ? (
                <p>{error}</p>
              ) : lista.length === 0 ? (
                <p>
                  {pestana === GENERALES
                    ? 'Aún no hay cuestionarios generales.'
                    : 'Aún no has creado cuestionarios propios.'}
                </p>
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
                    {lista.map((cuestionario) => (
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
                            {/* Lo decide el servidor: un general solo lo cambia el superadmin. */}
                            {cuestionario.editable && (
                              <>
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
                                  aria-label={`Archivar el cuestionario ${cuestionario.nombre}`}
                                  title="Archivar cuestionario"
                                  onClick={() =>
                                    handleDeleteCuestionario(cuestionario)
                                  }
                                >
                                  <CIcon icon={cilInbox} />
                                </CButton>
                              </>
                            )}
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

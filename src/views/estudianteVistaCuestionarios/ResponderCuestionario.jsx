import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CRow,
  CCol,
  CFormCheck,
  CProgress,
  CProgressBar,
  CAlert,
} from '@coreui/react'
import Swal from 'sweetalert2'
import {
  obtenerCuestionario,
  responderCuestionario,
} from '../../util/services/cuestionarioService'

const ResponderCuestionario = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  // Id de la asignación concreta: el mismo cuestionario puede estar asignado en varios grupos
  const asignacionId = searchParams.get('asignacion')
  const navigate = useNavigate()
  const [cuestionario, setCuestionario] = useState(null)
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState([
    { opts: [] },
  ])
  const [selMul, setSelMul] = useState([false])
  const [loading, setLoading] = useState(true)

  const sortByOrder = (a, b) => a.orden - b.orden

  useEffect(() => {
    const fetchCuestionario = async () => {
      try {
        const data = await obtenerCuestionario(id)
        // Ordenar preguntas y sus opciones
        data.preguntas.sort(sortByOrder)
        data.preguntas.forEach((pregunta) => {
          pregunta.opciones.sort(sortByOrder)
        })

        setCuestionario(data)
        const ressel = data.preguntas.map(() => {
          return {
            opts: [],
          }
        })
        setRespuestasSeleccionadas(ressel) // Inicializar con null
        const sm = data.preguntas.map((el) => el.opcionMultiple)
        setSelMul(sm)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching cuestionario:', error)
        setLoading(false)
      }
    }

    fetchCuestionario()
  }, [id])

  const handleChange = (preguntaIndex, opcionId) => {
    setRespuestasSeleccionadas((previas) =>
      previas.map((respuesta, idx) => {
        if (idx !== preguntaIndex) return respuesta
        if (!selMul[preguntaIndex]) return { opts: [opcionId] }
        const yaEstaba = respuesta.opts.includes(opcionId)
        return {
          opts: yaEstaba
            ? respuesta.opts.filter((e) => e !== opcionId)
            : [...respuesta.opts, opcionId],
        }
      }),
    )
  }

  const handleSubmit = async () => {
    // La flecha usaba llaves sin return, asi que .some() siempre daba false y
    // esta validacion no se ejecutaba nunca: el envio incompleto llegaba al
    // servidor y volvia como un error generico sin decir que preguntas faltaban.
    const sinResponder = respuestasSeleccionadas
      .map((respuesta, idx) =>
        !selMul[idx] && respuesta.opts.length !== 1
          ? cuestionario.preguntas[idx].orden
          : null,
      )
      .filter((orden) => orden !== null)

    if (sinResponder.length > 0) {
      Swal.fire(
        'Faltan respuestas',
        `Responde las preguntas ${sinResponder.join(', ')} antes de enviar.`,
        'warning',
      )
      return
    }

    const respuestasDTO = {
      cuestionarioId: parseInt(id),
      resultadoCuestionarioId: asignacionId ? parseInt(asignacionId) : null,
      opcionesSeleccionadasId: respuestasSeleccionadas.flatMap((el) => el.opts),
    }

    try {
      await responderCuestionario(respuestasDTO)
      Swal.fire(
        '¡Enviado!',
        'Tu cuestionario ha sido enviado.',
        'success',
      ).then(() => {
        navigate('/cuestionarios')
      })
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al enviar el cuestionario.', 'error')
    }
  }

  const getProgress = () => {
    if (!cuestionario) return 0
    return (
      (respuestasSeleccionadas.filter((r) => r.opts && r.opts.length > 0)
        .length /
        respuestasSeleccionadas.length) *
      100
    )
  }

  return (
    <CRow className="justify-content-center mt-4">
      <CCol md={10} lg={8}>
        <CCard className="shadow-sm">
          <CCardHeader className="bg-light d-flex justify-content-between align-items-center p-3">
            <h3 className="mb-0 text-center flex-grow-1">
              {loading
                ? 'Cargando cuestionario'
                : cuestionario
                  ? `${cuestionario.nombre} (${cuestionario.siglas})`
                  : 'Error'}
            </h3>
            <div style={{ width: '70px' }}></div>
            <CButton
              onClick={() => navigate('/cuestionarios')}
              color="secondary"
              style={{ marginLeft: 'auto' }}
            >
              Volver
            </CButton>
          </CCardHeader>

          <CCardBody className="p-4">
            {loading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />
                <p className="mt-3">Cargando cuestionario...</p>
              </div>
            ) : cuestionario ? (
              <>
                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <small className="text-medium-emphasis">
                      Progreso del cuestionario
                    </small>
                    <small className="text-medium-emphasis">
                      {Math.round(getProgress())}%
                    </small>
                  </div>
                  <CProgress className="mb-3">
                    <CProgressBar value={getProgress()} />
                  </CProgress>
                </div>

                <div className="mb-4 text-center">
                  <p className="text-medium-emphasis">
                    {cuestionario.descripcion}
                  </p>
                </div>

                {cuestionario.preguntas.map((pregunta, preguntaIndex) => (
                  <CCard key={pregunta.id} className="mb-4 border">
                    <CCardBody className="p-4">
                      <h5 className="mb-4 text-dark">
                        {pregunta.pregunta}{' '}
                        {pregunta.opcionMultiple
                          ? '(Puedes seleccionar varias opciones)'
                          : ''}
                      </h5>
                      <div className="ps-2">
                        {pregunta.opciones.map((opcion) => (
                          <div
                            key={opcion.id}
                            className="mb-3"
                            onClick={() =>
                              handleChange(preguntaIndex, opcion.id)
                            }
                            style={{ cursor: 'pointer' }}
                          >
                            <CCard
                              className={`p-3 border ${
                                respuestasSeleccionadas[
                                  preguntaIndex
                                ].opts.includes(opcion.id)
                                  ? 'border-primary bg-light'
                                  : ''
                              }`}
                            >
                              <CFormCheck
                                type={
                                  pregunta.opcionMultiple ? 'checkbox' : 'radio'
                                }
                                name={`pregunta-${preguntaIndex}`}
                                id={`pregunta-${preguntaIndex}-opcion-${opcion.id}`}
                                label={opcion.respuesta}
                                checked={respuestasSeleccionadas[
                                  preguntaIndex
                                ].opts.includes(opcion.id)}
                                onChange={(e) => {
                                  e.preventDefault()
                                }}
                                className="m-0"
                              />
                            </CCard>
                          </div>
                        ))}
                      </div>
                    </CCardBody>
                  </CCard>
                ))}

                <div className="text-center mt-4">
                  <CButton
                    color="success"
                    size="lg"
                    onClick={handleSubmit}
                    className="px-5"
                    style={{ color: 'white' }}
                  >
                    Enviar Respuestas
                  </CButton>
                </div>
              </>
            ) : (
              <CAlert color="danger" className="m-4">
                Error al cargar el cuestionario. Por favor, intenta nuevamente.
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ResponderCuestionario
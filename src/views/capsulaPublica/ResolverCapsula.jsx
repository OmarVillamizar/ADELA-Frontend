import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
} from '@coreui/react'
import PreguntasCuestionario from '../../components/cuestionario/PreguntasCuestionario'
import {
  obtenerCapsulaPublica,
  responderCapsula,
} from '../../util/services/capsulaPublicaService'
import {
  nuevoIntento,
  recordarResultado,
  resultadoRecordado,
} from '../../util/capsulas/capsulaUtils'

const mensajeDeError = (error) => {
  if (error.code === 'CAPSULA_CERRADA')
    return 'Esta cápsula ya está cerrada y no recibe respuestas.'
  if (error.status === 404)
    return 'Este enlace no corresponde a ninguna cápsula.'
  return error.message
}

/**
 * Página a la que lleva el enlace o QR de una cápsula. Sin cuenta: si la cápsula
 * lo pide se escribe un nombre, se responde y se va directo al resultado.
 */
const ResolverCapsula = () => {
  const { codigo } = useParams()
  const navigate = useNavigate()
  // Un intento por visita: si el envío falla y se repite, el servidor reconoce
  // el mismo intento y no crea una segunda respuesta.
  const intento = useRef(nuevoIntento())
  const [capsula, setCapsula] = useState(null)
  const [error, setError] = useState(null)
  const [paso, setPaso] = useState('intro')
  const [nombre, setNombre] = useState('')
  const [errorNombre, setErrorNombre] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [previo, setPrevio] = useState(() => resultadoRecordado(codigo))

  useEffect(() => {
    obtenerCapsulaPublica(codigo)
      .then(setCapsula)
      .catch((e) => setError(mensajeDeError(e)))
  }, [codigo])

  const pideNombre = capsula?.modoIdentificacion === 'NOMBRE'

  const comenzar = () => {
    if (pideNombre && !nombre.trim()) {
      setErrorNombre('Escribe tu nombre para empezar')
      return
    }
    setErrorNombre(null)
    setPaso('preguntas')
    window.scrollTo(0, 0)
  }

  const enviar = async (opcionesSeleccionadasId) => {
    setEnviando(true)
    try {
      const resultado = await responderCapsula(codigo, {
        intento: intento.current,
        nombre: pideNombre ? nombre.trim() : null,
        opcionesSeleccionadasId,
      })
      recordarResultado(codigo, resultado.codigo)
      navigate(`/r/${resultado.codigo}`, { state: { resultado } })
    } catch (e) {
      if (e.fields?.nombre) {
        setErrorNombre(e.fields.nombre)
        setPaso('intro')
      } else if (e.code === 'CAPSULA_CERRADA') {
        setError(mensajeDeError(e))
      } else {
        Swal.fire('No se pudo enviar', e.message, 'error')
      }
    } finally {
      setEnviando(false)
    }
  }

  if (error) {
    return (
      <CRow className="justify-content-center">
        <CCol md={8} lg={6}>
          <CAlert color="warning" className="text-center">
            <p className="mb-3">{error}</p>
            <div className="d-flex flex-column gap-2">
              <Link to="/c">Probar con otro código de cápsula</Link>
              <Link to="/r">
                ¿Ya respondiste? Consulta tu resultado con tu código
              </Link>
            </div>
          </CAlert>
        </CCol>
      </CRow>
    )
  }

  if (!capsula) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  const { cuestionario } = capsula

  return (
    <CRow className="justify-content-center">
      <CCol md={10} lg={8}>
        <CCard className="shadow-sm">
          <CCardHeader className="bg-light p-3 text-center">
            <h4 className="mb-1">{capsula.nombre}</h4>
            <small className="text-medium-emphasis">
              {cuestionario.nombre} ({cuestionario.siglas})
            </small>
          </CCardHeader>
          <CCardBody className="p-3 p-md-4">
            {paso === 'intro' && previo && (
              <CAlert color="info">
                <p className="mb-2">
                  Ya respondiste esta cápsula en este dispositivo.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <CButton
                    color="primary"
                    onClick={() => navigate(`/r/${previo}`)}
                  >
                    Ver mi resultado
                  </CButton>
                  <CButton
                    color="secondary"
                    variant="outline"
                    onClick={() => setPrevio(null)}
                  >
                    Responder de nuevo
                  </CButton>
                </div>
              </CAlert>
            )}

            {paso === 'intro' && !previo && (
              <>
                <p>{cuestionario.descripcion}</p>
                <p className="text-medium-emphasis">
                  {cuestionario.preguntas.length} preguntas. Al terminar verás
                  tu resultado y un código para consultarlo de nuevo.
                </p>
                {pideNombre && (
                  <div className="mb-3">
                    <CFormLabel htmlFor="nombre-participante">
                      Tu nombre
                    </CFormLabel>
                    <CFormInput
                      id="nombre-participante"
                      maxLength={60}
                      autoComplete="name"
                      value={nombre}
                      invalid={!!errorNombre}
                      feedbackInvalid={errorNombre}
                      onChange={(e) => setNombre(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && comenzar()}
                    />
                    <small className="text-medium-emphasis">
                      Tu nombre solo lo verá quien creó esta cápsula. No se pide
                      ningún otro dato.
                    </small>
                  </div>
                )}
                <div className="text-center">
                  <CButton
                    color="success"
                    size="lg"
                    className="px-5"
                    style={{ color: 'white' }}
                    onClick={comenzar}
                  >
                    Comenzar
                  </CButton>
                </div>
              </>
            )}

            {paso === 'preguntas' && (
              <PreguntasCuestionario
                cuestionario={cuestionario}
                onEnviar={enviar}
                enviando={enviando}
              />
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ResolverCapsula

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
  CAlert,
} from '@coreui/react'
import Swal from 'sweetalert2'
import {
  obtenerCuestionario,
  responderCuestionario,
} from '../../util/services/cuestionarioService'
import { useInsignias } from '../../util/insignias/InsigniasProvider'
import PreguntasCuestionario from '../../components/cuestionario/PreguntasCuestionario'
import { detalleError } from '../../util/cuestionario/validarRespuesta'

const ResponderCuestionario = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  // Id de la asignación concreta: el mismo cuestionario puede estar asignado en varios grupos
  const asignacionId = searchParams.get('asignacion')
  const navigate = useNavigate()
  const { verificar } = useInsignias()
  const [cuestionario, setCuestionario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const fetchCuestionario = async () => {
      try {
        setCuestionario(await obtenerCuestionario(id))
        setLoading(false)
      } catch (error) {
        console.error('Error fetching cuestionario:', error)
        setLoading(false)
      }
    }

    fetchCuestionario()
  }, [id])

  const handleSubmit = async (seleccion) => {
    const respuestasDTO = {
      cuestionarioId: parseInt(id),
      resultadoCuestionarioId: asignacionId ? parseInt(asignacionId) : null,
      ...seleccion,
    }

    setEnviando(true)
    try {
      await responderCuestionario(respuestasDTO)
      Swal.fire(
        '¡Enviado!',
        'Tu cuestionario ha sido enviado.',
        'success',
      ).then(() => {
        navigate('/cuestionarios')
        verificar('PRIMER_CUESTIONARIO')
      })
    } catch (error) {
      Swal.fire(
        'Error',
        error?.fields
          ? detalleError(error)
          : 'Hubo un problema al enviar el cuestionario.',
        'error',
      )
    } finally {
      setEnviando(false)
    }
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
              <PreguntasCuestionario
                cuestionario={cuestionario}
                onEnviar={handleSubmit}
                enviando={enviando}
              />
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

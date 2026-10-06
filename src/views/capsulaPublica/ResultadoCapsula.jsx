import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { usePDF } from 'react-to-pdf'
import Swal from 'sweetalert2'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilCopy } from '@coreui/icons'
import GraficasResultado from '../../components/resultados/GraficasResultado'
import TablaRespuestas from '../../components/resultados/TablaRespuestas'
import { obtenerResultadoCapsula } from '../../util/services/capsulaPublicaService'
import {
  estilosPredominantes,
  formatearCodigo,
  normalizarCodigo,
} from '../../util/capsulas/capsulaUtils'

/**
 * Resultado de una cápsula. Llega recién enviado (state de la navegación) o por
 * su código, que funciona como enlace permanente mientras la cápsula exista.
 */
const ResultadoCapsula = () => {
  const { codigo } = useParams()
  const { state } = useLocation()
  const recibido =
    state?.resultado?.codigo === normalizarCodigo(codigo)
      ? state.resultado
      : null
  const [resultado, setResultado] = useState(recibido)
  const [error, setError] = useState(null)
  const { toPDF, targetRef } = usePDF({ page: { margin: 20, format: 'a4' } })

  useEffect(() => {
    if (recibido) return
    obtenerResultadoCapsula(codigo)
      .then(setResultado)
      .catch((e) =>
        setError(
          e.status === 404
            ? 'No encontramos un resultado con ese código. Revisa que esté bien escrito.'
            : e.message,
        ),
      )
    // Solo cuando cambia el código; el state es el de la primera carga.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo])

  if (error) {
    return (
      <CRow className="justify-content-center">
        <CCol md={8} lg={6}>
          <CAlert color="warning" className="text-center">
            <p className="mb-3">{error}</p>
            <Link to="/r">Probar con otro código</Link>
          </CAlert>
        </CCol>
      </CRow>
    )
  }

  if (!resultado) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  const codigoVisible = formatearCodigo(resultado.codigo)
  const enlace = `${window.location.origin}/r/${resultado.codigo}`
  const predominantes = estilosPredominantes(resultado.estilos)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace)
      Swal.fire({
        icon: 'success',
        title: '¡Copiado!',
        text: 'Enlace a tu resultado copiado',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      })
    } catch (err) {
      Swal.fire('Anota tu código', codigoVisible, 'info')
    }
  }

  const descargar = async () => {
    try {
      await toPDF({
        filename: `resultado-${resultado.cuestionario.siglas}-${resultado.codigo}.pdf`,
      })
    } catch (err) {
      Swal.fire('Error', 'Hubo un problema al generar el PDF.', 'error')
    }
  }

  return (
    <CRow className="justify-content-center">
      <CCol lg={10}>
        <div className="d-flex flex-wrap gap-2 justify-content-end mb-3">
          <CButton color="primary" variant="outline" onClick={copiar}>
            <CIcon icon={cilCopy} className="me-1" />
            Copiar enlace
          </CButton>
          <CButton
            color="primary"
            onClick={descargar}
            style={{ background: 'red', borderColor: 'black' }}
          >
            <CIcon icon={cilCloudDownload} className="me-1" />
            Descargar PDF
          </CButton>
        </div>

        <div ref={targetRef}>
          <CCard className="mb-3 text-center">
            <CCardBody>
              <h4 className="mb-1">
                ¡Listo{resultado.nombre ? `, ${resultado.nombre}` : ''}!
              </h4>
              <p className="text-medium-emphasis mb-3">
                {resultado.capsulaNombre} ·{' '}
                {new Date(resultado.respondidaEn).toLocaleString('es-CO')}
              </p>
              {predominantes.length > 0 && (
                <p className="fs-5 mb-3">
                  {predominantes.length === 1
                    ? 'Tu estilo predominante es '
                    : 'Tus estilos predominantes son '}
                  <strong>{predominantes.join(' y ')}</strong>
                </p>
              )}
              <small className="text-medium-emphasis d-block">
                Tu código de resultado
              </small>
              <div className="codigo-resultado">{codigoVisible}</div>
              <small className="text-medium-emphasis">
                Guárdalo para volver a ver tu resultado en{' '}
                {window.location.host}/r
              </small>
            </CCardBody>
          </CCard>

          <CCard className="mb-3">
            <CCardHeader>
              <strong>{resultado.cuestionario.nombre}</strong> (
              {resultado.cuestionario.siglas})
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                {resultado.estilos.map((estilo) => (
                  <CCol xs={6} md={3} key={estilo.nombre}>
                    <p className="mb-1">
                      <strong>{estilo.nombre}:</strong>{' '}
                      {Number(estilo.valor).toFixed(2)}
                    </p>
                  </CCol>
                ))}
              </CRow>
              <GraficasResultado
                estilos={resultado.estilos}
                etiqueta={resultado.nombre || 'Tu resultado'}
              />
              <h6 className="mt-4">Preguntas</h6>
              <TablaRespuestas preguntas={resultado.preguntas} />
            </CCardBody>
          </CCard>
        </div>
      </CCol>
    </CRow>
  )
}

export default ResultadoCapsula

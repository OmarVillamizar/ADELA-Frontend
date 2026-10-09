import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { usePDF } from 'react-to-pdf'
import Swal from 'sweetalert2'
import { CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilCopy } from '@coreui/icons'
import EncabezadoReporte from '../../components/resultados/EncabezadoReporte'
import EsqueletoReporte from '../../components/resultados/EsqueletoReporte'
import PanelEstilos from '../../components/resultados/PanelEstilos'
import PerfilDestacado from '../../components/resultados/PerfilDestacado'
import TablaRespuestas from '../../components/resultados/TablaRespuestas'
import PreferenciaMultimodal, {
  PreguntaPreferencia,
} from '../../components/resultados/PreferenciaMultimodal'
import {
  declararPreferenciaCapsula,
  obtenerResultadoCapsula,
} from '../../util/services/capsulaPublicaService'
import {
  formatearCodigo,
  normalizarCodigo,
} from '../../util/capsulas/capsulaUtils'
import '../../components/resultados/resultados.css'

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
      <CRow className="justify-content-center adela-r">
        <CCol md={8} lg={6}>
          <div className="adela-vacio">
            <p className="adela-vacio__titulo">Resultado no encontrado</p>
            <p className="mb-3">{error}</p>
            <Link to="/r" className="adela-btn">
              Probar con otro código
            </Link>
          </div>
        </CCol>
      </CRow>
    )
  }

  if (!resultado) {
    return (
      <CRow className="justify-content-center">
        <CCol lg={10}>
          <EsqueletoReporte />
        </CCol>
      </CRow>
    )
  }

  const codigoVisible = formatearCodigo(resultado.codigo)
  const enlace = `${window.location.origin}/r/${resultado.codigo}`

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
      <CCol lg={10} className="adela-r">
        <EncabezadoReporte
          titulo={`¡Listo${resultado.nombre ? `, ${resultado.nombre}` : ''}!`}
          subtitulo={`${resultado.capsulaNombre}, ${new Date(resultado.respondidaEn).toLocaleString('es-CO')}`}
        >
          <button type="button" className="adela-btn" onClick={copiar}>
            <CIcon icon={cilCopy} />
            Copiar enlace
          </button>
          <button
            type="button"
            className="adela-btn adela-btn--primario"
            onClick={descargar}
          >
            <CIcon icon={cilCloudDownload} />
            Descargar PDF
          </button>
        </EncabezadoReporte>

        {resultado.pidePreferencia && !resultado.preferenciaMultimodal && (
          <PreguntaPreferencia
            onDeclarar={async (preferencia) =>
              setResultado(
                await declararPreferenciaCapsula(resultado.codigo, preferencia),
              )
            }
          />
        )}

        <div ref={targetRef}>
          <PerfilDestacado
            calificacion={resultado.calificacion}
            titulo="Tu perfil de aprendizaje"
          />
          {resultado.preferenciaMultimodal && (
            <PreferenciaMultimodal
              preferencia={resultado.preferenciaMultimodal}
              propio
            />
          )}

          <section className="adela-panel adela-aparece text-center">
            <p className="adela-cifra__etiqueta">Tu código de resultado</p>
            <div className="codigo-resultado">{codigoVisible}</div>
            <p className="adela-ayuda">
              Guárdalo para volver a ver tu resultado en {window.location.host}
              /r
            </p>
          </section>

          <PanelEstilos
            estilos={resultado.estilos}
            calificacion={resultado.calificacion}
            etiqueta={resultado.nombre || 'Tu resultado'}
          />

          <section className="adela-panel adela-aparece" style={{ '--i': 2 }}>
            <div className="adela-panel__cabeza">
              <h2 className="adela-panel__titulo">
                {resultado.cuestionario.nombre} ({resultado.cuestionario.siglas}
                )
              </h2>
            </div>
            <TablaRespuestas preguntas={resultado.preguntas} />
          </section>
        </div>
      </CCol>
    </CRow>
  )
}

export default ResultadoCapsula

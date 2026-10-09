import React, { useEffect, useState } from 'react'
import { usePDF } from 'react-to-pdf'
import { CContainer } from '@coreui/react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilCloudDownload,
  cilSpreadsheet,
  cilWarning,
} from '@coreui/icons'
import {
  descargarCsvGrupo,
  obtenerReporteGrupo,
} from '../../util/services/cuestionarioService'
import { simularGrupo } from '../../util/dev/simulacion'
import { useEscala } from '../../util/calificacion/useEscala'
import {
  AVISO_IPSATIVO,
  AYUDA_POMP,
  ESCALA,
  separarPorTipo,
} from '../../util/calificacion/escala'
import Cifra from '../../components/resultados/Cifra'
import DistribucionNiveles from '../../components/resultados/DistribucionNiveles'
import DistribucionPerfiles from '../../components/resultados/DistribucionPerfiles'
import EncabezadoReporte from '../../components/resultados/EncabezadoReporte'
import EsqueletoReporte from '../../components/resultados/EsqueletoReporte'
import GraficasResultado from '../../components/resultados/GraficasResultado'
import EscalasCompuestas from '../../components/resultados/EscalasCompuestas'
import MapaCuadrantes from '../../components/resultados/MapaCuadrantes'
import SelectorEscala from '../../components/resultados/SelectorEscala'
import TablaEstadisticos from '../../components/resultados/TablaEstadisticos'
import '../../components/resultados/resultados.css'

const ReporteGrupo = () => {
  const { id1, id2 } = useParams()
  const navigate = useNavigate()

  const [reporte, setReporte] = useState(null)
  const [error, setError] = useState(null)
  const { escala, setEscala, disponibles } = useEscala(reporte?.calificacion)

  // usePDF congela las opciones del primer render, cuando reporte todavia es
  // null: el nombre se pasa en la llamada, que ya ocurre con el reporte cargado.
  const { toPDF, targetRef } = usePDF({ page: { margin: 20, format: 'a4' } })

  useEffect(() => {
    if (!id1 || !id2) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontraron los parámetros requeridos para generar el reporte.',
      })
      navigate('/')
      return
    }
    obtenerReporteGrupo(id1, id2)
      .then(setReporte)
      .catch((e) => {
        console.error('Error al obtener reporte:', e)
        setError('Hubo un error al obtener el reporte.')
      })
  }, [id1, id2, navigate])

  const volver = () => navigate(`/resultado/${id2}/`)

  if (error) {
    return (
      <CContainer className="adela-r">
        <div className="adela-vacio">
          <p className="adela-vacio__titulo">No se pudo cargar el reporte</p>
          <p className="mb-3">{error}</p>
          <button type="button" className="adela-btn" onClick={volver}>
            <CIcon icon={cilArrowLeft} />
            Volver
          </button>
        </div>
      </CContainer>
    )
  }

  if (!reporte) {
    return (
      <CContainer>
        <EsqueletoReporte />
      </CContainer>
    )
  }

  const { calificacion, estilos, estudiantesResuelto, estudiantesNoResuelto } =
    reporte
  const resueltos = estudiantesResuelto.length
  const total = resueltos + estudiantesNoResuelto.length
  const ipsativo = calificacion?.esIpsativo

  const descargarPDF = async () => {
    try {
      await toPDF({ filename: `reporte-grupo-${reporte.grupo?.nombre}.pdf` })
    } catch (e) {
      console.error('Error al generar PDF:', e)
      Swal.fire('Error', 'Hubo un problema al generar el PDF.', 'error')
    }
  }

  const descargarCsv = async (formato) => {
    try {
      await descargarCsvGrupo(
        id1,
        id2,
        formato,
        `resultados-${reporte.cuestionario?.siglas}-${reporte.grupo?.nombre}${formato === 'rfc4180' ? '-analisis' : ''}.csv`,
      )
    } catch (e) {
      console.error('Error al descargar CSV:', e)
      Swal.fire('Error', 'No se pudo descargar el archivo.', 'error')
    }
  }

  const simular = async () => {
    const { value: cantidad } = await Swal.fire({
      title: '[dev] Simular estudiantes',
      text: 'Crea estudiantes ficticios en el grupo con el cuestionario respondido.',
      input: 'number',
      inputValue: 30,
      inputAttributes: { min: 1, max: 200 },
      showCancelButton: true,
    })
    if (!cantidad) return
    try {
      await simularGrupo(id1, id2, Number(cantidad))
      setReporte(await obtenerReporteGrupo(id1, id2))
    } catch (e) {
      console.error('Error al simular:', e)
      Swal.fire(
        'Error',
        e?.status === 404
          ? 'Arranca el backend con DEV_SIMULACION=true.'
          : (e?.message ?? 'No se pudo simular.'),
        'error',
      )
    }
  }

  return (
    <CContainer className="adela-r">
      <EncabezadoReporte
        titulo={`Reporte del grupo ${reporte.grupo?.nombre ?? ''}`}
        subtitulo={`${reporte.cuestionario?.nombre} (${reporte.cuestionario?.siglas})`}
      >
        {import.meta.env.DEV && (
          <button type="button" className="adela-btn" onClick={simular}>
            [dev] Simular estudiantes
          </button>
        )}
        <button
          type="button"
          className="adela-btn"
          onClick={() => descargarCsv('excel')}
          disabled={resueltos === 0}
          title="Separado por punto y coma, listo para abrir en Excel"
        >
          <CIcon icon={cilSpreadsheet} />
          CSV para Excel
        </button>
        <button
          type="button"
          className="adela-btn"
          onClick={() => descargarCsv('rfc4180')}
          disabled={resueltos === 0}
          title="Separado por comas con punto decimal, para R, Python o SPSS"
        >
          <CIcon icon={cilSpreadsheet} />
          CSV para análisis
        </button>
        <button
          type="button"
          className="adela-btn adela-btn--primario"
          onClick={descargarPDF}
        >
          <CIcon icon={cilCloudDownload} />
          Descargar PDF
        </button>
        <button type="button" className="adela-btn" onClick={volver}>
          <CIcon icon={cilArrowLeft} />
          Volver
        </button>
      </EncabezadoReporte>

      <div ref={targetRef}>
        <div className="adela-cifras">
          <Cifra indice={0} etiqueta="Estudiantes" valor={total} />
          <Cifra
            indice={1}
            etiqueta="Respondieron"
            valor={resueltos}
            extra={
              total > 0 ? `${Math.round((resueltos / total) * 100)} %` : null
            }
          />
          <Cifra indice={2} etiqueta="Pendientes" valor={total - resueltos} />
          <Cifra
            indice={3}
            etiqueta="Fecha de aplicación"
            valor={new Date(reporte.fechaAplicacion).toLocaleDateString(
              'es-CO',
            )}
          />
        </div>

        {resueltos === 0 ? (
          <div className="adela-vacio mb-4">
            <p className="adela-vacio__titulo">Todavía nadie ha respondido</p>
            <p className="mb-0">
              Cuando los estudiantes respondan, aquí verás los promedios, los
              niveles y los perfiles del grupo.
            </p>
          </div>
        ) : (
          <>
            {ipsativo && (
              <div className="adela-aviso" role="note">
                <CIcon icon={cilWarning} className="flex-shrink-0 mt-1" />
                <span>{AVISO_IPSATIVO}</span>
              </div>
            )}
            {ipsativo && (
              <DistribucionPerfiles
                distribucion={calificacion?.distribucionPerfiles}
                destacado
              />
            )}

            <section className="adela-panel adela-aparece">
              <div className="adela-panel__cabeza">
                <div>
                  <h2 className="adela-panel__titulo">
                    Promedio por estilo de aprendizaje
                  </h2>
                  {escala === ESCALA.POMP && (
                    <p className="adela-panel__nota">{AYUDA_POMP}</p>
                  )}
                </div>
                <SelectorEscala
                  disponibles={disponibles}
                  valor={escala}
                  onChange={setEscala}
                />
              </div>
              <GraficasResultado
                estilos={separarPorTipo(estilos).primarios}
                escala={escala}
                etiqueta="Promedio"
              />
              <h3 className="adela-panel__titulo mt-4 mb-3">Estadísticos</h3>
              <TablaEstadisticos estilos={estilos} escala={escala} />
            </section>

            <EscalasCompuestas
              estilos={separarPorTipo(estilos).compuestos}
              grupal
            />
            {calificacion?.plano && (
              <MapaCuadrantes
                plano={calificacion.plano}
                estilos={estilos}
                puntos={calificacion.puntosPlano}
                grupal
              />
            )}
            <DistribucionNiveles estilos={estilos} />
            {!ipsativo && (
              <DistribucionPerfiles
                distribucion={calificacion?.distribucionPerfiles}
              />
            )}
          </>
        )}

        <section className="adela-panel adela-aparece">
          <div className="adela-panel__cabeza">
            <h2 className="adela-panel__titulo">Estudiantes</h2>
          </div>
          <div className="adela-tabla__scroll">
            <table className="adela-tabla">
              <thead>
                <tr>
                  <th scope="col" className="num">
                    #
                  </th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Estado</th>
                  <th scope="col">
                    <span className="visually-hidden">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {estudiantesResuelto.map((r, i) => (
                  <tr key={r.id}>
                    <td className="num text-body-secondary">{i + 1}</td>
                    <td className="adela-tabla__nombre">
                      {r.estudiante.nombre}
                    </td>
                    <td>
                      <span className="adela-chip adela-chip--ok">
                        Respondió
                      </span>
                    </td>
                    <td className="num">
                      <Link
                        to={`/reporte-estudiante/${r.id}`}
                        className="adela-btn adela-btn--sm"
                      >
                        Ver resultado
                      </Link>
                    </td>
                  </tr>
                ))}
                {estudiantesNoResuelto.map((r, i) => (
                  <tr key={r.id}>
                    <td className="num text-body-secondary">
                      {resueltos + i + 1}
                    </td>
                    <td className="adela-tabla__nombre">
                      {r.estudiante.nombre}
                    </td>
                    <td>
                      <span className="adela-chip adela-chip--aviso">
                        Pendiente
                      </span>
                    </td>
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </CContainer>
  )
}

export default ReporteGrupo

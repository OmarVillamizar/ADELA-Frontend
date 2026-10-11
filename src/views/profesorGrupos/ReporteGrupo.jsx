import React, { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { usePDF } from 'react-to-pdf'
import { CContainer } from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
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
import ComparativaDemografica from '../../components/resultados/ComparativaDemografica'
import DistribucionNiveles from '../../components/resultados/DistribucionNiveles'
import DistribucionPerfiles from '../../components/resultados/DistribucionPerfiles'
import EncabezadoReporte from '../../components/resultados/EncabezadoReporte'
import EsqueletoReporte from '../../components/resultados/EsqueletoReporte'
import GraficasResultado from '../../components/resultados/GraficasResultado'
import EscalasCompuestas from '../../components/resultados/EscalasCompuestas'
import FiltroDemografico from '../../components/resultados/FiltroDemografico'
import ListadoEstudiantes from '../../components/resultados/ListadoEstudiantes'
import MapaCuadrantes from '../../components/resultados/MapaCuadrantes'
import { ConteoComplementaria } from '../../components/resultados/PreguntaComplementaria'
import ResumenGrupo from '../../components/resultados/ResumenGrupo'
import SelectorEscala from '../../components/resultados/SelectorEscala'
import SelectorSecciones from '../../components/resultados/SelectorSecciones'
import TablaEstadisticos from '../../components/resultados/TablaEstadisticos'
import {
  FILTRO_INICIAL,
  describirFiltro,
  filtrar,
} from '../../util/calificacion/demografia'
import '../../components/resultados/resultados.css'

const SECCIONES_INICIALES = {
  resumen: true,
  comparativa: true,
  graficas: true,
  estadisticas: true,
  estudiantes: true,
}

const ReporteGrupo = () => {
  const { id1, id2 } = useParams()
  const navigate = useNavigate()

  const [reporte, setReporte] = useState(null)
  const [error, setError] = useState(null)
  const [secciones, setSecciones] = useState(SECCIONES_INICIALES)
  const [filtro, setFiltro] = useState(FILTRO_INICIAL)
  // Mientras se genera el PDF el listado muestra todas las filas, no una página.
  const [pdfCompleto, setPdfCompleto] = useState(false)
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
  const resueltosFiltrados = filtrar(estudiantesResuelto, filtro)
  const filasFiltradas = [
    ...resueltosFiltrados,
    ...filtrar(estudiantesNoResuelto, filtro),
  ]
  const textoFiltro = describirFiltro(filtro)
  const verPromedio = secciones.graficas || secciones.estadisticas
  const nombresEstilos = separarPorTipo(estilos).primarios.map((e) => e.nombre)

  const descargarPDF = async () => {
    try {
      flushSync(() => setPdfCompleto(true))
      await toPDF({ filename: `reporte-grupo-${reporte.grupo?.nombre}.pdf` })
    } catch (e) {
      console.error('Error al generar PDF:', e)
      Swal.fire('Error', 'Hubo un problema al generar el PDF.', 'error')
    } finally {
      setPdfCompleto(false)
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

      <div className="adela-controles">
        <SelectorSecciones
          secciones={[
            { clave: 'resumen', etiqueta: 'Resumen' },
            { clave: 'comparativa', etiqueta: 'Por género y edad' },
            { clave: 'graficas', etiqueta: 'Gráficas' },
            { clave: 'estadisticas', etiqueta: 'Estadísticas avanzadas' },
            {
              clave: 'estudiantes',
              etiqueta: `Listado de estudiantes (${total})`,
            },
          ]}
          valor={secciones}
          onChange={setSecciones}
        />
        {(secciones.resumen ||
          secciones.comparativa ||
          secciones.estudiantes) && (
          <FiltroDemografico valor={filtro} onChange={setFiltro} />
        )}
      </div>

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
            {secciones.resumen && (
              <ResumenGrupo
                resueltos={resueltosFiltrados}
                nombresEstilos={nombresEstilos}
                filtro={textoFiltro}
              />
            )}
            {secciones.comparativa && (
              <ComparativaDemografica
                resueltos={resueltosFiltrados}
                nombresEstilos={nombresEstilos}
                filtro={textoFiltro}
              />
            )}

            {secciones.graficas && ipsativo && (
              <DistribucionPerfiles
                distribucion={calificacion?.distribucionPerfiles}
                destacado
              />
            )}

            {verPromedio && (
              <section className="adela-panel adela-aparece">
                <div className="adela-panel__cabeza">
                  <div>
                    <h2 className="adela-panel__titulo">
                      {secciones.graficas
                        ? 'Promedio por estilo de aprendizaje'
                        : 'Estadísticas avanzadas'}
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
                {secciones.graficas && (
                  <GraficasResultado
                    estilos={separarPorTipo(estilos).primarios}
                    escala={escala}
                    etiqueta="Promedio"
                  />
                )}
                {secciones.estadisticas && (
                  <>
                    {secciones.graficas && (
                      <h3 className="adela-panel__titulo mt-4 mb-3">
                        Estadísticas avanzadas
                      </h3>
                    )}
                    <TablaEstadisticos estilos={estilos} escala={escala} />
                  </>
                )}
              </section>
            )}

            {secciones.graficas && (
              <>
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
                <ConteoComplementaria conteo={reporte.complementaria} />
              </>
            )}
          </>
        )}

        {secciones.estudiantes && (
          <ListadoEstudiantes
            filas={filasFiltradas}
            filtro={textoFiltro}
            completo={pdfCompleto}
          />
        )}
      </div>
    </CContainer>
  )
}

export default ReporteGrupo

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePDF } from 'react-to-pdf'
import Swal from 'sweetalert2'
import { CContainer } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilCloudDownload, cilWarning } from '@coreui/icons'
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
import { obtenerReporteCapsula } from '../../util/services/capsulaService'
import { useEscala } from '../../util/calificacion/useEscala'
import {
  AVISO_IPSATIVO,
  AYUDA_POMP,
  ESCALA,
  separarPorTipo,
} from '../../util/calificacion/escala'
import '../../components/resultados/resultados.css'

/**
 * Reporte global de una cápsula. Sin detalle por pregunta de cada persona: el
 * nombre no está verificado y el seguimiento individual es cosa de los grupos.
 */
const ReporteCapsula = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reporte, setReporte] = useState(null)
  const { escala, setEscala, disponibles } = useEscala(reporte?.calificacion)
  const { toPDF, targetRef } = usePDF({ page: { margin: 20, format: 'a4' } })

  useEffect(() => {
    obtenerReporteCapsula(id)
      .then(setReporte)
      .catch((error) => {
        Swal.fire('Error', error.message, 'error')
        navigate('/capsulas')
      })
  }, [id, navigate])

  if (!reporte) {
    return (
      <CContainer>
        <EsqueletoReporte />
      </CContainer>
    )
  }

  const { capsula, calificacion, estilos, participantes, totalRespuestas } =
    reporte
  const ipsativo = calificacion?.esIpsativo

  const descargar = async () => {
    try {
      await toPDF({ filename: `reporte-capsula-${capsula.codigo}.pdf` })
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al generar el PDF.', 'error')
    }
  }

  return (
    <CContainer className="adela-r">
      <EncabezadoReporte
        titulo={capsula.nombre}
        subtitulo={`${capsula.cuestionarioNombre} (${capsula.cuestionarioSiglas})`}
      >
        <button
          type="button"
          className="adela-btn adela-btn--primario"
          onClick={descargar}
          disabled={totalRespuestas === 0}
        >
          <CIcon icon={cilCloudDownload} />
          Descargar PDF
        </button>
        <button
          type="button"
          className="adela-btn"
          onClick={() => navigate(`/capsulas/${id}`)}
        >
          <CIcon icon={cilArrowLeft} />
          Volver
        </button>
      </EncabezadoReporte>

      <div ref={targetRef}>
        <div className="adela-cifras">
          <Cifra indice={0} etiqueta="Respuestas" valor={totalRespuestas} />
          <Cifra
            indice={1}
            etiqueta="Participantes"
            valor={
              capsula.modoIdentificacion === 'NOMBRE'
                ? 'Con nombre'
                : 'Anónimos'
            }
          />
          <Cifra
            indice={2}
            etiqueta="Estado"
            valor={capsula.abierta ? 'Abierta' : 'Cerrada'}
          />
        </div>

        {totalRespuestas === 0 ? (
          <div className="adela-vacio">
            <p className="adela-vacio__titulo">
              Esta cápsula todavía no tiene respuestas
            </p>
            <p className="mb-0">
              Comparte el enlace o el código QR para empezar a recibirlas.
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

            {participantes && participantes.length > 0 && (
              <section className="adela-panel adela-aparece">
                <div className="adela-panel__cabeza">
                  <h2 className="adela-panel__titulo">Participantes</h2>
                </div>
                <div className="adela-tabla__scroll">
                  <table className="adela-tabla">
                    <thead>
                      <tr>
                        <th scope="col">Nombre</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Perfil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantes.map((p, i) => (
                        <tr key={i}>
                          <td className="adela-tabla__nombre">{p.nombre}</td>
                          <td className="text-body-secondary">
                            {new Date(p.respondidaEn).toLocaleString('es-CO')}
                          </td>
                          <td>
                            {p.perfil ? (
                              <span className="adela-chip">{p.perfil}</span>
                            ) : (
                              <span className="text-body-secondary">
                                Sin perfil
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </CContainer>
  )
}

export default ReporteCapsula

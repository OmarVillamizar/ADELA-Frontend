import React from 'react'
import PropTypes from 'prop-types'
import { usePDF } from 'react-to-pdf'
import Swal from 'sweetalert2'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilCloudDownload } from '@coreui/icons'
import EncabezadoReporte from './EncabezadoReporte'
import PerfilDestacado from './PerfilDestacado'
import PanelEstilos from './PanelEstilos'
import PreferenciaMultimodal, {
  PreguntaPreferencia,
} from './PreferenciaMultimodal'
import TablaRespuestas from './TablaRespuestas'
import { dateFromMsToString } from '../../util/dateUtils'
import './resultados.css'

const edad = (fechaNacimiento) => {
  const nacimiento = new Date(fechaNacimiento)
  const hoy = new Date()
  let anios = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) anios--
  return anios
}

/**
 * Resultado de un estudiante en un cuestionario. Lo ven el propio estudiante y
 * su profesor; solo cambian el título y a dónde vuelve. onDeclarar solo lo
 * pasa el estudiante: es quien responde la pregunta de preferencia.
 */
const ReporteIndividual = ({ resultado, titulo, onVolver, onDeclarar }) => {
  const { toPDF, targetRef } = usePDF({ page: { margin: 20, format: 'a4' } })
  const { cuestionario, estudiante, grupo } = resultado

  const descargar = async () => {
    try {
      await toPDF({
        filename: `reporte-${cuestionario.siglas}-${estudiante.nombre}.pdf`,
      })
    } catch (error) {
      console.error('Error al generar PDF:', error)
      Swal.fire('Error', 'Hubo un problema al generar el PDF.', 'error')
    }
  }

  const datos = [
    ['Estudiante', estudiante.nombre],
    estudiante.requiereCodigo && ['Código', estudiante.codigo],
    grupo?.nombre && ['Grupo', grupo.nombre],
    ['Edad', `${edad(estudiante.fechaNacimiento)} años`],
    ['Género', estudiante.genero],
    ['Fecha de nacimiento', dateFromMsToString(estudiante.fechaNacimiento)],
    ['Autor del cuestionario', cuestionario.autor],
    ['Versión', cuestionario.version],
  ].filter(Boolean)

  return (
    <div className="adela-r">
      <EncabezadoReporte
        titulo={titulo}
        subtitulo={`${cuestionario.nombre} (${cuestionario.siglas})`}
      >
        <button
          type="button"
          className="adela-btn adela-btn--primario"
          onClick={descargar}
        >
          <CIcon icon={cilCloudDownload} />
          Descargar PDF
        </button>
        <button type="button" className="adela-btn" onClick={onVolver}>
          <CIcon icon={cilArrowLeft} />
          Volver
        </button>
      </EncabezadoReporte>

      {/* Fuera del PDF: es una pregunta pendiente, no parte del reporte. */}
      {onDeclarar &&
        resultado.pidePreferencia &&
        !resultado.preferenciaMultimodal && (
          <PreguntaPreferencia onDeclarar={onDeclarar} />
        )}

      <div ref={targetRef}>
        <PerfilDestacado calificacion={resultado.calificacion} />
        {resultado.pidePreferencia &&
          (resultado.preferenciaMultimodal || !onDeclarar) && (
            <PreferenciaMultimodal
              preferencia={resultado.preferenciaMultimodal}
              propio={Boolean(onDeclarar)}
            />
          )}

        <section className="adela-panel adela-aparece">
          <dl className="adela-ficha">
            {datos.map(([etiqueta, valor]) => (
              <div key={etiqueta}>
                <dt>{etiqueta}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
          {cuestionario.descripcion && (
            <p className="adela-descripcion">{cuestionario.descripcion}</p>
          )}
        </section>

        <PanelEstilos
          estilos={resultado.estilos}
          calificacion={resultado.calificacion}
          etiqueta={estudiante.nombre}
        />

        <section className="adela-panel adela-aparece" style={{ '--i': 2 }}>
          <div className="adela-panel__cabeza">
            <h2 className="adela-panel__titulo">Respuestas</h2>
          </div>
          <TablaRespuestas preguntas={resultado.preguntas} />
        </section>
      </div>
    </div>
  )
}

ReporteIndividual.propTypes = {
  resultado: PropTypes.object.isRequired,
  titulo: PropTypes.string.isRequired,
  onVolver: PropTypes.func.isRequired,
  onDeclarar: PropTypes.func,
}

export default ReporteIndividual

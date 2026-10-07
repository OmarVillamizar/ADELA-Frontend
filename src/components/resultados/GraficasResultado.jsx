import React from 'react'
import PropTypes from 'prop-types'
import { CChartBar, CChartRadar } from '@coreui/react-chartjs'
import { valorEn } from '../../util/calificacion/escala'
import {
  COLOR_DATO,
  COLOR_DATO_SUAVE,
  barraEstilos,
  estiloBarra,
  radarEstilos,
} from '../../util/calificacion/opcionesGrafico'
import './resultados.css'

/**
 * Barras y radar del puntaje por estilo en la escala elegida. Lo usan el
 * resultado del estudiante, el de una cápsula y los reportes.
 */
const GraficasResultado = ({ estilos, escala, etiqueta }) => {
  const labels = estilos.map((e) => e.nombre)
  const datos = estilos.map((e) => valorEn(e, escala))

  return (
    <div className="adela-graficos">
      <div className="adela-grafico">
        <CChartBar
          customTooltips={false}
          data={{
            labels,
            datasets: [
              { label: etiqueta, data: datos, ...estiloBarra(COLOR_DATO) },
            ],
          }}
          options={barraEstilos(estilos, escala)}
        />
      </div>
      <div className="adela-grafico">
        <CChartRadar
          customTooltips={false}
          data={{
            labels,
            datasets: [
              {
                label: etiqueta,
                data: datos,
                borderColor: COLOR_DATO,
                backgroundColor: COLOR_DATO_SUAVE,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: COLOR_DATO,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
              },
            ],
          }}
          options={radarEstilos(estilos, escala)}
        />
      </div>
    </div>
  )
}

GraficasResultado.propTypes = {
  estilos: PropTypes.arrayOf(
    PropTypes.shape({
      nombre: PropTypes.string,
      valor: PropTypes.number,
      rangoMin: PropTypes.number,
      rangoMax: PropTypes.number,
    }),
  ).isRequired,
  escala: PropTypes.string.isRequired,
  etiqueta: PropTypes.string,
}

export default GraficasResultado

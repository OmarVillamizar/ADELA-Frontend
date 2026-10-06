import React from 'react'
import PropTypes from 'prop-types'
import { CCol, CRow } from '@coreui/react'
import { CChartBar, CChartRadar } from '@coreui/react-chartjs'

/**
 * Barras y radar del puntaje por estilo, en la escala del cuestionario.
 * Lo usan el resultado del estudiante, el de una cápsula y su reporte.
 */
const GraficasResultado = ({ estilos, etiqueta, valor = (c) => c.valor }) => {
  const minimo = Math.min(...estilos.map((c) => c.valorMinimo))
  const maximo = Math.max(...estilos.map((c) => c.valorMaximo))
  const labels = estilos.map((c) => c.nombre)
  const datos = estilos.map(valor)

  return (
    <CRow>
      <CCol md={6}>
        <CChartBar
          data={{
            labels,
            datasets: [
              { label: etiqueta, backgroundColor: '#36A2EB', data: datos },
            ],
          }}
          options={{
            responsive: true,
            scales: { y: { max: maximo, min: minimo } },
          }}
        />
      </CCol>
      <CCol md={6}>
        <CChartRadar
          data={{
            labels,
            datasets: [
              {
                label: etiqueta,
                data: datos,
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: 'rgba(75,192,192,1)',
                pointBorderColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(75,192,192,1)',
              },
            ],
          }}
          options={{
            scales: { r: { suggestedMin: minimo, suggestedMax: maximo } },
          }}
        />
      </CCol>
    </CRow>
  )
}

GraficasResultado.propTypes = {
  estilos: PropTypes.arrayOf(
    PropTypes.shape({
      nombre: PropTypes.string,
      valorMinimo: PropTypes.number,
      valorMaximo: PropTypes.number,
    }),
  ).isRequired,
  etiqueta: PropTypes.string,
  valor: PropTypes.func,
}

export default GraficasResultado

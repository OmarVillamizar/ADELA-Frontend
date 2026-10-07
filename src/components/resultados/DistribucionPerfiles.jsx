import React from 'react'
import PropTypes from 'prop-types'
import { CChartBar } from '@coreui/react-chartjs'
import {
  COLOR_DATO,
  barraConteo,
  estiloBarra,
} from '../../util/calificacion/opcionesGrafico'
import './resultados.css'

/**
 * Cuántas personas tienen cada perfil, del más al menos frecuente. En
 * cuestionarios ipsativos es el indicador principal del grupo.
 */
const DistribucionPerfiles = ({ distribucion, destacado = false }) => {
  const perfiles = Object.entries(distribucion ?? {})
  if (perfiles.length === 0) return null

  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">Perfiles del grupo</h2>
          <p className="adela-panel__nota">
            {destacado
              ? 'En este cuestionario, la distribución de perfiles describe mejor al grupo que el promedio.'
              : 'Cuántas personas tienen cada combinación de estilos dominantes.'}
          </p>
        </div>
      </div>
      <div
        className="adela-grafico"
        style={{ minHeight: 60 + perfiles.length * 40 }}
      >
        <CChartBar
          customTooltips={false}
          data={{
            labels: perfiles.map(([p]) => p),
            datasets: [
              {
                label: 'Personas',
                data: perfiles.map(([, n]) => n),
                ...estiloBarra(COLOR_DATO),
              },
            ],
          }}
          options={barraConteo({ horizontal: true })}
        />
      </div>
    </section>
  )
}

DistribucionPerfiles.propTypes = {
  distribucion: PropTypes.objectOf(PropTypes.number),
  destacado: PropTypes.bool,
}

export default DistribucionPerfiles

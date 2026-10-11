import React from 'react'
import PropTypes from 'prop-types'
import { CChartBar } from '@coreui/react-chartjs'
import {
  barraConteo,
  colorCategoria,
  estiloBarra,
} from '../../util/calificacion/opcionesGrafico'
import './resultados.css'

/**
 * Cuántas personas tienen cada perfil, del más al menos frecuente. A
 * diferencia de los estilos dominantes, cada persona cuenta una sola vez: las
 * barras suman el total. En cuestionarios ipsativos es el indicador principal.
 * esquinas: el perfil es la esquina del mapa de cuatro estilos.
 */
const DistribucionPerfiles = ({
  distribucion,
  destacado = false,
  esquinas = false,
}) => {
  const perfiles = Object.entries(distribucion ?? {})
  if (perfiles.length === 0) return null
  const total = perfiles.reduce((s, [, n]) => s + n, 0)
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0)

  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">
            {esquinas
              ? 'Ubicación en el mapa de estilos'
              : 'Combinaciones de estilos'}
          </h2>
          <p className="adela-panel__nota">
            {esquinas
              ? 'Cada estudiante aparece una sola vez, en la esquina del mapa donde quedó.'
              : 'Cada estudiante aparece una sola vez, en su combinación exacta de estilos fuertes (por ejemplo, dos estilos juntos cuentan como una combinación).'}{' '}
            Las barras suman {total} estudiante{total !== 1 ? 's' : ''}.
            {destacado &&
              ' En este cuestionario describe mejor al grupo que el promedio.'}
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
            labels: perfiles.map(([p, n]) => `${p} (${pct(n)} %)`),
            datasets: [
              {
                label: 'Estudiantes',
                data: perfiles.map(([, n]) => n),
                ...estiloBarra(perfiles.map((_, i) => colorCategoria(i))),
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
  esquinas: PropTypes.bool,
}

export default DistribucionPerfiles

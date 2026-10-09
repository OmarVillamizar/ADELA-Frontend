import React from 'react'
import PropTypes from 'prop-types'
import { CChartScatter } from '@coreui/react-chartjs'
import { polosDe } from './EscalasCompuestas'
import { formatoNumero } from '../../util/calificacion/escala'
import {
  COLOR_DATO,
  dispersionPlano,
  esquinasPlano,
} from '../../util/calificacion/opcionesGrafico'
import './resultados.css'

const EPS = 1e-9

/** "← bajo · alto →", o al revés si el eje se dibuja invertido. */
const titulo = (nombre, invertido) => {
  const polos = polosDe(nombre)
  if (!polos) return nombre
  return invertido
    ? `← ${polos.a} · ${polos.b} →`
    : `← ${polos.b} · ${polos.a} →`
}

// Cada línea necesita su propio label: al actualizar, CChart empareja los
// datasets por label y, sin él, la segunda línea pisa los datos de la primera.
const linea = (label, puntos) => ({
  label,
  data: puntos,
  showLine: true,
  pointRadius: 0,
  pointHitRadius: 0,
  borderColor: '#636874',
  borderWidth: 1.5,
  borderDash: [6, 4],
})

/**
 * Mapa de cuatro estilos: los dos ejes del cuestionario como plano, con una
 * línea en cada corte y el nombre de cada esquina. Individual: un punto con el
 * resultado. Grupal: la nube anónima de `puntos`, uno por resultado.
 */
const MapaCuadrantes = ({ plano, estilos, puntos, grupal }) => {
  const ejeX = estilos.find((e) => e.nombre === plano.ejeX)
  const ejeY = estilos.find((e) => e.nombre === plano.ejeY)
  if (!ejeX || !ejeY) return null

  const calculable = (e) => e.valor != null && e.estado !== 'NO_CALCULABLE'
  const punto =
    !grupal && calculable(ejeX) && calculable(ejeY)
      ? { x: ejeX.valor, y: ejeY.valor }
      : null
  const nube = grupal ? (puntos ?? []) : punto ? [punto] : []
  // Igual que el servidor: alto solo por encima del corte; igual al corte es bajo.
  const activa =
    punto &&
    `x${punto.x > plano.corteX + EPS ? 'Alto' : 'Bajo'}Y${punto.y > plano.corteY + EPS ? 'Alto' : 'Bajo'}`
  const x = { min: ejeX.rangoMin, max: ejeX.rangoMax }
  const y = { min: ejeY.rangoMin, max: ejeY.rangoMax }

  const data = {
    datasets: [
      {
        label: 'Resultados',
        data: nube,
        showLine: false,
        pointRadius: grupal ? 5 : 8,
        pointHoverRadius: grupal ? 6 : 9,
        backgroundColor: grupal ? 'rgba(42, 120, 214, 0.35)' : COLOR_DATO,
        borderColor: grupal ? 'rgba(42, 120, 214, 0.6)' : '#ffffff',
        borderWidth: grupal ? 1 : 2,
      },
      linea('Corte horizontal', [
        { x: plano.corteX, y: y.min },
        { x: plano.corteX, y: y.max },
      ]),
      linea('Corte vertical', [
        { x: x.min, y: plano.corteY },
        { x: x.max, y: plano.corteY },
      ]),
    ],
  }

  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">
            {grupal
              ? 'Mapa de cuatro estilos del grupo'
              : 'Mapa de cuatro estilos'}
          </h2>
          <p className="adela-panel__nota">
            Las líneas punteadas son los cortes (horizontal en{' '}
            {formatoNumero(plano.corteX)}, vertical en{' '}
            {formatoNumero(plano.corteY)}); un puntaje igual al corte cuenta
            como lado bajo.
            {grupal
              ? ' Cada punto es un resultado, sin nombre.'
              : !punto && ' No se pudo ubicar este resultado en el mapa.'}
            {punto &&
              ` Tu punto: horizontal ${formatoNumero(punto.x)}, vertical ${formatoNumero(punto.y)}.`}
            {punto &&
              (punto.x === plano.corteX || punto.y === plano.corteY) &&
              ' Cae justo sobre un corte, así que cuenta del lado bajo de esa línea.'}
          </p>
        </div>
      </div>
      <div className="adela-grafico adela-grafico--mapa">
        <CChartScatter
          customTooltips={false}
          data={data}
          options={dispersionPlano({
            x,
            y,
            tituloX: titulo(plano.ejeX, plano.invertirX),
            tituloY: titulo(plano.ejeY, plano.invertirY),
            invertirX: Boolean(plano.invertirX),
            invertirY: Boolean(plano.invertirY),
          })}
          plugins={[esquinasPlano(plano, activa)]}
        />
      </div>
    </section>
  )
}

MapaCuadrantes.propTypes = {
  plano: PropTypes.shape({
    ejeX: PropTypes.string,
    ejeY: PropTypes.string,
    corteX: PropTypes.number,
    corteY: PropTypes.number,
    xAltoYAlto: PropTypes.string,
    xBajoYAlto: PropTypes.string,
    xBajoYBajo: PropTypes.string,
    xAltoYBajo: PropTypes.string,
    invertirX: PropTypes.bool,
    invertirY: PropTypes.bool,
  }).isRequired,
  estilos: PropTypes.arrayOf(PropTypes.object).isRequired,
  puntos: PropTypes.arrayOf(
    PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
  ),
  grupal: PropTypes.bool,
}

export default MapaCuadrantes

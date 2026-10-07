import React from 'react'
import PropTypes from 'prop-types'
import {
  formatearPuntaje,
  formatearRango,
  formatoPct,
} from '../../util/calificacion/escala'
import './resultados.css'

/**
 * Puntaje de cada estilo con su rango, el % del máximo como medidor y el nivel
 * según el baremo del cuestionario.
 */
const TablaEstilos = ({ estilos }) => {
  const hayNivel = estilos.some((e) => e.nivel)
  return (
    <div className="adela-tabla__scroll">
      <table className="adela-tabla">
        <thead>
          <tr>
            <th scope="col">Estilo de aprendizaje</th>
            <th scope="col" className="num">
              Puntaje
            </th>
            <th scope="col">Rango posible</th>
            <th scope="col">% del máximo</th>
            {hayNivel && <th scope="col">Nivel</th>}
          </tr>
        </thead>
        <tbody>
          {estilos.map((e, i) => (
            <tr key={e.nombre}>
              <td>
                <span className="adela-tabla__nombre">{e.nombre}</span>
                {e.dominante && (
                  <span className="adela-chip adela-chip--acento ms-2">
                    Dominante
                  </span>
                )}
              </td>
              <td className="num">
                {formatearPuntaje(e)}
                {e.estado === 'PRORRATEADO' && (
                  <span className="text-body-secondary"> (estimado)</span>
                )}
              </td>
              <td className="text-body-secondary">{formatearRango(e)}</td>
              <td>
                {e.pomp == null ? (
                  <span className="text-body-secondary">-</span>
                ) : (
                  <div className="adela-medidor">
                    <div
                      className="adela-medidor__barra"
                      role="meter"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(e.pomp)}
                      aria-label={`${e.nombre}: ${formatoPct(e.pomp)} del máximo`}
                    >
                      <div
                        className="adela-medidor__relleno"
                        style={{ width: `${e.pomp}%`, '--i': i }}
                      />
                    </div>
                    <span className="adela-medidor__valor">
                      {formatoPct(e.pomp)}
                    </span>
                  </div>
                )}
              </td>
              {hayNivel && (
                <td>
                  {e.nivel ? (
                    <span className="adela-chip">{e.nivel}</span>
                  ) : (
                    '-'
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

TablaEstilos.propTypes = {
  estilos: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default TablaEstilos

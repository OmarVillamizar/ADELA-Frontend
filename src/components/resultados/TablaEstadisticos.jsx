import React from 'react'
import PropTypes from 'prop-types'
import {
  ESCALA,
  formatoNumero,
  formatoPct,
} from '../../util/calificacion/escala'
import './resultados.css'

const COLUMNAS = [
  ['n', 'Estudiantes'],
  ['media', 'Media'],
  ['desviacion', 'Desv. estándar'],
  ['mediana', 'Mediana'],
  ['p25', 'P25'],
  ['p75', 'P75'],
  ['minimo', 'Mín.'],
  ['maximo', 'Máx.'],
]

/** Estadísticos del grupo por estilo, en la escala elegida. */
const TablaEstadisticos = ({ estilos, escala }) => {
  const formato = escala === ESCALA.POMP ? formatoPct : formatoNumero
  return (
    <div className="adela-tabla__scroll">
      <table className="adela-tabla">
        <thead>
          <tr>
            <th scope="col">Estilo de aprendizaje</th>
            {COLUMNAS.map(([clave, titulo]) => (
              <th key={clave} scope="col" className="num">
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {estilos.map((e) => {
            const r =
              escala === ESCALA.POMP ? e.estadisticaPomp : e.estadisticaBruto
            return (
              <tr key={e.nombre}>
                <td className="adela-tabla__nombre">{e.nombre}</td>
                {COLUMNAS.map(([clave]) => (
                  <td key={clave} className="num">
                    {r == null ? '-' : clave === 'n' ? r.n : formato(r[clave])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

TablaEstadisticos.propTypes = {
  estilos: PropTypes.arrayOf(PropTypes.object).isRequired,
  escala: PropTypes.string.isRequired,
}

export default TablaEstadisticos

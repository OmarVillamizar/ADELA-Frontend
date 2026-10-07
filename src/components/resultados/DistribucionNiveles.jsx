import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { CChartBar } from '@coreui/react-chartjs'
import Segmentado from './Segmentado'
import {
  barraConteo,
  coloresNiveles,
  estiloBarra,
} from '../../util/calificacion/opcionesGrafico'
import './resultados.css'

const MANUAL = 'MANUAL'
const GRUPO = 'GRUPO'

/** Etiquetas de nivel en el orden en que aparecen (el de las bandas). */
const nivelesDe = (estilos, campo) => {
  const niveles = []
  estilos.forEach((e) =>
    Object.keys(e[campo] ?? {}).forEach((n) => {
      if (!niveles.includes(n)) niveles.push(n)
    }),
  )
  return niveles
}

/**
 * Cuántos estudiantes hay en cada nivel, por estilo. Con el baremo del manual
 * o, con 30 o más estudiantes, comparando a cada uno con su propio grupo.
 */
const DistribucionNiveles = ({ estilos }) => {
  const hayManual = estilos.some((e) => e.distribucionBandas)
  const hayGrupo = estilos.some((e) => e.distribucionBaremoLocal)
  const [fuente, setFuente] = useState(hayManual ? MANUAL : GRUPO)

  if (!hayManual && !hayGrupo) return null

  const campo =
    fuente === MANUAL ? 'distribucionBandas' : 'distribucionBaremoLocal'
  const conDatos = estilos.filter((e) => e[campo])
  const niveles = nivelesDe(conDatos, campo)
  const colores = coloresNiveles(niveles.length)

  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">Distribución por nivel</h2>
          <p className="adela-panel__nota">
            {fuente === MANUAL
              ? 'Estudiantes en cada nivel según el baremo del cuestionario.'
              : 'Cada estudiante comparado con su grupo: el 10 % más bajo es Muy baja y el 10 % más alto, Muy alta.'}
          </p>
        </div>
        {hayManual && hayGrupo && (
          <Segmentado
            etiqueta="Baremo"
            opciones={[
              { valor: MANUAL, etiqueta: 'Baremo del cuestionario' },
              { valor: GRUPO, etiqueta: 'Comparado con el grupo' },
            ]}
            valor={fuente}
            onChange={setFuente}
          />
        )}
      </div>
      <div className="adela-grafico">
        <CChartBar
          customTooltips={false}
          data={{
            labels: conDatos.map((e) => e.nombre),
            datasets: niveles.map((nivel, i) => ({
              label: nivel,
              data: conDatos.map((e) => e[campo][nivel] ?? 0),
              ...estiloBarra(colores[i]),
            })),
          }}
          options={barraConteo({ leyenda: true })}
        />
      </div>
    </section>
  )
}

DistribucionNiveles.propTypes = {
  estilos: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default DistribucionNiveles

import React from 'react'
import PropTypes from 'prop-types'
import {
  RAMPA_NIVELES,
  coloresNiveles,
} from '../../util/calificacion/opcionesGrafico'
import './resultados.css'

const pct = (k, n) => (n > 0 ? Math.round((k / n) * 100) : 0)

/** Los extremos de la rampa son oscuros: texto blanco encima. */
const OSCUROS = [RAMPA_NIVELES[0], RAMPA_NIVELES[RAMPA_NIVELES.length - 1]]

/**
 * Resumen de los esquemas que no eligen estilo destacado: cuántos estudiantes
 * caen en cada nivel de cada estilo, como barras apiladas al 100 %. Se cuenta
 * con el nivel de cada estudiante, así que respeta el filtro.
 *
 * estilos: [{ nombre, niveles }] con los niveles en el orden de las bandas.
 */
const NivelesGrupo = ({ resueltos, estilos, filtro }) => {
  const conNiveles = estilos.filter((e) => e.niveles.length > 0)
  const leyenda = []
  conNiveles.forEach((e) =>
    e.niveles.forEach((nv) => {
      if (!leyenda.includes(nv)) leyenda.push(nv)
    }),
  )
  const colores = coloresNiveles(leyenda.length)
  const color = (nv) => colores[leyenda.indexOf(nv)]

  const filas = conNiveles.map((e) => {
    const conteo = Object.fromEntries(e.niveles.map((nv) => [nv, 0]))
    resueltos.forEach((r) => {
      const nv = r.niveles?.[e.nombre]
      if (nv in conteo) conteo[nv]++
    })
    const n = Object.values(conteo).reduce((a, b) => a + b, 0)
    const max = Math.max(0, ...Object.values(conteo))
    const frecuente = e.niveles.find((nv) => max > 0 && conteo[nv] === max)
    return { ...e, conteo, n, frecuente }
  })

  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">Niveles del grupo por estilo</h2>
          <p className="adela-panel__nota">
            {filtro ? `Filtro: ${filtro}. ` : ''}
            Este cuestionario no elige un estilo destacado: cada estilo se lee
            por separado. Cada barra suma el 100 % de quienes tienen resultado
            en ese estilo y cada tramo es un nivel de preferencia. Pasa el
            cursor por un tramo para ver la cantidad.
          </p>
        </div>
      </div>

      {resueltos.length === 0 ? (
        <p className="adela-panel__nota mb-0">
          Ningún estudiante que haya respondido cumple el filtro.
        </p>
      ) : filas.length === 0 ? (
        <p className="adela-panel__nota mb-0">
          Este cuestionario no tiene niveles definidos. Compara los puntajes en
          Gráficas.
        </p>
      ) : (
        <>
          <p className="adela-resumen__frase">
            Nivel más frecuente:{' '}
            {filas
              .filter((f) => f.frecuente)
              .map((f, i) => (
                <React.Fragment key={f.nombre}>
                  {i > 0 && ' · '}
                  {f.nombre}, <strong>{f.frecuente}</strong> (
                  {pct(f.conteo[f.frecuente], f.n)} %)
                </React.Fragment>
              ))}
            .
          </p>

          <ul className="adela-resumen__lista">
            {filas.map((f) => (
              <li key={f.nombre} className="adela-niveles__fila">
                <span className="adela-resumen__nombre">
                  {f.nombre}
                  <span className="adela-niveles__n">n = {f.n}</span>
                </span>
                <span
                  className="adela-niveles__barra"
                  role="img"
                  aria-label={`${f.nombre}: ${f.niveles
                    .map((nv) => `${nv} ${f.conteo[nv]}`)
                    .join(', ')}`}
                >
                  {f.niveles
                    .filter((nv) => f.conteo[nv] > 0)
                    .map((nv) => {
                      const p = pct(f.conteo[nv], f.n)
                      return (
                        <span
                          key={nv}
                          className="adela-niveles__tramo"
                          title={`${nv}: ${f.conteo[nv]} de ${f.n} (${p} %)`}
                          style={{
                            width: `${(f.conteo[nv] / f.n) * 100}%`,
                            background: color(nv),
                            color: OSCUROS.includes(color(nv))
                              ? '#fff'
                              : 'var(--ink)',
                          }}
                        >
                          {p >= 8 ? `${p} %` : ''}
                        </span>
                      )
                    })}
                </span>
              </li>
            ))}
          </ul>

          <ul className="adela-niveles__leyenda">
            {leyenda.map((nv) => (
              <li key={nv}>
                <span
                  className="adela-resumen__punto"
                  style={{ background: color(nv) }}
                />
                {nv}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

NivelesGrupo.propTypes = {
  resueltos: PropTypes.arrayOf(PropTypes.object).isRequired,
  estilos: PropTypes.arrayOf(
    PropTypes.shape({
      nombre: PropTypes.string.isRequired,
      niveles: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
  filtro: PropTypes.string,
}

export default NivelesGrupo

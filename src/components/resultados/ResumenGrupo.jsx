import React from 'react'
import PropTypes from 'prop-types'
import { colorCategoria } from '../../util/calificacion/opcionesGrafico'
import { categoriasResumen, contar } from '../../util/calificacion/demografia'
import './resultados.css'

const pct = (k, n) => (n > 0 ? Math.round((k / n) * 100) : 0)

/** Categorías con más estudiantes; vacío si nadie cae en ninguna. */
const masFrecuentes = (conteo) => {
  const max = Math.max(0, ...Object.values(conteo))
  return max === 0 ? [] : Object.keys(conteo).filter((c) => conteo[c] === max)
}

/**
 * Lo esencial del grupo sin estadística: cuántos estudiantes tienen cada
 * estilo. Respeta el filtro elegido; la comparación por género y edad va en
 * ComparativaDemografica.
 */
const ResumenGrupo = ({ resueltos, nombresEstilos, filtro }) => {
  const criterio = categoriasResumen(resueltos, nombresEstilos)
  const { conteo, ninguna } = contar(resueltos, criterio)
  const n = resueltos.length
  const top = masFrecuentes(conteo)
  const orden = [...criterio.categorias].sort((a, b) => conteo[b] - conteo[a])

  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">
            {criterio.porEstilo ? 'Estilos dominantes' : 'Perfiles del grupo'}
          </h2>
          <p className="adela-panel__nota">
            {filtro ? `Filtro: ${filtro}. ` : ''}
            {criterio.porEstilo
              ? 'Cuántos estudiantes tienen cada estilo como fuerte. Quien tiene varios cuenta en cada uno, por eso los porcentajes pueden sumar más de 100 %.'
              : 'Cuántos estudiantes hay en cada perfil. Cada uno cuenta una sola vez.'}
          </p>
        </div>
      </div>

      {n === 0 ? (
        <p className="adela-panel__nota mb-0">
          Ningún estudiante que haya respondido cumple el filtro.
        </p>
      ) : (
        <>
          <p className="adela-resumen__frase">
            De <strong>{n}</strong> estudiante{n !== 1 ? 's' : ''} que respondi
            {n !== 1 ? 'eron' : 'ó'},{' '}
            {top.length === 0 ? (
              'ninguno tiene un estilo destacado.'
            ) : (
              <>
                {top.length > 1
                  ? 'los más frecuentes son '
                  : 'el más frecuente es '}
                <strong>{top.join(' y ')}</strong> ({conteo[top[0]]} estudiante
                {conteo[top[0]] !== 1 ? 's' : ''}, {pct(conteo[top[0]], n)} %).
              </>
            )}
          </p>

          <ul className="adela-resumen__lista">
            {orden.map((c) => (
              <li key={c} className="adela-resumen__fila">
                <span className="adela-resumen__nombre">
                  <span
                    className="adela-resumen__punto"
                    style={{
                      background: colorCategoria(
                        criterio.categorias.indexOf(c),
                      ),
                    }}
                  />
                  {c}
                </span>
                <span className="adela-medidor__barra">
                  <span
                    className="adela-medidor__relleno d-block"
                    style={{
                      width: `${pct(conteo[c], n)}%`,
                      background: colorCategoria(
                        criterio.categorias.indexOf(c),
                      ),
                    }}
                  />
                </span>
                <span className="adela-resumen__cifra">
                  {conteo[c]} · {pct(conteo[c], n)} %
                </span>
              </li>
            ))}
            {ninguna > 0 && (
              <li className="adela-resumen__fila">
                <span className="adela-resumen__nombre">
                  <span className="adela-resumen__punto" />
                  Sin estilo destacado
                </span>
                <span className="adela-medidor__barra">
                  <span
                    className="adela-medidor__relleno d-block"
                    style={{
                      width: `${pct(ninguna, n)}%`,
                      background: '#9aa0aa',
                    }}
                  />
                </span>
                <span className="adela-resumen__cifra">
                  {ninguna} · {pct(ninguna, n)} %
                </span>
              </li>
            )}
          </ul>
        </>
      )}
    </section>
  )
}

ResumenGrupo.propTypes = {
  resueltos: PropTypes.arrayOf(PropTypes.object).isRequired,
  nombresEstilos: PropTypes.arrayOf(PropTypes.string).isRequired,
  filtro: PropTypes.string,
}

export default ResumenGrupo

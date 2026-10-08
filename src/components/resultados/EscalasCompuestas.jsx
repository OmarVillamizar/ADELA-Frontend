import React from 'react'
import PropTypes from 'prop-types'
import {
  ESCALA,
  formatoNumero,
  formatoPct,
  valorEn,
} from '../../util/calificacion/escala'
import './resultados.css'

/** "Activo − Reflexivo" -> polos { a: 'Activo', b: 'Reflexivo' }; si no, null. */
export const polosDe = (nombre) => {
  const partes = nombre.split(/\s+[−-]\s+/)
  return partes.length === 2 ? { a: partes[0], b: partes[1] } : null
}

const posicion = (x, min, max) =>
  max - min < 1e-9
    ? 50
    : Math.min(100, Math.max(0, ((x - min) / (max - min)) * 100))

/**
 * Estilos compuestos (p. ej. un polo A − B) en una barra divergente: de su
 * mínimo a su máximo, con la línea en 0 y una marca en el puntaje (o en la
 * media del grupo). A la derecha queda el primer polo, a la izquierda el
 * segundo. Va aparte de los gráficos de primarios porque su rango tiene
 * negativos y es distinto.
 */
const EscalasCompuestas = ({ estilos, grupal }) => {
  if (estilos.length === 0) return null
  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">
            {grupal ? 'Promedio en las escalas de polos' : 'Escalas de polos'}
          </h2>
          <p className="adela-panel__nota">
            Cada barra va del mínimo al máximo posible. La línea marca el
            equilibrio (0) y el punto, hacia qué polo se inclina
            {grupal ? ' el grupo en promedio' : ' el resultado'}.
          </p>
        </div>
      </div>
      {estilos.map((e, i) => {
        const valor = e.valor
        const calculable = valor != null && e.estado !== 'NO_CALCULABLE'
        const polos = polosDe(e.nombre)
        const cero = posicion(0, e.rangoMin, e.rangoMax)
        const marca = calculable
          ? posicion(valor, e.rangoMin, e.rangoMax)
          : cero
        const pomp = valorEn(e, ESCALA.POMP)
        return (
          <div key={e.nombre} className="adela-polo">
            <div className="adela-polo__cabeza">
              <strong>{e.nombre}</strong>
              <span className="adela-polo__cifra">
                {calculable
                  ? `${formatoNumero(valor)} en [${formatoNumero(e.rangoMin)}, ${formatoNumero(e.rangoMax)}] · ${formatoPct(pomp)}`
                  : 'No calculable'}
              </span>
              {!grupal && e.nivel && (
                <span className="adela-chip adela-chip--acento">{e.nivel}</span>
              )}
            </div>
            <div
              className="adela-polo__pista"
              role="img"
              aria-label={
                calculable
                  ? `${e.nombre}: ${formatoNumero(valor)} entre ${formatoNumero(e.rangoMin)} y ${formatoNumero(e.rangoMax)}`
                  : `${e.nombre}: no calculable`
              }
            >
              {calculable && (
                <span
                  className="adela-polo__relleno"
                  style={{
                    left: `${Math.min(cero, marca)}%`,
                    width: `${Math.abs(marca - cero)}%`,
                    // Crece desde el equilibrio hacia el polo.
                    transformOrigin:
                      marca < cero ? 'right center' : 'left center',
                    '--i': i,
                  }}
                />
              )}
              <span className="adela-polo__cero" style={{ left: `${cero}%` }} />
              {calculable && (
                <span
                  className="adela-polo__marca"
                  style={{ left: `${marca}%` }}
                />
              )}
            </div>
            <div className="adela-polo__extremos">
              <span>{polos ? polos.b : formatoNumero(e.rangoMin)}</span>
              <span>{polos ? polos.a : formatoNumero(e.rangoMax)}</span>
            </div>
          </div>
        )
      })}
    </section>
  )
}

EscalasCompuestas.propTypes = {
  estilos: PropTypes.arrayOf(
    PropTypes.shape({
      nombre: PropTypes.string,
      valor: PropTypes.number,
      rangoMin: PropTypes.number,
      rangoMax: PropTypes.number,
      nivel: PropTypes.string,
      estado: PropTypes.string,
    }),
  ).isRequired,
  grupal: PropTypes.bool,
}

export default EscalasCompuestas

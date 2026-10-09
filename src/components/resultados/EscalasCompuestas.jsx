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

/**
 * Un compuesto es de contraste si su rango cruza el 0: resta un estilo de
 * otro (polos A − B, AC − CE). Si nunca baja de 0, solo suma componentes
 * (enfoque = motivo + estrategia) y no hay polos ni equilibrio que mostrar.
 * Se deduce del rango porque los coeficientes no llegan al cliente; con
 * pesos no negativos, un compuesto que solo suma no puede quedar bajo 0.
 */
export const esContraste = (e) => e.rangoMin < 0

/** Posición en la barra: fracción del intervalo [min, max], no % del máximo. */
const posicion = (x, min, max) =>
  max - min < 1e-9
    ? 50
    : Math.min(100, Math.max(0, ((x - min) / (max - min)) * 100))

const Escala = ({ e, i, contraste, grupal }) => {
  const valor = e.valor
  const calculable = valor != null && e.estado !== 'NO_CALCULABLE'
  const polos = contraste ? polosDe(e.nombre) : null
  // Contraste: crece desde el 0 hacia el polo. Aditiva: desde el mínimo.
  const origen = contraste ? posicion(0, e.rangoMin, e.rangoMax) : 0
  const marca = calculable ? posicion(valor, e.rangoMin, e.rangoMax) : origen
  const pomp = valorEn(e, ESCALA.POMP)
  return (
    <div className="adela-polo">
      <div className="adela-polo__cabeza">
        <strong>{e.nombre}</strong>
        <span className="adela-polo__cifra">
          {calculable
            ? `${formatoNumero(valor)} en [${formatoNumero(e.rangoMin)}, ${formatoNumero(e.rangoMax)}] · ${formatoPct(pomp)} del máximo`
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
              left: `${Math.min(origen, marca)}%`,
              width: `${Math.abs(marca - origen)}%`,
              transformOrigin: marca < origen ? 'right center' : 'left center',
              '--i': i,
            }}
          />
        )}
        {contraste && (
          <span className="adela-polo__cero" style={{ left: `${origen}%` }} />
        )}
        {calculable && (
          <span className="adela-polo__marca" style={{ left: `${marca}%` }} />
        )}
      </div>
      <div className="adela-polo__extremos">
        <span>{polos ? polos.b : formatoNumero(e.rangoMin)}</span>
        <span>{polos ? polos.a : formatoNumero(e.rangoMax)}</span>
      </div>
    </div>
  )
}

const estiloShape = PropTypes.shape({
  nombre: PropTypes.string,
  valor: PropTypes.number,
  rangoMin: PropTypes.number,
  rangoMax: PropTypes.number,
  nivel: PropTypes.string,
  estado: PropTypes.string,
})

Escala.propTypes = {
  e: estiloShape.isRequired,
  i: PropTypes.number.isRequired,
  contraste: PropTypes.bool,
  grupal: PropTypes.bool,
}

const Seccion = ({ titulo, nota, estilos, contraste, grupal }) =>
  estilos.length === 0 ? null : (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">{titulo}</h2>
          <p className="adela-panel__nota">{nota}</p>
        </div>
      </div>
      {estilos.map((e, i) => (
        <Escala
          key={e.nombre}
          e={e}
          i={i}
          contraste={contraste}
          grupal={grupal}
        />
      ))}
    </section>
  )

Seccion.propTypes = {
  titulo: PropTypes.string.isRequired,
  nota: PropTypes.string.isRequired,
  estilos: PropTypes.arrayOf(estiloShape).isRequired,
  contraste: PropTypes.bool,
  grupal: PropTypes.bool,
}

/**
 * Estilos compuestos, aparte de los primarios porque su rango es otro. Los de
 * contraste (A − B) van en una barra divergente con la línea en 0, que es la
 * igualdad matemática entre los dos, no un corte del instrumento. Los
 * aditivos (suma de componentes) van en una barra del mínimo al máximo.
 */
const EscalasCompuestas = ({ estilos, grupal }) => {
  const sujeto = grupal ? 'el grupo en promedio' : 'el resultado'
  return (
    <>
      <Seccion
        titulo={
          grupal
            ? 'Promedio en las escalas de contraste'
            : 'Escalas de contraste'
        }
        nota={`Cada barra va del mínimo al máximo posible. La línea marca el 0, donde los dos lados se igualan, y el punto, hacia cuál se inclina ${sujeto}.`}
        estilos={estilos.filter(esContraste)}
        contraste
        grupal={grupal}
      />
      <Seccion
        titulo={
          grupal
            ? 'Promedio en las escalas compuestas aditivas'
            : 'Escalas compuestas aditivas'
        }
        nota={`Cada una suma sus componentes. La barra va del mínimo al máximo posible y el punto marca ${sujeto}. El % del máximo no es un percentil ni un nivel.`}
        estilos={estilos.filter((e) => !esContraste(e))}
        grupal={grupal}
      />
    </>
  )
}

EscalasCompuestas.propTypes = {
  estilos: PropTypes.arrayOf(estiloShape).isRequired,
  grupal: PropTypes.bool,
}

export default EscalasCompuestas

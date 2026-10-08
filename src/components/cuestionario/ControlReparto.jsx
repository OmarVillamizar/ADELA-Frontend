import React from 'react'
import PropTypes from 'prop-types'
import '../resultados/resultados.css'
import './controles.css'

/**
 * Repartir P puntos enteros entre las opciones. El contador de lo que queda
 * impide pasarse: + se desactiva al llegar a 0 y lo escrito se recorta.
 */
const ControlReparto = ({ opciones, respuesta, onChange, puntos }) => {
  const usados = Object.values(respuesta).reduce((a, b) => a + b, 0)
  const restante = puntos - usados

  const fijar = (opcionId, valor) => {
    const actual = respuesta[opcionId] ?? 0
    const limpio = Math.max(
      0,
      Math.min(Math.trunc(Number(valor) || 0), actual + restante),
    )
    const siguiente = { ...respuesta }
    if (limpio === 0) delete siguiente[opcionId]
    else siguiente[opcionId] = limpio
    onChange(siguiente)
  }

  return (
    <div className="adela-r adela-reparto">
      <p
        className={`adela-reparto__restante ${restante === 0 ? 'adela-reparto__restante--listo' : ''}`}
        aria-live="polite"
      >
        {restante === 0
          ? `Repartiste los ${puntos} puntos`
          : `Te quedan ${restante} de ${puntos} puntos`}
      </p>
      {opciones.map((opcion) => {
        const valor = respuesta[opcion.id] ?? 0
        return (
          <div key={opcion.id} className="adela-orden__fila">
            <label
              htmlFor={`reparto-${opcion.id}`}
              className="adela-orden__texto"
            >
              {opcion.respuesta}
            </label>
            <div className="adela-stepper">
              <button
                type="button"
                className="adela-btn adela-btn--sm"
                aria-label={`Quitar un punto a ${opcion.respuesta}`}
                disabled={valor === 0}
                onClick={() => fijar(opcion.id, valor - 1)}
              >
                −
              </button>
              <input
                id={`reparto-${opcion.id}`}
                className="adela-stepper__valor"
                type="number"
                inputMode="numeric"
                min={0}
                max={valor + restante}
                value={valor}
                onChange={(e) => fijar(opcion.id, e.target.value)}
              />
              <button
                type="button"
                className="adela-btn adela-btn--sm"
                aria-label={`Sumar un punto a ${opcion.respuesta}`}
                disabled={restante === 0}
                onClick={() => fijar(opcion.id, valor + 1)}
              >
                +
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

ControlReparto.propTypes = {
  opciones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      respuesta: PropTypes.string,
    }),
  ).isRequired,
  respuesta: PropTypes.objectOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
  puntos: PropTypes.number.isRequired,
}

export default ControlReparto

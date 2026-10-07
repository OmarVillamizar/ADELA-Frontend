import React from 'react'
import PropTypes from 'prop-types'
import './resultados.css'

/** Control segmentado: una opción activa, hundida como una tecla pulsada. */
const Segmentado = ({ opciones, valor, onChange, etiqueta }) => {
  if (opciones.length < 2) return null
  return (
    <div className="adela-seg" role="group" aria-label={etiqueta}>
      {opciones.map((op) => (
        <button
          key={op.valor}
          type="button"
          className="adela-seg__op"
          aria-pressed={valor === op.valor}
          onClick={() => onChange(op.valor)}
        >
          {op.etiqueta}
        </button>
      ))}
    </div>
  )
}

Segmentado.propTypes = {
  opciones: PropTypes.arrayOf(
    PropTypes.shape({ valor: PropTypes.string, etiqueta: PropTypes.string }),
  ).isRequired,
  valor: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  etiqueta: PropTypes.string.isRequired,
}

export default Segmentado

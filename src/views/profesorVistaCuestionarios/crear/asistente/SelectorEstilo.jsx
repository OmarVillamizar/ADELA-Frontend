import React from 'react'
import PropTypes from 'prop-types'

/** Elegir un estilo con chips: más rápido que un desplegable con pocos estilos. */
const SelectorEstilo = ({ estilos, valor, onChange, etiqueta }) => (
  <div className="adela-chips" role="group" aria-label={etiqueta}>
    {estilos.map((e) => (
      <button
        key={e.id}
        type="button"
        className="adela-chip-btn"
        aria-pressed={valor === e.id}
        onClick={() => onChange(e.id)}
      >
        {e.nombre}
      </button>
    ))}
  </div>
)

SelectorEstilo.propTypes = {
  estilos: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, nombre: PropTypes.string }),
  ).isRequired,
  valor: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  etiqueta: PropTypes.string.isRequired,
}

export default SelectorEstilo

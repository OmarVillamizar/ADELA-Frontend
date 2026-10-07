import React from 'react'
import PropTypes from 'prop-types'
import './resultados.css'

/** Un número destacado con su etiqueta. */
const Cifra = ({ etiqueta, valor, extra, indice = 0 }) => (
  <div className="adela-cifra adela-aparece" style={{ '--i': indice }}>
    <p className="adela-cifra__etiqueta">{etiqueta}</p>
    <p className="adela-cifra__valor">
      {valor}
      {extra && <span className="adela-cifra__extra">{extra}</span>}
    </p>
  </div>
)

Cifra.propTypes = {
  etiqueta: PropTypes.string.isRequired,
  valor: PropTypes.node.isRequired,
  extra: PropTypes.node,
  indice: PropTypes.number,
}

export default Cifra

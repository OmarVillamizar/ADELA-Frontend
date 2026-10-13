import React from 'react'
import PropTypes from 'prop-types'

/**
 * Nelse a la derecha "diciendo" el contenido de la izquierda: un aviso o una
 * burbuja (.nelse-burbuja). Usa imágenes "_left", que miran hacia el texto.
 * La imagen es decorativa: el mensaje va en el contenido.
 */
const NelseMensaje = ({ imagen, children }) => (
  <div className="nelse-mensaje">
    <div className="nelse-mensaje-texto">{children}</div>
    <img src={imagen} alt="" aria-hidden="true" className="nelse-mensaje-img" />
  </div>
)

NelseMensaje.propTypes = {
  imagen: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default NelseMensaje

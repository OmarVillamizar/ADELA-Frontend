import React from 'react'
import PropTypes from 'prop-types'

/**
 * Nelse a la derecha "diciendo" el contenido de la izquierda: un aviso o una
 * burbuja (.nelse-burbuja). Usa imágenes "_left", que miran hacia el texto.
 * La imagen es decorativa: el mensaje va en el contenido. `compacto`: más
 * pequeño y pegado a la derecha, para invitaciones que no deben tapar la vista.
 */
const NelseMensaje = ({ imagen, compacto = false, children }) => (
  <div
    className={
      compacto ? 'nelse-mensaje nelse-mensaje-compacto' : 'nelse-mensaje'
    }
  >
    <div className="nelse-mensaje-texto">{children}</div>
    <img src={imagen} alt="" aria-hidden="true" className="nelse-mensaje-img" />
  </div>
)

NelseMensaje.propTypes = {
  imagen: PropTypes.string.isRequired,
  compacto: PropTypes.bool,
  children: PropTypes.node.isRequired,
}

export default NelseMensaje

import React from 'react'
import PropTypes from 'prop-types'

/**
 * Nelse, la mascota, a ambos lados del contenido. Decorativo: el lector de
 * pantalla no lo anuncia. Solo en escritorio; en celular no hay espacio libre.
 * Cada imagen mira hacia el centro: la de la izquierda es una "_right".
 */
const NelseLados = ({ izquierda, derecha, tamano = 'normal', children }) => (
  <div className={`nelse-escena nelse-escena-${tamano}`}>
    {children}
    <img
      src={izquierda}
      alt=""
      aria-hidden="true"
      className="nelse nelse-izq d-none d-lg-block"
    />
    <img
      src={derecha}
      alt=""
      aria-hidden="true"
      className="nelse nelse-der d-none d-lg-block"
    />
  </div>
)

NelseLados.propTypes = {
  izquierda: PropTypes.string.isRequired,
  derecha: PropTypes.string.isRequired,
  tamano: PropTypes.oneOf(['normal', 'grande']),
  children: PropTypes.node,
}

export default NelseLados

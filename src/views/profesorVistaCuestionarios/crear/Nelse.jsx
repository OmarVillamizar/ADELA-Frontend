import React from 'react'
import PropTypes from 'prop-types'
import feliz from '../../../assets/nelse_mascot/web/nelse_happy_left.webp'
import piensa from '../../../assets/nelse_mascot/web/nelse_think_left.webp'
import lee from '../../../assets/nelse_mascot/web/nelse_readingbookglasses_right.webp'
import anota from '../../../assets/nelse_mascot/web/nelse_thinkglasses_right.webp'
import reporte from '../../../assets/nelse_mascot/web/nelse_report_left.webp'
import listo from '../../../assets/nelse_mascot/web/nelse_questtionarieOK_left.webp'
import './crear.css'

/**
 * Hacia dónde mira cada pose. Quien mira a la izquierda va a la derecha del
 * globo, y al revés: así siempre mira hacia lo que explica.
 */
const POSES = {
  feliz: { src: feliz, mira: 'izq' },
  piensa: { src: piensa, mira: 'izq' },
  reporte: { src: reporte, mira: 'izq' },
  listo: { src: listo, mira: 'izq' },
  lee: { src: lee, mira: 'der' },
  anota: { src: anota, mira: 'der' },
}

/** Nelse, el guía del asistente: una pose y un consejo corto en un globo. */
const Nelse = ({ pose, titulo, children }) => {
  const { src, mira } = POSES[pose]
  return (
    <aside
      className={`adela-nelse adela-nelse--${mira === 'der' ? 'izq' : 'der'}`}
      aria-label="Consejo del asistente"
    >
      <img className="adela-nelse__img" src={src} alt="" aria-hidden="true" />
      <div className="adela-nelse__globo">
        {titulo && <strong className="adela-nelse__titulo">{titulo}</strong>}
        <div className="adela-nelse__texto">{children}</div>
      </div>
    </aside>
  )
}

Nelse.propTypes = {
  pose: PropTypes.oneOf(Object.keys(POSES)).isRequired,
  titulo: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default Nelse

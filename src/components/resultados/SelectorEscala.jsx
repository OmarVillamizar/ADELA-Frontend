import React from 'react'
import PropTypes from 'prop-types'
import Segmentado from './Segmentado'
import { etiquetaEscala } from '../../util/calificacion/escala'

/** Puntaje directo o % del máximo. Con una sola escala posible no se muestra. */
const SelectorEscala = ({ disponibles, valor, onChange }) => (
  <Segmentado
    etiqueta="Escala del gráfico"
    opciones={disponibles.map((e) => ({
      valor: e,
      etiqueta: etiquetaEscala[e],
    }))}
    valor={valor}
    onChange={onChange}
  />
)

SelectorEscala.propTypes = {
  disponibles: PropTypes.arrayOf(PropTypes.string).isRequired,
  valor: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default SelectorEscala

import React from 'react'
import PropTypes from 'prop-types'
import { ETIQUETA_RIESGO, ETIQUETA_SECCION } from './marcas'
import '../crear.css'

const CLASE_RIESGO = {
  ALTO: 'adela-chip--acento',
  MEDIO: 'adela-chip--aviso',
  BAJO: '',
}

/**
 * Una marca de revisión: qué se debe mirar, qué tan grave es y cómo
 * comprobarlo. La persona la confirma con "Revisado"; onIr (opcional) la lleva
 * a la sección donde se corrige.
 */
const FilaMarca = ({ marca, hecha, onCambiar, onIr }) => (
  <li
    className={`adela-marca adela-marca--${(marca.riesgo ?? '').toLowerCase()} ${hecha ? 'adela-marca--hecha' : ''}`}
  >
    <div className="adela-marca__cuerpo">
      <div className="adela-fila">
        <span className={`adela-chip ${CLASE_RIESGO[marca.riesgo] ?? ''}`}>
          {ETIQUETA_RIESGO[marca.riesgo] ?? marca.riesgo}
        </span>
        <span className="adela-marca__seccion">
          {ETIQUETA_SECCION[marca.seccion] ?? marca.seccion}
          {' · '}
          {marca.origen === 'MODELO' ? 'lo señaló la IA' : 'lo detectó ADELA'}
        </span>
        {onIr && (
          <button
            type="button"
            className="adela-btn adela-btn--sm"
            onClick={() => onIr(marca)}
          >
            Ir
          </button>
        )}
      </div>
      <p className="adela-marca__mensaje">{marca.mensaje}</p>
      {marca.comoVerificar && (
        <p className="adela-ayuda mt-0">
          Cómo verificarlo: {marca.comoVerificar}
        </p>
      )}
    </div>
    <label className="adela-marca__revisado">
      <input
        type="checkbox"
        checked={hecha}
        onChange={(e) => onCambiar(e.target.checked)}
      />
      Revisado
    </label>
  </li>
)

FilaMarca.propTypes = {
  marca: PropTypes.object.isRequired,
  hecha: PropTypes.bool.isRequired,
  onCambiar: PropTypes.func.isRequired,
  onIr: PropTypes.func,
}

export default FilaMarca

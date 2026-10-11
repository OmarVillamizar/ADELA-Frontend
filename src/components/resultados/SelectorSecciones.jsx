import React from 'react'
import PropTypes from 'prop-types'
import './resultados.css'

/**
 * Casillas para elegir qué partes del reporte se ven. Lo que se oculta tampoco
 * sale en el PDF, que captura solo lo visible.
 */
const SelectorSecciones = ({ secciones, valor, onChange }) => (
  <fieldset className="adela-secciones">
    <legend className="adela-secciones__titulo">Mostrar en el reporte</legend>
    {secciones.map((s) => (
      <label key={s.clave} className="adela-secciones__op">
        <input
          type="checkbox"
          className="form-check-input"
          checked={valor[s.clave]}
          onChange={(e) => onChange({ ...valor, [s.clave]: e.target.checked })}
        />
        {s.etiqueta}
      </label>
    ))}
  </fieldset>
)

SelectorSecciones.propTypes = {
  secciones: PropTypes.arrayOf(
    PropTypes.shape({ clave: PropTypes.string, etiqueta: PropTypes.string }),
  ).isRequired,
  valor: PropTypes.objectOf(PropTypes.bool).isRequired,
  onChange: PropTypes.func.isRequired,
}

export default SelectorSecciones

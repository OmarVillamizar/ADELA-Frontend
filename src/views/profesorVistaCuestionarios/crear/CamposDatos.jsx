import React from 'react'
import PropTypes from 'prop-types'

const CAMPOS = [
  ['nombre', 'Nombre', 'Ej.: Cómo prefiero aprender'],
  ['siglas', 'Siglas', 'Ej.: CPA'],
  ['autor', 'Autor', 'Quién diseñó el instrumento'],
  ['version', 'Versión', 'Ej.: 1.0'],
]

/** Los datos que identifican el cuestionario. */
const CamposDatos = ({ meta, onChange }) => (
  <>
    <div className="adela-rejilla mb-3">
      {CAMPOS.map(([campo, texto, ejemplo]) => (
        <label key={campo} className="adela-campo">
          <span>{texto}</span>
          <input
            className="adela-input"
            value={meta[campo]}
            placeholder={ejemplo}
            onChange={(e) => onChange({ ...meta, [campo]: e.target.value })}
          />
        </label>
      ))}
    </div>
    <label className="adela-campo">
      <span>Descripción (la ven los estudiantes antes de responder)</span>
      <textarea
        className="adela-input"
        maxLength={1000}
        value={meta.descripcion}
        placeholder="Para qué sirve y cómo responderlo con sinceridad."
        onChange={(e) => onChange({ ...meta, descripcion: e.target.value })}
      />
    </label>
  </>
)

CamposDatos.propTypes = {
  meta: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default CamposDatos

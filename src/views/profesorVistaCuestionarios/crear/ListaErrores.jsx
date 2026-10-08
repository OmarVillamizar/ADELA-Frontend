import React from 'react'
import PropTypes from 'prop-types'

const SECCIONES = {
  datos: 'Datos',
  estilos: 'Estilos',
  preguntas: 'Preguntas',
  interpretacion: 'Lectura de resultados',
  servidor: 'Servidor',
}

/** Lo que falta para crear; cada línea lleva a su sección. */
const ListaErrores = ({ errores, onIr }) => {
  if (errores.length === 0) return null
  return (
    <ul className="adela-errores" role="alert">
      {errores.map((e, i) => (
        <li key={i}>
          <strong>{SECCIONES[e.seccion] ?? e.seccion}:</strong>{' '}
          {onIr ? (
            <button type="button" onClick={() => onIr(e.seccion)}>
              {e.mensaje}
            </button>
          ) : (
            e.mensaje
          )}
        </li>
      ))}
    </ul>
  )
}

ListaErrores.propTypes = {
  errores: PropTypes.arrayOf(
    PropTypes.shape({ seccion: PropTypes.string, mensaje: PropTypes.string }),
  ).isRequired,
  onIr: PropTypes.func,
}

export default ListaErrores

import React from 'react'
import PropTypes from 'prop-types'
import '../resultados/resultados.css'
import './controles.css'

/**
 * Ordenar las opciones de una pregunta asignando a cada una un número del 1
 * al K sin repetir. K es lo que más describe a quien responde (convención del
 * inventario de Kolb): el puntaje es rango × peso.
 *
 * Elegir un número que ya tiene otra opción los intercambia, así nunca hay
 * repetidos y basta con ir corrigiendo; pulsar el número elegido lo quita.
 */
const ControlJerarquia = ({ opciones, respuesta, onChange, idPregunta }) => {
  const k = opciones.length
  const rangos = Array.from({ length: k }, (_, i) => k - i)

  const asignar = (opcionId, rango) => {
    const actual = respuesta[opcionId]
    const siguiente = { ...respuesta }
    if (actual === rango) {
      delete siguiente[opcionId]
      onChange(siguiente)
      return
    }
    const otra = Object.keys(respuesta).find(
      (id) => respuesta[id] === rango && Number(id) !== opcionId,
    )
    if (otra !== undefined) {
      if (actual === undefined) delete siguiente[otra]
      else siguiente[otra] = actual
    }
    siguiente[opcionId] = rango
    onChange(siguiente)
  }

  return (
    <div className="adela-r adela-orden">
      <p className="adela-ayuda mt-0 mb-3">
        {k} = lo que más te describe · 1 = lo que menos. Usa cada número una
        vez.
      </p>
      {opciones.map((opcion) => {
        const etiqueta = `pregunta-${idPregunta}-opcion-${opcion.id}`
        return (
          <div key={opcion.id} className="adela-orden__fila">
            <span id={etiqueta} className="adela-orden__texto">
              {opcion.respuesta}
            </span>
            <div className="adela-seg" role="group" aria-labelledby={etiqueta}>
              {rangos.map((rango) => (
                <button
                  key={rango}
                  type="button"
                  className="adela-seg__op adela-orden__op"
                  aria-pressed={respuesta[opcion.id] === rango}
                  aria-label={`${rango} de ${k}`}
                  onClick={() => asignar(opcion.id, rango)}
                >
                  {rango}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

ControlJerarquia.propTypes = {
  opciones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      respuesta: PropTypes.string,
    }),
  ).isRequired,
  respuesta: PropTypes.objectOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
  idPregunta: PropTypes.number.isRequired,
}

export default ControlJerarquia

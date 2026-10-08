import React from 'react'
import PropTypes from 'prop-types'
import './resultados.css'

/** Texto de una opción elegida: el rango en jerarquía, los puntos en reparto. */
const textoRespuesta = (formato, { texto, cantidad }) => {
  if (formato === 'JERARQUIA') return `${cantidad} · ${texto}`
  if (formato === 'REPARTO')
    return `${texto} — ${cantidad} ${cantidad === 1 ? 'pt' : 'pts'}`
  return texto
}

/** Lo que la persona eligió en cada pregunta. */
const TablaRespuestas = ({ preguntas }) => (
  <div className="adela-tabla__scroll">
    <table className="adela-tabla">
      <thead>
        <tr>
          <th scope="col" className="num">
            #
          </th>
          <th scope="col">Pregunta</th>
          <th scope="col">Respuesta</th>
        </tr>
      </thead>
      <tbody>
        {[...preguntas]
          .sort((a, b) => a.orden - b.orden)
          .map((pregunta) => (
            <tr key={pregunta.orden}>
              <td className="num text-body-secondary">{pregunta.orden}</td>
              <td>{pregunta.pregunta}</td>
              <td>
                {pregunta.respuestas.length === 0 ? (
                  <span className="text-body-secondary">Sin responder</span>
                ) : (
                  <span className="fw-semibold">
                    {pregunta.respuestas
                      .map((r) => textoRespuesta(pregunta.formato, r))
                      .join(', ')}
                  </span>
                )}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
)

TablaRespuestas.propTypes = {
  preguntas: PropTypes.arrayOf(
    PropTypes.shape({
      pregunta: PropTypes.string,
      orden: PropTypes.number,
      formato: PropTypes.string,
      respuestas: PropTypes.arrayOf(
        PropTypes.shape({
          texto: PropTypes.string,
          cantidad: PropTypes.number,
        }),
      ),
    }),
  ).isRequired,
}

export default TablaRespuestas

import React from 'react'
import PropTypes from 'prop-types'

/**
 * Cuánto suma una opción a cada estilo simple. Puede sumar a varios (o a
 * ninguno: una opción neutra). El peso admite decimales y negativos.
 */
const EditorPesos = ({ pesos, estilos, onChange }) => {
  const cambiar = (i, cambios) =>
    onChange(pesos.map((w, k) => (k === i ? { ...w, ...cambios } : w)))
  const libres = estilos.filter((e) => !pesos.some((w) => w.estiloId === e.id))

  return (
    <div className="adela-fila">
      {pesos.length === 0 && (
        <span className="adela-falta">No suma puntos.</span>
      )}
      {pesos.map((w, i) => (
        <span key={i} className="adela-fila" style={{ gap: '0.3rem' }}>
          <select
            className="adela-input"
            style={{ width: 'auto' }}
            aria-label="Estilo"
            value={w.estiloId}
            onChange={(e) => cambiar(i, { estiloId: e.target.value })}
          >
            {estilos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre || 'Sin nombre'}
              </option>
            ))}
          </select>
          <input
            className="adela-input adela-input--num"
            type="number"
            step="any"
            aria-label="Peso"
            value={w.peso}
            onChange={(e) => cambiar(i, { peso: e.target.value })}
          />
          <button
            type="button"
            className="adela-btn adela-btn--sm"
            aria-label="Quitar peso"
            onClick={() => onChange(pesos.filter((_, k) => k !== i))}
          >
            ×
          </button>
        </span>
      ))}
      {libres.length > 0 && (
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          onClick={() =>
            onChange([...pesos, { estiloId: libres[0].id, peso: 1 }])
          }
        >
          + Estilo
        </button>
      )}
    </div>
  )
}

EditorPesos.propTypes = {
  pesos: PropTypes.arrayOf(
    PropTypes.shape({
      estiloId: PropTypes.string,
      peso: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  ).isRequired,
  estilos: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default EditorPesos

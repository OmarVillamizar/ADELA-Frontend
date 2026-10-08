import React from 'react'
import PropTypes from 'prop-types'
import EditorPesos from './EditorPesos'
import { FORMATO, nuevaOpcion } from '../borrador'

const FORMATOS = [
  [FORMATO.UNICA, 'Única respuesta'],
  [FORMATO.MULTIPLE, 'Varias respuestas'],
  [FORMATO.JERARQUIA, 'Ordenar (1 a K)'],
  [FORMATO.REPARTO, 'Repartir puntos'],
]

/** Una pregunta con todos sus parámetros y los pesos de cada opción. */
const EditorPregunta = ({
  pregunta,
  numero,
  total,
  estilos,
  onChange,
  onQuitar,
  onMover,
  onDuplicar,
  marcada,
}) => {
  const p = pregunta
  const cambiarOpcion = (id, cambios) =>
    onChange({
      opciones: p.opciones.map((o) => (o.id === id ? { ...o, ...cambios } : o)),
    })

  const cambiarFormato = (formato) =>
    onChange({
      formato,
      obligatoria: formato !== FORMATO.MULTIPLE,
      puntosRepartir:
        formato === FORMATO.REPARTO ? p.puntosRepartir || 10 : p.puntosRepartir,
    })

  return (
    <div className={`adela-item ${marcada ? 'adela-item--error' : ''}`}>
      <div className="adela-item__cabeza">
        <span className="adela-item__num">{numero}</span>
        <input
          className="adela-input adela-crece"
          aria-label={`Enunciado de la pregunta ${numero}`}
          placeholder="Enunciado"
          value={p.texto}
          onChange={(e) => onChange({ texto: e.target.value })}
        />
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          aria-label="Subir"
          disabled={numero === 1}
          onClick={() => onMover(-1)}
        >
          ↑
        </button>
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          aria-label="Bajar"
          disabled={numero === total}
          onClick={() => onMover(1)}
        >
          ↓
        </button>
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          onClick={onDuplicar}
        >
          Duplicar
        </button>
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          aria-label={`Quitar la pregunta ${numero}`}
          onClick={onQuitar}
        >
          ×
        </button>
      </div>

      <div className="adela-fila mb-2">
        <select
          className="adela-input"
          style={{ width: 'auto' }}
          aria-label="Formato"
          value={p.formato}
          onChange={(e) => cambiarFormato(e.target.value)}
        >
          {FORMATOS.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
        <label className="adela-fila" style={{ gap: '0.35rem' }}>
          <input
            type="checkbox"
            checked={p.obligatoria}
            onChange={(e) => onChange({ obligatoria: e.target.checked })}
          />
          Obligatoria
        </label>
        {p.formato === FORMATO.MULTIPLE && (
          <>
            <label className="adela-fila" style={{ gap: '0.35rem' }}>
              Mínimo
              <input
                className="adela-input adela-input--num"
                type="number"
                min={0}
                value={p.minSelecciones}
                onChange={(e) => onChange({ minSelecciones: e.target.value })}
              />
            </label>
            <label className="adela-fila" style={{ gap: '0.35rem' }}>
              Máximo
              <input
                className="adela-input adela-input--num"
                type="number"
                min={1}
                placeholder="Todas"
                value={p.maxSelecciones}
                onChange={(e) => onChange({ maxSelecciones: e.target.value })}
              />
            </label>
          </>
        )}
        {p.formato === FORMATO.REPARTO && (
          <label className="adela-fila" style={{ gap: '0.35rem' }}>
            Puntos
            <input
              className="adela-input adela-input--num"
              type="number"
              min={1}
              value={p.puntosRepartir}
              onChange={(e) => onChange({ puntosRepartir: e.target.value })}
            />
          </label>
        )}
      </div>

      <div className="adela-sub">
        {p.opciones.map((o, j) => (
          <div key={o.id}>
            <div className="adela-fila">
              <input
                className="adela-input adela-crece"
                aria-label={`Opción ${j + 1}`}
                placeholder={`Opción ${j + 1}`}
                value={o.texto}
                onChange={(e) => cambiarOpcion(o.id, { texto: e.target.value })}
              />
              <button
                type="button"
                className="adela-btn adela-btn--sm"
                aria-label={`Quitar la opción ${j + 1}`}
                onClick={() =>
                  onChange({
                    opciones: p.opciones.filter((x) => x.id !== o.id),
                  })
                }
              >
                ×
              </button>
            </div>
            <div className="mt-1">
              <EditorPesos
                pesos={o.pesos}
                estilos={estilos}
                onChange={(pesos) => cambiarOpcion(o.id, { pesos })}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          onClick={() =>
            onChange({
              opciones: [...p.opciones, nuevaOpcion('', estilos[0]?.id)],
            })
          }
        >
          + Opción
        </button>
      </div>
    </div>
  )
}

EditorPregunta.propTypes = {
  pregunta: PropTypes.object.isRequired,
  numero: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  estilos: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onQuitar: PropTypes.func.isRequired,
  onMover: PropTypes.func.isRequired,
  onDuplicar: PropTypes.func.isRequired,
  marcada: PropTypes.bool,
}

export default EditorPregunta

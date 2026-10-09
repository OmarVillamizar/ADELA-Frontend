import React from 'react'
import PropTypes from 'prop-types'
import { nuevaOpcionComplementaria, plantillaComplementaria } from './borrador'
import './crear.css'

const Campo = ({ etiqueta, valor, onChange, max, largo = false, ayuda }) => (
  <label className="adela-campo mb-2">
    <span>{etiqueta}</span>
    {largo ? (
      <textarea
        className="adela-input"
        rows={2}
        maxLength={max}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <input
        className="adela-input"
        maxLength={max}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
    {ayuda && <small className="adela-ayuda mt-0">{ayuda}</small>}
  </label>
)

Campo.propTypes = {
  etiqueta: PropTypes.string.isRequired,
  valor: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number.isRequired,
  largo: PropTypes.bool,
  ayuda: PropTypes.string,
}

/**
 * Pregunta complementaria: se hace cuando el perfil destaca todos los estilos,
 * para que la persona declare cómo los usa. Activarla parte de una plantilla
 * que se puede reescribir entera; las opciones van de 2 en adelante. La usan
 * el asistente y el editor de interpretación.
 */
const EditorComplementaria = ({ valor, onChange }) => {
  const activa = Boolean(valor)
  const cambiar = (cambios) => onChange({ ...valor, ...cambios })
  const cambiarOpcion = (id, cambios) =>
    cambiar({
      opciones: valor.opciones.map((o) =>
        o.id === id ? { ...o, ...cambios } : o,
      ),
    })

  return (
    <div className="adela-item mb-3">
      <label className="d-flex gap-2">
        <input
          type="checkbox"
          className="form-check-input flex-shrink-0"
          checked={activa}
          onChange={(e) =>
            onChange(e.target.checked ? plantillaComplementaria() : null)
          }
        />
        <span>
          <strong className="d-block">Pregunta extra si destacan todos</strong>
          <span className="adela-ayuda d-block mt-0">
            Opcional. Si el resultado destaca todos los estilos por igual, el
            puntaje ya no distingue a la persona: se le hace una pregunta más
            para que diga cómo los usa. Se responde una vez y no cambia el
            perfil calculado.
          </span>
        </span>
      </label>

      {activa && (
        <div className="mt-3">
          <Campo
            etiqueta="Título"
            valor={valor.titulo}
            max={150}
            onChange={(titulo) => cambiar({ titulo })}
          />
          <Campo
            etiqueta="Introducción (opcional)"
            valor={valor.introduccion}
            max={500}
            largo
            onChange={(introduccion) => cambiar({ introduccion })}
          />
          <Campo
            etiqueta="Pregunta"
            valor={valor.enunciado}
            max={500}
            largo
            onChange={(enunciado) => cambiar({ enunciado })}
          />
          <Campo
            etiqueta="Nota al pie (opcional)"
            valor={valor.nota}
            max={300}
            onChange={(nota) => cambiar({ nota })}
          />

          <div className="adela-item__cabeza mt-3">
            <strong className="adela-crece">Opciones</strong>
            <button
              type="button"
              className="adela-btn adela-btn--sm"
              onClick={() =>
                cambiar({
                  opciones: [...valor.opciones, nuevaOpcionComplementaria()],
                })
              }
            >
              + Opción
            </button>
          </div>
          {valor.opciones.map((o, i) => (
            <div key={o.id} className="adela-item">
              <div className="adela-item__cabeza">
                <strong className="adela-crece">
                  {String.fromCharCode(65 + (i % 26))}.
                </strong>
                <button
                  type="button"
                  className="adela-btn adela-btn--sm"
                  aria-label={`Quitar opción ${i + 1}`}
                  disabled={valor.opciones.length <= 2}
                  title={
                    valor.opciones.length <= 2
                      ? 'Se necesitan al menos 2 opciones'
                      : undefined
                  }
                  onClick={() =>
                    cambiar({
                      opciones: valor.opciones.filter((x) => x.id !== o.id),
                    })
                  }
                >
                  ×
                </button>
              </div>
              <Campo
                etiqueta="Texto de la opción"
                valor={o.texto}
                max={200}
                onChange={(texto) => cambiarOpcion(o.id, { texto })}
              />
              <Campo
                etiqueta="Explicación (opcional)"
                valor={o.descripcion}
                max={1000}
                largo
                onChange={(descripcion) => cambiarOpcion(o.id, { descripcion })}
              />
              <Campo
                etiqueta="Resultado que se muestra"
                valor={o.resultado}
                max={100}
                ayuda="Nombre que aparece en el reporte de quien la elige."
                onChange={(resultado) => cambiarOpcion(o.id, { resultado })}
              />
              <Campo
                etiqueta="Descripción del resultado (opcional)"
                valor={o.resultadoDescripcion}
                max={1000}
                largo
                onChange={(resultadoDescripcion) =>
                  cambiarOpcion(o.id, { resultadoDescripcion })
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

EditorComplementaria.propTypes = {
  valor: PropTypes.shape({
    titulo: PropTypes.string,
    introduccion: PropTypes.string,
    enunciado: PropTypes.string,
    nota: PropTypes.string,
    opciones: PropTypes.array,
  }),
  onChange: PropTypes.func.isRequired,
}

export default EditorComplementaria

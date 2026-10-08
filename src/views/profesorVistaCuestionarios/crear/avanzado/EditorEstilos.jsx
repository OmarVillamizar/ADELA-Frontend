import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  TIPO,
  actualizarEstilo,
  agregarEstilo,
  primarios,
  quitarEstilo,
} from '../borrador'

/**
 * Estilos simples (los que suman puntos) y compuestos (combinación lineal de
 * simples, p. ej. un polo "A − B"). Un compuesto no tiene opciones propias.
 */
const EditorEstilos = ({ borrador, actualizar, marcados }) => {
  const [nombre, setNombre] = useState('')
  const prim = primarios(borrador)

  const agregar = (tipo) => {
    if (!nombre.trim()) return
    actualizar((b) => agregarEstilo(b, nombre, tipo))
    setNombre('')
  }

  const cambiarCoef = (estilo, i, cambios) =>
    actualizar((b) =>
      actualizarEstilo(b, estilo.id, {
        coeficientes: estilo.coeficientes.map((c, k) =>
          k === i ? { ...c, ...cambios } : c,
        ),
      }),
    )

  return (
    <>
      <div className="adela-fila mb-3">
        <input
          className="adela-input adela-crece"
          placeholder="Nombre del estilo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              agregar(TIPO.PRIMARIO)
            }
          }}
        />
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          onClick={() => agregar(TIPO.PRIMARIO)}
        >
          + Simple
        </button>
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          disabled={prim.length < 1}
          onClick={() => agregar(TIPO.COMPUESTO)}
        >
          + Compuesto
        </button>
      </div>

      {borrador.estilos.length === 0 && (
        <p className="adela-falta">Todavía no hay estilos.</p>
      )}
      {borrador.estilos.map((e) => (
        <div
          key={e.id}
          className={`adela-item ${marcados.has(e.id) ? 'adela-item--error' : ''}`}
        >
          <div className="adela-fila">
            <span className="adela-chip">
              {e.tipo === TIPO.PRIMARIO ? 'Simple' : 'Compuesto'}
            </span>
            <input
              className="adela-input adela-crece"
              aria-label="Nombre del estilo"
              value={e.nombre}
              onChange={(ev) =>
                actualizar((b) =>
                  actualizarEstilo(b, e.id, { nombre: ev.target.value }),
                )
              }
            />
            <button
              type="button"
              className="adela-btn adela-btn--sm"
              aria-label={`Quitar ${e.nombre}`}
              onClick={() => actualizar((b) => quitarEstilo(b, e.id))}
            >
              ×
            </button>
          </div>
          {e.tipo === TIPO.COMPUESTO && (
            <div className="adela-sub">
              <p className="adela-ayuda mt-0">
                Puntaje = suma de (coeficiente × puntaje del estilo). Para un
                polo A − B usa +1 y −1.
              </p>
              {e.coeficientes.map((c, i) => (
                <div key={i} className="adela-fila">
                  <select
                    className="adela-input adela-crece"
                    aria-label="Estilo simple"
                    value={c.estiloId}
                    onChange={(ev) =>
                      cambiarCoef(e, i, { estiloId: ev.target.value })
                    }
                  >
                    {prim.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    className="adela-input adela-input--num"
                    type="number"
                    step="any"
                    aria-label="Coeficiente"
                    value={c.coeficiente}
                    onChange={(ev) =>
                      cambiarCoef(e, i, { coeficiente: ev.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="adela-btn adela-btn--sm"
                    aria-label="Quitar coeficiente"
                    onClick={() =>
                      actualizar((b) =>
                        actualizarEstilo(b, e.id, {
                          coeficientes: e.coeficientes.filter(
                            (_, k) => k !== i,
                          ),
                        }),
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="adela-fila">
                <button
                  type="button"
                  className="adela-btn adela-btn--sm"
                  disabled={prim.length === 0}
                  onClick={() =>
                    actualizar((b) =>
                      actualizarEstilo(b, e.id, {
                        coeficientes: [
                          ...e.coeficientes,
                          { estiloId: prim[0].id, coeficiente: 1 },
                        ],
                      }),
                    )
                  }
                >
                  + Estilo
                </button>
                {prim.length >= 2 && (
                  <button
                    type="button"
                    className="adela-btn adela-btn--sm"
                    onClick={() =>
                      actualizar((b) =>
                        actualizarEstilo(b, e.id, {
                          coeficientes: [
                            { estiloId: prim[0].id, coeficiente: 1 },
                            { estiloId: prim[1].id, coeficiente: -1 },
                          ],
                        }),
                      )
                    }
                  >
                    Atajo A − B
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  )
}

EditorEstilos.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
  marcados: PropTypes.instanceOf(Set).isRequired,
}

export default EditorEstilos

import React from 'react'
import PropTypes from 'prop-types'
import Segmentado from '../../../components/resultados/Segmentado'
import { ESCALA, ESQUEMA } from './borrador'
import './crear.css'

const ESQUEMAS = [
  { valor: ESQUEMA.NINGUNA, etiqueta: 'Solo puntajes' },
  { valor: ESQUEMA.BAREMO, etiqueta: 'Niveles por tabla' },
  { valor: ESQUEMA.RELATIVO, etiqueta: 'Predominante' },
  { valor: ESQUEMA.RELATIVO_ESCALONADO, etiqueta: 'Perfil escalonado' },
]

const AYUDA = {
  NINGUNA:
    'Se muestran el puntaje y el % del máximo de cada estilo, sin destacar ninguno.',
  BAREMO:
    'Cada estilo muestra el nivel cuyo rango contiene su puntaje. Los niveles se aplican con cualquier esquema; este no destaca un estilo predominante.',
  RELATIVO:
    'Predominan los estilos cuyo % del máximo queda a menos del margen del más alto.',
  RELATIVO_ESCALONADO:
    'Se ordenan los estilos por puntaje y se suman al perfil mientras la distancia con el anterior no supere la del escalón que corresponde al total.',
}

const nuevoId = () => Math.random().toString(36).slice(2, 10)

const TERCIOS = [
  [0, 33.3, 'Bajo'],
  [33.3, 66.7, 'Medio'],
  [66.7, 100, 'Alto'],
]

/**
 * Cómo se leen los resultados: esquema, margen de empate, niveles por estilo
 * y tabla de escalones. Lo usan el modo avanzado de creación y el editor de un
 * cuestionario existente; trabaja con ids de estilo locales.
 */
const EditorInterpretacion = ({ estilos, valor, onChange, marcados }) => {
  const cambiar = (cambios) => onChange({ ...valor, ...cambios })
  const bandas = valor.bandas

  const cambiarBanda = (id, cambios) =>
    cambiar({
      bandas: bandas.map((x) => (x.id === id ? { ...x, ...cambios } : x)),
    })
  const quitarBanda = (id) =>
    cambiar({ bandas: bandas.filter((x) => x.id !== id) })
  const moverBanda = (id, paso) => {
    const i = bandas.findIndex((x) => x.id === id)
    const mismos = bandas
      .map((x, k) => ({ x, k }))
      .filter(({ x }) => x.estiloId === bandas[i].estiloId)
    const pos = mismos.findIndex(({ k }) => k === i)
    const otro = mismos[pos + paso]
    if (!otro) return
    const copia = [...bandas]
    ;[copia[i], copia[otro.k]] = [copia[otro.k], copia[i]]
    cambiar({ bandas: copia })
  }
  const agregarBanda = (estiloId) =>
    cambiar({
      bandas: [
        ...bandas,
        {
          id: nuevoId(),
          estiloId,
          escala: ESCALA.POMP,
          li: '',
          ls: '',
          etiqueta: '',
        },
      ],
    })
  const tresNiveles = (estiloId) =>
    cambiar({
      bandas: [
        ...bandas.filter((x) => x.estiloId !== estiloId),
        ...TERCIOS.map(([li, ls, etiqueta]) => ({
          id: nuevoId(),
          estiloId,
          escala: ESCALA.POMP,
          li,
          ls,
          etiqueta,
        })),
      ],
    })

  const escalones = valor.escalones
  const cambiarEscalon = (i, cambios) =>
    cambiar({
      escalones: escalones.map((s, k) => (k === i ? { ...s, ...cambios } : s)),
    })

  return (
    <div className="adela-r">
      <div className="adela-campo mb-2">
        <span>Esquema</span>
        <Segmentado
          etiqueta="Esquema de interpretación"
          opciones={ESQUEMAS}
          valor={valor.esquema}
          onChange={(esquema) => cambiar({ esquema })}
        />
      </div>
      <p className="adela-ayuda mt-0 mb-3">{AYUDA[valor.esquema]}</p>

      {valor.esquema === ESQUEMA.RELATIVO && (
        <label className="adela-campo mb-3" style={{ maxWidth: '16rem' }}>
          <span>Margen de empate (puntos de %)</span>
          <input
            className="adela-input adela-input--num"
            type="number"
            min={0}
            max={100}
            value={valor.delta}
            onChange={(e) => cambiar({ delta: e.target.value })}
          />
        </label>
      )}

      {valor.esquema === ESQUEMA.RELATIVO_ESCALONADO && (
        <div className="adela-item mb-3">
          <div className="adela-item__cabeza">
            <strong className="adela-crece">Escalones</strong>
            <button
              type="button"
              className="adela-btn adela-btn--sm"
              onClick={() =>
                cambiar({
                  escalones: [
                    ...escalones,
                    { totalMin: '', totalMax: '', distancia: '' },
                  ],
                })
              }
            >
              + Escalón
            </button>
          </div>
          <p className="adela-ayuda mt-0 mb-2">
            Según la suma de todos los puntajes, cuánta distancia se tolera
            entre un estilo y el siguiente para seguir en el perfil.
          </p>
          {escalones.map((s, i) => (
            <div key={i} className="adela-fila mb-2">
              {[
                ['totalMin', 'Total desde'],
                ['totalMax', 'Total hasta'],
                ['distancia', 'Distancia'],
              ].map(([campo, texto]) => (
                <label key={campo} className="adela-campo">
                  <span>{texto}</span>
                  <input
                    className="adela-input adela-input--num"
                    type="number"
                    value={s[campo]}
                    onChange={(e) =>
                      cambiarEscalon(i, { [campo]: e.target.value })
                    }
                  />
                </label>
              ))}
              <button
                type="button"
                className="adela-btn adela-btn--sm align-self-end"
                aria-label="Quitar escalón"
                onClick={() =>
                  cambiar({ escalones: escalones.filter((_, k) => k !== i) })
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <strong className="d-block mb-1">Niveles por estilo</strong>
      <p className="adela-ayuda mt-0 mb-2">
        Opcionales. Por % del máximo (0 a 100) o por puntaje directo. Si dos
        niveles comparten un límite, gana el primero.
      </p>
      {estilos.map((e) => {
        const propias = bandas.filter((x) => x.estiloId === e.id)
        return (
          <div key={e.id} className="adela-item">
            <div className="adela-item__cabeza">
              <strong className="adela-crece">
                {e.nombre || 'Sin nombre'}
              </strong>
              <button
                type="button"
                className="adela-btn adela-btn--sm"
                onClick={() => tresNiveles(e.id)}
              >
                Bajo · Medio · Alto
              </button>
              <button
                type="button"
                className="adela-btn adela-btn--sm"
                onClick={() => agregarBanda(e.id)}
              >
                + Nivel
              </button>
            </div>
            {propias.length === 0 && (
              <p className="adela-falta">Sin niveles.</p>
            )}
            {propias.map((x, k) => (
              <div
                key={x.id}
                className={`adela-fila mb-2 ${marcados?.has(x.id) ? 'adela-item--error' : ''}`}
              >
                <select
                  className="adela-input"
                  style={{ width: 'auto' }}
                  aria-label="Escala"
                  value={x.escala}
                  onChange={(ev) =>
                    cambiarBanda(x.id, { escala: ev.target.value })
                  }
                >
                  <option value={ESCALA.POMP}>% del máximo</option>
                  <option value={ESCALA.BRUTO}>Puntaje</option>
                </select>
                <input
                  className="adela-input adela-input--num"
                  type="number"
                  aria-label="Desde"
                  placeholder="Desde"
                  value={x.li}
                  onChange={(ev) => cambiarBanda(x.id, { li: ev.target.value })}
                />
                <input
                  className="adela-input adela-input--num"
                  type="number"
                  aria-label="Hasta"
                  placeholder="Hasta"
                  value={x.ls}
                  onChange={(ev) => cambiarBanda(x.id, { ls: ev.target.value })}
                />
                <input
                  className="adela-input adela-crece"
                  aria-label="Nombre del nivel"
                  placeholder="Nombre del nivel (p. ej. Alto)"
                  maxLength={60}
                  value={x.etiqueta}
                  onChange={(ev) =>
                    cambiarBanda(x.id, { etiqueta: ev.target.value })
                  }
                />
                <button
                  type="button"
                  className="adela-btn adela-btn--sm"
                  aria-label="Subir nivel"
                  disabled={k === 0}
                  onClick={() => moverBanda(x.id, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="adela-btn adela-btn--sm"
                  aria-label="Bajar nivel"
                  disabled={k === propias.length - 1}
                  onClick={() => moverBanda(x.id, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="adela-btn adela-btn--sm"
                  aria-label="Quitar nivel"
                  onClick={() => quitarBanda(x.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

EditorInterpretacion.propTypes = {
  estilos: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, nombre: PropTypes.string }),
  ).isRequired,
  valor: PropTypes.shape({
    esquema: PropTypes.string,
    delta: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    bandas: PropTypes.array,
    escalones: PropTypes.array,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  marcados: PropTypes.instanceOf(Set),
}

export default EditorInterpretacion

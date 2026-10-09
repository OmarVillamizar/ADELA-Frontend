import React from 'react'
import PropTypes from 'prop-types'
import Segmentado from '../../../components/resultados/Segmentado'
import {
  ESCALA,
  ESQUEMA,
  ESQUINAS,
  TIPO,
  esquinasDe,
  ladosDe,
  planoVacio,
  polosNombres,
  sugerirEsquinas,
} from './borrador'
import './crear.css'

const ESQUEMAS = [
  { valor: ESQUEMA.NINGUNA, etiqueta: 'Solo puntajes' },
  { valor: ESQUEMA.BAREMO, etiqueta: 'Niveles por tabla' },
  { valor: ESQUEMA.RELATIVO, etiqueta: 'Predominante' },
  { valor: ESQUEMA.RELATIVO_ESCALONADO, etiqueta: 'Perfil escalonado' },
  { valor: ESQUEMA.CUADRANTES, etiqueta: 'Cuadrantes' },
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
  CUADRANTES:
    'Se cruzan dos ejes y cada estudiante recibe el estilo de la esquina donde cae. Un puntaje igual al corte cuenta como lado bajo.',
}

/** Polos (nombres) del eje elegido: los de un compuesto o "alto"/"bajo". */
const polosEje = (estilos, id) => {
  const e = estilos.find((x) => x.id === id)
  return e ? polosNombres({ estilos }, e) : null
}

/**
 * Mapa de cuatro estilos: eje horizontal y vertical, un corte para cada uno y
 * el nombre de las cuatro esquinas. Los compuestos van primero y se muestran
 * como "A − B": el signo importa, porque lo alto del eje es hacia A.
 */
const EditorPlano = ({ estilos, plano, onChange, marcados }) => {
  const ordenados = [
    ...estilos.filter((e) => e.tipo === TIPO.COMPUESTO),
    ...estilos.filter((e) => e.tipo !== TIPO.COMPUESTO),
  ]
  const sugerencias = (p) => {
    const x = polosEje(estilos, p.ejeX)
    const y = polosEje(estilos, p.ejeY)
    return x && y ? sugerirEsquinas(x, y) : null
  }
  const marca = (k) => (marcados?.has(`plano.${k}`) ? 'adela-item--error' : '')

  const cambiarEje = (campo, id) => {
    const nuevo = { ...plano, [campo]: id }
    const antes = sugerencias(plano)
    const despues = sugerencias(nuevo)
    // Solo se reemplazan los nombres que el usuario no ha tocado.
    if (despues)
      ESQUINAS.forEach(([k]) => {
        if (!plano[k] || plano[k] === antes?.[k]) nuevo[k] = despues[k]
      })
    onChange(nuevo)
  }
  const cambiar = (cambios) => onChange({ ...plano, ...cambios })

  const lados = ladosDe(
    plano,
    polosEje(estilos, plano.ejeX) ?? {
      a: 'Horizontal alto',
      b: 'Horizontal bajo',
    },
    polosEje(estilos, plano.ejeY) ?? { a: 'Vertical alto', b: 'Vertical bajo' },
  )
  const selectorEje = (campo, texto) => (
    <label className="adela-campo adela-crece">
      <span>{texto}</span>
      <select
        className={`adela-input ${marca(campo)}`}
        value={plano[campo]}
        onChange={(e) => cambiarEje(campo, e.target.value)}
      >
        <option value="">Elegir…</option>
        {ordenados.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nombre || 'Sin nombre'}
          </option>
        ))}
      </select>
    </label>
  )
  const esquina = ([k, lugar]) => (
    <input
      key={k}
      className={`adela-input ${marca(k)}`}
      aria-label={`Nombre de la esquina ${lugar}`}
      placeholder="Nombre del estilo"
      maxLength={60}
      value={plano[k]}
      onChange={(e) => cambiar({ [k]: e.target.value })}
    />
  )
  const [arribaIzq, arribaDer, abajoIzq, abajoDer] = esquinasDe(plano)

  return (
    <div className="adela-item mb-3">
      <div className="adela-item__cabeza">
        <strong className="adela-crece">Mapa de cuatro estilos</strong>
      </div>
      <div className="adela-fila mb-2">
        {selectorEje('ejeX', 'Eje horizontal')}
        {selectorEje('ejeY', 'Eje vertical')}
      </div>
      <p className="adela-ayuda mt-0 mb-3">
        El lado alto de cada eje es hacia el primer polo de &quot;A − B&quot;.
        Invertir el orden invierte el eje. Las casillas de invertir solo cambian
        el dibujo: cada esquina conserva su nombre.
      </p>
      <div className="adela-fila mb-3">
        {[
          ['corteX', 'Corte horizontal'],
          ['corteY', 'Corte vertical'],
        ].map(([k, texto]) => (
          <label key={k} className="adela-campo">
            <span>{texto}</span>
            <input
              className={`adela-input adela-input--num ${marca(k)}`}
              type="number"
              value={plano[k]}
              onChange={(e) => cambiar({ [k]: e.target.value })}
            />
          </label>
        ))}
        {[
          ['invertirX', 'Invertir horizontal'],
          ['invertirY', 'Invertir vertical'],
        ].map(([k, texto]) => (
          <label key={k} className="adela-fila" style={{ gap: '0.35rem' }}>
            <input
              type="checkbox"
              checked={Boolean(plano[k])}
              onChange={(e) => cambiar({ [k]: e.target.checked })}
            />
            {texto}
          </label>
        ))}
      </div>
      <div className="adela-cruz">
        <span className="adela-cruz__polo adela-cruz__polo--arriba">
          ↑ {lados.arriba}
        </span>
        <span className="adela-cruz__polo adela-cruz__polo--izq">
          ← {lados.izq}
        </span>
        {esquina(arribaIzq)}
        {esquina(arribaDer)}
        <span className="adela-cruz__polo adela-cruz__polo--der">
          {lados.der} →
        </span>
        {esquina(abajoIzq)}
        {esquina(abajoDer)}
        <span className="adela-cruz__polo adela-cruz__polo--abajo">
          ↓ {lados.abajo}
        </span>
      </div>
    </div>
  )
}

EditorPlano.propTypes = {
  estilos: PropTypes.array.isRequired,
  plano: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  marcados: PropTypes.instanceOf(Set),
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

  // Al elegir "Cuadrantes": los dos primeros compuestos, con nombres sugeridos.
  const planoInicial = () => {
    const [x, y] = estilos.filter((e) => e.tipo === TIPO.COMPUESTO)
    if (!x || !y) return planoVacio()
    return {
      ...planoVacio(x.id, y.id),
      ...sugerirEsquinas(polosEje(estilos, x.id), polosEje(estilos, y.id)),
    }
  }

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
          onChange={(esquema) =>
            cambiar(
              esquema === ESQUEMA.CUADRANTES && !valor.plano
                ? { esquema, plano: planoInicial() }
                : { esquema },
            )
          }
        />
      </div>
      <p className="adela-ayuda mt-0 mb-3">{AYUDA[valor.esquema]}</p>

      {valor.esquema === ESQUEMA.CUADRANTES && (
        <EditorPlano
          estilos={estilos}
          plano={valor.plano ?? planoVacio()}
          marcados={marcados}
          onChange={(plano) => cambiar({ plano })}
        />
      )}

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
          <label className="d-flex gap-2 mt-3">
            <input
              type="checkbox"
              className="form-check-input flex-shrink-0"
              checked={Boolean(valor.preguntaPreferencia)}
              onChange={(e) =>
                cambiar({ preguntaPreferencia: e.target.checked })
              }
            />
            <span>
              <strong className="d-block">
                Preguntar la preferencia multimodal
              </strong>
              <span className="adela-ayuda d-block mt-0">
                Opcional. Si el perfil reúne todos los estilos, se pregunta una
                vez si la persona los usa según la situación (selectivo) o
                combinándolos (integrativo). Es autodeclarada y no cambia el
                perfil calculado.
              </span>
            </span>
          </label>
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
    preguntaPreferencia: PropTypes.bool,
    plano: PropTypes.object,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  marcados: PropTypes.instanceOf(Set),
}

export default EditorInterpretacion

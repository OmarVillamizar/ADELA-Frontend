import React from 'react'
import PropTypes from 'prop-types'
import Segmentado from '../../../../components/resultados/Segmentado'
import {
  CORTE,
  CORTES_REFERENCIA,
  editarPlano,
  elegirCorte,
  esquinasDe,
  intercambiarEjes,
  ladosDe,
  planoAsistenteDe,
  polosNombres,
} from '../borrador'

const OPCIONES_CORTE = [
  { valor: CORTE.EQUILIBRIO, etiqueta: 'En el equilibrio (0)' },
  { valor: CORTE.REFERENCIA, etiqueta: 'Cortes de referencia' },
  { valor: CORTE.PERSONALIZADO, etiqueta: 'Personalizado' },
]

/**
 * Paso Lectura, mapa de cuatro estilos: con los dos pares opuestos en
 * horizontal y vertical, el estudiante recibe el estilo de la esquina donde
 * cae. Aquí se nombran las esquinas y se decide dónde cortar cada eje.
 */
const PlanoAsistente = ({ borrador, actualizar }) => {
  const { corte, plano } = planoAsistenteDe(borrador)
  const estilo = (id) => borrador.estilos.find((e) => e.id === id)
  const x = estilo(plano.ejeX)
  const y = estilo(plano.ejeY)
  if (!x || !y) return null
  const lados = ladosDe(
    plano,
    polosNombres(borrador, x),
    polosNombres(borrador, y),
  )
  const [arribaIzq, arribaDer, abajoIzq, abajoDer] = esquinasDe(plano)
  const esquina = ([k, lugar]) => (
    <input
      key={k}
      className="adela-input"
      aria-label={`Nombre de la esquina ${lugar}`}
      placeholder="Nombre del estilo"
      maxLength={60}
      value={plano[k]}
      onChange={(e) =>
        actualizar((b) => editarPlano(b, { [k]: e.target.value }))
      }
    />
  )

  return (
    <div className="adela-item mt-4">
      <div className="adela-item__cabeza">
        <strong className="adela-crece">Mapa de cuatro estilos</strong>
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          onClick={() => actualizar(intercambiarEjes)}
        >
          Intercambiar ejes
        </button>
      </div>
      <p className="adela-ayuda mt-0 mb-3">
        Horizontal: {x.nombre}. Vertical: {y.nombre}. Escribe cómo se llama el
        estilo de cada esquina; las sugerencias salen de los polos.
      </p>
      <div className="adela-cruz mb-3">
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
      <div className="adela-fila mb-3" style={{ gap: '1rem' }}>
        {[
          ['invertirX', 'Invertir horizontal'],
          ['invertirY', 'Invertir vertical'],
        ].map(([k, texto]) => (
          <label key={k} className="adela-fila" style={{ gap: '0.35rem' }}>
            <input
              type="checkbox"
              checked={Boolean(plano[k])}
              onChange={(e) =>
                actualizar((b) => editarPlano(b, { [k]: e.target.checked }))
              }
            />
            {texto}
          </label>
        ))}
      </div>

      <div className="adela-campo mb-2">
        <span>¿Dónde cortar?</span>
        <Segmentado
          etiqueta="Dónde cortar cada eje"
          opciones={OPCIONES_CORTE}
          valor={corte}
          onChange={(c) => actualizar((b) => elegirCorte(b, c))}
        />
      </div>
      {corte === CORTE.PERSONALIZADO && (
        <div className="adela-fila mb-2">
          {[
            ['corteX', 'Corte horizontal'],
            ['corteY', 'Corte vertical'],
          ].map(([k, texto]) => (
            <label key={k} className="adela-campo">
              <span>{texto}</span>
              <input
                className="adela-input adela-input--num"
                type="number"
                value={plano[k]}
                onChange={(e) =>
                  actualizar((b) => editarPlano(b, { [k]: e.target.value }))
                }
              />
            </label>
          ))}
        </div>
      )}
      <p className="adela-ayuda mt-0 mb-0">
        {corte === CORTE.EQUILIBRIO &&
          'Se separa a quien prefiere un polo de quien prefiere el otro. Un puntaje exactamente en 0 cuenta como lado bajo.'}
        {corte === CORTE.REFERENCIA &&
          `Cortes de referencia del inventario de ciclo de aprendizaje 3.1: horizontal +${CORTES_REFERENCIA.x}, vertical +${CORTES_REFERENCIA.y}. Ubican al estudiante respecto de una población (son la mediana). Solo valen si el cuestionario reproduce la puntuación original: 12 preguntas de ordenar con 4 opciones y los ejes en la orientación «hacer − observar» y «pensar − sentir».`}
        {corte === CORTE.PERSONALIZADO &&
          'Un puntaje igual al corte cuenta como lado bajo; el lado alto empieza por encima.'}
      </p>
    </div>
  )
}

PlanoAsistente.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
}

export default PlanoAsistente

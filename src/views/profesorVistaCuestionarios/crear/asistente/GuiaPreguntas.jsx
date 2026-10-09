import React from 'react'
import PropTypes from 'prop-types'
import {
  PLANTILLA,
  agregarPregunta,
  compuestos,
  estiloDeAfirmacion,
  nombreDe,
  nuevaOpcion,
  nuevaPregunta,
  polosDe,
  preguntaDePlantilla,
  primarios,
} from '../borrador'
import { modeloDe, totalSugerido } from './modelos'

/**
 * Agrega una pregunta. Si la última está en blanco (la que el asistente deja
 * lista al entrar), la reemplaza en vez de dejarla vacía detrás.
 */
const insertar = (b, p) => {
  const ultima = b.preguntas.at(-1)
  const enBlanco =
    ultima &&
    !ultima.texto.trim() &&
    (b.plantilla === PLANTILLA.AFIRMACIONES ||
      ultima.opciones.every((o) => !o.texto.trim()))
  return agregarPregunta(
    enBlanco ? { ...b, preguntas: b.preguntas.slice(0, -1) } : b,
    p,
  )
}

/** Preguntas de un par: las que tienen una opción a cada polo. */
const esDelPar = (p, par) => {
  const { a, b } = polosDe(par)
  const ids = p.opciones.map((o) => o.pesos[0]?.estiloId)
  return ids.includes(a) && ids.includes(b)
}

const Avance = ({ hechas, meta }) => {
  const completo = meta > 0 && hechas >= meta
  return (
    <>
      <span className="adela-guia__cuenta" data-completo={completo}>
        {hechas}
        {meta > 0 && ` de ~${meta}`}
      </span>
      {meta > 0 && (
        <div className="adela-guia__barra" aria-hidden="true">
          <div
            className="adela-guia__relleno"
            style={{ width: `${Math.min(100, (hechas / meta) * 100)}%` }}
          />
        </div>
      )}
    </>
  )
}

Avance.propTypes = {
  hechas: PropTypes.number.isRequired,
  meta: PropTypes.number,
}

const Ejemplo = ({ texto, onUsar }) => (
  <div className="adela-guia__ejemplo">
    <span>«{texto}»</span>
    <button
      type="button"
      className="adela-btn adela-btn--sm"
      onClick={onUsar}
      title="Agregar este ejemplo como pregunta; luego puedes editarlo"
    >
      Usar
    </button>
  </div>
)

Ejemplo.propTypes = {
  texto: PropTypes.string.isRequired,
  onUsar: PropTypes.func.isRequired,
}

/** Aviso si un estilo tiene muchas más preguntas que otro. */
const desbalance = (cuentas) => {
  const conDatos = cuentas.filter((c) => c.hechas > 0)
  if (conDatos.length < 2) return null
  const max = cuentas.reduce((x, c) => (c.hechas > x.hechas ? c : x))
  const min = cuentas.reduce((x, c) => (c.hechas < x.hechas ? c : x))
  if (max.hechas < 4 || max.hechas < 2 * Math.max(min.hechas, 1)) return null
  return `${max.nombre} tiene ${max.hechas} preguntas y ${min.nombre} ${min.hechas}. Con pocas preguntas, cada respuesta mueve mucho el puntaje de un estilo; procura una cantidad parecida.`
}

/**
 * Guía del paso Preguntas: qué describe cada estilo, cuántas preguntas lleva
 * frente a las sugeridas y ejemplos originales del modelo que se pueden usar
 * con un clic (y editar después).
 */
const GuiaPreguntas = ({ borrador, actualizar }) => {
  const m = modeloDe(borrador)
  const prim = primarios(borrador)
  const ejemplosDe = (clave) =>
    m?.estilos.find((e) => e.clave === clave)?.ejemplos ?? []

  // Frases: una tarjeta por estilo.
  if (borrador.plantilla === PLANTILLA.AFIRMACIONES) {
    const cuentas = prim.map((e) => ({
      e,
      nombre: e.nombre,
      hechas: borrador.preguntas.filter((p) => estiloDeAfirmacion(p) === e.id)
        .length,
    }))
    const aviso = desbalance(cuentas)
    return (
      <>
        <div className="adela-guia">
          {cuentas.map(({ e, hechas }) => (
            <div key={e.id} className="adela-guia__estilo">
              <div className="adela-guia__cabeza">
                <strong>{e.nombre}</strong>
                <Avance hechas={hechas} meta={m?.sugerido.porEstilo} />
              </div>
              {e.describe && (
                <span className="adela-ayuda m-0">{e.describe}</span>
              )}
              {ejemplosDe(e.clave).map((t) => (
                <Ejemplo
                  key={t}
                  texto={t}
                  onUsar={() =>
                    actualizar((b) =>
                      insertar(b, preguntaDePlantilla(b, t, e.id)),
                    )
                  }
                />
              ))}
            </div>
          ))}
        </div>
        {aviso && <div className="adela-aviso mb-3">{aviso}</div>}
      </>
    )
  }

  // Pares a/b: una tarjeta por par.
  const pares = compuestos(borrador).filter((e) => polosDe(e))
  if (borrador.preguntaPorPar && pares.length > 0) {
    const cuentas = pares.map((par) => ({
      par,
      nombre: `${nombreDe(borrador, polosDe(par).a)} ↔ ${nombreDe(borrador, polosDe(par).b)}`,
      hechas: borrador.preguntas.filter((p) => esDelPar(p, par)).length,
    }))
    const aviso = desbalance(cuentas)
    return (
      <>
        <div className="adela-guia">
          {cuentas.map(({ par, nombre, hechas }) => {
            const { a, b } = polosDe(par)
            const def = m?.pares?.find((x) => x.clave === par.clave)
            const describe = (id) =>
              borrador.estilos.find((x) => x.id === id)?.describe
            return (
              <div key={par.id} className="adela-guia__estilo">
                <div className="adela-guia__cabeza">
                  <strong>{nombre}</strong>
                  <Avance hechas={hechas} meta={m?.sugerido.porPar} />
                </div>
                {describe(a) && (
                  <span className="adela-ayuda m-0">
                    a) {nombreDe(borrador, a)}: {describe(a)} b){' '}
                    {nombreDe(borrador, b)}: {describe(b)}
                  </span>
                )}
                {(def?.ejemplos ?? []).map((x) => (
                  <Ejemplo
                    key={x.pregunta}
                    texto={`${x.pregunta} a) ${x.a} · b) ${x.b}`}
                    onUsar={() =>
                      actualizar((bo) =>
                        insertar(bo, {
                          ...nuevaPregunta(undefined, [
                            nuevaOpcion(x.a, a),
                            nuevaOpcion(x.b, b),
                          ]),
                          texto: x.pregunta,
                        }),
                      )
                    }
                  />
                ))}
              </div>
            )
          })}
        </div>
        {aviso && <div className="adela-aviso mb-3">{aviso}</div>}
      </>
    )
  }

  // Una opción por estilo en cada pregunta (varias respuestas, ordenar).
  if (!m) return null
  const meta = totalSugerido(m)
  const usar = (x) =>
    actualizar((b) => {
      const p = preguntaDePlantilla(b, x.pregunta)
      return insertar(b, {
        ...p,
        opciones: p.opciones.map((o) => {
          const clave = b.estilos.find(
            (e) => e.id === o.pesos[0]?.estiloId,
          )?.clave
          return { ...o, texto: x.opciones[clave] ?? o.texto }
        }),
      })
    })
  return (
    <div className="adela-guia">
      <div className="adela-guia__estilo">
        <div className="adela-guia__cabeza">
          <strong>Cada pregunta trae una opción por estilo</strong>
          <Avance hechas={borrador.preguntas.length} meta={meta} />
        </div>
        {prim.map((e) => (
          <span key={e.id} className="adela-ayuda m-0">
            <strong>{e.nombre}:</strong> {e.describe ?? ''}
          </span>
        ))}
      </div>
      <div className="adela-guia__estilo">
        <strong>Ejemplos para empezar</strong>
        {(m.ejemplosPregunta ?? []).map((x) => (
          <Ejemplo
            key={x.pregunta}
            texto={`${x.pregunta} ${prim
              .map((e) => x.opciones[e.clave])
              .filter(Boolean)
              .join(' · ')}`}
            onUsar={() => usar(x)}
          />
        ))}
      </div>
    </div>
  )
}

GuiaPreguntas.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
}

export default GuiaPreguntas

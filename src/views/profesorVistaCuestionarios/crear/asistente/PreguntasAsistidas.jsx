import React, { useState } from 'react'
import PropTypes from 'prop-types'
import SelectorEstilo from './SelectorEstilo'
import {
  FORMATO,
  MIDE_ESCALA,
  PLANTILLA,
  RESPUESTA_FRASE,
  actualizarPregunta,
  agregarPregunta,
  duplicarPregunta,
  estiloDeAfirmacion,
  etiquetasFrase,
  moverPregunta,
  nombreDe,
  nuevaOpcion,
  opcionesFrase,
  preguntaDePlantilla,
  primarios,
  quitarPregunta,
} from '../borrador'

const Acciones = ({ numero, total, onMover, onDuplicar, onQuitar }) => (
  <>
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
    {onDuplicar && (
      <button
        type="button"
        className="adela-btn adela-btn--sm"
        onClick={onDuplicar}
      >
        Duplicar
      </button>
    )}
    <button
      type="button"
      className="adela-btn adela-btn--sm"
      aria-label={`Quitar la pregunta ${numero}`}
      onClick={onQuitar}
    >
      ×
    </button>
  </>
)

Acciones.propTypes = {
  numero: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onMover: PropTypes.func.isRequired,
  onDuplicar: PropTypes.func,
  onQuitar: PropTypes.func.isRequired,
}

/**
 * Pista de redacción para una frase, o null. Una pregunta con "?" no encaja en
 * una escala de "qué tanto"; una frase en negativo suele necesitar puntuar al
 * revés.
 */
const pistaFrase = (texto, inversa, maxima) => {
  const t = texto.trim()
  if (!t) return null
  if (t.endsWith('?'))
    return 'Escríbela como afirmación, no como pregunta: el estudiante responde qué tanto se aplica a él.'
  if (!inversa && /(^|\s)(no|nunca|jamás|jamas|evito)\s/i.test(` ${t} `))
    return `Parece escrita en negativo. Si responder «${maxima}» muestra MENOS de este estilo, márcala «Al revés».`
  return null
}

/**
 * Frases que pertenecen a un estilo y se responden con Sí/No o con una escala
 * (frecuencia o acuerdo). La forma de responder se elige en el primer paso.
 */
const Afirmaciones = ({ borrador, actualizar }) => {
  const prim = primarios(borrador)
  const [elegido, setEstiloNuevo] = useState(prim[0]?.id)
  // Si el estilo elegido se borró, se usa el primero.
  const estiloNuevo = prim.some((e) => e.id === elegido) ? elegido : prim[0]?.id
  const [pegado, setPegado] = useState('')
  const [pegar, setPegar] = useState(false)
  const lineas = pegado
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const escala = borrador.respuestaFrase === RESPUESTA_FRASE.ESCALA
  const etiquetas = etiquetasFrase(borrador)
  const maxima = escala ? etiquetas[etiquetas.length - 1] : 'De acuerdo'
  const ejemplo = escala
    ? borrador.mideEscala === MIDE_ESCALA.FRECUENCIA
      ? 'Ej.: Hago esquemas para estudiar un tema'
      : 'Ej.: Aprendo mejor cuando practico'
    : 'Ej.: Me gusta probar cosas nuevas'

  const agregar = (textos) =>
    actualizar((b) =>
      textos.reduce(
        (acc, t) =>
          agregarPregunta(acc, preguntaDePlantilla(acc, t, estiloNuevo)),
        b,
      ),
    )

  const rehacer = (p, estiloId, inversa) =>
    actualizar((b) =>
      actualizarPregunta(b, p.id, {
        inversa,
        opciones: opcionesFrase(b, estiloId, inversa),
      }),
    )

  return (
    <>
      <div className="adela-ayuda mt-0 mb-3">
        <p className="m-0">
          Cada estudiante elegirá una de estas respuestas en cada frase:
        </p>
        <div className="adela-chips my-2">
          {etiquetas.map((t, i) => (
            <span key={t} className="adela-chip">
              {t}
              {escala && ` · ${i + 1}`}
            </span>
          ))}
        </div>
        <p className="m-0">
          {escala
            ? `La respuesta suma de 1 a ${etiquetas.length} puntos al estilo de la frase.`
            : '«De acuerdo» suma un punto al estilo de la frase.'}{' '}
          Marca «Al revés» las frases escritas en contra del estilo: puntúan al
          contrario.
        </p>
      </div>
      {borrador.preguntas.map((p, i) => {
        const pista = pistaFrase(p.texto, p.inversa, maxima)
        return (
          <div key={p.id} className="adela-item">
            <div className="adela-item__cabeza">
              <span className="adela-item__num">{i + 1}</span>
              <input
                className="adela-input adela-crece"
                aria-label={`Frase ${i + 1}`}
                placeholder={ejemplo}
                value={p.texto}
                onChange={(e) =>
                  actualizar((b) =>
                    actualizarPregunta(b, p.id, { texto: e.target.value }),
                  )
                }
              />
              <Acciones
                numero={i + 1}
                total={borrador.preguntas.length}
                onMover={(paso) =>
                  actualizar((b) => moverPregunta(b, p.id, paso))
                }
                onQuitar={() => actualizar((b) => quitarPregunta(b, p.id))}
              />
            </div>
            <div className="adela-fila">
              <SelectorEstilo
                etiqueta={`Estilo de la frase ${i + 1}`}
                estilos={prim}
                valor={estiloDeAfirmacion(p)}
                onChange={(id) => rehacer(p, id, Boolean(p.inversa))}
              />
              <button
                type="button"
                className="adela-chip-btn"
                aria-pressed={Boolean(p.inversa)}
                title="La frase está escrita en contra del estilo: puntúa al contrario"
                onClick={() => rehacer(p, estiloDeAfirmacion(p), !p.inversa)}
              >
                ⇅ Al revés
              </button>
            </div>
            {pista && <p className="adela-ayuda mb-0">{pista}</p>}
          </div>
        )
      })}

      <div className="adela-panel mt-3 mb-0" style={{ boxShadow: 'none' }}>
        <div className="adela-fila mb-2">
          <strong className="adela-crece">Las próximas frases serán de:</strong>
          <button
            type="button"
            className="adela-btn adela-btn--sm"
            onClick={() => setPegar((v) => !v)}
          >
            {pegar ? 'Agregar de a una' : 'Pegar varias frases'}
          </button>
        </div>
        <SelectorEstilo
          etiqueta="Estilo de las frases nuevas"
          estilos={prim}
          valor={estiloNuevo}
          onChange={setEstiloNuevo}
        />
        {pegar ? (
          <>
            <textarea
              className="adela-input mt-2"
              rows={6}
              placeholder={`Una frase por línea.\n${ejemplo.replace('Ej.: ', '')}`}
              value={pegado}
              onChange={(e) => setPegado(e.target.value)}
            />
            <button
              type="button"
              className="adela-btn adela-btn--primario mt-2"
              disabled={lineas.length === 0}
              onClick={() => {
                agregar(lineas)
                setPegado('')
              }}
            >
              Agregar {lineas.length} {lineas.length === 1 ? 'frase' : 'frases'}{' '}
              a {nombreDe(borrador, estiloNuevo)}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="adela-btn mt-2"
            onClick={() => agregar([''])}
          >
            + Frase
          </button>
        )}
      </div>
    </>
  )
}

Afirmaciones.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
}

/** Una o varias respuestas: cada opción apunta a un estilo. */
const OpcionesPorEstilo = ({ borrador, actualizar }) => {
  const prim = primarios(borrador)
  const varias = borrador.plantilla === PLANTILLA.VARIAS
  const cambiarOpcion = (p, id, cambios) =>
    actualizar((b) =>
      actualizarPregunta(b, p.id, {
        opciones: p.opciones.map((o) =>
          o.id === id ? { ...o, ...cambios } : o,
        ),
      }),
    )

  return (
    <>
      <p className="adela-ayuda mt-0 mb-3">
        {varias
          ? 'Los estudiantes podrán marcar todas las opciones que los describan; cada una suma un punto a su estilo.'
          : 'Los estudiantes elegirán una opción; suma un punto al estilo al que apunta.'}
      </p>
      {borrador.preguntas.map((p, i) => (
        <div key={p.id} className="adela-item">
          <div className="adela-item__cabeza">
            <span className="adela-item__num">{i + 1}</span>
            <input
              className="adela-input adela-crece"
              aria-label={`Enunciado de la pregunta ${i + 1}`}
              placeholder={
                varias
                  ? 'Ej.: Para aprender a usar un aparato nuevo, prefiero…'
                  : 'Ej.: Ante un problema nuevo, suelo…'
              }
              value={p.texto}
              onChange={(e) =>
                actualizar((b) =>
                  actualizarPregunta(b, p.id, { texto: e.target.value }),
                )
              }
            />
            <Acciones
              numero={i + 1}
              total={borrador.preguntas.length}
              onMover={(paso) =>
                actualizar((b) => moverPregunta(b, p.id, paso))
              }
              onDuplicar={() => actualizar((b) => duplicarPregunta(b, p.id))}
              onQuitar={() => actualizar((b) => quitarPregunta(b, p.id))}
            />
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
                    onChange={(e) =>
                      cambiarOpcion(p, o.id, { texto: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="adela-btn adela-btn--sm"
                    aria-label={`Quitar la opción ${j + 1}`}
                    onClick={() =>
                      actualizar((b) =>
                        actualizarPregunta(b, p.id, {
                          opciones: p.opciones.filter((x) => x.id !== o.id),
                        }),
                      )
                    }
                  >
                    ×
                  </button>
                </div>
                <div className="mt-1">
                  <SelectorEstilo
                    etiqueta={`Estilo de la opción ${j + 1}`}
                    estilos={prim}
                    valor={o.pesos[0]?.estiloId}
                    onChange={(id) =>
                      cambiarOpcion(p, o.id, {
                        pesos: [{ estiloId: id, peso: 1 }],
                      })
                    }
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="adela-btn adela-btn--sm"
              onClick={() =>
                actualizar((b) =>
                  actualizarPregunta(b, p.id, {
                    opciones: [...p.opciones, nuevaOpcion('', prim[0]?.id)],
                  }),
                )
              }
            >
              + Opción
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="adela-btn mt-3"
        onClick={() =>
          actualizar((b) => agregarPregunta(b, preguntaDePlantilla(b)))
        }
      >
        + Pregunta
      </button>
    </>
  )
}

OpcionesPorEstilo.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
}

/** Ordenar o repartir: una opción por estilo, ya rotulada. */
const UnaPorEstilo = ({ borrador, actualizar }) => {
  const reparto = borrador.formatoOrden === FORMATO.REPARTO
  return (
    <>
      <p className="adela-ayuda mt-0 mb-3">
        {reparto
          ? `Los estudiantes repartirán ${borrador.puntos} puntos entre las opciones según cuánto los describe cada una.`
          : 'Los estudiantes ordenarán las opciones de la que más a la que menos los describe.'}{' '}
        Cada opción ya está ligada a su estilo: solo escribe el texto.
      </p>
      {borrador.preguntas.map((p, i) => (
        <div key={p.id} className="adela-item">
          <div className="adela-item__cabeza">
            <span className="adela-item__num">{i + 1}</span>
            <input
              className="adela-input adela-crece"
              aria-label={`Enunciado de la pregunta ${i + 1}`}
              placeholder="Ej.: Cuando aprendo…"
              value={p.texto}
              onChange={(e) =>
                actualizar((b) =>
                  actualizarPregunta(b, p.id, { texto: e.target.value }),
                )
              }
            />
            <Acciones
              numero={i + 1}
              total={borrador.preguntas.length}
              onMover={(paso) =>
                actualizar((b) => moverPregunta(b, p.id, paso))
              }
              onDuplicar={() => actualizar((b) => duplicarPregunta(b, p.id))}
              onQuitar={() => actualizar((b) => quitarPregunta(b, p.id))}
            />
          </div>
          <div className="adela-sub">
            {p.opciones.map((o) => (
              <div key={o.id} className="adela-fila">
                <span className="adela-chip" style={{ minWidth: '6rem' }}>
                  {nombreDe(borrador, o.pesos[0]?.estiloId)}
                </span>
                <input
                  className="adela-input adela-crece"
                  aria-label={`Opción de ${nombreDe(borrador, o.pesos[0]?.estiloId)}`}
                  placeholder="Texto de la opción"
                  value={o.texto}
                  onChange={(e) =>
                    actualizar((b) =>
                      actualizarPregunta(b, p.id, (actual) => ({
                        opciones: actual.opciones.map((x) =>
                          x.id === o.id ? { ...x, texto: e.target.value } : x,
                        ),
                      })),
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="adela-btn mt-3"
        onClick={() =>
          actualizar((b) => agregarPregunta(b, preguntaDePlantilla(b)))
        }
      >
        + Pregunta
      </button>
    </>
  )
}

UnaPorEstilo.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
}

/** Editor de preguntas hecho a la medida de la plantilla elegida. */
const PreguntasAsistidas = (props) => {
  switch (props.borrador.plantilla) {
    case PLANTILLA.AFIRMACIONES:
      return <Afirmaciones {...props} />
    case PLANTILLA.ORDENAR:
      return <UnaPorEstilo {...props} />
    default:
      return <OpcionesPorEstilo {...props} />
  }
}

PreguntasAsistidas.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
}

export default PreguntasAsistidas

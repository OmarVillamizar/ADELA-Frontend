import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Swal from 'sweetalert2'
import Segmentado from '../../../../components/resultados/Segmentado'
import CamposDatos from '../CamposDatos'
import ListaErrores from '../ListaErrores'
import VistaPrevia from '../VistaPrevia'
import PreguntasAsistidas from './PreguntasAsistidas'
import {
  FORMATO,
  LECTURA,
  MIDE_ESCALA,
  PLANTILLA,
  RESPUESTA_FRASE,
  agregarEstilo,
  agregarPar,
  agregarPregunta,
  compuestos,
  estiloDeAfirmacion,
  etiquetasFrase,
  nombreDe,
  pasarAAvanzado,
  polosDe,
  preguntaDePlantilla,
  primarios,
  quitarEstilo,
  sincronizarFrases,
  sincronizarOrdenar,
} from '../borrador'

const PASOS = ['Tipo', 'Estilos', 'Lectura', 'Preguntas', 'Revisión']
const PASO_DE_SECCION = {
  estilos: 1,
  interpretacion: 2,
  preguntas: 3,
  datos: 4,
}

const PLANTILLAS = [
  {
    valor: PLANTILLA.AFIRMACIONES,
    titulo: 'Frases que se valoran',
    texto:
      'Leen frases y dicen si están de acuerdo, o qué tanto se aplican a ellos en una escala. Cada frase pertenece a un estilo.',
    ejemplo:
      '«Hago esquemas para estudiar» → Nunca · Algunas veces · Bastantes veces · Siempre',
  },
  {
    valor: PLANTILLA.UNA_OPCION,
    titulo: 'Una respuesta por pregunta',
    texto:
      'Eligen una opción; cada opción apunta a un estilo, o a uno de dos polos opuestos.',
    ejemplo:
      'Ante un problema nuevo: a) lo pruebo enseguida · b) lo analizo primero',
  },
  {
    valor: PLANTILLA.VARIAS,
    titulo: 'Varias respuestas',
    texto:
      'Marcan todas las que apliquen. Sirve, por ejemplo, para los canales por los que prefieren aprender: ver, oír, leer, hacer.',
    ejemplo:
      'Para seguir una ruta prefiero: ☐ un mapa ☐ que me la expliquen ☐ instrucciones escritas ☐ recorrerla',
  },
  {
    valor: PLANTILLA.ORDENAR,
    titulo: 'Ordenar o repartir',
    texto:
      'Ordenan las opciones de la que más a la que menos los describe, o reparten puntos entre ellas. Cada opción representa un estilo.',
    ejemplo:
      'Cuando aprendo: 4 · haciendo   3 · observando   2 · pensando   1 · sintiendo',
  },
]

const ofrecePolos = (b) =>
  b.plantilla === PLANTILLA.UNA_OPCION || b.plantilla === PLANTILLA.ORDENAR

/** Qué falta para avanzar desde un paso, o null si se puede. */
const faltaEn = (b, paso) => {
  const prim = primarios(b)
  if (paso === 0 && !b.plantilla)
    return 'Elige cómo responderán tus estudiantes.'
  if (paso === 0 && b.plantilla === PLANTILLA.ORDENAR) {
    const pts = Number(b.puntos)
    if (
      b.formatoOrden === FORMATO.REPARTO &&
      (!Number.isInteger(pts) || pts <= 0)
    )
      return 'Indica cuántos puntos se reparten.'
  }
  if (paso === 1 && prim.length < 2) return 'Agrega al menos dos estilos.'
  if (paso === 2 && !b.lectura) return 'Elige cómo leer los resultados.'
  if (paso === 3) {
    if (b.preguntas.length === 0) return 'Agrega al menos una pregunta.'
    const i = b.preguntas.findIndex(
      (p) =>
        !p.texto.trim() ||
        p.opciones.length < 2 ||
        p.opciones.some((o) => !o.texto.trim()) ||
        (b.plantilla === PLANTILLA.AFIRMACIONES
          ? !estiloDeAfirmacion(p)
          : p.opciones.some((o) => o.pesos.length === 0)),
    )
    if (i >= 0)
      return `Completa la pregunta ${i + 1}: enunciado, opciones y el estilo de cada una.`
  }
  return null
}

const resumenFrases = (b, n) => {
  const base = n === 1 ? 'frase' : 'frases'
  if (b.respuestaFrase !== RESPUESTA_FRASE.ESCALA)
    return `${base} de acuerdo o desacuerdo`
  const mide =
    b.mideEscala === MIDE_ESCALA.FRECUENCIA ? 'frecuencia' : 'acuerdo'
  const alReves = b.preguntas.filter((p) => p.inversa).length
  return `${base} con escala de ${mide} de ${b.puntosEscala} puntos${
    alReves > 0 ? ` (${alReves} al revés)` : ''
  }`
}

const resumen = (b) => {
  const n = b.preguntas.length
  const tipo = {
    [PLANTILLA.AFIRMACIONES]: resumenFrases(b, n),
    [PLANTILLA.UNA_OPCION]:
      n === 1 ? 'pregunta de una respuesta' : 'preguntas de una respuesta',
    [PLANTILLA.VARIAS]:
      n === 1
        ? 'pregunta de varias respuestas'
        : 'preguntas de varias respuestas',
    [PLANTILLA.ORDENAR]:
      b.formatoOrden === FORMATO.REPARTO
        ? `${n === 1 ? 'pregunta' : 'preguntas'} para repartir ${b.puntos} puntos`
        : `${n === 1 ? 'pregunta' : 'preguntas'} para ordenar`,
  }[b.plantilla]
  const lectura = {
    [LECTURA.SOLO_PUNTAJES]: 'se mostrarán solo los puntajes',
    [LECTURA.PREDOMINANTE]: 'se destacará el estilo predominante',
    [LECTURA.NIVELES]: 'cada estilo tendrá nivel bajo, medio o alto',
  }[b.lectura]
  const pares = compuestos(b).length
  return [
    `${n} ${tipo}`,
    `${primarios(b).length} estilos`,
    pares > 0 && `${pares} ${pares === 1 ? 'par opuesto' : 'pares opuestos'}`,
    lectura,
  ]
    .filter(Boolean)
    .join(' · ')
}

/**
 * Paso 1, frases: cómo responde el estudiante cada frase. Sí/No para
 * inventarios de acuerdo; escala de frecuencia para hábitos y estrategias, de
 * acuerdo para preferencias. Muestra las respuestas tal como las verá.
 */
const OpcionesFrase = ({ borrador, actualizar }) => {
  const cambiar = (cambios) =>
    actualizar((b) => sincronizarFrases({ ...b, ...cambios }))
  const escala = borrador.respuestaFrase === RESPUESTA_FRASE.ESCALA
  return (
    <div className="adela-item mt-3">
      <div className="adela-campo mb-2">
        <span>¿Cómo responde el estudiante cada frase?</span>
        <Segmentado
          etiqueta="Forma de responder cada frase"
          opciones={[
            {
              valor: RESPUESTA_FRASE.SI_NO,
              etiqueta: 'De acuerdo / En desacuerdo',
            },
            { valor: RESPUESTA_FRASE.ESCALA, etiqueta: 'Con una escala' },
          ]}
          valor={borrador.respuestaFrase}
          onChange={(respuestaFrase) => cambiar({ respuestaFrase })}
        />
      </div>
      {escala && (
        <>
          <div className="adela-campo mb-1">
            <span>¿Qué le pregunta la escala?</span>
            <Segmentado
              etiqueta="Qué mide la escala"
              opciones={[
                {
                  valor: MIDE_ESCALA.FRECUENCIA,
                  etiqueta: 'Con qué frecuencia lo hace',
                },
                {
                  valor: MIDE_ESCALA.ACUERDO,
                  etiqueta: 'Qué tan de acuerdo está',
                },
              ]}
              valor={borrador.mideEscala}
              onChange={(mideEscala) => cambiar({ mideEscala })}
            />
          </div>
          <p className="adela-ayuda mt-0 mb-2">
            Frecuencia sirve para hábitos y estrategias («Hago resúmenes al
            estudiar»). Acuerdo, para preferencias y opiniones («Prefiero
            trabajar en grupo»).
          </p>
          <div className="adela-campo mb-1">
            <span>¿Cuántas respuestas tiene la escala?</span>
            <Segmentado
              etiqueta="Puntos de la escala"
              opciones={[
                { valor: '4', etiqueta: '4 respuestas' },
                { valor: '5', etiqueta: '5 respuestas' },
              ]}
              valor={String(borrador.puntosEscala)}
              onChange={(v) => cambiar({ puntosEscala: Number(v) })}
            />
          </div>
          <p className="adela-ayuda mt-0 mb-2">
            Con 4 no hay punto medio: el estudiante tiene que inclinarse hacia
            un lado. Con 5 hay una respuesta neutral en el centro.
          </p>
        </>
      )}
      <div className="adela-campo">
        <span>Así verá cada frase:</span>
        <div className="adela-chips">
          {etiquetasFrase(borrador).map((t) => (
            <span key={t} className="adela-chip">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

OpcionesFrase.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
}

/** Paso 2: nombres de los estilos y, si aplica, pares de polos opuestos. */
const PasoEstilos = ({ borrador, actualizar }) => {
  const [nombre, setNombre] = useState('')
  const [parA, setParA] = useState('')
  const [parB, setParB] = useState('')
  const prim = primarios(borrador)
  const pares = compuestos(borrador)

  const agregar = () => {
    const limpio = nombre.trim()
    if (!limpio) return
    if (
      borrador.estilos.some(
        (e) => e.nombre.trim().toLowerCase() === limpio.toLowerCase(),
      )
    ) {
      Swal.fire('Ese estilo ya está', `"${limpio}" ya fue agregado.`, 'info')
      return
    }
    actualizar((b) => agregarEstilo(b, limpio))
    setNombre('')
  }

  const a = prim.some((e) => e.id === parA) ? parA : ''
  const z = prim.some((e) => e.id === parB) ? parB : ''
  const parRepetido = pares.some((e) => {
    const p = polosDe(e)
    return p && ((p.a === a && p.b === z) || (p.a === z && p.b === a))
  })

  return (
    <>
      <h3 className="adela-panel__titulo">¿Qué estilos mide?</h3>
      <p className="adela-panel__nota mb-3">
        Escribe el nombre de cada estilo y pulsa Enter. Por ejemplo:{' '}
        {borrador.plantilla === PLANTILLA.AFIRMACIONES &&
        borrador.respuestaFrase === RESPUESTA_FRASE.ESCALA &&
        borrador.mideEscala === MIDE_ESCALA.FRECUENCIA
          ? 'Adquisición, Codificación, Recuperación, Apoyo (estrategias de estudio).'
          : 'Activo, Reflexivo, Teórico, Pragmático.'}
      </p>
      <div className="adela-fila mb-3">
        <input
          className="adela-input adela-crece"
          placeholder="Nombre del estilo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              agregar()
            }
          }}
        />
        <button type="button" className="adela-btn" onClick={agregar}>
          Agregar
        </button>
      </div>
      <div className="adela-chips mb-2">
        {prim.length === 0 && (
          <span className="adela-falta">Aún no hay estilos.</span>
        )}
        {prim.map((e) => (
          <span key={e.id} className="adela-chip-btn" aria-pressed="true">
            {e.nombre}
            <button
              type="button"
              className="adela-chip-btn__quitar"
              aria-label={`Quitar ${e.nombre}`}
              onClick={() => actualizar((b) => quitarEstilo(b, e.id))}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {ofrecePolos(borrador) && prim.length >= 2 && (
        <div className="adela-item mt-4">
          <strong className="d-block">
            ¿Algunos estilos son polos opuestos de una misma dimensión?
          </strong>
          <p className="adela-ayuda mt-1 mb-3">
            Opcional. Por ejemplo, Activo frente a Reflexivo. Además de cada
            estilo, el resultado mostrará hacia qué polo se inclina el
            estudiante.
          </p>
          <div className="adela-fila mb-2">
            <select
              className="adela-input"
              style={{ width: 'auto' }}
              aria-label="Primer polo"
              value={a}
              onChange={(e) => setParA(e.target.value)}
            >
              <option value="">Un polo…</option>
              {prim.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
            <span aria-hidden="true">frente a</span>
            <select
              className="adela-input"
              style={{ width: 'auto' }}
              aria-label="Polo opuesto"
              value={z}
              onChange={(e) => setParB(e.target.value)}
            >
              <option value="">El opuesto…</option>
              {prim
                .filter((e) => e.id !== a)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
            </select>
            <button
              type="button"
              className="adela-btn adela-btn--sm"
              disabled={!a || !z || a === z || parRepetido}
              onClick={() => {
                actualizar((b) => agregarPar(b, a, z))
                setParA('')
                setParB('')
              }}
            >
              Agregar par
            </button>
          </div>
          <div className="adela-chips">
            {pares.map((e) => {
              const p = polosDe(e)
              return (
                <span key={e.id} className="adela-chip-btn">
                  {p
                    ? `${nombreDe(borrador, p.a)} ↔ ${nombreDe(borrador, p.b)}`
                    : e.nombre}
                  <button
                    type="button"
                    className="adela-chip-btn__quitar"
                    aria-label={`Quitar el par ${e.nombre}`}
                    onClick={() => actualizar((b) => quitarEstilo(b, e.id))}
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

PasoEstilos.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
}

/**
 * Crear un cuestionario contestando pocas preguntas: cómo responderán, qué
 * estilos mide y cómo leer los resultados. Después, un editor de preguntas a la
 * medida y la revisión. Todo queda en el mismo borrador que el modo avanzado.
 */
const Asistente = ({
  borrador,
  actualizar,
  errores,
  intentado,
  creando,
  onCrear,
}) => {
  const paso = borrador.paso ?? 0
  const ultimo = paso === PASOS.length - 1
  const falta = ultimo ? null : faltaEn(borrador, paso)
  const prim = primarios(borrador)
  const e1 = prim[0]?.nombre || 'Activo'
  const e2 = prim[1]?.nombre || 'Reflexivo'

  const irA = (n) => {
    actualizar((b) => {
      if (n !== 3) return { ...b, paso: n }
      // Al llegar a las preguntas, ya hay una lista para escribir.
      const listo = sincronizarOrdenar({ ...b, paso: n })
      return listo.preguntas.length > 0
        ? listo
        : agregarPregunta(listo, preguntaDePlantilla(listo))
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const elegirPlantilla = async (valor) => {
    if (valor === borrador.plantilla) return
    if (borrador.preguntas.length > 0) {
      const { isConfirmed } = await Swal.fire({
        title: '¿Cambiar el tipo?',
        text: `Las ${borrador.preguntas.length} preguntas escritas tienen otra forma y se borrarán.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Cambiar',
        cancelButtonText: 'Cancelar',
      })
      if (!isConfirmed) return
    }
    actualizar((b) => ({
      ...b,
      plantilla: valor,
      preguntas: [],
      // Los pares solo existen en las plantillas que los ofrecen.
      estilos: ofrecePolos({ plantilla: valor }) ? b.estilos : primarios(b),
    }))
  }

  const aAvanzado = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Pasar a modo avanzado?',
      text: 'Conservas todo lo hecho y podrás ajustar cada detalle. Desde allí no se puede volver al asistente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Pasar a avanzado',
      cancelButtonText: 'Seguir en el asistente',
    })
    if (isConfirmed) actualizar(pasarAAvanzado)
  }

  const LECTURAS = [
    {
      valor: LECTURA.SOLO_PUNTAJES,
      titulo: 'Solo puntajes',
      texto:
        'Cada estilo con su puntaje y su porcentaje del máximo, sin destacar ninguno.',
      ejemplo: `${e1}: 14 de 20 (70 %)`,
    },
    {
      valor: LECTURA.PREDOMINANTE,
      titulo: 'Destacar el predominante',
      texto: 'Se destaca el estilo más alto y los que quedan muy cerca de él.',
      ejemplo: `Predomina: ${e1} + ${e2}`,
    },
    {
      valor: LECTURA.NIVELES,
      titulo: 'Niveles bajo, medio y alto',
      texto:
        compuestos(borrador).length > 0
          ? 'Cada estilo recibe un nivel según su porcentaje del máximo; cada par opuesto, hacia qué polo tiende.'
          : 'Cada estilo recibe un nivel según su porcentaje del máximo.',
      ejemplo: `${e1}: Alto · ${e2}: Medio`,
    },
  ]

  let cuerpo
  if (paso === 0) {
    cuerpo = (
      <>
        <h3 className="adela-panel__titulo">
          ¿Cómo responderán tus estudiantes?
        </h3>
        <p className="adela-panel__nota mb-3">
          Elige la forma más parecida a tu instrumento.
        </p>
        <div className="adela-tarjetas">
          {PLANTILLAS.map((t) => (
            <button
              key={t.valor}
              type="button"
              className="adela-tarjeta"
              aria-pressed={borrador.plantilla === t.valor}
              onClick={() => elegirPlantilla(t.valor)}
            >
              <p className="adela-tarjeta__titulo">{t.titulo}</p>
              <p className="adela-tarjeta__texto">{t.texto}</p>
              <p className="adela-tarjeta__ejemplo">{t.ejemplo}</p>
            </button>
          ))}
        </div>
        {borrador.plantilla === PLANTILLA.AFIRMACIONES && (
          <OpcionesFrase borrador={borrador} actualizar={actualizar} />
        )}
        {borrador.plantilla === PLANTILLA.ORDENAR && (
          <div className="adela-item mt-3">
            <div className="adela-fila">
              <Segmentado
                etiqueta="Ordenar o repartir"
                opciones={[
                  { valor: FORMATO.JERARQUIA, etiqueta: 'Ordenar' },
                  { valor: FORMATO.REPARTO, etiqueta: 'Repartir puntos' },
                ]}
                valor={borrador.formatoOrden}
                onChange={(formatoOrden) =>
                  actualizar((b) => sincronizarOrdenar({ ...b, formatoOrden }))
                }
              />
              {borrador.formatoOrden === FORMATO.REPARTO && (
                <label className="adela-fila" style={{ gap: '0.4rem' }}>
                  Puntos por pregunta
                  <input
                    className="adela-input adela-input--num"
                    type="number"
                    min={1}
                    value={borrador.puntos}
                    onChange={(e) =>
                      actualizar((b) =>
                        sincronizarOrdenar({ ...b, puntos: e.target.value }),
                      )
                    }
                  />
                </label>
              )}
            </div>
          </div>
        )}
      </>
    )
  } else if (paso === 1) {
    cuerpo = <PasoEstilos borrador={borrador} actualizar={actualizar} />
  } else if (paso === 2) {
    cuerpo = (
      <>
        <h3 className="adela-panel__titulo">
          ¿Cómo quieres leer los resultados?
        </h3>
        <p className="adela-panel__nota mb-3">
          Podrás cambiarlo más adelante desde la lista de cuestionarios.
        </p>
        <div className="adela-tarjetas">
          {LECTURAS.map((t) => (
            <button
              key={t.valor}
              type="button"
              className="adela-tarjeta"
              aria-pressed={borrador.lectura === t.valor}
              onClick={() => actualizar((b) => ({ ...b, lectura: t.valor }))}
            >
              <p className="adela-tarjeta__titulo">{t.titulo}</p>
              <p className="adela-tarjeta__texto">{t.texto}</p>
              <p className="adela-tarjeta__ejemplo">{t.ejemplo}</p>
            </button>
          ))}
        </div>
      </>
    )
  } else if (paso === 3) {
    cuerpo = (
      <>
        <h3 className="adela-panel__titulo mb-2">Escribe las preguntas</h3>
        <PreguntasAsistidas borrador={borrador} actualizar={actualizar} />
      </>
    )
  } else {
    cuerpo = (
      <>
        <h3 className="adela-panel__titulo">Datos y revisión</h3>
        <p className="adela-panel__nota mb-3">{resumen(borrador)}</p>
        <CamposDatos
          meta={borrador.meta}
          onChange={(meta) => actualizar((b) => ({ ...b, meta }))}
        />
        <details className="adela-seccion mt-4">
          <summary>
            <strong>Vista previa: así lo verán los estudiantes</strong>
          </summary>
          <VistaPrevia borrador={borrador} />
        </details>
      </>
    )
  }

  return (
    <>
      <ol className="adela-pasos" aria-label="Pasos del asistente">
        {PASOS.map((nombre, i) => (
          <li
            key={nombre}
            aria-current={i === paso ? 'step' : undefined}
            data-estado={i < paso ? 'hecho' : undefined}
          >
            <span className="adela-pasos__barra" />
            <span className="adela-pasos__nombre">
              {i + 1}. {nombre}
            </span>
          </li>
        ))}
      </ol>

      <div className="adela-panel">{cuerpo}</div>

      {ultimo && intentado && (
        <ListaErrores
          errores={errores}
          onIr={(s) => irA(PASO_DE_SECCION[s] ?? 4)}
        />
      )}

      <div className="adela-navegacion">
        <div className="adela-fila">
          <button
            type="button"
            className="adela-btn"
            disabled={paso === 0}
            onClick={() => irA(paso - 1)}
          >
            Atrás
          </button>
          <button
            type="button"
            className="adela-btn adela-btn--sm"
            onClick={aAvanzado}
          >
            Pasar a modo avanzado
          </button>
        </div>
        <div className="adela-fila">
          {falta && <span className="adela-falta">{falta}</span>}
          {ultimo ? (
            <button
              type="button"
              className="adela-btn adela-btn--primario"
              disabled={creando}
              onClick={onCrear}
            >
              {creando ? 'Creando…' : 'Crear cuestionario'}
            </button>
          ) : (
            <button
              type="button"
              className="adela-btn adela-btn--primario"
              disabled={Boolean(falta)}
              onClick={() => irA(paso + 1)}
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </>
  )
}

Asistente.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
  errores: PropTypes.array.isRequired,
  intentado: PropTypes.bool,
  creando: PropTypes.bool,
  onCrear: PropTypes.func.isRequired,
}

export default Asistente

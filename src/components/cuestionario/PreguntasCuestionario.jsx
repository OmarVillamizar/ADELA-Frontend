import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import ControlReparto from './ControlReparto'
import {
  FORMATO,
  armarEnvio,
  errorPregunta,
  limitesSeleccion,
} from '../../util/cuestionario/validarRespuesta'
import {
  borrarBorrador,
  guardarBorrador,
  leerBorrador,
} from '../../util/cuestionario/borradorRespuestas'
import { respuestasAlAzar } from '../../util/dev/simulacion'
import nelseFeliz from '../../assets/nelse_mascot/web/nelse_happy_left.webp'
import '../resultados/resultados.css'
import './responder.css'

const porOrden = (a, b) => a.orden - b.orden

/** Pausa tras tocar una opción única: deja ver la marca antes de avanzar. */
const AVANCE_MS = 200
/** Recorrido horizontal del dedo que cuenta como deslizar a otra pregunta. */
const UMBRAL_DESLIZ = 60
/** Tiempo de envío a partir del cual se avisa que la conexión va lenta. */
const LENTO_MS = 8000

/** Colores del logo, uno por opción, para distinguirlas de un vistazo. */
const COLORES = 5

/** Azul de datos mezclado con blanco: la escala se intensifica hacia el final. */
const tonoEscala = (t) => {
  const mezcla = (a, b) => Math.round(b + (a - b) * (0.3 + 0.7 * t))
  const [r, g, b] = [mezcla(0x2a, 0xff), mezcla(0x78, 0xff), mezcla(0xd6, 0xff)]
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Cómo se muestran las opciones de una pregunta de respuesta única: dos
 * tarjetas grandes, una escala en fila o una lista. La escala solo con
 * opciones cortas, que caben lado a lado.
 */
const disposicion = (p) => {
  if (p.formato !== FORMATO.UNICA) return 'lista'
  const n = p.opciones.length
  const largo = Math.max(...p.opciones.map((o) => o.respuesta.length))
  if (n === 2 && largo <= 60) return 'dos'
  if (n >= 3 && n <= 7 && largo <= 32) return 'escala'
  return 'lista'
}

/** Opciones cortas: en pantallas anchas van en dos columnas y la pregunta cabe entera. */
const columnasDe = (p) =>
  p.opciones.length >= 4 &&
  Math.max(...p.opciones.map((o) => o.respuesta.length)) <= 80
    ? ' adela-resp__ops--2col'
    : ''

const ayudaDe = (p) => {
  if (p.formato === FORMATO.JERARQUIA)
    return `Toca en orden: 1º la que más te describe, ${p.opciones.length}º la que menos. Toca otra vez para quitarla.`
  if (p.formato === FORMATO.REPARTO)
    return `Reparte ${p.puntosRepartir} puntos según cuánto te describe cada opción.`
  if (p.formato !== FORMATO.MULTIPLE) return null
  const { min, max } = limitesSeleccion(p)
  if (min <= 1 && max === p.opciones.length) return 'Puedes elegir varias.'
  return min === max ? `Elige ${max}.` : `Elige entre ${min} y ${max}.`
}

/** Lo que le falta a la pregunta, en pocas palabras, para el botón Siguiente. */
const faltaDe = (p, respuesta) => {
  const valores = Object.values(respuesta)
  if (p.formato === FORMATO.JERARQUIA) {
    const n = p.opciones.length - valores.length
    return n === 1 ? 'Falta ordenar 1' : `Faltan ${n} por ordenar`
  }
  if (p.formato === FORMATO.REPARTO) {
    const resto = p.puntosRepartir - valores.reduce((a, b) => a + b, 0)
    return resto > 0 ? `Faltan ${resto} puntos` : `Sobran ${-resto} puntos`
  }
  if (p.formato === FORMATO.MULTIPLE) {
    const { min, max } = limitesSeleccion(p)
    return valores.length < min
      ? `Elige al menos ${min}`
      : `Elige máximo ${max}`
  }
  return 'Elige una opción'
}

/** Opciones de una jerarquía de la que más describe (rango K) a la que menos. */
const ordenDe = (respuesta) =>
  Object.keys(respuesta)
    .sort((a, b) => respuesta[b] - respuesta[a])
    .map(Number)

/**
 * Responder un cuestionario una pregunta por pantalla.
 *
 * Lo comparten el estudiante (asignación de grupo), quien responde una cápsula
 * sin cuenta y la vista previa del profesor. Cada uno decide qué hacer con lo
 * elegido en onEnviar, que recibe { opcionesSeleccionadasId, cantidades } y
 * devuelve true si el envío salió bien; aquí se garantiza que cada pregunta
 * cumpla las reglas de su formato, las mismas que valida el servidor.
 *
 * Con claveBorrador, cada cambio se guarda en el navegador y se retoma al
 * volver; el borrador se borra solo cuando onEnviar confirma el envío.
 */
const PreguntasCuestionario = ({
  cuestionario,
  onEnviar,
  enviando = false,
  claveBorrador = null,
  portada = false,
}) => {
  // Copias ordenadas: no se muta el objeto que llega por props.
  const preguntas = useMemo(
    () =>
      [...cuestionario.preguntas]
        .sort(porOrden)
        .map((p) => ({ ...p, opciones: [...p.opciones].sort(porOrden) })),
    [cuestionario],
  )
  const total = preguntas.length
  const [borrador] = useState(() =>
    claveBorrador ? leerBorrador(claveBorrador, preguntas) : null,
  )
  // Por pregunta, { opcionId: cantidad }.
  const [respuestas, setRespuestas] = useState(
    () => borrador?.respuestas ?? preguntas.map(() => ({})),
  )
  const [indice, setIndice] = useState(borrador?.indice ?? 0)
  const [vista, setVista] = useState(portada ? 'portada' : 'pregunta')
  const [dir, setDir] = useState('sig')
  const [recuperado, setRecuperado] = useState(Boolean(borrador) && !portada)
  const [guardado, setGuardado] = useState(true)
  const [mapa, setMapa] = useState(false)
  const [hito, setHito] = useState(null)
  const [lento, setLento] = useState(false)
  const [enLinea, setEnLinea] = useState(() => navigator.onLine)
  // Hasta dónde llegó: una pregunta opcional que se dejó atrás en blanco
  // cuenta como lista, no como pendiente.
  const [alcance, setAlcance] = useState(borrador?.indice ?? 0)

  const errores = useMemo(
    () => preguntas.map((p, i) => errorPregunta(p, respuestas[i])),
    [preguntas, respuestas],
  )
  const vacia = (i) => Object.keys(respuestas[i]).length === 0
  const lista = (i) => errores[i] === null && (!vacia(i) || i < alcance)
  const omitida = (i) => lista(i) && vacia(i)
  const completas = preguntas.filter((_, i) => lista(i)).length
  const pendientes = preguntas
    .map((_, i) => i)
    .filter((i) => errores[i] !== null)
  const progreso = total === 0 ? 0 : (completas / total) * 100

  // El avance automático corre tras una pausa: lee el estado vigente, no el
  // de cuando se tocó la opción.
  const ultimo = useRef({})
  ultimo.current = { indice, vista, respuestas }
  const temporizador = useRef(null)
  // Al saltar desde la revisión, avanzar lleva a la siguiente pendiente.
  const saltando = useRef(false)
  const mitadVista = useRef(completas >= Math.ceil(total / 2))
  const raiz = useRef(null)
  const paso = useRef(null)
  const enunciado = useRef(null)
  const toque = useRef(null)

  useEffect(() => () => clearTimeout(temporizador.current), [])

  useEffect(() => {
    if (!claveBorrador || vista === 'portada') return
    setGuardado(guardarBorrador(claveBorrador, preguntas, respuestas, indice))
  }, [claveBorrador, preguntas, respuestas, indice, vista])

  useEffect(() => {
    const cambiar = () => setEnLinea(navigator.onLine)
    window.addEventListener('online', cambiar)
    window.addEventListener('offline', cambiar)
    return () => {
      window.removeEventListener('online', cambiar)
      window.removeEventListener('offline', cambiar)
    }
  }, [])

  useEffect(() => {
    if (!enviando) {
      setLento(false)
      return undefined
    }
    const t = setTimeout(() => setLento(true), LENTO_MS)
    return () => clearTimeout(t)
  }, [enviando])

  // Al terminar no se celebra la mitad: la revisión ya lo dice.
  useEffect(() => {
    const mitad = Math.ceil(total / 2)
    if (mitadVista.current || total < 6 || completas < mitad) return
    mitadVista.current = true
    if (completas < total) setHito('¡Vas por la mitad!')
  }, [completas, total])

  useEffect(() => {
    if (!hito) return undefined
    const t = setTimeout(() => setHito(null), 2400)
    return () => clearTimeout(t)
  }, [hito])

  // Cada pregunta nueva empieza a la vista y con el foco en su enunciado.
  useEffect(() => {
    if (vista === 'portada') return
    const caja = raiz.current?.getBoundingClientRect()
    if (caja && caja.top < 0) window.scrollTo(0, window.scrollY + caja.top - 80)
    enunciado.current?.focus({ preventScroll: true })
  }, [indice, vista])

  const cambiar = (i, respuesta) =>
    setRespuestas((previas) => previas.map((r, j) => (j === i ? respuesta : r)))

  /** Pregunta que sigue a la i: la próxima, o la próxima pendiente si se saltó. */
  const destinoDesde = (i, actuales) => {
    if (!saltando.current) return i === total - 1 ? 'revision' : i + 1
    const proxima = preguntas.findIndex(
      (p, j) => j > i && errorPregunta(p, actuales[j]) !== null,
    )
    return proxima === -1 ? 'revision' : proxima
  }

  const mostrar = (destino, direccion) => {
    clearTimeout(temporizador.current)
    setDir(direccion)
    setRecuperado(false)
    setAlcance((a) => Math.max(a, destino === 'revision' ? total : destino))
    if (destino === 'revision') {
      saltando.current = false
      setVista('revision')
    } else {
      setIndice(destino)
      setVista('pregunta')
    }
  }

  const siguiente = () => {
    if (vista !== 'pregunta' || errores[indice] !== null) return
    mostrar(destinoDesde(indice, respuestas), 'sig')
  }

  const anterior = () => {
    if (vista === 'revision') mostrar(total - 1, 'ant')
    else if (vista === 'pregunta' && indice > 0) mostrar(indice - 1, 'ant')
  }

  const irA = (i) => {
    saltando.current = vista === 'revision' || mapa
    setMapa(false)
    mostrar(i, i < indice && vista === 'pregunta' ? 'ant' : 'sig')
  }

  const elegirUnica = (opcionId) => {
    const nueva = Object.keys(respuestas[indice]).length === 0
    cambiar(indice, { [opcionId]: 1 })
    // Solo la primera vez: quien vuelve a corregir se queda en la pregunta.
    if (!nueva) return
    const desde = indice
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => {
      const { indice: actual, vista: v, respuestas: r } = ultimo.current
      if (actual === desde && v === 'pregunta')
        mostrar(destinoDesde(desde, r), 'sig')
    }, AVANCE_MS)
  }

  const alternarMultiple = (p, opcionId) => {
    const actual = respuestas[indice]
    const nueva = { ...actual }
    if (nueva[opcionId]) delete nueva[opcionId]
    else if (Object.keys(actual).length < limitesSeleccion(p).max)
      nueva[opcionId] = 1
    cambiar(indice, nueva)
  }

  // Tocar agrega al final del orden; tocar una ya ordenada la quita y corre
  // las demás. La última se ordena sola: no queda otra opción para ella.
  const alternarOrden = (p, opcionId) => {
    const k = p.opciones.length
    const orden = ordenDe(respuestas[indice])
    const pos = orden.indexOf(opcionId)
    if (pos >= 0) orden.splice(pos, 1)
    else orden.push(opcionId)
    if (pos < 0 && orden.length === k - 1)
      orden.push(p.opciones.find((o) => !orden.includes(o.id)).id)
    cambiar(indice, Object.fromEntries(orden.map((id, i) => [id, k - i])))
  }

  const empezar = (desdeCero) => {
    if (desdeCero) {
      if (claveBorrador) borrarBorrador(claveBorrador)
      setRespuestas(preguntas.map(() => ({})))
      mitadVista.current = false
      mostrar(0, 'sig')
    } else mostrar(borrador?.indice ?? 0, 'sig')
  }

  const enviar = async () => {
    if (pendientes.length > 0 || enviando) return
    const ok = await onEnviar(armarEnvio(preguntas, respuestas))
    if (ok === true && claveBorrador) borrarBorrador(claveBorrador)
  }

  // Teclado: números eligen, Enter o → avanzan, ← retrocede.
  const teclas = useRef(null)
  teclas.current = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || mapa) return
    if (document.body.classList.contains('swal2-shown')) return
    if (e.target.closest?.('input, textarea, select')) return
    if (e.key === 'ArrowLeft') {
      anterior()
      return
    }
    if (vista !== 'pregunta') return
    const p = preguntas[indice]
    if (
      e.key === 'ArrowRight' ||
      (e.key === 'Enter' && !e.target.closest?.('button'))
    ) {
      e.preventDefault()
      siguiente()
      return
    }
    const n = Number(e.key)
    if (!Number.isInteger(n) || n < 1 || n > p.opciones.length) return
    const opcionId = p.opciones[n - 1].id
    if (p.formato === FORMATO.UNICA) elegirUnica(opcionId)
    else if (p.formato === FORMATO.MULTIPLE) alternarMultiple(p, opcionId)
    else if (p.formato === FORMATO.JERARQUIA) alternarOrden(p, opcionId)
  }
  useEffect(() => {
    const escuchar = (e) => teclas.current(e)
    window.addEventListener('keydown', escuchar)
    return () => window.removeEventListener('keydown', escuchar)
  }, [])

  // Deslizar con el dedo: la pregunta sigue al dedo y, pasado el umbral,
  // cambia. Hacia donde no se puede ir, se resiste.
  const puedeSeguir = vista === 'pregunta' && errores[indice] === null
  const puedeVolver =
    vista === 'revision' || (vista === 'pregunta' && indice > 0)

  const alTocar = (e) => {
    if (e.pointerType === 'mouse' || !e.isPrimary) return
    toque.current = { x: e.clientX, y: e.clientY, dx: 0, eje: null }
  }
  const alMover = (e) => {
    const t = toque.current
    if (!t || !paso.current) return
    const dx = e.clientX - t.x
    const dy = e.clientY - t.y
    if (!t.eje && Math.abs(dx) + Math.abs(dy) > 10)
      t.eje = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y'
    if (t.eje !== 'x') return
    t.dx = dx
    const libre = dx < 0 ? puedeSeguir : puedeVolver
    paso.current.style.transition = 'none'
    paso.current.style.transform = `translate3d(${libre ? dx : dx / 4}px, 0, 0)`
  }
  const alSoltar = () => {
    const t = toque.current
    toque.current = null
    if (!t || t.eje !== 'x' || !paso.current) return
    // Que el toque no cuente además como clic sobre una opción.
    const anular = (ev) => {
      ev.stopPropagation()
      ev.preventDefault()
    }
    window.addEventListener('click', anular, { capture: true, once: true })
    setTimeout(
      () => window.removeEventListener('click', anular, { capture: true }),
      0,
    )
    if (t.dx < -UMBRAL_DESLIZ && puedeSeguir) siguiente()
    else if (t.dx > UMBRAL_DESLIZ && puedeVolver) anterior()
    else {
      paso.current.style.transition =
        'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
      paso.current.style.transform = ''
    }
  }

  const marcaOpcion = (k, elegida) => (
    <span className="adela-resp__marca" aria-hidden="true">
      {elegida ? '✓' : k + 1}
    </span>
  )

  const control = (p) => {
    const respuesta = respuestas[indice]
    if (p.formato === FORMATO.REPARTO) {
      return (
        <ControlReparto
          opciones={p.opciones}
          respuesta={respuesta}
          onChange={(r) => cambiar(indice, r)}
          puntos={p.puntosRepartir}
        />
      )
    }
    if (p.formato === FORMATO.JERARQUIA) {
      const orden = ordenDe(respuesta)
      return (
        <div
          className={`adela-resp__ops${columnasDe(p)}`}
          role="group"
          aria-labelledby={`enunciado-${p.id}`}
        >
          {p.opciones.map((o, k) => {
            const pos = orden.indexOf(o.id)
            return (
              <button
                key={o.id}
                type="button"
                className={`adela-resp__op adela-resp__op--c${k % COLORES} adela-resp__op--orden`}
                aria-pressed={pos >= 0}
                aria-label={`${o.respuesta}${pos >= 0 ? `, puesto ${pos + 1}` : ''}`}
                onClick={() => alternarOrden(p, o.id)}
              >
                <span className="adela-resp__marca" aria-hidden="true">
                  {pos >= 0 ? `${pos + 1}º` : ''}
                </span>
                <span className="adela-resp__texto">{o.respuesta}</span>
              </button>
            )
          })}
        </div>
      )
    }
    if (p.formato === FORMATO.MULTIPLE) {
      const { max } = limitesSeleccion(p)
      const elegidas = Object.keys(respuesta).length
      return (
        <div
          className={`adela-resp__ops${columnasDe(p)}`}
          role="group"
          aria-labelledby={`enunciado-${p.id}`}
        >
          {p.opciones.map((o, k) => {
            const elegida = Boolean(respuesta[o.id])
            return (
              <button
                key={o.id}
                type="button"
                className={`adela-resp__op adela-resp__op--c${k % COLORES} adela-resp__op--multi`}
                aria-pressed={elegida}
                disabled={!elegida && elegidas >= max}
                onClick={() => alternarMultiple(p, o.id)}
              >
                {marcaOpcion(k, elegida)}
                <span className="adela-resp__texto">{o.respuesta}</span>
              </button>
            )
          })}
        </div>
      )
    }
    const tipo = disposicion(p)
    const n = p.opciones.length
    return (
      <div
        className={`adela-resp__ops adela-resp__ops--${tipo}${tipo === 'lista' ? columnasDe(p) : ''}`}
        style={tipo === 'escala' ? { '--n': n } : undefined}
        role="radiogroup"
        aria-labelledby={`enunciado-${p.id}`}
      >
        {p.opciones.map((o, k) => {
          const elegida = Boolean(respuesta[o.id])
          const escala = tipo === 'escala'
          const t = k / (n - 1)
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={elegida}
              className={`adela-resp__op ${escala ? 'adela-resp__op--escala' : `adela-resp__op--c${k % COLORES}`}`}
              style={
                escala
                  ? {
                      '--c': tonoEscala(t),
                      '--c-sobre': t > 0.45 ? '#fff' : '#16181d',
                    }
                  : undefined
              }
              onClick={() => elegirUnica(o.id)}
            >
              <span className="adela-resp__marca" aria-hidden="true">
                {k + 1}
              </span>
              <span className="adela-resp__texto">{o.respuesta}</span>
            </button>
          )
        })}
      </div>
    )
  }

  const rellenarDev = import.meta.env.DEV && (
    <button
      type="button"
      className="adela-btn adela-btn--sm"
      onClick={() => {
        setRespuestas(respuestasAlAzar(preguntas))
        mostrar('revision', 'sig')
      }}
    >
      [dev] Rellenar al azar
    </button>
  )

  if (vista === 'portada') {
    const guardadas = borrador
      ? borrador.respuestas.filter((r) => Object.keys(r).length > 0).length
      : 0
    return (
      <div className="adela-r adela-resp adela-resp__portada">
        {cuestionario.descripcion && (
          <p className="adela-resp__descripcion">{cuestionario.descripcion}</p>
        )}
        <p className="adela-resp__meta">
          {total} preguntas, una por pantalla.
          {claveBorrador && ' Tu avance se guarda en este dispositivo.'}
        </p>
        {borrador ? (
          <div className="adela-resp__acciones">
            <button
              type="button"
              className="adela-btn adela-resp__btn-avanzar adela-resp__grande"
              onClick={() => empezar(false)}
            >
              Continuar en la pregunta {borrador.indice + 1}
            </button>
            <button
              type="button"
              className="adela-btn adela-resp__grande"
              onClick={() => empezar(true)}
            >
              Empezar de nuevo
            </button>
            <p className="adela-resp__nota">
              Llevas {guardadas} de {total} respondidas.
            </p>
          </div>
        ) : (
          <div className="adela-resp__acciones">
            <button
              type="button"
              className="adela-btn adela-resp__btn-avanzar adela-resp__grande"
              onClick={() => empezar(false)}
            >
              Empezar
            </button>
          </div>
        )}
        {rellenarDev}
      </div>
    )
  }

  const p = preguntas[indice]
  const ayuda = vista === 'pregunta' ? ayudaDe(p) : null
  const unicaSinResponder =
    p.formato === FORMATO.UNICA && p.obligatoria && vacia(indice)

  return (
    <div className="adela-r adela-resp" ref={raiz}>
      <div className="adela-resp__cabeza">
        <span className="adela-resp__contador">
          {vista === 'revision' ? (
            'Revisión final'
          ) : (
            <>
              Pregunta <b>{indice + 1}</b> de {total}
            </>
          )}
        </span>
        <div
          className="adela-resp__barra"
          role="progressbar"
          aria-label="Preguntas respondidas"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={completas}
        >
          <div
            className="adela-resp__relleno"
            style={{ clipPath: `inset(0 ${100 - progreso}% 0 0 round 999px)` }}
          />
        </div>
        <span className="adela-resp__estado">
          {completas}/{total}
          {claveBorrador && (
            <span
              title={
                guardado
                  ? 'Tus respuestas quedan en este dispositivo si sales o se va internet'
                  : 'El navegador no deja guardar (¿modo incógnito?)'
              }
              className={
                guardado ? 'adela-resp__guardado' : 'adela-resp__sin-guardar'
              }
            >
              {guardado ? 'Guardado' : 'Sin guardar: no cierres la página'}
            </span>
          )}
        </span>
        <button
          type="button"
          className="adela-btn adela-btn--sm adela-resp__ver"
          onClick={() => setMapa(true)}
        >
          Ver todas
        </button>
      </div>

      {recuperado && (
        <div className="adela-resp__aviso">
          Retomamos donde ibas: llevas {completas} de {total}.
          <button
            type="button"
            className="adela-resp__enlace"
            onClick={() => empezar(true)}
          >
            Empezar de nuevo
          </button>
        </div>
      )}

      <div
        className="adela-resp__escena"
        onPointerDown={alTocar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
      >
        {vista === 'pregunta' ? (
          <section
            key={indice}
            ref={paso}
            className={`adela-resp__paso adela-resp__paso--${dir}`}
          >
            <h2
              id={`enunciado-${p.id}`}
              ref={enunciado}
              tabIndex={-1}
              className={`adela-resp__enunciado${p.pregunta.length > 140 ? ' adela-resp__enunciado--largo' : ''}`}
            >
              {p.pregunta}
            </h2>
            {ayuda && <p className="adela-resp__ayuda">{ayuda}</p>}
            {control(p)}
          </section>
        ) : (
          <section
            key="revision"
            ref={paso}
            className={`adela-resp__paso adela-resp__paso--${dir} adela-resp__revision`}
          >
            {pendientes.length > 0 ? (
              <>
                <h2
                  ref={enunciado}
                  tabIndex={-1}
                  className="adela-resp__enunciado"
                >
                  {pendientes.length === 1
                    ? 'Te falta 1 pregunta'
                    : `Te faltan ${pendientes.length} preguntas`}
                </h2>
                <p className="adela-resp__ayuda">Toca una para responderla.</p>
                <div className="adela-resp__pendientes">
                  {pendientes.map((i) => (
                    <button
                      key={i}
                      type="button"
                      className="adela-resp__num adela-resp__num--falta"
                      onClick={() => irA(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <img
                  src={nelseFeliz}
                  alt=""
                  aria-hidden="true"
                  className="adela-resp__nelse"
                />
                <h2
                  ref={enunciado}
                  tabIndex={-1}
                  className="adela-resp__enunciado"
                >
                  ¡Respondiste todo!
                </h2>
                <p className="adela-resp__ayuda">
                  Puedes revisar cualquier respuesta en «Ver todas» antes de
                  enviar.
                </p>
              </>
            )}
            {!enLinea && (
              <p className="adela-resp__aviso" role="status">
                Sin conexión a internet.
                {claveBorrador
                  ? ' Tus respuestas siguen guardadas en este dispositivo: envíalas cuando vuelva la conexión.'
                  : ' Envía cuando vuelva la conexión.'}
              </p>
            )}
            {lento && (
              <p className="adela-resp__aviso" role="status">
                La conexión está lenta. Seguimos intentando; no cierres la
                página.
              </p>
            )}
          </section>
        )}
      </div>

      <div className="adela-resp__pie">
        <button
          type="button"
          className="adela-btn adela-resp__nav"
          onClick={anterior}
          disabled={!puedeVolver || enviando}
        >
          ‹ Anterior
        </button>
        <span className="adela-resp__centro">
          <span className="adela-resp__teclas">
            <kbd>1</kbd>–<kbd>9</kbd> elegir · <kbd>Enter</kbd> seguir ·{' '}
            <kbd>←</kbd> volver
          </span>
          {rellenarDev}
        </span>
        {vista === 'revision' ? (
          <button
            type="button"
            className="adela-btn adela-resp__btn-enviar adela-resp__nav adela-resp__nav--principal"
            onClick={enviar}
            disabled={pendientes.length > 0 || enviando}
          >
            {enviando && <CSpinner size="sm" />}
            {enviando ? 'Enviando…' : 'Enviar respuestas'}
          </button>
        ) : unicaSinResponder ? (
          <span className="adela-resp__pista">Toca una opción</span>
        ) : (
          <button
            type="button"
            className="adela-btn adela-resp__btn-avanzar adela-resp__nav adela-resp__nav--principal"
            onClick={siguiente}
            disabled={errores[indice] !== null}
          >
            {errores[indice] !== null
              ? faltaDe(p, respuestas[indice])
              : vacia(indice)
                ? 'Omitir ›'
                : indice === total - 1 ||
                    destinoDesde(indice, respuestas) === 'revision'
                  ? 'Revisar y enviar ›'
                  : 'Siguiente ›'}
          </button>
        )}
      </div>

      {hito && (
        <div className="adela-resp__hito" role="status">
          <img src={nelseFeliz} alt="" aria-hidden="true" />
          {hito}
        </div>
      )}

      <CModal
        visible={mapa}
        onClose={() => setMapa(false)}
        alignment="center"
        scrollable
      >
        <CModalHeader>
          <CModalTitle>
            Llevas {completas} de {total}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="adela-r">
          <div className="adela-resp__mapa">
            {preguntas.map((pq, i) => (
              <button
                key={pq.id}
                type="button"
                className={`adela-resp__num ${lista(i) ? (omitida(i) ? 'adela-resp__num--omitida' : 'adela-resp__num--hecha') : ''} ${i === indice && vista === 'pregunta' ? 'adela-resp__num--actual' : ''}`}
                aria-label={`Pregunta ${i + 1}${omitida(i) ? ', omitida' : lista(i) ? ', respondida' : ''}`}
                onClick={() => irA(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="adela-resp__leyenda-mapa">
            <span className="adela-resp__ley adela-resp__ley--hecha">
              Respondida
            </span>
            <span className="adela-resp__ley adela-resp__ley--actual">
              Actual
            </span>
            {preguntas.some((_, i) => omitida(i)) && (
              <span className="adela-resp__ley adela-resp__ley--omitida">
                Omitida
              </span>
            )}
            <span className="adela-resp__ley">Sin responder</span>
          </div>
          <button
            type="button"
            className="adela-btn adela-resp__btn-avanzar adela-resp__grande mt-3 w-100 justify-content-center"
            onClick={() => {
              setMapa(false)
              mostrar('revision', 'sig')
            }}
          >
            Ir a revisión y enviar
          </button>
        </CModalBody>
      </CModal>
    </div>
  )
}

PreguntasCuestionario.propTypes = {
  cuestionario: PropTypes.shape({
    descripcion: PropTypes.string,
    preguntas: PropTypes.array.isRequired,
  }).isRequired,
  onEnviar: PropTypes.func.isRequired,
  enviando: PropTypes.bool,
  claveBorrador: PropTypes.string,
  portada: PropTypes.bool,
}

export default PreguntasCuestionario

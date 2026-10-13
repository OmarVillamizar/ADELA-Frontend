import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Swal from 'sweetalert2'
import { CProgress, CProgressBar, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilDescription } from '@coreui/icons'
import ListaErrores from '../ListaErrores'
import Nelse from '../Nelse'
import {
  cancelarTrabajo,
  crearTrabajo,
  estadoIa,
  refinarTrabajo,
} from '../../../../util/services/iaService'
import { borradorDesdeDTO, marcasDeErroresDuros } from '../importar/desdeDTO'
import { etiquetaDeCampo } from '../importar/marcas'
import {
  Faltantes,
  Lista,
  PuntosARevisar,
  Resumen,
  altasSinMarcar,
  plural,
} from '../importar/RevisionIA'
import useTrabajoIa from './useTrabajoIa'
import insigniaIa from '../../../../assets/images/adela_ia_badge.svg'
import '../crear.css'

const PASOS = ['Fuente', 'Leyendo', 'Lo que entendí', 'Revisar']
const MAX_INSTRUCCIONES = 4000
const MB = 1024 * 1024

// Lectura deseada: frases que el prompt reconoce como pedido del profesor.
const LECTURAS = [
  ['Solo puntajes', 'solo puntajes'],
  ['Niveles bajo, medio y alto', 'niveles (bajo/medio/alto)'],
  ['Estilo predominante', 'estilo predominante'],
  ['Perfil multimodal', 'perfil multimodal'],
  ['Dominancia por nivel', 'dominancia primaria/secundaria'],
  ['Cuadrantes de dos ejes', 'cuadrantes'],
]

const FASES = {
  LEYENDO: ['lee', 'Leyendo el documento…'],
  GENERANDO: ['piensa', 'Armando el cuestionario…'],
  VALIDANDO: ['anota', 'Revisando que cumpla las reglas de ADELA…'],
  CORRIGIENDO: ['anota', 'Corrigiendo lo que no cuadró…'],
  REFINANDO: ['piensa', 'Aplicando tus respuestas…'],
}

/** Errores de una respuesta del servidor como filas de ListaErrores. */
const erroresDe = (e, seccion) => {
  const campos = Object.entries(e?.fields ?? {})
  return campos.length > 0
    ? campos.map(([campo, mensaje]) => ({
        seccion: etiquetaDeCampo(campo),
        mensaje,
      }))
    : [{ seccion, mensaje: e?.message ?? 'Algo salió mal. Intenta de nuevo.' }]
}

/**
 * Crear un cuestionario con Nelse: la persona sube un PDF y/o describe el
 * cuestionario, el servidor lo genera como un trabajo que se consulta cada
 * 2 s, y el resultado pasa por la misma revisión que la importación antes de
 * abrirse en el editor. trabajoId vive en el borrador guardado, así que una
 * recarga retoma la consulta.
 */
const AsistenteIA = ({ trabajoId, onTrabajo, onListo, onVolver }) => {
  const { trabajo, error, reconsultar } = useTrabajoIa(trabajoId)
  const [limites, setLimites] = useState(null)
  const [archivo, setArchivo] = useState(null)
  const [instrucciones, setInstrucciones] = useState('')
  const [lectura, setLectura] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [errores, setErrores] = useState([])
  const [respuestas, setRespuestas] = useState({})
  const [nota, setNota] = useState('')
  const [esperandoAjuste, setEsperandoAjuste] = useState(false)
  const [enRevision, setEnRevision] = useState(false)
  const [hechas, setHechas] = useState(() => new Set())

  const cargarLimites = useCallback(() => {
    estadoIa()
      .then(setLimites)
      .catch(() => setLimites(null))
  }, [])

  useEffect(() => {
    if (!trabajoId) cargarLimites()
  }, [trabajoId, cargarLimites])

  // El ajuste ya arrancó en el servidor cuando la consulta lo devuelve marcado.
  useEffect(() => {
    if (trabajo?.refinado) setEsperandoAjuste(false)
  }, [trabajo?.refinado])

  const resultado = trabajo?.estado === 'LISTO' ? trabajo.resultado : null
  // undefined = el resultado llegó pero no se pudo convertir en borrador.
  const borrador = useMemo(() => {
    if (!resultado) return null
    try {
      return borradorDesdeDTO(
        resultado.cuestionario,
        resultado.analisis,
        [
          ...marcasDeErroresDuros(resultado.erroresDuros),
          ...(resultado.marcas ?? []),
        ],
        'NELSE',
      )
    } catch {
      return undefined
    }
  }, [resultado])

  // Un resultado nuevo (tras el ajuste) se revisa desde cero.
  useEffect(() => {
    setHechas(new Set())
    setEnRevision(false)
  }, [borrador])

  let paso = 0
  if (trabajoId) {
    if (borrador && !esperandoAjuste) paso = enRevision ? 3 : 2
    else paso = 1
  }

  const [arrastrando, setArrastrando] = useState(false)

  /** Valida y toma el PDF, venga del selector o de soltarlo sobre la zona. */
  const tomarArchivo = (elegido) => {
    setErrores([])
    if (!elegido) return
    if (!/\.pdf$/i.test(elegido.name) && elegido.type !== 'application/pdf') {
      setErrores([
        { seccion: 'Documento', mensaje: 'Solo se aceptan archivos PDF.' },
      ])
      return
    }
    const maxMb = limites?.maxMb ?? 15
    if (elegido.size > maxMb * MB) {
      setErrores([
        {
          seccion: 'Documento',
          mensaje: `El PDF supera el máximo de ${maxMb} MB.`,
        },
      ])
      return
    }
    setArchivo(elegido)
  }

  const elegirArchivo = (e) => {
    const elegido = e.target.files?.[0]
    e.target.value = ''
    tomarArchivo(elegido)
  }

  const soltarArchivo = (e) => {
    e.preventDefault()
    setArrastrando(false)
    tomarArchivo(e.dataTransfer.files?.[0])
  }

  const generar = async () => {
    setEnviando(true)
    setErrores([])
    const texto = [
      instrucciones.trim(),
      lectura && `Lectura deseada: ${lectura}.`,
    ]
      .filter(Boolean)
      .join('\n\n')
    try {
      onTrabajo(await crearTrabajo(archivo, texto))
      setRespuestas({})
      setNota('')
    } catch (e) {
      setErrores(erroresDe(e, 'Nelse'))
      cargarLimites()
    } finally {
      setEnviando(false)
    }
  }

  const cancelar = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Detener a Nelse?',
      text: 'Se descarta lo que lleva. La generación ya cuenta para tu cupo de hoy.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Detener',
      cancelButtonText: 'Seguir esperando',
    })
    if (!isConfirmed) return
    cancelarTrabajo(trabajoId).catch(() => {})
    onTrabajo(null)
  }

  const descartar = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Descartar este resultado?',
      text: 'Volverás a la fuente para generar otro. Contará como una generación nueva.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Descartar',
      cancelButtonText: 'Cancelar',
    })
    if (isConfirmed) onTrabajo(null)
  }

  const preguntas =
    trabajo?.preguntasAlProfesor ??
    borrador?.ia.resumen?.preguntasAlProfesor ??
    []
  const solicitud = {
    respuestas: preguntas
      .map((pregunta, i) => ({
        pregunta,
        respuesta: (respuestas[i] ?? '').trim(),
      }))
      .filter((r) => r.respuesta),
    texto: nota.trim() || undefined,
  }
  const hayAjuste = solicitud.respuestas.length > 0 || Boolean(solicitud.texto)

  const ajustar = async () => {
    setEnviando(true)
    setErrores([])
    try {
      await refinarTrabajo(trabajoId, solicitud)
      setEsperandoAjuste(true)
      reconsultar()
    } catch (e) {
      setErrores(erroresDe(e, 'Ajuste'))
    } finally {
      setEnviando(false)
    }
  }

  const marcar = (id, valor) =>
    setHechas((previas) => {
      const nuevas = new Set(previas)
      if (valor) nuevas.add(id)
      else nuevas.delete(id)
      return nuevas
    })

  const resumen = borrador?.ia.resumen
  const marcas = borrador?.ia.marcas ?? []
  const faltanAltas = altasSinMarcar(borrador, hechas)
  const duros = Object.entries(resultado?.erroresDuros ?? {}).map(
    ([campo, mensaje]) => ({ seccion: etiquetaDeCampo(campo), mensaje }),
  )

  let guia
  let cuerpo
  if (paso === 0) {
    const sinCupo = limites?.cuotaRestante === 0
    guia = {
      pose: 'feliz',
      titulo: 'Dame tu documento',
      texto:
        'Sube el PDF del cuestionario (con texto o escaneado) y, si quieres, cuéntame cómo lo necesitas. Si no tienes documento, descríbelo y yo lo armo.',
    }
    cuerpo = (
      <>
        <h3 className="adela-panel__titulo">De dónde parto</h3>
        <p className="adela-panel__nota mb-3">
          {limites
            ? `Necesitas un PDF, instrucciones o ambos. Te ${limites.cuotaRestante === 1 ? 'queda 1 generación' : `quedan ${limites.cuotaRestante} generaciones`} hoy.`
            : 'Necesitas un PDF, instrucciones o ambos.'}
        </p>
        {archivo ? (
          <div className="adela-subida adela-subida--lista mb-3">
            <CIcon icon={cilDescription} size="xl" aria-hidden="true" />
            <div className="adela-subida__archivo">
              <strong>{archivo.name}</strong>
              <span className="adela-falta">
                {(archivo.size / MB).toFixed(1)} MB · listo para enviar
              </span>
            </div>
            <label className="adela-btn adela-btn--sm adela-archivo">
              Cambiar
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={elegirArchivo}
              />
            </label>
            <button
              type="button"
              className="adela-btn adela-btn--sm"
              onClick={() => setArchivo(null)}
            >
              Quitar
            </button>
          </div>
        ) : (
          <label
            className={`adela-subida mb-3 ${arrastrando ? 'adela-subida--encima' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setArrastrando(true)
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={soltarArchivo}
          >
            <CIcon icon={cilCloudUpload} size="3xl" aria-hidden="true" />
            <strong>Haz clic para elegir tu PDF o arrástralo aquí</strong>
            <span className="adela-falta">
              Con texto o escaneado
              {limites
                ? ` · hasta ${limites.maxMb} MB y ${limites.maxPaginas} páginas`
                : ''}
              . Opcional si escribes instrucciones.
            </span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={elegirArchivo}
            />
          </label>
        )}
        <label className="adela-campo">
          <span>Instrucciones (opcional)</span>
          <textarea
            className="adela-input"
            rows={5}
            maxLength={MAX_INSTRUCCIONES}
            placeholder="Ej.: Usa solo la forma de 20 ítems. Es para estudiantes de primer semestre."
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
          />
        </label>
        <p className="adela-ayuda">
          {instrucciones.length}/{MAX_INSTRUCCIONES} caracteres
        </p>
        <strong className="d-block mt-3 mb-1">
          ¿Cómo quieres leer los resultados?
        </strong>
        <div className="adela-chips">
          <button
            type="button"
            className="adela-chip-btn"
            aria-pressed={lectura === null}
            onClick={() => setLectura(null)}
          >
            Basado en el documento
          </button>
          {LECTURAS.map(([nombre, frase]) => (
            <button
              key={frase}
              type="button"
              className="adela-chip-btn"
              aria-pressed={lectura === frase}
              onClick={() => setLectura(frase)}
            >
              {nombre}
            </button>
          ))}
        </div>
        {sinCupo && (
          <div className="adela-aviso mt-3">
            Ya usaste todas las generaciones de hoy. Mañana tendrás más;
            mientras tanto puedes usar «Con tu propia IA».
          </div>
        )}
        <div className="mt-3">
          <ListaErrores errores={errores} />
        </div>
      </>
    )
  } else if (paso === 1) {
    const fallido =
      trabajo?.estado === 'FALLIDO' || error || borrador === undefined
    const [pose, texto] = FASES[trabajo?.fase] ?? ['lee', 'Preparando…']
    guia = fallido
      ? {
          pose: 'piensa',
          titulo: 'No pude terminar',
          texto:
            'Puedes intentarlo de nuevo, quizá con otro PDF o con más detalle en las instrucciones.',
        }
      : {
          pose,
          titulo: texto,
          texto:
            'Suele tardar entre uno y dos minutos. Puedes salir de esta página y volver: sigo trabajando.',
        }
    cuerpo = fallido ? (
      <>
        <h3 className="adela-panel__titulo mb-3">No se pudo generar</h3>
        <div className="adela-errores" role="alert">
          {trabajo?.error?.mensaje ??
            error?.mensaje ??
            'No pude abrir el resultado en el editor. Intenta generarlo de nuevo.'}{' '}
          {error && !error.perdido && (
            <button type="button" onClick={reconsultar}>
              Reintentar la consulta
            </button>
          )}
        </div>
      </>
    ) : (
      <>
        <h3 className="adela-panel__titulo mb-3">{texto}</h3>
        <CProgress className="mb-2">
          <CProgressBar value={trabajo?.progreso ?? 0} animated />
        </CProgress>
        <p className="adela-panel__nota">
          {trabajo ? `${trabajo.progreso} %` : <CSpinner size="sm" />}
        </p>
      </>
    )
  } else if (paso === 2) {
    guia = {
      pose: 'reporte',
      titulo: 'Esto es lo que entendí',
      texto:
        preguntas.length > 0 && !trabajo.refinado
          ? 'Me quedaron dudas: si las respondes, lo rehago una vez con tus respuestas. También puedes continuar así y corregir en el editor.'
          : 'Revisa que sea lo que esperabas antes de pasar a los puntos a revisar.',
    }
    cuerpo = (
      <>
        {trabajo.aviso && (
          <div className="adela-aviso mb-3">{trabajo.aviso}</div>
        )}
        {duros.length > 0 && (
          <>
            <ListaErrores errores={duros} />
            <div className="adela-aviso mb-3">
              Quedaron {plural(duros.length, 'problema', 'problemas')} que el
              servidor no aceptaría. Se marcarán en el editor para que los
              corrijas.
            </div>
          </>
        )}
        <h3 className="adela-panel__titulo mb-3">Lo que se armó</h3>
        <Resumen borrador={borrador} />
        <Faltantes resumen={resumen} />
        {trabajo.refinado ? (
          <Lista titulo="Dudas que quedaron" items={preguntas} />
        ) : (
          <>
            <h3 className="adela-panel__titulo mt-4">
              Rehacer con tus respuestas (una sola vez)
            </h3>
            {preguntas.map((pregunta, i) => (
              <label key={i} className="adela-campo">
                <span>{pregunta}</span>
                <textarea
                  className="adela-input"
                  rows={2}
                  value={respuestas[i] ?? ''}
                  onChange={(e) =>
                    setRespuestas((r) => ({ ...r, [i]: e.target.value }))
                  }
                />
              </label>
            ))}
            <label className="adela-campo">
              <span>
                {preguntas.length > 0
                  ? 'Algo más (opcional)'
                  : '¿Algo que cambiar?'}
              </span>
              <textarea
                className="adela-input"
                rows={2}
                maxLength={MAX_INSTRUCCIONES}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
            </label>
            <div className="mt-2">
              <ListaErrores errores={errores} />
            </div>
          </>
        )}
      </>
    )
  } else {
    guia = {
      pose: 'anota',
      titulo: 'Revisa lo que marqué',
      texto:
        'Marca cada punto de riesgo alto cuando lo hayas comprobado contra tu documento: ahí es donde más fácil se cuela un error.',
    }
    cuerpo = (
      <PuntosARevisar marcas={marcas} hechas={hechas} onMarcar={marcar} />
    )
  }

  const falta =
    paso === 3 && faltanAltas > 0
      ? `Marca ${plural(faltanAltas, 'punto', 'puntos')} de riesgo alto para continuar.`
      : null

  let atras
  if (paso === 0) atras = onVolver
  else if (paso === 1)
    atras = trabajo?.estado === 'EN_CURSO' ? cancelar : () => onTrabajo(null)
  else if (paso === 2) atras = descartar
  else atras = () => setEnRevision(false)

  return (
    <>
      <ol className="adela-pasos" aria-label="Pasos con Nelse">
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

      <Nelse pose={guia.pose} titulo={guia.titulo}>
        <p>{guia.texto}</p>
      </Nelse>

      <div className="adela-panel">{cuerpo}</div>

      <div className="adela-navegacion">
        <button type="button" className="adela-btn" onClick={atras}>
          {paso === 1 && trabajo?.estado === 'EN_CURSO'
            ? 'Detener'
            : paso === 1
              ? 'Volver a la fuente'
              : paso === 2
                ? 'Descartar'
                : 'Atrás'}
        </button>
        <div className="adela-fila">
          {falta && <span className="adela-falta">{falta}</span>}
          {paso === 0 && (
            <button
              type="button"
              className="adela-btn adela-btn--nelse"
              disabled={
                enviando ||
                limites?.cuotaRestante === 0 ||
                (!archivo && !instrucciones.trim())
              }
              onClick={generar}
            >
              {enviando ? 'Enviando…' : 'Generar con Nelse'}
            </button>
          )}
          {paso === 0 && (
            <img
              className="adela-insignia-ia"
              src={insigniaIa}
              alt="Impulsado por inteligencia artificial"
            />
          )}
          {paso === 2 && (
            <>
              {!trabajo.refinado && (
                <button
                  type="button"
                  className="adela-btn adela-btn--celeste"
                  disabled={enviando || !hayAjuste}
                  onClick={ajustar}
                >
                  {enviando ? 'Enviando…' : 'Rehacer con mis respuestas'}
                </button>
              )}
              <button
                type="button"
                className="adela-btn adela-btn--primario"
                onClick={() => setEnRevision(true)}
              >
                Continuar
              </button>
            </>
          )}
          {paso === 3 && (
            <button
              type="button"
              className="adela-btn adela-btn--primario"
              disabled={faltanAltas > 0}
              onClick={() =>
                onListo({
                  ...borrador,
                  ia: { ...borrador.ia, revisadas: [...hechas] },
                })
              }
            >
              Abrir en el editor
            </button>
          )}
        </div>
      </div>
    </>
  )
}

AsistenteIA.propTypes = {
  trabajoId: PropTypes.string,
  onTrabajo: PropTypes.func.isRequired,
  onListo: PropTypes.func.isRequired,
  onVolver: PropTypes.func.isRequired,
}

export default AsistenteIA

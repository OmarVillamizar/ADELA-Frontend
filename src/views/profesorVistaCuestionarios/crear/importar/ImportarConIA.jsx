import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CSpinner } from '@coreui/react'
import ListaErrores from '../ListaErrores'
import Nelse from '../Nelse'
import {
  obtenerInstrucciones,
  validarImportacion,
} from '../../../../util/services/importacionService'
import { ApiError } from '../../../../util/services/ApiError'
import { borradorDesdeDTO, marcasDeErroresDuros } from './desdeDTO'
import { etiquetaDeCampo } from './marcas'
import {
  Faltantes,
  Lista,
  PuntosARevisar,
  Resumen,
  altasSinMarcar,
  plural,
} from './RevisionIA'
import '../crear.css'

const PASOS = ['Instrucciones', 'Tu JSON', 'Revisión']
const NOMBRE_ARCHIVO = 'instrucciones-adela-cuestionario.md'
const MAX_ARCHIVO = 2 * 1024 * 1024

const mensajeInstrucciones = (e) => {
  if (e?.status === 403) return 'Solo un administrador puede usar esta opción.'
  if (e?.status === 0) return e.message
  return 'No se pudieron cargar las instrucciones. Intenta de nuevo.'
}

/**
 * Importar un cuestionario hecho con la IA de la persona: copia las
 * instrucciones, pega el JSON que le devuelve, revisa lo que se marcó y abre
 * el resultado en el editor avanzado. onListo recibe el borrador armado.
 */
const ImportarConIA = ({ onListo, onVolver }) => {
  const [paso, setPaso] = useState(0)
  const [instrucciones, setInstrucciones] = useState({
    estado: 'cargando',
    texto: '',
    error: '',
  })
  const [aviso, setAviso] = useState(null)
  const [json, setJson] = useState('')
  const [revisando, setRevisando] = useState(false)
  const [errores, setErrores] = useState([])
  const [resultado, setResultado] = useState(null)
  const [hechas, setHechas] = useState(() => new Set())
  const vista = useRef(null)
  const area = useRef(null)

  const cargar = useCallback(() => {
    setInstrucciones({ estado: 'cargando', texto: '', error: '' })
    obtenerInstrucciones()
      .then((texto) => setInstrucciones({ estado: 'listo', texto, error: '' }))
      .catch((e) =>
        setInstrucciones({
          estado: 'error',
          texto: '',
          error: mensajeInstrucciones(e),
        }),
      )
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const avisar = (tipo) => {
    setAviso(tipo)
    setTimeout(() => setAviso(null), 5000)
  }

  /** Alternativa sin portapapeles: deja el texto seleccionado para Ctrl+C. */
  const seleccionar = () => {
    if (vista.current) vista.current.open = true
    area.current?.focus()
    area.current?.select()
    let copiado = false
    try {
      copiado = document.execCommand('copy')
    } catch {
      copiado = false
    }
    avisar(copiado ? 'copiado' : 'manual')
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(instrucciones.texto)
      avisar('copiado')
    } catch {
      seleccionar()
    }
  }

  const descargar = () => {
    const url = URL.createObjectURL(
      new Blob([instrucciones.texto], { type: 'text/markdown;charset=utf-8' }),
    )
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = NOMBRE_ARCHIVO
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    URL.revokeObjectURL(url)
  }

  const cambiarJson = (texto) => {
    setJson(texto)
    setErrores([])
    setResultado(null)
  }

  const leerArchivo = async (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    if (archivo.size > MAX_ARCHIVO) {
      setErrores([
        {
          seccion: 'Tu JSON',
          mensaje: 'El archivo es demasiado grande para ser un cuestionario.',
        },
      ])
      return
    }
    try {
      cambiarJson(await archivo.text())
    } catch {
      setErrores([
        { seccion: 'Tu JSON', mensaje: 'No se pudo leer el archivo.' },
      ])
    }
  }

  const revisar = async () => {
    setRevisando(true)
    setErrores([])
    setResultado(null)
    setHechas(new Set())
    try {
      const r = await validarImportacion(json)
      const duros = Object.entries(r.erroresDuros ?? {}).map(
        ([campo, mensaje]) => ({
          seccion: etiquetaDeCampo(campo),
          mensaje,
        }),
      )
      if (!r.cuestionario) {
        setErrores(
          duros.length > 0
            ? duros
            : [
                {
                  seccion: 'Tu JSON',
                  mensaje: 'No encontré un cuestionario en lo que pegaste.',
                },
              ],
        )
        return
      }
      const borrador = borradorDesdeDTO(
        r.cuestionario,
        r.analisis,
        [...marcasDeErroresDuros(r.erroresDuros), ...(r.marcas ?? [])],
        'EXTERNA',
      )
      setResultado({ borrador, duros })
      if (duros.length === 0) setPaso(2)
    } catch (e) {
      const campos = e instanceof ApiError ? Object.entries(e.fields ?? {}) : []
      setErrores(
        campos.length > 0
          ? campos.map(([campo, mensaje]) => ({
              seccion: etiquetaDeCampo(campo),
              mensaje,
            }))
          : [
              {
                seccion: 'Tu JSON',
                mensaje:
                  e instanceof ApiError
                    ? e.message
                    : 'No se pudo armar el cuestionario con ese JSON.',
              },
            ],
      )
    } finally {
      setRevisando(false)
    }
  }

  const marcar = (id, valor) =>
    setHechas((previas) => {
      const nuevas = new Set(previas)
      if (valor) nuevas.add(id)
      else nuevas.delete(id)
      return nuevas
    })

  const borrador = resultado?.borrador
  const marcas = borrador?.ia.marcas ?? []
  const faltanAltas = altasSinMarcar(borrador, hechas)
  const resumen = borrador?.ia.resumen

  let guia
  let cuerpo
  if (paso === 0) {
    guia = {
      pose: 'feliz',
      titulo: 'Copia las instrucciones',
      texto:
        'Dáselas a la IA que uses a diario (ChatGPT, Claude, Gemini…) junto con tu documento o tu investigación. Ella te hará las preguntas que falten y te devolverá un cuestionario para traer aquí.',
    }
    cuerpo = (
      <>
        <h3 className="adela-panel__titulo">Instrucciones para tu IA</h3>
        <p className="adela-panel__nota mb-3">
          Son las mismas reglas que sigue ADELA para armar un cuestionario.
        </p>
        {instrucciones.estado === 'cargando' && (
          <div className="adela-falta">
            <CSpinner size="sm" /> Cargando las instrucciones…
          </div>
        )}
        {instrucciones.estado === 'error' && (
          <div className="adela-errores" role="alert">
            {instrucciones.error}{' '}
            <button type="button" onClick={cargar}>
              Reintentar
            </button>
          </div>
        )}
        <div className="adela-fila mb-2">
          <button
            type="button"
            className="adela-btn adela-btn--primario"
            disabled={instrucciones.estado !== 'listo'}
            onClick={copiar}
          >
            Copiar al portapapeles
          </button>
          <button
            type="button"
            className="adela-btn"
            disabled={instrucciones.estado !== 'listo'}
            onClick={descargar}
          >
            Descargar .md
          </button>
          <span role="status" className="adela-falta">
            {aviso === 'copiado' && '¡Copiado!'}
            {aviso === 'manual' &&
              'No pude copiarlo solo: quedó seleccionado, presiona Ctrl+C.'}
          </span>
        </div>
        <ol className="adela-lista mb-3">
          <li>
            Copia las instrucciones (o descárgalas) y pégalas al empezar un chat
            nuevo con tu IA.
          </li>
          <li>
            Envíale tu documento o cuéntale tu investigación; te preguntará solo
            lo que falte.
          </li>
          <li>
            Al final te dará un bloque con un JSON. Cópialo y tráelo en el
            siguiente paso.
          </li>
        </ol>
        <details ref={vista} className="adela-seccion">
          <summary>
            <strong>Ver las instrucciones</strong>
          </summary>
          <textarea
            ref={area}
            className="adela-input adela-json"
            readOnly
            rows={12}
            aria-label="Instrucciones para tu IA"
            value={instrucciones.texto}
          />
        </details>
      </>
    )
  } else if (paso === 1) {
    guia = {
      pose: 'lee',
      titulo: 'Trae tu JSON',
      texto:
        'Pega aquí lo que te dio tu IA, o sube el archivo. No hace falta limpiarlo: si viene con texto alrededor, yo lo busco.',
    }
    cuerpo = (
      <>
        <label className="adela-campo">
          <span>Lo que te dio tu IA</span>
          <textarea
            className="adela-input adela-json"
            rows={12}
            spellCheck={false}
            placeholder="Pega aquí el JSON…"
            value={json}
            onChange={(e) => cambiarJson(e.target.value)}
          />
        </label>
        <div className="adela-fila mt-2">
          <label className="adela-btn adela-btn--sm adela-archivo">
            Subir un archivo
            <input
              type="file"
              accept=".json,.txt,.md,application/json,text/plain,text/markdown"
              onChange={leerArchivo}
            />
          </label>
          <span className="adela-falta">.json, .txt o .md</span>
        </div>
        {revisando && (
          <div className="adela-falta mt-3">
            <CSpinner size="sm" /> Revisando tu cuestionario…
          </div>
        )}
        <div className="mt-3">
          <ListaErrores errores={errores} />
        </div>
        {resultado && resultado.duros.length > 0 && (
          <>
            <ListaErrores errores={resultado.duros} />
            <div className="adela-aviso">
              Armé el cuestionario, pero encontré{' '}
              {plural(resultado.duros.length, 'problema', 'problemas')} que el
              servidor no aceptaría. Puedes continuar: se marcarán en el editor
              para que los corrijas.
            </div>
          </>
        )}
      </>
    )
  } else {
    guia = {
      pose: 'reporte',
      titulo: 'Revisa lo que marcó',
      texto:
        'Esto es lo que entendí de tu cuestionario. Marca cada punto de riesgo alto cuando lo hayas comprobado: ahí es donde más fácil se cuela un error.',
    }
    cuerpo = (
      <>
        <h3 className="adela-panel__titulo mb-3">Lo que se armó</h3>
        <Resumen borrador={borrador} />
        <Faltantes resumen={resumen} />
        <Lista
          titulo="Tu IA dejó estas dudas"
          items={resumen?.preguntasAlProfesor ?? []}
        />
        <PuntosARevisar marcas={marcas} hechas={hechas} onMarcar={marcar} />
      </>
    )
  }

  const falta =
    paso === 2 && faltanAltas > 0
      ? `Marca ${plural(faltanAltas, 'punto', 'puntos')} de riesgo alto para continuar.`
      : null

  return (
    <>
      <ol className="adela-pasos" aria-label="Pasos de la importación">
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
        <button
          type="button"
          className="adela-btn"
          onClick={() => (paso === 0 ? onVolver() : setPaso(paso - 1))}
        >
          Atrás
        </button>
        <div className="adela-fila">
          {falta && <span className="adela-falta">{falta}</span>}
          {paso === 0 && (
            <button
              type="button"
              className="adela-btn adela-btn--primario"
              onClick={() => setPaso(1)}
            >
              Siguiente
            </button>
          )}
          {paso === 1 && (
            <>
              <button
                type="button"
                className={`adela-btn ${resultado ? '' : 'adela-btn--primario'}`}
                disabled={revisando || !json.trim()}
                onClick={revisar}
              >
                {revisando ? 'Revisando…' : 'Revisar'}
              </button>
              {resultado && (
                <button
                  type="button"
                  className="adela-btn adela-btn--primario"
                  onClick={() => setPaso(2)}
                >
                  Continuar
                </button>
              )}
            </>
          )}
          {paso === 2 && (
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

ImportarConIA.propTypes = {
  onListo: PropTypes.func.isRequired,
  onVolver: PropTypes.func.isRequired,
}

export default ImportarConIA

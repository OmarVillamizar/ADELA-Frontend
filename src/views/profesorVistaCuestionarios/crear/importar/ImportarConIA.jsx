import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CSpinner } from '@coreui/react'
import ListaErrores from '../ListaErrores'
import Nelse from '../Nelse'
import { MODELOS } from '../asistente/modelos'
import { primarios } from '../borrador'
import {
  obtenerInstrucciones,
  validarImportacion,
} from '../../../../util/services/importacionService'
import { ApiError } from '../../../../util/services/ApiError'
import { borradorDesdeDTO, marcasDeErroresDuros } from './desdeDTO'
import FilaMarca from './FilaMarca'
import { etiquetaDeCampo } from './marcas'
import '../crear.css'

const PASOS = ['Instrucciones', 'Tu JSON', 'Revisión']
const NOMBRE_ARCHIVO = 'instrucciones-adela-cuestionario.md'
const MAX_ARCHIVO = 2 * 1024 * 1024

// Cómo se leerán los resultados, según el esquema con el que queda el borrador.
const TEXTO_LECTURA = {
  NINGUNA: 'Se mostrarán solo los puntajes, sin destacar ningún estilo.',
  BAREMO: 'Cada estilo recibirá el nivel cuyo rango contiene su puntaje.',
  RELATIVO:
    'Se destacará el estilo predominante y los que queden muy cerca de él.',
  RELATIVO_ESCALONADO:
    'El perfil reunirá los estilos que queden cerca del más alto; la tolerancia crece con el total de marcas.',
  CUADRANTES:
    'Se cruzarán dos ejes y cada persona recibirá el estilo de la esquina donde caiga.',
  NIVEL_SUPERIOR:
    'Dominarán los estilos que lleguen a su nivel más alto (simple, doble, triple o cuádruple).',
}
const NOMBRE_ESQUEMA = {
  NINGUNA: 'Solo puntajes',
  BAREMO: 'Niveles por tabla',
  RELATIVO: 'Predominante',
  RELATIVO_ESCALONADO: 'Perfil escalonado',
  CUADRANTES: 'Cuadrantes',
  NIVEL_SUPERIOR: 'Dominancia por nivel',
}

// De dónde salió cada parte del cuestionario, y cuánto hay que confiar en ella.
const PARTES = {
  items: 'Preguntas',
  clave: 'Clave de puntaje',
  compuestos: 'Estilos combinados',
  bandas: 'Niveles',
  escalones: 'Escalones',
  plano: 'Mapa',
  complementaria: 'Pregunta extra',
}
const ORIGEN = {
  DOCUMENTO: ['Del documento', 'adela-chip--ok'],
  PROFESOR: ['Lo indicaste tú', 'adela-chip--ok'],
  CATALOGO: ['Instrumento conocido', 'adela-chip--ok'],
  CONVENCION: ['Regla de ADELA', ''],
  INFERIDO: ['Deducido', 'adela-chip--aviso'],
  GENERADO: ['Creado por la IA', 'adela-chip--aviso'],
  VACIO: ['Vacío', ''],
}

const mensajeInstrucciones = (e) => {
  if (e?.status === 403) return 'Solo un administrador puede usar esta opción.'
  if (e?.status === 0) return e.message
  return 'No se pudieron cargar las instrucciones. Intenta de nuevo.'
}

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`

/** Lo que se armó con el JSON, en palabras llanas. */
const Resumen = ({ borrador }) => {
  const { resumen } = borrador.ia
  const esquema = borrador.interpretacion.esquema
  const modelo = MODELOS.find((m) => m.id === resumen?.modeloAsistente)
  const lectura = resumen?.lectura
  const combinados = borrador.estilos.length - primarios(borrador).length
  return (
    <div className="adela-item mb-3">
      <p className="m-0">
        <strong>Se armó con:</strong>{' '}
        {plural(borrador.preguntas.length, 'pregunta', 'preguntas')},{' '}
        {plural(primarios(borrador).length, 'estilo', 'estilos')}
        {combinados > 0 &&
          ` y ${plural(combinados, 'estilo combinado', 'estilos combinados')}`}
        .
      </p>
      <p className="mt-2 mb-0">
        <strong>Cómo se leerán los resultados:</strong>{' '}
        {NOMBRE_ESQUEMA[esquema] ?? esquema}. {TEXTO_LECTURA[esquema]}
      </p>
      {modelo && (
        <p className="adela-ayuda">
          Se parece al modelo guía «{modelo.nombre}» del asistente.
        </p>
      )}
      {lectura?.motivo && <p className="adela-ayuda">{lectura.motivo}</p>}
      {lectura?.sugerencia && (
        <p className="adela-ayuda">Sugerencia: {lectura.sugerencia}</p>
      )}
      {(lectura?.descartados ?? []).map((d, i) => (
        <p key={i} className="adela-ayuda">
          Se descartó «{NOMBRE_ESQUEMA[d.esquema] ?? d.esquema}»: {d.porque}
        </p>
      ))}
      {resumen?.origen && (
        <div className="adela-chips mt-2">
          {Object.entries(PARTES)
            .filter(([k]) => ORIGEN[resumen.origen[k]])
            .map(([k, texto]) => (
              <span
                key={k}
                className={`adela-chip ${ORIGEN[resumen.origen[k]][1]}`}
              >
                {texto}: {ORIGEN[resumen.origen[k]][0]}
              </span>
            ))}
        </div>
      )}
    </div>
  )
}

Resumen.propTypes = { borrador: PropTypes.object.isRequired }

/** Una lista con título; no se dibuja si está vacía. */
const Lista = ({ titulo, items }) =>
  items.length === 0 ? null : (
    <div className="mb-3">
      <strong className="d-block mb-1">{titulo}</strong>
      <ul className="adela-lista">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  )

Lista.propTypes = {
  titulo: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.node).isRequired,
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
  const faltanAltas = marcas.filter(
    (m) => m.riesgo === 'ALTO' && !hechas.has(m.id),
  ).length
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
        <Lista titulo="Lo que faltó" items={resumen?.faltantes ?? []} />
        <Lista
          titulo="Lo que no se pudo incluir"
          items={(resumen?.noSoportado ?? []).map((n) => (
            <span key={n.que}>
              {n.que}
              {n.resolucion && ` — ${n.resolucion}`}
            </span>
          ))}
        />
        <Lista
          titulo="Tu IA dejó estas dudas"
          items={resumen?.preguntasAlProfesor ?? []}
        />
        <h3 className="adela-panel__titulo mt-4">Puntos a revisar</h3>
        {marcas.length === 0 ? (
          <p className="adela-panel__nota">
            Nada quedó marcado. Aun así, revisa el cuestionario en el editor
            antes de crearlo.
          </p>
        ) : (
          <>
            <p className="adela-panel__nota mb-3">
              Los de riesgo alto son obligatorios; los demás puedes marcarlos
              después, en el editor.
            </p>
            <ul className="adela-marcas">
              {marcas.map((m) => (
                <FilaMarca
                  key={m.id}
                  marca={m}
                  hecha={hechas.has(m.id)}
                  onCambiar={(valor) => marcar(m.id, valor)}
                />
              ))}
            </ul>
          </>
        )}
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

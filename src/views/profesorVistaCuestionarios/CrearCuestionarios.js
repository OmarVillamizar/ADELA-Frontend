import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { crearCuestionario } from '../../util/services/cuestionarioService'
import { estadoIa } from '../../util/services/iaService'
import { useAuth } from '../../util/auth/AuthProvider'
import { Roles, getRole } from '../../util/userUtils'
import useBorrador from './crear/useBorrador'
import EditorAvanzado from './crear/avanzado/EditorAvanzado'
import Asistente from './crear/asistente/Asistente'
import ImportarConIA from './crear/importar/ImportarConIA'
import AsistenteIA from './crear/ia/AsistenteIA'
import { altasPendientes } from './crear/importar/marcas'
import ListaErrores from './crear/ListaErrores'
import Nelse from './crear/Nelse'
import { aDTO, tieneContenido, validarBorrador } from './crear/borrador'
import '../../components/resultados/resultados.css'
import './crear/crear.css'

/** Sección del formulario a la que pertenece un campo de error del servidor. */
const seccionDeCampo = (campo) => {
  if (campo.startsWith('estilos')) return 'estilos'
  if (campo.startsWith('preguntas')) return 'preguntas'
  if (/^(bandas|escalones|esquema|delta|plano)/.test(campo))
    return 'interpretacion'
  return 'datos'
}

/**
 * Crear un cuestionario. El borrador se guarda en el navegador mientras se
 * edita, así que salir o recargar no pierde lo escrito.
 */
const CrearCuestionarios = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  // Importar con IA exige el mismo rol que el servidor pide para sus rutas.
  let esAdmin = false
  try {
    esAdmin = Boolean(user) && getRole(user) === Roles.ADMINISTRADOR
  } catch {
    esAdmin = false
  }
  const { borrador, actualizar, descartar } = useBorrador()
  const [reanudar, setReanudar] = useState(() => tieneContenido(borrador))
  const [intentado, setIntentado] = useState(false)
  const [creando, setCreando] = useState(false)
  const [erroresServidor, setErroresServidor] = useState([])
  const errores = useMemo(() => validarBorrador(borrador), [borrador])
  // Nelse solo se ofrece si el servidor tiene la IA encendida y con llave.
  const [nelse, setNelse] = useState(false)

  useEffect(() => {
    if (!esAdmin) return
    estadoIa()
      .then((e) => setNelse(Boolean(e.habilitada)))
      .catch(() => setNelse(false))
  }, [esAdmin])

  const empezar = (modo) => actualizar((b) => ({ ...b, modo }))

  const empezarDeNuevo = () => {
    descartar()
    setReanudar(false)
    setIntentado(false)
    setErroresServidor([])
  }

  const crear = async () => {
    setIntentado(true)
    setErroresServidor([])
    if (errores.length > 0) return
    // Importado con IA: nada de riesgo alto puede quedar sin revisar.
    const sinRevisar = altasPendientes(borrador)
    if (sinRevisar.length > 0) {
      // Los textos de las marcas vienen del análisis: solo como texto, nunca html.
      await Swal.fire({
        title: 'Faltan puntos por revisar',
        text: `Marca como revisados estos puntos de riesgo alto antes de crear: ${sinRevisar
          .map((m, i) => `(${i + 1}) ${m.mensaje}`)
          .join(' ')}`,
        icon: 'warning',
        confirmButtonText: 'Entendido',
      })
      return
    }
    const { isConfirmed } = await Swal.fire({
      title: '¿Crear el cuestionario?',
      text: 'Después de creado no se podrán cambiar sus preguntas ni sus estilos. La lectura de resultados sí se puede ajustar más adelante.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Seguir editando',
    })
    if (!isConfirmed) return
    setCreando(true)
    try {
      await crearCuestionario(aDTO(borrador))
      descartar()
      await Swal.fire('Cuestionario creado', '', 'success')
      navigate('/administrar-cuestionarios')
    } catch (e) {
      const campos = Object.entries(e.fields ?? {})
      setErroresServidor(
        campos.length > 0
          ? campos.map(([campo, mensaje]) => ({
              seccion: seccionDeCampo(campo),
              mensaje,
            }))
          : [{ seccion: 'servidor', mensaje: e.message }],
      )
    } finally {
      setCreando(false)
    }
  }

  const salir = () => {
    navigate('/administrar-cuestionarios')
  }

  const cabecera = (
    <div className="adela-r__bar mb-3">
      <div>
        <h2>Crear cuestionario</h2>
        {borrador.modo && (
          <p className="adela-r__subtitulo m-0">
            {borrador.modo === 'IMPORTAR'
              ? 'Con tu propia IA'
              : borrador.modo === 'NELSE'
                ? 'Con Nelse'
                : `Modo ${borrador.modo === 'ASISTIDO' ? 'asistido' : 'avanzado'}`}{' '}
            · el borrador se guarda solo
          </p>
        )}
      </div>
      <div className="adela-r__acciones">
        {borrador.modo && (
          <button
            type="button"
            className="adela-btn adela-btn--sm"
            onClick={empezarDeNuevo}
          >
            Descartar borrador
          </button>
        )}
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          onClick={salir}
        >
          Volver
        </button>
      </div>
    </div>
  )

  let contenido
  if (reanudar) {
    contenido = (
      <div className="adela-panel">
        <h3 className="adela-panel__titulo">
          Tienes un cuestionario sin terminar
        </h3>
        <p className="adela-panel__nota mb-3">
          {borrador.meta.nombre.trim() || 'Sin nombre'} ·{' '}
          {borrador.estilos.length} estilos · {borrador.preguntas.length}{' '}
          preguntas
        </p>
        <div className="adela-fila">
          <button
            type="button"
            className="adela-btn adela-btn--primario"
            onClick={() => setReanudar(false)}
          >
            Continuar borrador
          </button>
          <button type="button" className="adela-btn" onClick={empezarDeNuevo}>
            Empezar de nuevo
          </button>
        </div>
      </div>
    )
  } else if (!borrador.modo) {
    contenido = (
      <>
        <Nelse pose="feliz" titulo="¡Hola! Soy Nelse, tu guía de cuestionarios">
          <p>
            En el modo asistido te acompaño paso a paso: eliges cómo responden
            tus estudiantes, puedes partir de un modelo conocido y te muestro
            con números cómo se calculará cada resultado antes de crearlo.
          </p>
        </Nelse>
        <p className="adela-crear__lema">¿Cómo quieres crearlo?</p>
        <div className="adela-tarjetas">
          <button
            type="button"
            className="adela-tarjeta"
            onClick={() => empezar('ASISTIDO')}
          >
            <span className="adela-tarjeta__marca">Recomendado</span>
            <p className="adela-tarjeta__titulo">Asistido</p>
            <p className="adela-tarjeta__texto">
              Elige cómo responden, parte de un modelo si quieres y escribe solo
              el contenido: el asistente arma los estilos, los cortes y la
              lectura de resultados.
            </p>
          </button>
          <button
            type="button"
            className="adela-tarjeta"
            onClick={() => empezar('AVANZADO')}
          >
            <p className="adela-tarjeta__titulo">Avanzado</p>
            <p className="adela-tarjeta__texto">
              Control total: formato por pregunta, opciones que suman a varios
              estilos, estilos compuestos y niveles a medida.
            </p>
          </button>
          {esAdmin && (
            <button
              type="button"
              className="adela-tarjeta"
              onClick={() => empezar('IMPORTAR')}
            >
              <p className="adela-tarjeta__titulo">Con tu propia IA</p>
              <p className="adela-tarjeta__texto">
                Dale nuestras instrucciones a ChatGPT, Claude, Gemini u otra IA
                junto con tu documento: te devuelve el cuestionario y aquí lo
                revisas antes de crearlo.
              </p>
            </button>
          )}
          {esAdmin && nelse && (
            <button
              type="button"
              className="adela-tarjeta"
              onClick={() => empezar('NELSE')}
            >
              <p className="adela-tarjeta__titulo">Con Nelse</p>
              <p className="adela-tarjeta__texto">
                Sube el PDF del cuestionario (aunque esté escaneado) o
                descríbelo: lo armo yo y te muestro qué revisar antes de
                crearlo.
              </p>
            </button>
          )}
        </div>
      </>
    )
  } else if (borrador.modo === 'IMPORTAR') {
    contenido = (
      <ImportarConIA
        onListo={(importado) => actualizar(() => importado)}
        onVolver={() => actualizar((b) => ({ ...b, modo: null }))}
      />
    )
  } else if (borrador.modo === 'NELSE') {
    contenido = (
      <AsistenteIA
        trabajoId={borrador.trabajoIa ?? null}
        onTrabajo={(id) => actualizar((b) => ({ ...b, trabajoIa: id }))}
        onListo={(generado) => actualizar(() => generado)}
        onVolver={() =>
          actualizar((b) => ({ ...b, modo: null, trabajoIa: null }))
        }
      />
    )
  } else if (borrador.modo === 'ASISTIDO') {
    contenido = (
      <Asistente
        borrador={borrador}
        actualizar={actualizar}
        errores={errores}
        intentado={intentado}
        creando={creando}
        onCrear={crear}
      />
    )
  } else {
    const pie = (
      <div className="adela-navegacion">
        <span className="adela-falta">
          {errores.length === 0
            ? 'Listo para crear.'
            : `${errores.length} ${errores.length === 1 ? 'cosa pendiente' : 'cosas pendientes'}.`}
        </span>
        <button
          type="button"
          className="adela-btn adela-btn--primario"
          disabled={creando}
          onClick={crear}
        >
          {creando ? 'Creando…' : 'Crear cuestionario'}
        </button>
      </div>
    )
    contenido = (
      <EditorAvanzado
        borrador={borrador}
        actualizar={actualizar}
        errores={errores}
        mostrarErrores={intentado}
        pie={pie}
      />
    )
  }

  return (
    <div className="adela-r adela-crear">
      {cabecera}
      <ListaErrores errores={erroresServidor} />
      {contenido}
    </div>
  )
}

export default CrearCuestionarios

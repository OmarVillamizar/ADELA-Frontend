import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { crearCuestionario } from '../../util/services/cuestionarioService'
import useBorrador from './crear/useBorrador'
import EditorAvanzado from './crear/avanzado/EditorAvanzado'
import Asistente from './crear/asistente/Asistente'
import ListaErrores from './crear/ListaErrores'
import { aDTO, tieneContenido, validarBorrador } from './crear/borrador'
import '../../components/resultados/resultados.css'
import './crear/crear.css'

/** Sección del formulario a la que pertenece un campo de error del servidor. */
const seccionDeCampo = (campo) => {
  if (campo.startsWith('estilos')) return 'estilos'
  if (campo.startsWith('preguntas')) return 'preguntas'
  if (/^(bandas|escalones|esquema|delta)/.test(campo)) return 'interpretacion'
  return 'datos'
}

/**
 * Crear un cuestionario. El borrador se guarda en el navegador mientras se
 * edita, así que salir o recargar no pierde lo escrito.
 */
const CrearCuestionarios = () => {
  const navigate = useNavigate()
  const { borrador, actualizar, descartar } = useBorrador()
  const [reanudar, setReanudar] = useState(() => tieneContenido(borrador))
  const [intentado, setIntentado] = useState(false)
  const [creando, setCreando] = useState(false)
  const [erroresServidor, setErroresServidor] = useState([])
  const errores = useMemo(() => validarBorrador(borrador), [borrador])

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
            Modo {borrador.modo === 'ASISTIDO' ? 'asistido' : 'avanzado'} · el
            borrador se guarda solo
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
              Responde tres preguntas sobre tu instrumento y escribe solo el
              contenido: el asistente arma el resto.
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
        </div>
      </>
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

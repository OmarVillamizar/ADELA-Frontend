import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Swal from 'sweetalert2'
import './resultados.css'

/**
 * Pregunta complementaria de ADELA para quien obtuvo un perfil con todas las
 * modalidades. La respuesta es autodeclarada y no reemplaza ni altera el
 * resultado calculado; se responde una sola vez.
 */
const OPCIONES = [
  {
    valor: 'SELECTIVO',
    letra: 'A',
    titulo: 'Adapto mi forma de aprender según la situación.',
    texto:
      'Prefiero elegir la forma de aprender que mejor se ajuste a lo que necesito. Por ejemplo, si debo estudiar un documento, prefiero leerlo; si necesito aprender una actividad práctica, prefiero realizarla. No siempre necesito combinar varias formas de aprendizaje.',
  },
  {
    valor: 'INTEGRATIVO',
    letra: 'B',
    titulo: 'Prefiero combinar diferentes formas de aprender.',
    texto:
      'Cuando quiero comprender algo nuevo, prefiero utilizar varias formas de aprendizaje para complementar lo que entiendo. Por ejemplo, puedo leer una explicación, observar un diagrama, conversar sobre el tema y ponerlo en práctica.',
  },
]

export const CLASIFICACION = {
  SELECTIVO: {
    nombre: 'Multimodal selectivo',
    propio:
      'Tu respuesta indica que prefieres adaptar tu forma de aprender a las necesidades de cada situación, seleccionando la modalidad más útil en cada momento.',
    ajeno:
      'Indicó que prefiere adaptar su forma de aprender a las necesidades de cada situación, seleccionando la modalidad más útil en cada momento.',
  },
  INTEGRATIVO: {
    nombre: 'Multimodal integrativo',
    propio:
      'Tu respuesta indica que prefieres combinar varias formas de aprender para comprender algo nuevo, complementando unas con otras.',
    ajeno:
      'Indicó que prefiere combinar varias formas de aprender para comprender algo nuevo, complementando unas con otras.',
  },
}

/** La pregunta, mientras el estudiante no la haya respondido. */
export const PreguntaPreferencia = ({ onDeclarar }) => {
  const [elegida, setElegida] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const guardar = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Guardar tu respuesta?',
      text: 'Después no podrás cambiarla.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Revisar',
    })
    if (!isConfirmed) return
    setEnviando(true)
    try {
      await onDeclarar(elegida)
    } catch (e) {
      Swal.fire(
        'Error',
        e?.message ?? 'No se pudo guardar tu respuesta.',
        'error',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="adela-panel adela-aparece">
      <h2 className="adela-panel__titulo">¿Cómo prefieres aprender?</h2>
      <p className="mt-2">
        Tu resultado incluye todas las modalidades de aprendizaje. Queremos
        conocer un poco mejor cómo prefieres utilizarlas.
      </p>
      <p className="fw-semibold">
        Cuando aprendes algo nuevo, ¿cuál de estas situaciones describe mejor tu
        forma habitual de aprender?
      </p>
      {OPCIONES.map((o) => (
        <label
          key={o.valor}
          className={`d-block border rounded p-3 mb-2 ${elegida === o.valor ? 'border-primary bg-body-tertiary' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <input
            type="radio"
            name="preferencia-multimodal"
            className="form-check-input me-2"
            checked={elegida === o.valor}
            onChange={() => setElegida(o.valor)}
          />
          <strong>
            {o.letra}. {o.titulo}
          </strong>
          <span className="d-block mt-1 text-body-secondary">{o.texto}</span>
        </label>
      ))}
      <p className="adela-panel__nota fst-italic">
        No hay respuestas correctas o incorrectas. Elige la opción con la que
        más te identifiques.
      </p>
      <button
        type="button"
        className="adela-btn adela-btn--primario mt-2"
        disabled={!elegida || enviando}
        onClick={guardar}
      >
        Guardar respuesta
      </button>
    </section>
  )
}

PreguntaPreferencia.propTypes = {
  onDeclarar: PropTypes.func.isRequired,
}

/** La clasificación declarada, en el resultado y su PDF. */
const PreferenciaMultimodal = ({ preferencia, propio }) => {
  const c = CLASIFICACION[preferencia]
  return (
    <section className="adela-panel adela-aparece">
      <p className="adela-panel__nota mb-1">
        Clasificación complementaria autodeclarada
      </p>
      {c ? (
        <>
          <h2 className="adela-panel__titulo">{c.nombre}</h2>
          <p className="mt-2 mb-0">{propio ? c.propio : c.ajeno}</p>
        </>
      ) : (
        <p className="mb-0 text-body-secondary">
          {propio
            ? 'Aún no has indicado cómo prefieres utilizar tus modalidades.'
            : 'El estudiante aún no ha indicado cómo prefiere utilizar sus modalidades.'}
        </p>
      )}
    </section>
  )
}

PreferenciaMultimodal.propTypes = {
  preferencia: PropTypes.oneOf(['SELECTIVO', 'INTEGRATIVO']),
  propio: PropTypes.bool,
}

/** Conteo en el reporte de grupo, entre quienes tienen todas las modalidades. */
export const PreferenciasGrupo = ({ conteo }) => {
  if (!conteo) return null
  const filas = [
    [CLASIFICACION.SELECTIVO.nombre, conteo.SELECTIVO ?? 0],
    [CLASIFICACION.INTEGRATIVO.nombre, conteo.INTEGRATIVO ?? 0],
    ['Sin declarar', conteo.SIN_DECLARAR ?? 0],
  ]
  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">
            Preferencia multimodal autodeclarada
          </h2>
          <p className="adela-panel__nota">
            Entre quienes obtuvieron todas las modalidades: cómo dicen preferir
            utilizarlas. Es una pregunta complementaria, no parte del cálculo.
          </p>
        </div>
      </div>
      <dl className="adela-ficha">
        {filas.map(([etiqueta, n]) => (
          <div key={etiqueta}>
            <dt>{etiqueta}</dt>
            <dd>{n}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

PreferenciasGrupo.propTypes = {
  conteo: PropTypes.objectOf(PropTypes.number),
}

export default PreferenciaMultimodal

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Swal from 'sweetalert2'
import './resultados.css'

/**
 * Pregunta complementaria del cuestionario: se hace cuando el perfil destaca
 * todos los estilos, para que la persona declare cómo los usa. Textos y
 * opciones los define quien crea el cuestionario. Se responde una sola vez y
 * no altera el resultado calculado.
 */
const PreguntaComplementaria = ({ pregunta, onResponder }) => {
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
      await onResponder(elegida)
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
      <h2 className="adela-panel__titulo">{pregunta.titulo}</h2>
      {pregunta.introduccion && <p className="mt-2">{pregunta.introduccion}</p>}
      <p className="fw-semibold mt-2">{pregunta.enunciado}</p>
      {pregunta.opciones.map((o, i) => (
        <label
          key={o.id}
          className={`d-block border rounded p-3 mb-2 ${elegida === o.id ? 'border-primary bg-body-tertiary' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <input
            type="radio"
            name="pregunta-complementaria"
            className="form-check-input me-2"
            checked={elegida === o.id}
            onChange={() => setElegida(o.id)}
          />
          <strong>
            {String.fromCharCode(65 + (i % 26))}. {o.texto}
          </strong>
          {o.descripcion && (
            <span className="d-block mt-1 text-body-secondary">
              {o.descripcion}
            </span>
          )}
        </label>
      ))}
      {pregunta.nota && (
        <p className="adela-panel__nota fst-italic">{pregunta.nota}</p>
      )}
      <button
        type="button"
        className="adela-btn adela-btn--primario mt-2"
        disabled={elegida == null || enviando}
        onClick={guardar}
      >
        Guardar respuesta
      </button>
    </section>
  )
}

PreguntaComplementaria.propTypes = {
  pregunta: PropTypes.shape({
    titulo: PropTypes.string.isRequired,
    introduccion: PropTypes.string,
    enunciado: PropTypes.string.isRequired,
    nota: PropTypes.string,
    opciones: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        texto: PropTypes.string.isRequired,
        descripcion: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
  onResponder: PropTypes.func.isRequired,
}

/**
 * Lo que la persona eligió, en su reporte y su PDF. Sin respuesta, quien la ve
 * no es quien responde (el profesor): se indica que falta.
 */
export const RespuestaComplementaria = ({ respuesta, titulo }) => (
  <section className="adela-panel adela-aparece">
    <p className="adela-panel__nota mb-1">{titulo} · respuesta autodeclarada</p>
    {respuesta ? (
      <>
        <h2 className="adela-panel__titulo">{respuesta.resultado}</h2>
        {respuesta.descripcion && (
          <p className="mt-2 mb-0">{respuesta.descripcion}</p>
        )}
      </>
    ) : (
      <p className="mb-0 text-body-secondary">Aún no ha respondido.</p>
    )}
  </section>
)

RespuestaComplementaria.propTypes = {
  respuesta: PropTypes.shape({
    resultado: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
  }),
  titulo: PropTypes.string.isRequired,
}

/** Conteo en un reporte agregado, entre quienes les tocó la pregunta. */
export const ConteoComplementaria = ({ conteo }) => {
  if (!conteo) return null
  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">{conteo.titulo}</h2>
          <p className="adela-panel__nota">
            Pregunta extra para quienes obtuvieron todos los estilos destacados.
            Es autodeclarada y no cambia el cálculo.
          </p>
        </div>
      </div>
      <dl className="adela-ficha">
        {Object.entries(conteo.respuestas).map(([resultado, n]) => (
          <div key={resultado}>
            <dt>{resultado}</dt>
            <dd>{n}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

ConteoComplementaria.propTypes = {
  conteo: PropTypes.shape({
    titulo: PropTypes.string.isRequired,
    respuestas: PropTypes.objectOf(PropTypes.number).isRequired,
  }),
}

export default PreguntaComplementaria

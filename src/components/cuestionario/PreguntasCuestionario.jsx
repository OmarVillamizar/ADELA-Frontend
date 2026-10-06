import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CButton,
  CCard,
  CCardBody,
  CFormCheck,
  CProgress,
  CProgressBar,
  CSpinner,
} from '@coreui/react'
import Swal from 'sweetalert2'

const porOrden = (a, b) => a.orden - b.orden

/**
 * Preguntas de un cuestionario con su selección, progreso y validación.
 *
 * Lo comparten el estudiante (asignación de grupo) y quien responde una cápsula
 * sin cuenta. Cada uno decide qué hacer con las opciones elegidas en onEnviar;
 * aquí solo se garantiza que las preguntas de única respuesta estén contestadas.
 */
const PreguntasCuestionario = ({ cuestionario, onEnviar, enviando }) => {
  // Copias ordenadas: no se muta el objeto que llega por props.
  const preguntas = useMemo(
    () =>
      [...cuestionario.preguntas]
        .sort(porOrden)
        .map((p) => ({ ...p, opciones: [...p.opciones].sort(porOrden) })),
    [cuestionario],
  )
  const [seleccion, setSeleccion] = useState(() => preguntas.map(() => []))

  const alternar = (indice, opcionId) => {
    setSeleccion((previas) =>
      previas.map((opts, idx) => {
        if (idx !== indice) return opts
        if (!preguntas[indice].opcionMultiple) return [opcionId]
        return opts.includes(opcionId)
          ? opts.filter((e) => e !== opcionId)
          : [...opts, opcionId]
      }),
    )
  }

  const progreso =
    preguntas.length === 0
      ? 0
      : (seleccion.filter((opts) => opts.length > 0).length /
          preguntas.length) *
        100

  const enviar = () => {
    const sinResponder = preguntas
      .filter((p, idx) => !p.opcionMultiple && seleccion[idx].length !== 1)
      .map((p) => p.orden)

    if (sinResponder.length > 0) {
      Swal.fire(
        'Faltan respuestas',
        `Responde las preguntas ${sinResponder.join(', ')} antes de enviar.`,
        'warning',
      )
      return
    }
    onEnviar(seleccion.flat())
  }

  return (
    <>
      <div className="mb-4">
        <div className="d-flex justify-content-between mb-2">
          <small className="text-medium-emphasis">
            Progreso del cuestionario
          </small>
          <small className="text-medium-emphasis">
            {Math.round(progreso)}%
          </small>
        </div>
        <CProgress className="mb-3">
          <CProgressBar value={progreso} />
        </CProgress>
      </div>

      <div className="mb-4 text-center">
        <p className="text-medium-emphasis">{cuestionario.descripcion}</p>
      </div>

      {preguntas.map((pregunta, preguntaIndex) => (
        <CCard key={pregunta.id} className="mb-4 border">
          <CCardBody className="p-4">
            <h5 className="mb-4 text-dark">
              {pregunta.pregunta}{' '}
              {pregunta.opcionMultiple
                ? '(Puedes seleccionar varias opciones)'
                : ''}
            </h5>
            <div className="ps-2">
              {pregunta.opciones.map((opcion) => {
                const elegida = seleccion[preguntaIndex].includes(opcion.id)
                return (
                  <div
                    key={opcion.id}
                    className="mb-3"
                    onClick={() => alternar(preguntaIndex, opcion.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <CCard
                      className={`p-3 border ${elegida ? 'border-primary bg-light' : ''}`}
                    >
                      <CFormCheck
                        type={pregunta.opcionMultiple ? 'checkbox' : 'radio'}
                        name={`pregunta-${preguntaIndex}`}
                        id={`pregunta-${preguntaIndex}-opcion-${opcion.id}`}
                        label={opcion.respuesta}
                        checked={elegida}
                        onChange={(e) => {
                          e.preventDefault()
                        }}
                        className="m-0"
                      />
                    </CCard>
                  </div>
                )
              })}
            </div>
          </CCardBody>
        </CCard>
      ))}

      <div className="text-center mt-4">
        <CButton
          color="success"
          size="lg"
          onClick={enviar}
          disabled={enviando}
          className="px-5"
          style={{ color: 'white' }}
        >
          {enviando && <CSpinner size="sm" className="me-2" />}
          Enviar Respuestas
        </CButton>
      </div>
    </>
  )
}

PreguntasCuestionario.propTypes = {
  cuestionario: PropTypes.shape({
    descripcion: PropTypes.string,
    preguntas: PropTypes.array.isRequired,
  }).isRequired,
  onEnviar: PropTypes.func.isRequired,
  enviando: PropTypes.bool,
}

export default PreguntasCuestionario

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
import ControlJerarquia from './ControlJerarquia'
import ControlReparto from './ControlReparto'
import {
  FORMATO,
  armarEnvio,
  errorPregunta,
  limitesSeleccion,
} from '../../util/cuestionario/validarRespuesta'

const porOrden = (a, b) => a.orden - b.orden

/** Indicación junto al enunciado según el formato. */
const ayudaDe = (p) => {
  if (p.formato === FORMATO.JERARQUIA) return '(Ordena las opciones)'
  if (p.formato === FORMATO.REPARTO)
    return `(Reparte ${p.puntosRepartir} puntos)`
  if (p.formato !== FORMATO.MULTIPLE) return ''
  const { min, max } = limitesSeleccion(p)
  if (min <= 1 && max === p.opciones.length)
    return '(Puedes seleccionar varias opciones)'
  return min === max ? `(Elige ${max})` : `(Elige entre ${min} y ${max})`
}

/**
 * Preguntas de un cuestionario con su selección, progreso y validación.
 *
 * Lo comparten el estudiante (asignación de grupo) y quien responde una cápsula
 * sin cuenta. Cada uno decide qué hacer con lo elegido en onEnviar, que recibe
 * { opcionesSeleccionadasId, cantidades }; aquí se garantiza que cada pregunta
 * cumpla las reglas de su formato, las mismas que valida el servidor.
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
  // Por pregunta, { opcionId: cantidad }.
  const [respuestas, setRespuestas] = useState(() => preguntas.map(() => ({})))

  const cambiar = (indice, respuesta) =>
    setRespuestas((previas) =>
      previas.map((r, idx) => (idx === indice ? respuesta : r)),
    )

  const alternar = (indice, opcionId) => {
    const pregunta = preguntas[indice]
    const actual = respuestas[indice]
    if (pregunta.formato !== FORMATO.MULTIPLE) {
      cambiar(indice, { [opcionId]: 1 })
      return
    }
    const siguiente = { ...actual }
    if (siguiente[opcionId]) delete siguiente[opcionId]
    else if (Object.keys(actual).length < limitesSeleccion(pregunta).max)
      siguiente[opcionId] = 1
    cambiar(indice, siguiente)
  }

  const completas = preguntas.filter(
    (p, idx) =>
      Object.keys(respuestas[idx]).length > 0 &&
      errorPregunta(p, respuestas[idx]) === null,
  ).length
  const progreso =
    preguntas.length === 0 ? 0 : (completas / preguntas.length) * 100

  const enviar = () => {
    const problemas = preguntas
      .map((p, idx) => ({ p, error: errorPregunta(p, respuestas[idx]) }))
      .filter(({ error }) => error !== null)

    if (problemas.length > 0) {
      Swal.fire({
        title: 'Revisa tus respuestas',
        html: problemas
          .map(({ p, error }) => `Pregunta ${p.orden}: ${error}`)
          .join('<br>'),
        icon: 'warning',
      })
      return
    }
    onEnviar(armarEnvio(preguntas, respuestas))
  }

  const control = (pregunta, preguntaIndex) => {
    const respuesta = respuestas[preguntaIndex]
    if (pregunta.formato === FORMATO.JERARQUIA) {
      return (
        <ControlJerarquia
          opciones={pregunta.opciones}
          respuesta={respuesta}
          onChange={(r) => cambiar(preguntaIndex, r)}
          idPregunta={pregunta.id}
        />
      )
    }
    if (pregunta.formato === FORMATO.REPARTO) {
      return (
        <ControlReparto
          opciones={pregunta.opciones}
          respuesta={respuesta}
          onChange={(r) => cambiar(preguntaIndex, r)}
          puntos={pregunta.puntosRepartir}
        />
      )
    }
    const multiple = pregunta.formato === FORMATO.MULTIPLE
    const lleno =
      multiple &&
      Object.keys(respuesta).length >= limitesSeleccion(pregunta).max
    return pregunta.opciones.map((opcion) => {
      const elegida = Boolean(respuesta[opcion.id])
      const bloqueada = lleno && !elegida
      return (
        <div
          key={opcion.id}
          className="mb-3"
          onClick={() => alternar(preguntaIndex, opcion.id)}
          style={{ cursor: bloqueada ? 'not-allowed' : 'pointer' }}
        >
          <CCard
            className={`p-3 border ${elegida ? 'border-primary bg-light' : ''} ${bloqueada ? 'opacity-50' : ''}`}
          >
            <CFormCheck
              type={multiple ? 'checkbox' : 'radio'}
              name={`pregunta-${preguntaIndex}`}
              id={`pregunta-${preguntaIndex}-opcion-${opcion.id}`}
              label={opcion.respuesta}
              checked={elegida}
              disabled={bloqueada}
              onChange={(e) => {
                e.preventDefault()
              }}
              className="m-0"
            />
          </CCard>
        </div>
      )
    })
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
              {pregunta.pregunta} {ayudaDe(pregunta)}
            </h5>
            <div className="ps-2">{control(pregunta, preguntaIndex)}</div>
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

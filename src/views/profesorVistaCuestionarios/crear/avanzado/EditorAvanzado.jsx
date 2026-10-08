import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import CamposDatos from '../CamposDatos'
import EditorEstilos from './EditorEstilos'
import EditorPregunta from './EditorPregunta'
import EditorInterpretacion from '../EditorInterpretacion'
import ListaErrores from '../ListaErrores'
import VistaPrevia from '../VistaPrevia'
import {
  FORMATO,
  actualizarPregunta,
  agregarPregunta,
  duplicarPregunta,
  moverPregunta,
  nuevaOpcion,
  nuevaPregunta,
  primarios,
  quitarPregunta,
} from '../borrador'

/**
 * Todo lo que el modelo permite: formato por pregunta, pesos a varios estilos,
 * compuestos con coeficientes libres e interpretación completa.
 */
const EditorAvanzado = ({
  borrador,
  actualizar,
  errores,
  mostrarErrores,
  pie,
}) => {
  const secciones = useRef({})
  const prim = primarios(borrador)
  const marcados = new Set(
    mostrarErrores ? errores.map((e) => e.ref).filter(Boolean) : [],
  )

  const ir = (seccion) => {
    const el = secciones.current[seccion === 'servidor' ? 'revision' : seccion]
    if (!el) return
    el.open = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const seccion = (clave, titulo, nota, contenido, abierta = true) => (
    <details
      className="adela-panel adela-seccion"
      open={abierta}
      ref={(el) => {
        secciones.current[clave] = el
      }}
    >
      <summary>
        <div>
          <h3 className="adela-panel__titulo">{titulo}</h3>
          {nota && <p className="adela-panel__nota">{nota}</p>}
        </div>
      </summary>
      {contenido}
    </details>
  )

  return (
    <>
      {seccion(
        'datos',
        'Datos',
        null,
        <CamposDatos
          meta={borrador.meta}
          onChange={(meta) => actualizar((b) => ({ ...b, meta }))}
        />,
      )}

      {seccion(
        'estilos',
        `Estilos (${borrador.estilos.length})`,
        'Los simples reciben puntos de las opciones; los compuestos combinan simples.',
        <EditorEstilos
          borrador={borrador}
          actualizar={actualizar}
          marcados={marcados}
        />,
      )}

      {seccion(
        'preguntas',
        `Preguntas (${borrador.preguntas.length})`,
        null,
        <>
          {borrador.preguntas.map((p, i) => (
            <EditorPregunta
              key={p.id}
              pregunta={p}
              numero={i + 1}
              total={borrador.preguntas.length}
              estilos={prim}
              marcada={marcados.has(p.id)}
              onChange={(cambios) =>
                actualizar((b) => actualizarPregunta(b, p.id, cambios))
              }
              onQuitar={() => actualizar((b) => quitarPregunta(b, p.id))}
              onMover={(paso) =>
                actualizar((b) => moverPregunta(b, p.id, paso))
              }
              onDuplicar={() => actualizar((b) => duplicarPregunta(b, p.id))}
            />
          ))}
          <button
            type="button"
            className="adela-btn mt-3"
            onClick={() =>
              actualizar((b) =>
                agregarPregunta(
                  b,
                  nuevaPregunta(
                    FORMATO.UNICA,
                    primarios(b).map((e) => nuevaOpcion('', e.id)),
                  ),
                ),
              )
            }
          >
            + Pregunta
          </button>
        </>,
      )}

      {seccion(
        'interpretacion',
        'Lectura de resultados',
        'Se puede cambiar después desde la lista de cuestionarios.',
        <EditorInterpretacion
          estilos={borrador.estilos}
          valor={borrador.interpretacion}
          marcados={marcados}
          onChange={(interpretacion) =>
            actualizar((b) => ({ ...b, interpretacion }))
          }
        />,
        false,
      )}

      {seccion(
        'revision',
        'Vista previa',
        'El formulario tal como lo verán los estudiantes.',
        <VistaPrevia borrador={borrador} />,
        false,
      )}

      {mostrarErrores && <ListaErrores errores={errores} onIr={ir} />}
      {pie}
    </>
  )
}

EditorAvanzado.propTypes = {
  borrador: PropTypes.object.isRequired,
  actualizar: PropTypes.func.isRequired,
  errores: PropTypes.array.isRequired,
  mostrarErrores: PropTypes.bool,
  pie: PropTypes.node,
}

export default EditorAvanzado

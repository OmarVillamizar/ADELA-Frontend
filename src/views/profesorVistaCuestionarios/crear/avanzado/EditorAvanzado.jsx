import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import CamposDatos from '../CamposDatos'
import EditorEstilos from './EditorEstilos'
import EditorPregunta from './EditorPregunta'
import EditorInterpretacion from '../EditorInterpretacion'
import ListaErrores from '../ListaErrores'
import VistaPrevia from '../VistaPrevia'
import FilaMarca from '../importar/FilaMarca'
import { pendientesDe, seccionDelEditor } from '../importar/marcas'
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

  // Cuestionario importado con IA: lo que aún no se revisó, por sección y por
  // pregunta o estilo señalado.
  const marcasIA = borrador.ia?.marcas ?? []
  const revisadas = new Set(borrador.ia?.revisadas ?? [])
  const pendientes = pendientesDe(borrador)
  const porSeccion = {}
  pendientes.forEach((m) => {
    const s = seccionDelEditor(m)
    porSeccion[s] = (porSeccion[s] ?? 0) + 1
  })
  const marcasPor = (campo) => {
    const mapa = new Map()
    pendientes.forEach((m) =>
      (m[campo] ?? []).forEach((id) =>
        mapa.set(id, [...(mapa.get(id) ?? []), m]),
      ),
    )
    return mapa
  }
  const iaPreguntas = marcasPor('preguntaIds')
  const iaEstilos = marcasPor('estiloIds')
  const revisar = (id, valor) =>
    actualizar((b) => {
      const hechas = new Set(b.ia?.revisadas ?? [])
      if (valor) hechas.add(id)
      else hechas.delete(id)
      return { ...b, ia: { ...b.ia, revisadas: [...hechas] } }
    })

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
          <h3 className="adela-panel__titulo">
            {titulo}
            {porSeccion[clave] > 0 && (
              <span className="adela-chip adela-chip--aviso ms-2">
                {porSeccion[clave]} por revisar
              </span>
            )}
          </h3>
          {nota && <p className="adela-panel__nota">{nota}</p>}
        </div>
      </summary>
      {contenido}
    </details>
  )

  return (
    <>
      {marcasIA.length > 0 &&
        seccion(
          'ia',
          'Puntos a revisar',
          pendientes.length > 0
            ? `Quedan ${pendientes.length} de ${marcasIA.length}. Los de riesgo alto deben revisarse para poder crear el cuestionario.`
            : 'Todo quedó revisado.',
          <ul className="adela-marcas">
            {marcasIA.map((m) => (
              <FilaMarca
                key={m.id}
                marca={m}
                hecha={revisadas.has(m.id)}
                onCambiar={(valor) => revisar(m.id, valor)}
                onIr={(marca) => ir(seccionDelEditor(marca))}
              />
            ))}
          </ul>,
          pendientes.length > 0,
        )}

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
          marcasIA={iaEstilos}
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
              marcasIA={iaPreguntas.get(p.id)}
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

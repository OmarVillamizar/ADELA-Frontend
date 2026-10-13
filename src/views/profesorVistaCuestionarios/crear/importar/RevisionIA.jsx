import React from 'react'
import PropTypes from 'prop-types'
import { MODELOS } from '../asistente/modelos'
import { primarios } from '../borrador'
import FilaMarca from './FilaMarca'
import '../crear.css'

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
  complementaria: 'Pregunta de desempate',
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

export const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`

/** Marcas de riesgo alto que aún no se han marcado como revisadas. */
export const altasSinMarcar = (borrador, hechas) =>
  (borrador?.ia.marcas ?? []).filter(
    (m) => m.riesgo === 'ALTO' && !hechas.has(m.id),
  ).length

/** Lo que se armó con el JSON, en palabras llanas. */
export const Resumen = ({ borrador }) => {
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
          {borrador.ia.origen === 'NELSE'
            ? `Se parece a «${modelo.nombre}», un cuestionario de mi conocimiento interno como I.A de cuestionarios.`
            : `Se parece al modelo guía «${modelo.nombre}» del asistente.`}
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
export const Lista = ({ titulo, items }) =>
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

/** Lo que faltó y lo que no se pudo incluir, según el análisis de la IA. */
export const Faltantes = ({ resumen }) => (
  <>
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
  </>
)

Faltantes.propTypes = { resumen: PropTypes.object }

/**
 * Los puntos que la persona debe revisar antes de abrir el editor. Los de
 * riesgo alto se marcan uno por uno; el resto puede esperar al editor.
 */
export const PuntosARevisar = ({ marcas, hechas, onMarcar }) => (
  <>
    <h3 className="adela-panel__titulo mt-4">Puntos a revisar</h3>
    {marcas.length === 0 ? (
      <p className="adela-panel__nota">
        Nada quedó marcado. Aun así, revisa el cuestionario en el editor antes
        de crearlo.
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
              onCambiar={(valor) => onMarcar(m.id, valor)}
            />
          ))}
        </ul>
      </>
    )}
  </>
)

PuntosARevisar.propTypes = {
  marcas: PropTypes.array.isRequired,
  hechas: PropTypes.instanceOf(Set).isRequired,
  onMarcar: PropTypes.func.isRequired,
}

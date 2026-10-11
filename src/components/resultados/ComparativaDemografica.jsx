import React from 'react'
import PropTypes from 'prop-types'
import { CChartBar } from '@coreui/react-chartjs'
import {
  barraConteo,
  colorCategoria,
  estiloBarra,
} from '../../util/calificacion/opcionesGrafico'
import {
  GENEROS,
  RANGOS_EDAD,
  agrupar,
  categoriasResumen,
  contar,
  edad,
  etiquetaGenero,
  rangoEdadDe,
} from '../../util/calificacion/demografia'
import './resultados.css'

const pct = (k, n) => (n > 0 ? Math.round((k / n) * 100) : 0)

/** Categorías con más estudiantes; vacío si nadie cae en ninguna. */
const masFrecuentes = (conteo) => {
  const max = Math.max(0, ...Object.values(conteo))
  return max === 0 ? [] : Object.keys(conteo).filter((c) => conteo[c] === max)
}

/**
 * Columnas agrupadas: una serie por grupo (género o rango de edad) y, en el
 * eje, cada estilo. Se grafica el porcentaje y no el conteo: los grupos rara
 * vez tienen el mismo tamaño y 3 de 4 no es comparable con 3 de 20.
 */
const GraficaComparativa = ({ grupos, criterio }) => {
  const series = grupos.map(([nombre, filas]) => ({
    nombre,
    n: filas.length,
    conteo: contar(filas, criterio).conteo,
  }))
  const opciones = barraConteo({ leyenda: true })
  opciones.scales.y.max = 100
  opciones.scales.y.ticks = {
    ...opciones.scales.y.ticks,
    callback: (v) => `${v} %`,
  }
  opciones.plugins.tooltip = {
    ...opciones.plugins.tooltip,
    callbacks: {
      label: (ctx) => {
        const s = series[ctx.datasetIndex]
        const k = s.conteo[criterio.categorias[ctx.dataIndex]]
        return ` ${s.nombre}: ${ctx.parsed.y} % (${k} de ${s.n})`
      },
    },
  }

  return (
    <div
      className="adela-grafico"
      style={{
        minHeight: 260 + Math.max(0, criterio.categorias.length - 4) * 20,
      }}
    >
      <CChartBar
        customTooltips={false}
        data={{
          labels: criterio.categorias,
          datasets: series.map((s, i) => ({
            label: `${s.nombre} (${s.n})`,
            data: criterio.categorias.map((c) => pct(s.conteo[c], s.n)),
            ...estiloBarra(colorCategoria(i)),
          })),
        }}
        options={opciones}
      />
    </div>
  )
}

GraficaComparativa.propTypes = {
  grupos: PropTypes.array.isRequired,
  criterio: PropTypes.object.isRequired,
}

const Tendencias = ({ columna, grupos, criterio }) => (
  <div className="adela-tabla__scroll mt-3">
    <table className="adela-tabla">
      <thead>
        <tr>
          <th scope="col">{columna}</th>
          <th scope="col" className="num">
            Estudiantes
          </th>
          {criterio.categorias.map((c) => (
            <th scope="col" className="num" key={c}>
              {c}
            </th>
          ))}
          <th scope="col">Más frecuente</th>
        </tr>
      </thead>
      <tbody>
        {grupos.map(([nombre, filas]) => {
          const { conteo } = contar(filas, criterio)
          const top = masFrecuentes(conteo)
          return (
            <tr key={nombre}>
              <td className="adela-tabla__nombre">{nombre}</td>
              <td className="num">{filas.length}</td>
              {criterio.categorias.map((c) => (
                <td
                  className={`num${top.includes(c) ? ' fw-bold' : ''}`}
                  key={c}
                >
                  {conteo[c]}{' '}
                  <span className="text-body-secondary">
                    ({pct(conteo[c], filas.length)} %)
                  </span>
                </td>
              ))}
              <td>{top.length ? top.join(', ') : '—'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

Tendencias.propTypes = {
  columna: PropTypes.string.isRequired,
  grupos: PropTypes.array.isRequired,
  criterio: PropTypes.object.isRequired,
}

const Bloque = ({ titulo, columna, grupos, criterio, aviso }) => (
  <>
    <h3 className="adela-panel__titulo mt-4 mb-2">{titulo}</h3>
    {grupos.length < 2 && <p className="adela-panel__nota mb-2">{aviso}</p>}
    <GraficaComparativa grupos={grupos} criterio={criterio} />
    <Tendencias columna={columna} grupos={grupos} criterio={criterio} />
  </>
)

Bloque.propTypes = {
  titulo: PropTypes.string.isRequired,
  columna: PropTypes.string.isRequired,
  grupos: PropTypes.array.isRequired,
  criterio: PropTypes.object.isRequired,
  aviso: PropTypes.string.isRequired,
}

/**
 * Cómo se reparten los estilos entre géneros y entre rangos de edad. Separado
 * del resumen para que este quede en lo esencial; respeta el mismo filtro.
 */
const ComparativaDemografica = ({ resueltos, nombresEstilos, filtro }) => {
  const criterio = categoriasResumen(resueltos, nombresEstilos)

  const porGenero = agrupar(
    resueltos,
    (r) => etiquetaGenero(r.estudiante.genero),
    GENEROS.map((g) => g.etiqueta),
  )
  const porEdad = agrupar(
    resueltos,
    (r) => rangoEdadDe(edad(r.estudiante.fechaNacimiento)),
    RANGOS_EDAD.map((r) => r.etiqueta),
  ).map(([rango, filas]) => [
    RANGOS_EDAD.some((r) => r.etiqueta === rango) ? `${rango} años` : rango,
    filas,
  ])

  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">Comparación por género y edad</h2>
          <p className="adela-panel__nota">
            {filtro ? `Filtro: ${filtro}. ` : ''}
            Porcentaje de cada grupo que tiene cada{' '}
            {criterio.porEstilo ? 'estilo' : 'perfil'}; así se comparan grupos
            de distinto tamaño. Pasa el cursor por una columna para ver el
            conteo.
          </p>
        </div>
      </div>

      {resueltos.length === 0 ? (
        <p className="adela-panel__nota mb-0">
          Ningún estudiante que haya respondido cumple el filtro.
        </p>
      ) : (
        <>
          <Bloque
            titulo="Entre géneros"
            columna="Género"
            grupos={porGenero}
            criterio={criterio}
            aviso="Solo hay un género con este filtro. Quita el filtro de género para comparar."
          />
          <Bloque
            titulo="Entre edades"
            columna="Edad"
            grupos={porEdad}
            criterio={criterio}
            aviso="Solo hay un rango de edad con este filtro. Quita el filtro de edad para comparar."
          />
        </>
      )}
    </section>
  )
}

ComparativaDemografica.propTypes = {
  resueltos: PropTypes.arrayOf(PropTypes.object).isRequired,
  nombresEstilos: PropTypes.arrayOf(PropTypes.string).isRequired,
  filtro: PropTypes.string,
}

export default ComparativaDemografica

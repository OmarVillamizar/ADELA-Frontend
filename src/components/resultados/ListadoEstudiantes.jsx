import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Paginacion from './Paginacion'
import './resultados.css'

/**
 * Estudiantes del grupo, primero los que respondieron, paginados. completo
 * muestra todas las filas sin controles: el PDF lleva la lista entera.
 */
const ListadoEstudiantes = ({ filas, filtro, completo = false }) => {
  const [pagina, setPagina] = useState(1)
  const [tamano, setTamano] = useState(40)

  // Al filtrar puede sobrar la página actual: se queda en la última que existe.
  const paginas = Math.max(1, Math.ceil(filas.length / tamano))
  const actual = Math.min(pagina, paginas)
  const visibles = completo
    ? filas
    : filas.slice((actual - 1) * tamano, actual * tamano)
  const inicio = completo ? 0 : (actual - 1) * tamano

  return (
    <section className="adela-panel adela-aparece">
      <div className="adela-panel__cabeza">
        <div>
          <h2 className="adela-panel__titulo">Estudiantes</h2>
          {filtro && <p className="adela-panel__nota">Filtro: {filtro}</p>}
        </div>
      </div>
      {filas.length === 0 ? (
        <p className="adela-panel__nota mb-0">
          Ningún estudiante cumple el filtro.
        </p>
      ) : (
        <>
          <div className="adela-tabla__scroll">
            <table className="adela-tabla">
              <thead>
                <tr>
                  <th scope="col" className="num">
                    #
                  </th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Estilo</th>
                  <th scope="col">Estado</th>
                  <th scope="col">
                    <span className="visually-hidden">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((r, i) => {
                  const resuelto = r.fechaResolucion != null
                  return (
                    <tr key={r.id}>
                      <td className="num text-body-secondary">
                        {inicio + i + 1}
                      </td>
                      <td className="adela-tabla__nombre">
                        {r.estudiante.nombre}
                      </td>
                      <td>{r.perfil ?? '—'}</td>
                      <td>
                        {resuelto ? (
                          <span className="adela-chip adela-chip--ok">
                            Respondió
                          </span>
                        ) : (
                          <span className="adela-chip adela-chip--aviso">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="num">
                        {resuelto && (
                          <Link
                            to={`/reporte-estudiante/${r.id}`}
                            className="adela-btn adela-btn--sm"
                          >
                            Ver resultado
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!completo && (
            <Paginacion
              total={filas.length}
              pagina={actual}
              tamano={tamano}
              onPagina={setPagina}
              onTamano={(t) => {
                setTamano(t)
                setPagina(1)
              }}
            />
          )}
        </>
      )}
    </section>
  )
}

ListadoEstudiantes.propTypes = {
  filas: PropTypes.arrayOf(PropTypes.object).isRequired,
  filtro: PropTypes.string,
  completo: PropTypes.bool,
}

export default ListadoEstudiantes

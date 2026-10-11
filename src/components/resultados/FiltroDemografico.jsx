import React from 'react'
import PropTypes from 'prop-types'
import {
  FILTRO_INICIAL,
  GENEROS,
  PERSONALIZADO,
  RANGOS_EDAD,
  TODOS,
  filtroActivo,
} from '../../util/calificacion/demografia'
import './resultados.css'

/** Género y edad (rango fijo o mínimo / máximo libres) del resumen y el listado. */
const FiltroDemografico = ({ valor, onChange }) => {
  const cambiar = (campo) => (e) =>
    onChange({ ...valor, [campo]: e.target.value })

  return (
    <div className="adela-filtro" role="group" aria-label="Filtrar estudiantes">
      <label className="adela-filtro__campo">
        Género
        <select
          className="form-select form-select-sm"
          value={valor.genero}
          onChange={cambiar('genero')}
        >
          <option value={TODOS}>Todos</option>
          {GENEROS.map((g) => (
            <option key={g.valor} value={g.valor}>
              {g.etiqueta}
            </option>
          ))}
        </select>
      </label>
      <label className="adela-filtro__campo">
        Edad
        <select
          className="form-select form-select-sm"
          value={valor.rango}
          onChange={cambiar('rango')}
        >
          <option value={TODOS}>Todas</option>
          {RANGOS_EDAD.map((r) => (
            <option key={r.valor} value={r.valor}>
              {r.etiqueta} años
            </option>
          ))}
          <option value={PERSONALIZADO}>Otro rango…</option>
        </select>
      </label>
      {valor.rango === PERSONALIZADO && (
        <>
          <label className="adela-filtro__campo">
            Desde
            <input
              type="number"
              min={0}
              max={120}
              className="form-control form-control-sm adela-filtro__edad"
              value={valor.min}
              onChange={cambiar('min')}
              placeholder="mín."
            />
          </label>
          <label className="adela-filtro__campo">
            Hasta
            <input
              type="number"
              min={0}
              max={120}
              className="form-control form-control-sm adela-filtro__edad"
              value={valor.max}
              onChange={cambiar('max')}
              placeholder="máx."
            />
          </label>
        </>
      )}
      {filtroActivo(valor) && (
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          onClick={() => onChange(FILTRO_INICIAL)}
        >
          Quitar filtro
        </button>
      )}
    </div>
  )
}

FiltroDemografico.propTypes = {
  valor: PropTypes.shape({
    genero: PropTypes.string,
    rango: PropTypes.string,
    min: PropTypes.string,
    max: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
}

export default FiltroDemografico

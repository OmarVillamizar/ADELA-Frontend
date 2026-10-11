import React from 'react'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cilChevronLeft, cilChevronRight } from '@coreui/icons'
import './resultados.css'

export const TAMANOS_PAGINA = [10, 20, 40, 100]

/** Filas por página y anterior / siguiente, con "1–40 de 120". */
const Paginacion = ({ total, pagina, tamano, onPagina, onTamano }) => {
  const paginas = Math.max(1, Math.ceil(total / tamano))
  const desde = total === 0 ? 0 : (pagina - 1) * tamano + 1
  const hasta = Math.min(pagina * tamano, total)

  return (
    <div className="adela-paginacion">
      <label className="adela-paginacion__tamano">
        Mostrar
        <select
          className="form-select form-select-sm"
          value={tamano}
          onChange={(e) => onTamano(Number(e.target.value))}
        >
          {TAMANOS_PAGINA.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        por página
      </label>
      <div className="adela-paginacion__nav">
        <span className="adela-paginacion__rango">
          {desde}–{hasta} de {total}
        </span>
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          onClick={() => onPagina(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
        >
          <CIcon icon={cilChevronLeft} />
        </button>
        <span className="adela-paginacion__rango">
          {pagina} / {paginas}
        </span>
        <button
          type="button"
          className="adela-btn adela-btn--sm"
          onClick={() => onPagina(pagina + 1)}
          disabled={pagina >= paginas}
          aria-label="Página siguiente"
        >
          <CIcon icon={cilChevronRight} />
        </button>
      </div>
    </div>
  )
}

Paginacion.propTypes = {
  total: PropTypes.number.isRequired,
  pagina: PropTypes.number.isRequired,
  tamano: PropTypes.number.isRequired,
  onPagina: PropTypes.func.isRequired,
  onTamano: PropTypes.func.isRequired,
}

export default Paginacion

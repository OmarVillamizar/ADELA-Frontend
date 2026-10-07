import React from 'react'
import PropTypes from 'prop-types'
import './resultados.css'

/** Título del reporte a la izquierda y sus acciones a la derecha. */
const EncabezadoReporte = ({ titulo, subtitulo, children }) => (
  <header className="adela-r__bar">
    <div>
      <h1 className="adela-r__titulo">{titulo}</h1>
      {subtitulo && <p className="adela-r__subtitulo">{subtitulo}</p>}
    </div>
    {children && <div className="adela-r__acciones">{children}</div>}
  </header>
)

EncabezadoReporte.propTypes = {
  titulo: PropTypes.node.isRequired,
  subtitulo: PropTypes.node,
  children: PropTypes.node,
}

export default EncabezadoReporte

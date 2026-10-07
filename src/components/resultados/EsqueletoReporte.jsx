import React from 'react'
import './resultados.css'

/** Silueta del reporte mientras carga: mismo esqueleto que el contenido final. */
const EsqueletoReporte = () => (
  <div className="adela-r" aria-busy="true" aria-label="Cargando reporte">
    <div
      className="adela-esqueleto mb-3"
      style={{ height: 36, width: '45%' }}
    />
    <div className="adela-cifras">
      {[0, 1, 2].map((i) => (
        <div key={i} className="adela-esqueleto" style={{ height: 84 }} />
      ))}
    </div>
    <div className="adela-esqueleto mb-3" style={{ height: 320 }} />
    <div className="adela-esqueleto" style={{ height: 220 }} />
  </div>
)

export default EsqueletoReporte

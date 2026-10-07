import { ESCALA, formatoNumero, formatoPct, limitesEje } from './escala'

/**
 * Colores y opciones de Chart.js para los reportes. Un solo tono para una
 * serie (el título dice qué se grafica, no hace falta leyenda) y una rampa
 * ordinal de un solo tono para los niveles, de claro a oscuro. La rampa está
 * validada: monótona en luminosidad y el paso más claro supera 2:1 sobre blanco.
 */
export const COLOR_DATO = '#2a78d6'
export const COLOR_DATO_SUAVE = 'rgba(42, 120, 214, 0.10)'
export const RAMPA_NIVELES = [
  '#86b6ef',
  '#5598e7',
  '#2a78d6',
  '#1c5cab',
  '#104281',
]

const TINTA = '#16181d'
const TINTA_SUAVE = '#636874'
const REJILLA = '#eceef1'

/** Toma pasos repartidos de la rampa para n niveles, de claro a oscuro. */
export const coloresNiveles = (n) => {
  if (n <= 1) return [RAMPA_NIVELES[2]]
  return Array.from(
    { length: n },
    (_, i) =>
      RAMPA_NIVELES[Math.round((i * (RAMPA_NIVELES.length - 1)) / (n - 1))],
  )
}

const ticks = { color: TINTA_SUAVE, font: { size: 12 } }

const tooltip = {
  backgroundColor: TINTA,
  titleColor: '#ffffff',
  bodyColor: '#e7e9ee',
  padding: 10,
  cornerRadius: 8,
  displayColors: false,
}

const callbackEscala = (escala) =>
  escala === ESCALA.POMP ? (v) => `${v} %` : undefined

const tooltipEscala = (escala) => ({
  ...tooltip,
  callbacks: {
    label: (ctx) =>
      escala === ESCALA.POMP ? formatoPct(ctx.raw) : formatoNumero(ctx.raw),
  },
})

export const barraEstilos = (estilos, escala) => {
  const { min, max } = limitesEje(estilos, escala)
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipEscala(escala) },
    scales: {
      x: { grid: { display: false }, border: { color: REJILLA }, ticks },
      y: {
        min,
        max,
        grid: { color: REJILLA },
        border: { display: false },
        ticks: { ...ticks, callback: callbackEscala(escala) },
      },
    },
  }
}

export const radarEstilos = (estilos, escala) => {
  const { min, max } = limitesEje(estilos, escala)
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipEscala(escala) },
    scales: {
      r: {
        min,
        max,
        grid: { color: REJILLA },
        angleLines: { color: REJILLA },
        pointLabels: { color: TINTA, font: { size: 12, weight: '600' } },
        ticks: {
          ...ticks,
          backdropColor: 'transparent',
          callback: callbackEscala(escala),
        },
      },
    },
  }
}

/** Barras de recuento: horizontales si lo pide, enteros en el eje. */
export const barraConteo = ({ horizontal = false, leyenda = false } = {}) => {
  const ejeValor = horizontal ? 'x' : 'y'
  const ejeCategoria = horizontal ? 'y' : 'x'
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: {
        display: leyenda,
        position: 'bottom',
        labels: {
          color: TINTA,
          usePointStyle: true,
          pointStyle: 'rectRounded',
        },
      },
      tooltip: { ...tooltip, displayColors: leyenda },
    },
    scales: {
      [ejeCategoria]: {
        grid: { display: false },
        border: { color: REJILLA },
        ticks,
      },
      [ejeValor]: {
        beginAtZero: true,
        grid: { color: REJILLA },
        border: { display: false },
        ticks: { ...ticks, precision: 0 },
      },
    },
  }
}

/** Barras finas, extremo redondeado y base recta, sin borde. */
export const estiloBarra = (color) => ({
  backgroundColor: color,
  borderRadius: 4,
  borderSkipped: 'start',
  maxBarThickness: 24,
})

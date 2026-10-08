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

/**
 * Paso entero que reparte [min, max] en una de las cantidades pedidas de
 * tramos, para que los extremos del rango (12 y 48, -36 y 36) sean marcas y no
 * se amontonen con las automáticas. undefined deja el paso a Chart.js.
 */
const pasoEje = (min, max, tramos = [6, 5, 4]) => {
  const n = tramos.find((t) => Number.isInteger((max - min) / t))
  return n ? (max - min) / n : undefined
}

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
        ticks: {
          ...ticks,
          stepSize: pasoEje(min, max),
          callback: callbackEscala(escala),
        },
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
          // Pocos anillos: el radar es chico y las cifras tapan el polígono.
          stepSize: pasoEje(min, max, [3, 4, 5]),
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

/**
 * Mapa de cuadrantes (dispersión): cada eje va de su mínimo a su máximo y los
 * títulos nombran los polos ("← B · A →"). Solo el primer dataset (los puntos)
 * tiene tooltip; los otros dos son las líneas de corte.
 */
export const dispersionPlano = ({ x, y, tituloX, tituloY }) => {
  const eje = (rango, titulo) => ({
    type: 'linear',
    min: rango.min,
    max: rango.max,
    grid: { color: REJILLA },
    border: { color: REJILLA },
    ticks: { ...ticks, stepSize: pasoEje(rango.min, rango.max) },
    title: {
      display: true,
      text: titulo,
      color: TINTA,
      font: { size: 12, weight: '600' },
    },
  })
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltip,
        filter: (ctx) => ctx.datasetIndex === 0,
        callbacks: {
          label: (ctx) =>
            `${formatoNumero(ctx.raw.x)} · ${formatoNumero(ctx.raw.y)}`,
        },
      },
    },
    scales: { x: eje(x, tituloX), y: eje(y, tituloY) },
  }
}

/**
 * Plugin que escribe el nombre de cada esquina dentro del área del gráfico.
 * Con `activa` (la clave de una esquina, p. ej. 'xBajoYBajo') sombrea esa región
 * y resalta su nombre: así se ve de qué lado cuenta un punto que cae sobre un corte.
 */
export const esquinasPlano = (plano, activa) => ({
  id: 'esquinasPlano',
  beforeDatasetsDraw(chart) {
    if (!activa) return
    const { ctx, chartArea, scales } = chart
    const cx = scales.x.getPixelForValue(plano.corteX)
    const cy = scales.y.getPixelForValue(plano.corteY)
    const xs = activa.startsWith('xAlto')
      ? [cx, chartArea.right]
      : [chartArea.left, cx]
    const ys = activa.endsWith('YAlto')
      ? [chartArea.top, cy]
      : [cy, chartArea.bottom]
    ctx.save()
    ctx.fillStyle = COLOR_DATO_SUAVE
    ctx.fillRect(xs[0], ys[0], xs[1] - xs[0], ys[1] - ys[0])
    ctx.restore()
  },
  afterDatasetsDraw(chart) {
    const { ctx, chartArea } = chart
    const { left, right, top, bottom } = chartArea
    const ancho = (right - left) / 2 - 12
    ctx.save()
    ;[
      ['xBajoYAlto', left + 8, top + 8, 'left', 'top'],
      ['xAltoYAlto', right - 8, top + 8, 'right', 'top'],
      ['xBajoYBajo', left + 8, bottom - 8, 'left', 'bottom'],
      ['xAltoYBajo', right - 8, bottom - 8, 'right', 'bottom'],
    ].forEach(([clave, px, py, alinear, base]) => {
      const esActiva = clave === activa
      ctx.font = `${esActiva ? 800 : 600} 12px sans-serif`
      ctx.fillStyle = esActiva ? COLOR_DATO : TINTA_SUAVE
      ctx.textAlign = alinear
      ctx.textBaseline = base
      ctx.fillText(plano[clave], px, py, ancho)
    })
    ctx.restore()
  },
})

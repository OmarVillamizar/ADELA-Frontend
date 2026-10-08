/**
 * Escalas de los reportes. BRUTO es el puntaje directo; POMP es el % del
 * máximo posible, donde 0 % es el mínimo y 100 % el máximo que permite el
 * cuestionario. El puntaje directo solo se ofrece cuando todos los estilos
 * tienen el mismo rango: si no, el gráfico compara escalas distintas.
 */
export const ESCALA = Object.freeze({ BRUTO: 'BRUTO', POMP: 'POMP' })

export const etiquetaEscala = {
  [ESCALA.BRUTO]: 'Puntaje directo',
  [ESCALA.POMP]: '% del máximo',
}

export const AYUDA_POMP =
  '% del máximo posible: posición del puntaje dentro de su rango teórico. 0 % es el mínimo y 100 % el máximo que permite el cuestionario.'

export const AVISO_IPSATIVO =
  'Este cuestionario usa respuestas de jerarquización o reparto de puntos. Los puntajes de un estudiante dependen entre sí, por lo que la distribución de perfiles es más informativa que el promedio por estilo de aprendizaje.'

const num = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })
const pct = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export const formatoNumero = (v) => (v == null ? '-' : num.format(v))
export const formatoPct = (v) => (v == null ? '-' : `${pct.format(v)} %`)

export const escalasDisponibles = (calificacion) =>
  calificacion?.rangosHomogeneos ? [ESCALA.BRUTO, ESCALA.POMP] : [ESCALA.POMP]

export const escalaInicial = (calificacion) =>
  escalasDisponibles(calificacion)[0]

/**
 * Valor de un estilo en la escala. En un resultado individual el POMP viene
 * en pomp; en un reporte, como media de estadisticaPomp.
 */
export const valorEn = (estilo, escala) => {
  if (escala === ESCALA.POMP) {
    if (estilo.pomp !== undefined) return estilo.pomp
    return estilo.estadisticaPomp?.media ?? 0
  }
  return estilo.valor
}

export const limitesEje = (estilos, escala) => {
  if (escala === ESCALA.POMP || estilos.length === 0)
    return { min: 0, max: 100 }
  return {
    min: Math.min(...estilos.map((e) => e.rangoMin)),
    max: Math.max(...estilos.map((e) => e.rangoMax)),
  }
}

/** "18 / 20" o "5 en [-11, 11]"; "No calculable" si faltan respuestas. */
export const formatearPuntaje = (e) => {
  if (e.estado === 'NO_CALCULABLE' || e.valor == null) return 'No calculable'
  return e.rangoMin === 0
    ? `${num.format(e.valor)} / ${num.format(e.rangoMax)}`
    : `${num.format(e.valor)} en [${num.format(e.rangoMin)}, ${num.format(e.rangoMax)}]`
}

export const formatearRango = (e) =>
  `${num.format(e.rangoMin)} a ${num.format(e.rangoMax)}`

/**
 * Primarios (reciben puntos de las opciones) y compuestos (combinación de
 * primarios, p. ej. un polo A − B). Los compuestos tienen rango con negativos y
 * distinto: se muestran aparte para no estirar los ejes de los primarios.
 */
export const separarPorTipo = (estilos = []) => ({
  primarios: estilos.filter((e) => e.tipo !== 'COMPUESTO'),
  compuestos: estilos.filter((e) => e.tipo === 'COMPUESTO'),
})

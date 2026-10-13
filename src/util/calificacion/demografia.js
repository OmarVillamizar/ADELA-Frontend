/**
 * Género y edad de los estudiantes de un reporte de grupo: filtros y conteos
 * por estilo para el resumen del profesor. Todo se calcula en el navegador con
 * lo que ya trae el reporte (estudiante.genero, estudiante.fechaNacimiento y,
 * en los resueltos, dominantes y perfil).
 */

export const edad = (fechaNacimiento) => {
  if (fechaNacimiento == null) return null
  const nacimiento = new Date(fechaNacimiento)
  const hoy = new Date()
  let anios = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) anios--
  return anios
}

export const GENEROS = [
  { valor: 'FEMENINO', etiqueta: 'Femenino' },
  { valor: 'MASCULINO', etiqueta: 'Masculino' },
  { valor: 'NO_DECIR', etiqueta: 'Prefiere no decirlo' },
]
const SIN_DATO = 'Sin dato'

export const etiquetaGenero = (g) =>
  GENEROS.find((x) => x.valor === g)?.etiqueta ?? SIN_DATO

export const RANGOS_EDAD = [
  { valor: 'hasta15', etiqueta: '15 o menos', min: null, max: 15 },
  { valor: '16a17', etiqueta: '16 a 17', min: 16, max: 17 },
  { valor: '18a20', etiqueta: '18 a 20', min: 18, max: 20 },
  { valor: '21a25', etiqueta: '21 a 25', min: 21, max: 25 },
  { valor: 'desde26', etiqueta: '26 o más', min: 26, max: null },
]

const enRango = (anios, min, max) =>
  anios != null &&
  (min == null || anios >= min) &&
  (max == null || anios <= max)

export const rangoEdadDe = (anios) =>
  RANGOS_EDAD.find((r) => enRango(anios, r.min, r.max))?.etiqueta ?? SIN_DATO

export const TODOS = 'TODOS'
export const PERSONALIZADO = 'PERSONALIZADO'

export const FILTRO_INICIAL = {
  genero: TODOS,
  rango: TODOS,
  min: '',
  max: '',
}

/** Límites de edad del filtro; null en un lado = sin límite. */
const limitesFiltro = ({ rango, min, max }) => {
  if (rango === PERSONALIZADO) {
    return {
      min: min === '' ? null : Number(min),
      max: max === '' ? null : Number(max),
    }
  }
  const r = RANGOS_EDAD.find((x) => x.valor === rango)
  return r ? { min: r.min, max: r.max } : { min: null, max: null }
}

export const filtroActivo = (f) =>
  f.genero !== TODOS ||
  (f.rango !== TODOS &&
    !(f.rango === PERSONALIZADO && f.min === '' && f.max === ''))

/** Filas (ResultadoCuestionarioDTO) que cumplen género y edad. */
export const filtrar = (filas, f) => {
  const { min, max } = limitesFiltro(f)
  const conEdad = min != null || max != null
  return filas.filter(
    (r) =>
      (f.genero === TODOS || r.estudiante.genero === f.genero) &&
      (!conEdad || enRango(edad(r.estudiante.fechaNacimiento), min, max)),
  )
}

/** Texto corto del filtro para el PDF: "Femenino · 16 a 17 años". */
export const describirFiltro = (f) => {
  const partes = []
  if (f.genero !== TODOS) partes.push(etiquetaGenero(f.genero))
  const { min, max } = limitesFiltro(f)
  if (min != null && max != null) partes.push(`${min} a ${max} años`)
  else if (min != null) partes.push(`${min} años o más`)
  else if (max != null) partes.push(`${max} años o menos`)
  return partes.join(' · ')
}

/**
 * Esquemas que no eligen estilos destacados ni perfil: cada estilo se lee por
 * su nivel. Con ellos el resumen por perfil saldría siempre vacío.
 */
export const destacaEstilos = (esquema) =>
  !['BAREMO', 'NINGUNA'].includes(esquema)

export const SIN_DESTACADO =
  'Este cuestionario no elige un estilo destacado: cada estilo se lee por separado según el nivel en que cae su puntaje. Cuántos estudiantes hay en cada nivel está en «Niveles del grupo por estilo», en el Resumen.'

/**
 * Categorías del resumen. Si algún estudiante tiene estilos dominantes se
 * cuenta por estilo (alguien multimodal suma en varios); si no (mapa de cuatro
 * estilos, dominancia media) se cuenta por perfil, que es uno por persona.
 */
export const categoriasResumen = (resueltos, nombresEstilos) => {
  const porEstilo = resueltos.some((r) => r.dominantes?.length)
  if (porEstilo) {
    return {
      porEstilo,
      categorias: nombresEstilos,
      de: (r) => r.dominantes ?? [],
    }
  }
  const categorias = []
  resueltos.forEach((r) => {
    if (r.perfil && !categorias.includes(r.perfil)) categorias.push(r.perfil)
  })
  return { porEstilo, categorias, de: (r) => (r.perfil ? [r.perfil] : []) }
}

/** { categoria: cantidad } más los que no caen en ninguna. */
export const contar = (filas, { categorias, de }) => {
  const conteo = Object.fromEntries(categorias.map((c) => [c, 0]))
  let ninguna = 0
  filas.forEach((r) => {
    const cs = de(r).filter((c) => c in conteo)
    if (cs.length === 0) ninguna++
    cs.forEach((c) => conteo[c]++)
  })
  return { conteo, ninguna }
}

/** Filas agrupadas por una clave, en el orden de `orden` y luego el resto. */
export const agrupar = (filas, clave, orden) => {
  const grupos = new Map(orden.map((o) => [o, []]))
  filas.forEach((r) => {
    const k = clave(r)
    if (!grupos.has(k)) grupos.set(k, [])
    grupos.get(k).push(r)
  })
  return [...grupos].filter(([, fs]) => fs.length > 0)
}

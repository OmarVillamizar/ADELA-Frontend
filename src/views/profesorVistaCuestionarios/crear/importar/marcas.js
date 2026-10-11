/**
 * Marcas de revisión de un cuestionario importado (b.ia.marcas). Lo que la IA
 * o el validador dejaron para que una persona lo confirme antes de crear.
 * Funciones puras sobre el borrador, compartidas por la importación, el editor
 * avanzado y el botón de crear.
 */

export const ETIQUETA_RIESGO = {
  ALTO: 'Riesgo alto',
  MEDIO: 'Riesgo medio',
  BAJO: 'Riesgo bajo',
}

export const ETIQUETA_SECCION = {
  clave: 'Clave de puntaje',
  items: 'Preguntas',
  estilos: 'Estilos',
  compuestos: 'Estilos combinados',
  bandas: 'Niveles',
  escalones: 'Escalones',
  plano: 'Mapa de cuatro estilos',
  esquema: 'Lectura de resultados',
  complementaria: 'Pregunta extra',
  meta: 'Datos',
}

// Sección del editor avanzado donde se corrige cada tipo de marca.
const SECCION_DEL_EDITOR = {
  clave: 'preguntas',
  items: 'preguntas',
  estilos: 'estilos',
  compuestos: 'estilos',
  bandas: 'interpretacion',
  escalones: 'interpretacion',
  plano: 'interpretacion',
  esquema: 'interpretacion',
  complementaria: 'interpretacion',
  meta: 'datos',
}

export const seccionDelEditor = (marca) =>
  SECCION_DEL_EDITOR[marca.seccion] ?? 'datos'

/** Marca (tipo de sección) a la que pertenece un campo del contrato del servidor. */
export const seccionDeCampo = (campo) => {
  if (/preguntas/.test(campo)) return 'items'
  if (/bandas/.test(campo)) return 'bandas'
  if (/escalones/.test(campo)) return 'escalones'
  if (/plano/.test(campo)) return 'plano'
  if (/complementaria/.test(campo)) return 'complementaria'
  if (/^estilos/.test(campo)) return 'estilos'
  if (/^(interpretacion|esquema|delta)/.test(campo)) return 'esquema'
  return 'meta'
}

/** Rótulo legible de un campo con error: "json" es lo que la persona pegó. */
export const etiquetaDeCampo = (campo) =>
  campo === 'json' ? 'Tu JSON' : ETIQUETA_SECCION[seccionDeCampo(campo)]

/** Marcas del borrador que aún no se revisaron. */
export const pendientesDe = (b) => {
  const hechas = new Set(b.ia?.revisadas ?? [])
  return (b.ia?.marcas ?? []).filter((m) => !hechas.has(m.id))
}

/** Las de riesgo alto sin revisar: mientras haya, no se puede crear. */
export const altasPendientes = (b) =>
  pendientesDe(b).filter((m) => m.riesgo === 'ALTO')

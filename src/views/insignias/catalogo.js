import cuentaCompleta from 'src/assets/insignias/insignia_cuenta-completa.webp'
import primerCuestionario from 'src/assets/insignias/insignia_cuestionario.webp'
import primerReporte from 'src/assets/insignias/insignia_reporte.webp'

/**
 * Texto e imagen de cada insignia. El servidor solo dice cuáles se ganaron; el
 * orden de este arreglo es el de la cuadrícula.
 *
 * Las imágenes son a color: la versión bloqueada sale por CSS (grayscale), así
 * que cada insignia necesita un único archivo.
 */
export const CATALOGO_INSIGNIAS = [
  {
    codigo: 'CUENTA_COMPLETA',
    nombre: 'Perfil listo',
    texto: 'Completaste tu cuenta',
    pista: 'Completa los datos de tu cuenta',
    imagen: cuentaCompleta,
  },
  {
    codigo: 'PRIMER_CUESTIONARIO',
    nombre: 'Primer paso',
    texto: 'Respondiste tu primer cuestionario',
    pista: 'Responde tu primer cuestionario',
    imagen: primerCuestionario,
  },
  {
    codigo: 'PRIMER_REPORTE',
    nombre: 'Autoconocimiento',
    texto: 'Descubriste tu estilo de aprendizaje',
    pista: 'Abre el resultado de un cuestionario',
    imagen: primerReporte,
  },
]

export const insigniaPorCodigo = (codigo) =>
  CATALOGO_INSIGNIAS.find((insignia) => insignia.codigo === codigo)

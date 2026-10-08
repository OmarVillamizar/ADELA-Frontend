import { useCallback, useEffect, useState } from 'react'
import { borradorVacio } from './borrador'

const CLAVE = 'adela.borradorCuestionario'

/** Lee el borrador guardado; si no hay, el almacenamiento falla o está dañado, null. */
export const leerGuardado = () => {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return null
    return { ...borradorVacio(), ...JSON.parse(crudo) }
  } catch {
    return null
  }
}

const escribir = (b) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(b))
  } catch {
    // Sin almacenamiento (modo privado, cuota llena) el borrador vive solo en memoria.
  }
}

const borrar = () => {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // Nada que limpiar.
  }
}

/**
 * Borrador persistido en el navegador: recargar a mitad de un cuestionario
 * largo no pierde lo escrito. actualizar recibe una función pura de
 * borrador.js (b => b').
 */
const useBorrador = () => {
  const [borrador, setBorrador] = useState(
    () => leerGuardado() ?? borradorVacio(),
  )

  useEffect(() => {
    escribir(borrador)
  }, [borrador])

  const actualizar = useCallback((fn) => setBorrador((b) => fn(b)), [])

  const descartar = useCallback(() => {
    borrar()
    setBorrador(borradorVacio())
  }, [])

  return { borrador, actualizar, descartar }
}

export default useBorrador

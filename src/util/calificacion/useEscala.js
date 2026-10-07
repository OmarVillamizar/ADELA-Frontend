import { useState } from 'react'
import { escalasDisponibles } from './escala'

/**
 * Escala elegida por quien mira el reporte. Mientras no elija, o si la elegida
 * deja de estar disponible, se usa la primera posible: el puntaje directo si
 * los rangos son homogéneos, el % del máximo si no.
 */
export const useEscala = (calificacion) => {
  const disponibles = escalasDisponibles(calificacion)
  const [elegida, setEscala] = useState(null)
  const escala = disponibles.includes(elegida) ? elegida : disponibles[0]
  return { escala, setEscala, disponibles }
}

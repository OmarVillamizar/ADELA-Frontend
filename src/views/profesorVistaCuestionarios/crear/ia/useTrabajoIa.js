import { useCallback, useEffect, useState } from 'react'
import { consultarTrabajo } from '../../../../util/services/iaService'

const INTERVALO = 2000
const MAX_FALLOS = 5

/**
 * Consulta un trabajo de Nelse cada 2 s mientras siga EN_CURSO. Solo vuelve a
 * dibujar cuando cambia la versión del trabajo. Un 404 significa que expiró o
 * se canceló; varios fallos de red seguidos detienen la consulta hasta que se
 * llame a reconsultar (también tras pedir un ajuste, que lo reanuda).
 */
const useTrabajoIa = (id) => {
  const [trabajo, setTrabajo] = useState(null)
  const [error, setError] = useState(null)
  const [ronda, setRonda] = useState(0)

  useEffect(() => {
    if (!id) return undefined
    let vivo = true
    let reloj
    let version = null
    let fallos = 0

    const consultar = async () => {
      try {
        const t = await consultarTrabajo(id)
        if (!vivo) return
        fallos = 0
        setError(null)
        if (t.version !== version) {
          version = t.version
          setTrabajo(t)
        }
        if (t.estado === 'EN_CURSO') reloj = setTimeout(consultar, INTERVALO)
      } catch (e) {
        if (!vivo) return
        if (e?.status === 404) {
          setError({ id, perdido: true, mensaje: 'Este trabajo ya no existe.' })
          return
        }
        fallos += 1
        if (fallos >= MAX_FALLOS) {
          setError({ id, perdido: false, mensaje: e?.message })
          return
        }
        reloj = setTimeout(consultar, INTERVALO * fallos)
      }
    }

    consultar()
    return () => {
      vivo = false
      clearTimeout(reloj)
    }
  }, [id, ronda])

  const reconsultar = useCallback(() => setRonda((r) => r + 1), [])

  // Lo de un trabajo anterior no se muestra mientras llega el del nuevo id.
  return {
    trabajo: trabajo?.id === id ? trabajo : null,
    error: error?.id === id ? error : null,
    reconsultar,
  }
}

export default useTrabajoIa

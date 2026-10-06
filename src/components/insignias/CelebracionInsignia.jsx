import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { motion, useReducedMotion } from 'motion/react'
import confetti from 'canvas-confetti'
import './CelebracionInsignia.css'

const DURACION_VISIBLE_MS = 4500

// Sidebar abierto: vuela a "Mis insignias". Cerrado (móvil): al botón de menú.
const DESTINOS = ['[data-insignias-destino]', '.header-toggler']

const buscarDestino = () => {
  for (const selector of DESTINOS) {
    const el = document.querySelector(selector)
    const r = el?.getBoundingClientRect()
    if (r && r.width > 0 && r.right > 0 && r.left < window.innerWidth) {
      return el
    }
  }
  return null
}

const lanzarConfeti = () => {
  const base = { zIndex: 2001, disableForReducedMotion: true }
  confetti({ ...base, particleCount: 110, spread: 75, origin: { y: 0.45 } })
  confetti({
    ...base,
    particleCount: 50,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.7 },
  })
  confetti({
    ...base,
    particleCount: 50,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.7 },
  })
}

/**
 * Tres fases: entra en blanco y negro, se enciende a color con confeti, y vuela
 * encogiéndose hasta "Mis insignias". Se carga bajo demanda: motion y el confeti
 * no pesan en el bundle de quien no tiene nada que celebrar.
 */
const CelebracionInsignia = ({ insignia, onTerminar }) => {
  const reducirMovimiento = useReducedMotion()
  const medallaRef = useRef(null)
  const botonRef = useRef(null)
  const [imagenLista, setImagenLista] = useState(false)
  const [fase, setFase] = useState('entrada')
  const [vuelo, setVuelo] = useState(null)

  // Precarga: sin esto la medalla aparece vacía y se pinta a mitad del rebote.
  useEffect(() => {
    const img = new Image()
    img.src = insignia.imagen
    img
      .decode()
      .catch(() => {})
      .finally(() => setImagenLista(true))
  }, [insignia.imagen])

  const volar = useCallback(() => {
    if (fase === 'vuelo') return
    const destino = reducirMovimiento ? null : buscarDestino()
    const medalla = medallaRef.current?.getBoundingClientRect()
    if (!destino || !medalla) {
      setVuelo({ destino: null, animacion: { opacity: 0, scale: 0.85 } })
    } else {
      const d = destino.getBoundingClientRect()
      const dx = d.left + d.width / 2 - (medalla.left + medalla.width / 2)
      const dy = d.top + d.height / 2 - (medalla.top + medalla.height / 2)
      setVuelo({
        destino,
        // Arco: sube un poco antes de caer sobre el destino.
        animacion: {
          x: [0, dx * 0.3, dx],
          y: [0, dy * 0.3 - 140, dy],
          scale: [1, 0.75, 36 / medalla.width],
          rotate: [0, -12, 0],
          opacity: [1, 1, 0.9],
        },
      })
    }
    setFase('vuelo')
  }, [fase, reducirMovimiento])

  useEffect(() => {
    if (!imagenLista) return
    const t = setTimeout(() => {
      setFase('color')
      lanzarConfeti()
      botonRef.current?.focus()
    }, 650)
    return () => clearTimeout(t)
  }, [imagenLista])

  useEffect(() => {
    if (fase !== 'color') return
    const t = setTimeout(volar, DURACION_VISIBLE_MS)
    const conEscape = (e) => e.key === 'Escape' && volar()
    window.addEventListener('keydown', conEscape)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', conEscape)
    }
  }, [fase, volar])

  const aterrizar = () => {
    const destino = vuelo?.destino
    if (destino) {
      destino.classList.add('insignia-aterriza')
      setTimeout(() => destino.classList.remove('insignia-aterriza'), 1100)
    }
    onTerminar(insignia.codigo)
  }

  if (!imagenLista) return null

  const enVuelo = fase === 'vuelo'

  return (
    <div
      className="celebracion"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebracion-titulo"
    >
      <motion.div
        className="celebracion-fondo"
        initial={{ opacity: 0 }}
        animate={{ opacity: enVuelo ? 0 : 1 }}
        transition={{ duration: enVuelo ? 0.5 : 0.35 }}
        onClick={() => fase === 'color' && volar()}
      />

      <div className="celebracion-escena">
        <motion.div
          ref={medallaRef}
          className={`celebracion-medalla ${fase !== 'entrada' ? 'encendida' : ''}`}
          initial={
            reducirMovimiento
              ? { opacity: 0 }
              : { scale: 0.2, rotate: -25, opacity: 0 }
          }
          animate={
            enVuelo ? vuelo.animacion : { scale: 1, rotate: 0, opacity: 1 }
          }
          transition={
            enVuelo
              ? {
                  duration: 0.95,
                  ease: [0.55, 0, 0.25, 1],
                  times: [0, 0.35, 1],
                }
              : { type: 'spring', stiffness: 210, damping: 13 }
          }
          onAnimationComplete={() => enVuelo && aterrizar()}
        >
          <span className="celebracion-rayos" aria-hidden="true" />
          <img
            src={insignia.imagen}
            alt=""
            className="celebracion-img"
            draggable="false"
          />
          <span className="celebracion-brillo" aria-hidden="true" />
        </motion.div>

        <motion.div
          className="celebracion-texto"
          initial={{ opacity: 0, y: 24 }}
          animate={
            fase === 'color'
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: enVuelo ? 0 : 24 }
          }
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <span className="celebracion-etiqueta">¡Nueva insignia!</span>
          <h2 id="celebracion-titulo">{insignia.nombre}</h2>
          <p>{insignia.texto}</p>
          <button
            ref={botonRef}
            type="button"
            className="celebracion-boton"
            onClick={volar}
          >
            ¡Genial!
          </button>
        </motion.div>
      </div>
    </div>
  )
}

CelebracionInsignia.propTypes = {
  insignia: PropTypes.shape({
    codigo: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    texto: PropTypes.string.isRequired,
    imagen: PropTypes.string.isRequired,
  }).isRequired,
  onTerminar: PropTypes.func.isRequired,
}

export default CelebracionInsignia

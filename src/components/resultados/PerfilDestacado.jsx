import React from 'react'
import PropTypes from 'prop-types'
import './resultados.css'

/** Dominancia por nivel: cuántos estilos quedan en su nivel más alto. */
const DOMINANCIA = {
  SIMPLE: 'Dominancia simple',
  DOBLE: 'Dominancia doble',
  TRIPLE: 'Dominancia triple',
  CUADRUPLE: 'Dominancia cuádruple',
  MULTIPLE: 'Dominancia múltiple',
}

/** Texto de la dominancia por nivel, que siempre trae el código de niveles. */
const textoPorNivel = (tipo) => {
  if (tipo === 'SIMPLE') return 'Un estilo alcanza el nivel más alto.'
  if (DOMINANCIA[tipo]) return 'Estos estilos alcanzan el nivel más alto.'
  if (tipo === 'MEDIA')
    return 'Ningún estilo queda en el nivel más alto ni en el más bajo.'
  return 'Ningún estilo alcanza el nivel más alto.'
}

/**
 * El perfil de aprendizaje como lo define el manual del cuestionario (VARK,
 * Herrmann). Si el cuestionario no define dominancia, no se muestra nada. Con
 * dominancia por nivel se muestra también el código (1-2-3-3: el nivel de cada
 * estilo, en orden, contado desde el más alto), aunque ninguno domine.
 */
const PerfilDestacado = ({
  calificacion,
  titulo = 'Perfil de aprendizaje',
}) => {
  const codigo = calificacion?.perfilCodigo
  if (!calificacion?.perfilEtiqueta && !codigo) return null
  const multimodal = calificacion.perfilTipo === 'MULTIMODAL'
  const cuadrante = calificacion.perfilTipo === 'CUADRANTE'
  const dominancia = DOMINANCIA[calificacion.perfilTipo]
  return (
    <section className="adela-perfil adela-aparece" aria-label={titulo}>
      <p className="adela-perfil__etiqueta">{titulo}</p>
      <p className="adela-perfil__valor">
        {calificacion.perfilEtiqueta ?? 'Sin estilo dominante'}
      </p>
      <p className="adela-perfil__texto">
        {cuadrante ? (
          'Tu estilo según los dos ejes.'
        ) : codigo ? (
          <>
            {dominancia && (
              <span className="adela-chip adela-chip--claro me-2">
                {dominancia}
              </span>
            )}
            <span className="adela-chip adela-chip--claro me-2">
              Código {codigo}
            </span>
            {textoPorNivel(calificacion.perfilTipo)}
          </>
        ) : (
          <>
            <span className="adela-chip adela-chip--claro me-2">
              {multimodal ? 'Multimodal' : 'Unimodal'}
            </span>
            {multimodal
              ? 'Varios estilos se destacan casi por igual.'
              : 'Un estilo se destaca sobre los demás.'}
          </>
        )}
      </p>
    </section>
  )
}

PerfilDestacado.propTypes = {
  calificacion: PropTypes.shape({
    perfilEtiqueta: PropTypes.string,
    perfilTipo: PropTypes.string,
    perfilCodigo: PropTypes.string,
  }),
  titulo: PropTypes.string,
}

export default PerfilDestacado

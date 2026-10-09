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

/**
 * El perfil de aprendizaje como lo define el manual del cuestionario (VARK,
 * Herrmann). Si el cuestionario no define dominancia, no se muestra nada.
 */
const PerfilDestacado = ({
  calificacion,
  titulo = 'Perfil de aprendizaje',
}) => {
  if (!calificacion?.perfilEtiqueta) return null
  const multimodal = calificacion.perfilTipo === 'MULTIMODAL'
  const cuadrante = calificacion.perfilTipo === 'CUADRANTE'
  const dominancia = DOMINANCIA[calificacion.perfilTipo]
  return (
    <section className="adela-perfil adela-aparece" aria-label={titulo}>
      <p className="adela-perfil__etiqueta">{titulo}</p>
      <p className="adela-perfil__valor">{calificacion.perfilEtiqueta}</p>
      <p className="adela-perfil__texto">
        {cuadrante ? (
          'Tu estilo según los dos ejes.'
        ) : dominancia ? (
          <>
            <span className="adela-chip adela-chip--claro me-2">
              {dominancia}
            </span>
            {calificacion.perfilTipo === 'SIMPLE'
              ? 'Un estilo alcanza el nivel más alto.'
              : 'Estos estilos alcanzan el nivel más alto.'}
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
  }),
  titulo: PropTypes.string,
}

export default PerfilDestacado

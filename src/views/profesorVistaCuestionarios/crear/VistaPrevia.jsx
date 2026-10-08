import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import Swal from 'sweetalert2'
import PreguntasCuestionario from '../../../components/cuestionario/PreguntasCuestionario'
import { aVistaPrevia } from './borrador'

/**
 * El formulario real que verá el estudiante, con el borrador actual. Enviar
 * solo avisa: no se guarda nada.
 */
const VistaPrevia = ({ borrador }) => {
  const cuestionario = useMemo(() => aVistaPrevia(borrador), [borrador])
  // El formulario guarda su propio estado: se reinicia si cambia el borrador.
  const clave = useMemo(() => JSON.stringify(cuestionario), [cuestionario])

  if (cuestionario.preguntas.length === 0) {
    return (
      <p className="adela-falta">Agrega preguntas para ver la vista previa.</p>
    )
  }
  return (
    <PreguntasCuestionario
      key={clave}
      cuestionario={cuestionario}
      onEnviar={() =>
        Swal.fire(
          'Así lo verá el estudiante',
          'Esto es una vista previa: no se envió ninguna respuesta.',
          'info',
        )
      }
    />
  )
}

VistaPrevia.propTypes = {
  borrador: PropTypes.object.isRequired,
}

export default VistaPrevia

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import { getReporteEstudiante } from '../../util/services/cuestionarioService'
import ReporteIndividual from '../../components/resultados/ReporteIndividual'
import EsqueletoReporte from '../../components/resultados/EsqueletoReporte'

const ReporteEstudiante = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    getReporteEstudiante(id)
      .then((data) => {
        if (data.ok) {
          setResultado(data.data)
        } else {
          throw new Error('Error al obtener cuestionario')
        }
      })
      .catch(() => {
        navigate(-1)
      })
  }, [id, navigate])

  return (
    <CContainer>
      {resultado ? (
        <ReporteIndividual
          resultado={resultado}
          titulo={`Resultado de ${resultado.estudiante.nombre}`}
          onVolver={() => navigate(-1)}
        />
      ) : (
        <EsqueletoReporte />
      )}
    </CContainer>
  )
}

export default ReporteEstudiante

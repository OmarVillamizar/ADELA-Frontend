import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import { getCuestionarioResultado } from '../../util/services/cuestionarioService'
import { useInsignias } from '../../util/insignias/InsigniasProvider'
import ReporteIndividual from '../../components/resultados/ReporteIndividual'
import EsqueletoReporte from '../../components/resultados/EsqueletoReporte'

const ResultadoCuestionario = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    getCuestionarioResultado(id)
      .then((data) => {
        if (data.ok) {
          setResultado(data.data)
        } else {
          throw new Error('Error al obtener cuestionario')
        }
      })
      .catch(() => {
        navigate('/cuestionarios')
      })
  }, [id, navigate])

  // El backend otorga la insignia al servir el reporte; aquí solo se recoge.
  const { verificar } = useInsignias()
  const reporteCargado = resultado !== null
  useEffect(() => {
    if (reporteCargado) verificar('PRIMER_REPORTE')
  }, [reporteCargado, verificar])

  return (
    <CContainer>
      {resultado ? (
        <ReporteIndividual
          resultado={resultado}
          titulo="Tu resultado"
          onVolver={() => navigate('/cuestionarios/')}
        />
      ) : (
        <EsqueletoReporte />
      )}
    </CContainer>
  )
}

export default ResultadoCuestionario

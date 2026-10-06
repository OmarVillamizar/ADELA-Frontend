import { useEffect, useState } from 'react'
import { useNavigate, useParams, useOutletContext } from 'react-router-dom'
import { getCuestionarioResultado } from '../../util/services/cuestionarioService'
import { dateFromMsToString } from '../../util/dateUtils'
import { usePDF } from 'react-to-pdf'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CContainer,
  CButton,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import Swal from 'sweetalert2'
import { useInsignias } from '../../util/insignias/InsigniasProvider'
import GraficasResultado from '../../components/resultados/GraficasResultado'
import TablaRespuestas from '../../components/resultados/TablaRespuestas'

const ResultadoCuestionario = () => {
  const user = useOutletContext()
  const { id } = useParams()
  const navigate = useNavigate()

  const [resultado, setResultado] = useState({
    cuestionario: {
      id: 0,
      nombre: '',
      siglas: '',
      descripcion: '',
      autor: '',
      version: '',
    },
    estudiante: {
      nombre: '',
      fechaNacimiento: 0,
      genero: '',
    },
    preguntas: [{ pregunta: '', orden: 0, respuestas: [''] }],
    categorias: [{ nombre: '', valorMinimo: 0, valorMaximo: 0, valor: 0 }],
  })

  const { toPDF, targetRef } = usePDF({
    filename: `reporte-estudiante-${resultado.estudiante.nombre}.pdf`,
    page: {
      margin: 20,
      format: 'a4',
    },
  })

  const handleDownloadPDF = async () => {
    try {
      await toPDF()
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'El PDF se ha generado correctamente.',
      })
    } catch (error) {
      console.error('Error al generar PDF:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al generar el PDF.',
      })
    }
  }

  const calculateAge = (fechaNacimiento) => {
    const birthDate = new Date(fechaNacimiento)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDifference = today.getMonth() - birthDate.getMonth()

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  }

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
  const reporteCargado = resultado.cuestionario.id !== 0
  useEffect(() => {
    if (reporteCargado) verificar('PRIMER_REPORTE')
  }, [reporteCargado, verificar])

  return (
    <>
      <CAlert
        color="info"
        className="mb-2 d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: '#d3d3d3',
          border: '#d3d3d3',
          color: 'black',
          padding: '0.5rem',
          margin: '0 0.6rem 0 0.6rem',
        }}
      >
        <span className="fw-semibold text-black">Estudiante {user.nombre}</span>
        <div className="d-flex gap-2">
          <CButton
            color="primary"
            onClick={handleDownloadPDF}
            style={{ background: 'red', borderColor: 'black' }}
          >
            <CIcon icon={cilCloudDownload} className="me-2" />
            Descargar PDF
          </CButton>
          <CButton
            color="secondary"
            className="ml-auto"
            onClick={() => navigate('/cuestionarios/')}
          >
            Volver
          </CButton>
        </div>
      </CAlert>
      <CContainer>
        <div ref={targetRef}>
          <CRow>
            <CCol md={12}>
              <CCard>
                <CCardHeader>
                  <h5>Resultado del Cuestionario</h5>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    {/* Información del Cuestionario */}
                    <CCol md={6}>
                      <h6>Cuestionario</h6>
                      <p>
                        <strong>Nombre:</strong> {resultado.cuestionario.nombre}
                      </p>
                      <p>
                        <strong>Siglas:</strong> {resultado.cuestionario.siglas}
                      </p>
                      <p>
                        <strong>Descripción:</strong>{' '}
                        {resultado.cuestionario.descripcion}
                      </p>
                      <p>
                        <strong>Autor:</strong> {resultado.cuestionario.autor}
                      </p>
                      <p>
                        <strong>Versión:</strong>{' '}
                        {resultado.cuestionario.version}
                      </p>
                    </CCol>
                    {/* Información del Estudiante */}
                    <CCol md={6}>
                      <h6>Estudiante</h6>
                      <p>
                        <strong>Nombre:</strong> {resultado.estudiante.nombre}
                      </p>
                      {/* Solo las cuentas UFPS tienen código. */}
                      {resultado.estudiante.requiereCodigo && (
                        <p>
                          <strong>Código:</strong> {resultado.estudiante.codigo}
                        </p>
                      )}
                      <p>
                        <strong>Edad:</strong>{' '}
                        {calculateAge(resultado.estudiante.fechaNacimiento)}
                      </p>
                      <p>
                        <strong>Género:</strong> {resultado.estudiante.genero}
                      </p>
                      <p>
                        <strong>Fecha de Nacimiento:</strong>{' '}
                        {dateFromMsToString(
                          resultado.estudiante.fechaNacimiento,
                        )}
                      </p>
                    </CCol>
                    {/* Promedios por Categoría */}
                    <CCol md={12}>
                      <h6>Promedios por Categoría</h6>
                      <div className="mt-3">
                        <CRow>
                          {resultado.categorias.map((categoria, index) => (
                            <CCol md={3} key={index}>
                              <p>
                                <strong>{categoria.nombre}:</strong>{' '}
                                {Number.isNaN(Number(categoria.valor))
                                  ? 0
                                  : Number(categoria.valor).toFixed(2)}
                              </p>
                            </CCol>
                          ))}
                        </CRow>
                      </div>
                    </CCol>
                  </CRow>

                  <GraficasResultado
                    categorias={resultado.categorias}
                    etiqueta={resultado.estudiante.nombre}
                  />

                  <h6 className="mt-4">Preguntas</h6>
                  <TablaRespuestas preguntas={resultado.preguntas} />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </div>
      </CContainer>
    </>
  )
}

export default ResultadoCuestionario
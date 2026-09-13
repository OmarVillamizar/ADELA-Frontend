import React, { useEffect, useState } from 'react'
import { usePDF } from 'react-to-pdf'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CCol,
  CRow,
  CContainer,
  CAlert,
  CButton,
} from '@coreui/react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { obtenerReporteGrupo } from '../../util/services/cuestionarioService'
import { CChartBar, CChartPolarArea, CChartRadar } from '@coreui/react-chartjs'
import Swal from 'sweetalert2'
import CIcon from '@coreui/icons-react'
import { cilChart, cilCloudDownload } from '@coreui/icons'

const ReporteGrupo = () => {
  const { id1, id2 } = useParams()
  const navigate = useNavigate()

  const [reporte, setReporte] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // usePDF congela las opciones del primer render, cuando reporte todavia es
  // null: el nombre quedaba fijado como "reporte-grupo-undefined.pdf". El nombre
  // se pasa en la llamada, que ya ocurre con el reporte cargado.
  const { toPDF, targetRef } = usePDF({
    page: {
      margin: 20,
      format: 'a4',
    },
  })

  useEffect(() => {
    if (!id1 || !id2) {
      console.error('Parámetros faltantes.')
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontraron los parámetros requeridos para generar el reporte.',
      })
      navigate('/')
    } else {
      obtenerReporteGrupo(id1, id2)
        .then((data) => {
          setReporte(data)
          setLoading(false)
        })
        .catch((error) => {
          setError('Hubo un error al obtener el reporte.')
          setLoading(false)
          console.error('Error al obtener reporte:', error)
        })
    }
  }, [id1, id2, navigate])

  const handleDownloadPDF = async () => {
    try {
      await toPDF({ filename: `reporte-grupo-${reporte?.grupo?.nombre}.pdf` })
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

  if (error) {
    return (
      <CAlert color="danger">
        <p>{error}</p>
        <CButton color="secondary" onClick={() => navigate('/grupos')}>
          Volver
        </CButton>
      </CAlert>
    )
  }

  if (loading) {
    return <CAlert color="info">Cargando reporte...</CAlert>
  }

  if (!reporte) {
    return (
      <CAlert color="warning">
        <p>No se encontraron datos para mostrar.</p>
        <CButton color="secondary" onClick={() => navigate('/grupos')}>
          Volver
        </CButton>
      </CAlert>
    )
  }

  return (
    <CContainer>
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
        <span className="fw-semibold text-black">
          REPORTE DE RESULTADOS GRUPO
        </span>
        <div className="d-flex gap-2">
          <CButton
            color="primary"
            onClick={handleDownloadPDF}
            style={{ background: 'red', borderColor: 'black ' }}
          >
            <CIcon icon={cilCloudDownload} className="me-2" />
            Descargar PDF
          </CButton>
          <CButton
            color="secondary"
            onClick={() => navigate(`/resultado/${id2}/`)}
          >
            Volver
          </CButton>
        </div>
      </CAlert>

      <div ref={targetRef}>
        <CRow className="mt-4">
          <CCol md={12}>
            <CCard>
              <CCardHeader>
                <h4>Reporte de Grupo: {reporte?.grupo?.nombre}</h4>
                <p>
                  <strong>Cuestionario:</strong> {reporte?.cuestionario?.nombre}
                </p>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <h5>Estadísticas Generales</h5>
                    <p>
                      <strong>Fecha de Aplicación:</strong>{' '}
                      {new Date(reporte.fechaAplicacion).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Total Estudiantes:</strong>{' '}
                      {reporte.estudiantesResuelto.length +
                        reporte.estudiantesNoResuelto.length}
                    </p>
                    <p>
                      <strong>Estudiantes que resolvieron:</strong>{' '}
                      {reporte.estudiantesResuelto.length}
                    </p>
                    <p>
                      <strong>Estudiantes que no resolvieron:</strong>{' '}
                      {reporte.estudiantesNoResuelto.length}
                    </p>
                    <p>
                      <strong>Promedios por Categoría:</strong>
                    </p>
                    <div className="mt-3">
                      <CRow>
                        {reporte.categorias.map((categoria, index) => (
                          <CCol md={6} key={index}>
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
                  <CCol md={6}>
                    <CChartBar
                      data={{
                        labels: reporte.categorias.map((c) => c.nombre),
                        datasets: [
                          {
                            label: 'Promedio por Categoría',
                            backgroundColor: '#36A2EB',
                            data: reporte.categorias.map((c) => c.valor),
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            max: Math.max(
                              ...reporte.categorias.map((c) => c.valorMaximo),
                            ),
                            min: Math.min(
                              ...reporte.categorias.map((c) => c.valorMinimo),
                            ),
                          },
                        },
                      }}
                    />
                  </CCol>
                </CRow>

                <CRow className="mt-4">
                  <CCol md={6}>
                    <CChartRadar
                      data={{
                        labels: reporte.categorias.map((c) => c.nombre),
                        datasets: [
                          {
                            label: 'Promedio por Categoría',
                            data: reporte.categorias.map((c) => c.valor),
                            backgroundColor: 'rgba(75,192,192,0.2)',
                            borderColor: 'rgba(75,192,192,1)',
                            pointBackgroundColor: 'rgba(75,192,192,1)',
                          },
                        ],
                      }}
                      options={{
                        scales: {
                          r: {
                            suggestedMin: Math.max(
                              ...reporte.categorias.map((c) => c.valorMinimo),
                            ),
                            suggestedMax: Math.min(
                              ...reporte.categorias.map((c) => c.valorMaximo),
                            ),
                          },
                        },
                      }}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CChartPolarArea
                      data={{
                        labels: reporte.categorias.map((c) => c.nombre),
                        datasets: [
                          {
                            label: 'Promedio por Categoría',
                            data: reporte.categorias.map((c) => c.valor),
                          },
                        ],
                      }}
                      options={{
                        scales: {
                          r: {
                            suggestedMin: Math.max(
                              ...reporte.categorias.map((c) => c.valorMinimo),
                            ),
                            suggestedMax: Math.min(
                              ...reporte.categorias.map((c) => c.valorMaximo),
                            ),
                          },
                        },
                      }}
                    />
                  </CCol>
                </CRow>

                <h5 className="mt-4">Estudiantes</h5>
                <CTable hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Nombre</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                      <CTableHeaderCell>Ver Resultado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {reporte.estudiantesResuelto.map((estudiante, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>
                          {estudiante.estudiante.nombre}
                        </CTableDataCell>
                        <CTableDataCell>Resuelto</CTableDataCell>
                        <CTableDataCell>
                          <Link to={`/reporte-estudiante/${estudiante.id}`}>
                            <CButton color="success" size="sm">
                              <CIcon icon={cilChart} />
                            </CButton>
                          </Link>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                    {reporte.estudiantesNoResuelto.map((estudiante, index) => (
                      <CTableRow
                        key={reporte.estudiantesResuelto.length + index}
                      >
                        <CTableDataCell>
                          {reporte.estudiantesResuelto.length + index + 1}
                        </CTableDataCell>
                        <CTableDataCell>
                          {estudiante.estudiante.nombre}
                        </CTableDataCell>
                        <CTableDataCell>No Resuelto</CTableDataCell>
                        <CTableDataCell>-</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>
    </CContainer>
  )
}

export default ReporteGrupo
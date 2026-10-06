import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePDF } from 'react-to-pdf'
import Swal from 'sweetalert2'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CChartBar } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import GraficasResultado from '../../components/resultados/GraficasResultado'
import { obtenerReporteCapsula } from '../../util/services/capsulaService'

/**
 * Reporte global de una cápsula. Sin detalle por pregunta de cada persona: el
 * nombre no está verificado y el seguimiento individual es cosa de los grupos.
 */
const ReporteCapsula = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reporte, setReporte] = useState(null)
  const { toPDF, targetRef } = usePDF({ page: { margin: 20, format: 'a4' } })

  useEffect(() => {
    obtenerReporteCapsula(id)
      .then(setReporte)
      .catch((error) => {
        Swal.fire('Error', error.message, 'error')
        navigate('/capsulas')
      })
  }, [id, navigate])

  if (!reporte) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  const { capsula, estilos, participantes, totalRespuestas } = reporte

  const descargar = async () => {
    try {
      await toPDF({ filename: `reporte-capsula-${capsula.codigo}.pdf` })
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al generar el PDF.', 'error')
    }
  }

  return (
    <CContainer>
      <CAlert
        color="info"
        className="mb-2 d-flex justify-content-between align-items-center flex-wrap gap-2"
        style={{
          backgroundColor: '#d3d3d3',
          border: '#d3d3d3',
          color: 'black',
          padding: '0.5rem',
        }}
      >
        <span className="fw-semibold text-black">REPORTE DE CÁPSULA</span>
        <div className="d-flex gap-2">
          <CButton
            color="primary"
            onClick={descargar}
            disabled={totalRespuestas === 0}
            style={{ background: 'red', borderColor: 'black' }}
          >
            <CIcon icon={cilCloudDownload} className="me-2" />
            Descargar PDF
          </CButton>
          <CButton
            color="secondary"
            onClick={() => navigate(`/capsulas/${id}`)}
          >
            Volver
          </CButton>
        </div>
      </CAlert>

      <div ref={targetRef}>
        <CCard className="mt-3 mb-4">
          <CCardHeader>
            <h4>{capsula.nombre}</h4>
            <p className="mb-0">
              <strong>Cuestionario:</strong> {capsula.cuestionarioNombre} (
              {capsula.cuestionarioSiglas})
            </p>
          </CCardHeader>
          <CCardBody>
            {totalRespuestas === 0 ? (
              <p className="mb-0">Esta cápsula todavía no tiene respuestas.</p>
            ) : (
              <>
                <CRow>
                  <CCol md={4}>
                    <p>
                      <strong>Respuestas:</strong> {totalRespuestas}
                    </p>
                    <p>
                      <strong>Participantes:</strong>{' '}
                      {capsula.modoIdentificacion === 'NOMBRE'
                        ? 'con nombre'
                        : 'anónimos'}
                    </p>
                    <p>
                      <strong>Estado:</strong>{' '}
                      {capsula.abierta ? 'abierta' : 'cerrada'}
                    </p>
                    <p className="mb-1">
                      <strong>Promedio por estilo:</strong>
                    </p>
                    {estilos.map((c) => (
                      <p key={c.nombre} className="mb-1">
                        {c.nombre}: {c.promedio.toFixed(2)}
                      </p>
                    ))}
                  </CCol>
                  <CCol md={8}>
                    <h6>Estilo predominante</h6>
                    <CChartBar
                      data={{
                        labels: estilos.map((c) => c.nombre),
                        datasets: [
                          {
                            label: 'Personas',
                            backgroundColor: '#4BC0C0',
                            data: estilos.map((c) => c.predominantes),
                          },
                        ],
                      }}
                      options={{
                        indexAxis: 'y',
                        scales: {
                          x: { beginAtZero: true, ticks: { precision: 0 } },
                        },
                      }}
                    />
                    <small className="text-medium-emphasis">
                      Quien empata entre varios estilos cuenta en cada uno, así
                      que la suma puede superar el total de respuestas.
                    </small>
                  </CCol>
                </CRow>

                <h6 className="mt-4">Promedios</h6>
                <GraficasResultado
                  estilos={estilos}
                  etiqueta="Promedio"
                  valor={(c) => c.promedio}
                />
              </>
            )}
          </CCardBody>
        </CCard>

        {participantes && participantes.length > 0 && (
          <CCard className="mb-4">
            <CCardHeader>Participantes</CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Fecha</CTableHeaderCell>
                    <CTableHeaderCell>Estilo predominante</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {participantes.map((p, i) => (
                    <CTableRow key={i}>
                      <CTableDataCell>{p.nombre}</CTableDataCell>
                      <CTableDataCell>
                        {new Date(p.respondidaEn).toLocaleString('es-CO')}
                      </CTableDataCell>
                      <CTableDataCell>
                        {p.predominantes.join(', ') || '—'}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        )}
      </div>
    </CContainer>
  )
}

export default ReporteCapsula

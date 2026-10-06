import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import Swal from 'sweetalert2'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSwitch,
  CInputGroup,
  CModal,
  CModalBody,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilCopy, cilFullscreen } from '@coreui/icons'
import {
  actualizarCapsula,
  enlaceCapsula,
  obtenerCapsula,
} from '../../util/services/capsulaService'

/** Panel para compartir una cápsula: enlace, QR y modo proyección. */
const CapsulaDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const qrRef = useRef(null)
  const [capsula, setCapsula] = useState(null)
  const [proyectando, setProyectando] = useState(false)

  useEffect(() => {
    obtenerCapsula(id)
      .then(setCapsula)
      .catch((error) => {
        Swal.fire('Error', error.message, 'error')
        navigate('/capsulas')
      })
  }, [id, navigate])

  if (!capsula) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  const enlace = enlaceCapsula(capsula.codigo)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace)
      Swal.fire({
        icon: 'success',
        title: '¡Copiado!',
        text: 'Enlace copiado al portapapeles',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      })
    } catch (err) {
      Swal.fire('Error', 'No se pudo copiar al portapapeles', 'error')
    }
  }

  const descargarQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `qr-capsula-${capsula.codigo}.png`
    a.click()
  }

  const actualizar = async (cambios) => {
    try {
      setCapsula(await actualizarCapsula(capsula.id, cambios))
    } catch (error) {
      Swal.fire('Error', error.message, 'error')
    }
  }

  const renombrar = async () => {
    const { value } = await Swal.fire({
      title: 'Renombrar cápsula',
      input: 'text',
      inputValue: capsula.nombre,
      inputAttributes: { maxlength: 100 },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (v) => (!v.trim() ? 'El nombre es obligatorio' : null),
    })
    if (value) actualizar({ nombre: value.trim() })
  }

  return (
    <>
      <CAlert
        color="info"
        className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
        style={{
          backgroundColor: '#d3d3d3',
          border: '#d3d3d3',
          color: 'black',
          padding: '0.5rem',
        }}
      >
        <span className="fw-semibold text-black">
          Cápsula: {capsula.nombre}
        </span>
        <div className="d-flex gap-2">
          <CButton color="light" onClick={renombrar}>
            Renombrar
          </CButton>
          <CButton color="secondary" onClick={() => navigate('/capsulas')}>
            Volver
          </CButton>
        </div>
      </CAlert>

      <CRow>
        <CCol lg={7} className="mb-4">
          <CCard className="h-100">
            <CCardHeader>Compartir</CCardHeader>
            <CCardBody>
              <p className="mb-2">
                Quien abra este enlace o escanee el QR responde{' '}
                <strong>{capsula.cuestionarioNombre}</strong> sin crear cuenta.
              </p>
              <CInputGroup className="mb-3">
                <CFormInput value={enlace} readOnly aria-label="Enlace" />
                <CButton color="primary" onClick={copiar}>
                  <CIcon icon={cilCopy} className="me-1" />
                  Copiar
                </CButton>
              </CInputGroup>
              <div className="d-flex flex-wrap gap-2">
                <CButton color="dark" onClick={() => setProyectando(true)}>
                  <CIcon icon={cilFullscreen} className="me-1" />
                  Proyectar
                </CButton>
                <CButton color="secondary" onClick={descargarQR}>
                  <CIcon icon={cilCloudDownload} className="me-1" />
                  Descargar QR
                </CButton>
              </div>
              <hr />
              <p className="mb-1">
                <strong>Participantes:</strong>{' '}
                {capsula.modoIdentificacion === 'NOMBRE'
                  ? 'escriben su nombre antes de empezar'
                  : 'anónimos'}
              </p>
              <p className="mb-1">
                <strong>Respuestas recibidas:</strong> {capsula.numRespuestas}
              </p>
              <CFormSwitch
                className="mt-2"
                label={
                  capsula.abierta
                    ? 'Abierta: recibe respuestas'
                    : 'Cerrada: el enlace ya no acepta respuestas'
                }
                checked={capsula.abierta}
                onChange={() => actualizar({ abierta: !capsula.abierta })}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={5} className="mb-4">
          <CCard className="h-100">
            <CCardBody className="d-flex flex-column align-items-center justify-content-center">
              <div ref={qrRef}>
                <QRCodeCanvas value={enlace} size={240} marginSize={2} />
              </div>
              <p className="mt-2 mb-0 fs-5 fw-semibold">{capsula.codigo}</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal
        fullscreen
        visible={proyectando}
        onClose={() => setProyectando(false)}
      >
        <CModalBody
          className="d-flex flex-column align-items-center justify-content-center text-center"
          onClick={() => setProyectando(false)}
          style={{ cursor: 'pointer' }}
        >
          <h1 className="mb-4">{capsula.nombre}</h1>
          <QRCodeSVG
            value={enlace}
            marginSize={2}
            style={{ width: 'min(70vh, 90vw)', height: 'min(70vh, 90vw)' }}
          />
          <p className="mt-4 fs-3 text-break">{enlace}</p>
          <small className="text-medium-emphasis">
            Toca en cualquier lugar para salir
          </small>
        </CModalBody>
      </CModal>
    </>
  )
}

export default CapsulaDetalle

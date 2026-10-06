import React, { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import {
  actualizarCapsula,
  crearCapsula,
  eliminarCapsula,
  listarCapsulas,
} from '../../util/services/capsulaService'
import { listarCuestionarios } from '../../util/services/cuestionarioService'

const formularioVacio = {
  nombre: '',
  cuestionarioId: '',
  modoIdentificacion: 'ANONIMO',
}

/**
 * Cápsulas del profesor: un cuestionario compartido por enlace o QR para que
 * lo respondan personas sin cuenta. Para seguimiento individual están los grupos.
 */
const Capsulas = () => {
  const user = useOutletContext()
  const navigate = useNavigate()
  const [capsulas, setCapsulas] = useState([])
  const [cuestionarios, setCuestionarios] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [form, setForm] = useState(formularioVacio)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    listarCapsulas()
      .then(setCapsulas)
      .catch((error) => Swal.fire('Error', error.message, 'error'))
  }, [])

  const abrirModal = () => {
    setForm(formularioVacio)
    setErrores({})
    setModalVisible(true)
    if (cuestionarios.length === 0) {
      listarCuestionarios()
        .then(setCuestionarios)
        .catch((error) => Swal.fire('Error', error.message, 'error'))
    }
  }

  const crear = async () => {
    setGuardando(true)
    try {
      const nueva = await crearCapsula({
        ...form,
        nombre: form.nombre.trim(),
        cuestionarioId: form.cuestionarioId
          ? Number(form.cuestionarioId)
          : null,
      })
      setModalVisible(false)
      navigate(`/capsulas/${nueva.id}`)
    } catch (error) {
      setErrores(error.fields ?? {})
      if (!error.fields) Swal.fire('Error', error.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const alternarAbierta = async (capsula) => {
    try {
      const actualizada = await actualizarCapsula(capsula.id, {
        abierta: !capsula.abierta,
      })
      setCapsulas((previas) =>
        previas.map((c) => (c.id === actualizada.id ? actualizada : c)),
      )
    } catch (error) {
      Swal.fire('Error', error.message, 'error')
    }
  }

  const eliminar = (capsula) => {
    Swal.fire({
      title: `¿Eliminar la cápsula ${capsula.nombre}?`,
      text: `Se borrarán sus ${capsula.numRespuestas} respuestas y los participantes ya no podrán consultar su resultado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return
      eliminarCapsula(capsula.id)
        .then(() => {
          setCapsulas((previas) => previas.filter((c) => c.id !== capsula.id))
          Swal.fire('¡Eliminada!', 'La cápsula ha sido eliminada.', 'success')
        })
        .catch((error) => Swal.fire('Error', error.message, 'error'))
    })
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CAlert
            color="info"
            className="mb-4"
            style={{
              backgroundColor: '#d3d3d3',
              border: '#d3d3d3',
              color: 'black',
            }}
          >
            Bienvenid@ Profesor {user.nombre}. Una cápsula comparte un
            cuestionario por enlace o QR: cualquiera lo responde sin cuenta y ve
            su resultado al terminar.
          </CAlert>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>Listado de Cápsulas</span>
              <CButton
                color="success"
                onClick={abrirModal}
                style={{ color: 'white' }}
              >
                Añadir Cápsula
              </CButton>
            </CCardHeader>
            <CCardBody>
              {capsulas.length === 0 ? (
                <p>No hay cápsulas creadas</p>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Nombre</CTableHeaderCell>
                      <CTableHeaderCell>Cuestionario</CTableHeaderCell>
                      <CTableHeaderCell>Participantes</CTableHeaderCell>
                      <CTableHeaderCell>Respuestas</CTableHeaderCell>
                      <CTableHeaderCell>Abierta</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {capsulas.map((capsula) => (
                      <CTableRow
                        key={capsula.id}
                        onClick={() => navigate(`/capsulas/${capsula.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <CTableDataCell>{capsula.nombre}</CTableDataCell>
                        <CTableDataCell>
                          {capsula.cuestionarioSiglas}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="secondary">
                            {capsula.modoIdentificacion === 'NOMBRE'
                              ? 'Con nombre'
                              : 'Anónimos'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>{capsula.numRespuestas}</CTableDataCell>
                        <CTableDataCell onClick={(e) => e.stopPropagation()}>
                          <CFormSwitch
                            checked={capsula.abierta}
                            onChange={() => alternarAbierta(capsula)}
                            aria-label="Abierta"
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              eliminar(capsula)
                            }}
                          >
                            {' '}
                            -{' '}
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Nueva cápsula</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel htmlFor="capsula-nombre">Nombre</CFormLabel>
              <CFormInput
                id="capsula-nombre"
                maxLength={100}
                placeholder="Ej. Charla de bienvenida"
                value={form.nombre}
                invalid={!!errores.nombre}
                feedbackInvalid={errores.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="capsula-cuestionario">
                Cuestionario
              </CFormLabel>
              <CFormSelect
                id="capsula-cuestionario"
                value={form.cuestionarioId}
                invalid={!!errores.cuestionarioId}
                feedbackInvalid={errores.cuestionarioId}
                onChange={(e) =>
                  setForm({ ...form, cuestionarioId: e.target.value })
                }
              >
                <option value="">Elige un cuestionario</option>
                {cuestionarios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.siglas})
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="mb-2">
              <CFormLabel>Participantes</CFormLabel>
              <CFormCheck
                type="radio"
                name="modo"
                id="modo-anonimo"
                label="Anónimos: nadie escribe su nombre"
                checked={form.modoIdentificacion === 'ANONIMO'}
                onChange={() =>
                  setForm({ ...form, modoIdentificacion: 'ANONIMO' })
                }
              />
              <CFormCheck
                type="radio"
                name="modo"
                id="modo-nombre"
                label="Con nombre: escriben su nombre antes de empezar"
                checked={form.modoIdentificacion === 'NOMBRE'}
                onChange={() =>
                  setForm({ ...form, modoIdentificacion: 'NOMBRE' })
                }
              />
            </div>
            <small className="text-medium-emphasis">
              El cuestionario y el modo no se pueden cambiar después de crearla.
            </small>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton
            color="success"
            style={{ color: 'white' }}
            disabled={guardando}
            onClick={crear}
          >
            Crear
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Capsulas

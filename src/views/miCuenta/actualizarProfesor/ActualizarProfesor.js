import React, { useState, useEffect } from 'react'
import {
  CForm,
  CCol,
  CFormInput,
  CFormSelect,
  CButton,
  CCard,
  CCardBody,
  CRow,
  CAlert,
} from '@coreui/react'
import Swal from 'sweetalert2'
import './botonActualizar.css'
import { updateUserInfo } from '../../../util/services/userService'
import { useNavigate, useOutletContext } from 'react-router-dom'

const ActualizarCuentaProfesor = () => {
  const user = useOutletContext()
  const navigate = useNavigate()

  // Estado y funciones de manejadores
  const [formData, setFormData] = useState({
    codigo: user.codigo,
    carrera: user.carrera,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar campos vacíos
    if (!formData.codigo || !formData.carrera) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos.',
        icon: 'warning',
      })
      return
    }

    // Simulación de llamada al backend
    const userUpd = { ...user, ...formData }
    // Simulación de llamada al backend
    updateUserInfo(userUpd)
      .then((response) => {
        if (response.ok) {
          Swal.fire({
            title: '¡Cuenta actualizada!',
            text: 'Los datos de la cuenta han sido actualizados correctamente.',
            icon: 'success',
          }).then(() => {
            // Agregar un retraso de 5 segundos antes de recargar la página
            setTimeout(() => {
              navigate(0)
            }, 1000)
          })
        } else {
          throw new Error('Error al actualizar la cuenta: ')
        }
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
        })
      })
  }

  return (
    <>
      <CAlert
        color="info"
        className="d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: '#d3d3d3',
          border: '#d3d3d3',
          color: 'black',
        }}
      >
        Bienvenid@ Profesor {user.nombre}
      </CAlert>
      <CCard className="mb-4">
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="g-3">
              <CCol md={6}>
                {/* type="number" ignora maxLength, asi que el campo es de texto con
                    teclado numerico. El limite son los 8 caracteres de la columna. */}
                <CFormInput
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  id="inputCodigoNumber"
                  label="Código de Profesor"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  id="inputCarrera"
                  label="Carrera"
                  name="carrera"
                  value={formData.carrera}
                  onChange={handleChange}
                >
                  <option value="">Choose...</option>
                  <option value="109">109 - Ingeniería Electromecánica</option>
                  <option value="111">111 - Ingeniería Civil</option>
                  <option value="112">112 - Ingeniería Mecánica</option>
                  <option value="115">115 - Ingeniería de Sistemas</option>
                  <option value="116">116 - Ingeniería Electrónica</option>
                  <option value="118">118 - Ingeniería de Minas</option>
                  <option value="119">119 - Ingeniería Industrial</option>
                  <option value="161">161 - Ingeniería Biotecnológica</option>
                  <option value="162">162 - Ingeniería Agronómica</option>
                  <option value="163">163 - Ingeniería Pecuaria</option>
                  <option value="164">164 - Ingeniería Agroindustrial</option>
                  <option value="165">165 - Ingeniería Ambiental</option>
                </CFormSelect>
              </CCol>
              <CCol xs={12} className="text-center">
                <CButton
                  color="primary"
                  type="submit"
                  className="custom-warning-button"
                  style={{ fontSize: 'bold' }}
                >
                  Actualizar cuenta
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default ActualizarCuentaProfesor

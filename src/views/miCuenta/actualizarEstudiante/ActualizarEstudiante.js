import React, { useState, useEffect } from 'react'
import {
  CForm,
  CCol,
  CFormInput,
  CFormSelect,
  CButton,
  CFormFloating,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
import Swal from 'sweetalert2'
import './botonActualizar.css'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { dateFromMsToString } from '../../../util/dateUtils'
import { updateUserInfo } from '../../../util/services/userService'

const ActualizarEstudiante = () => {
  // Estado y funciones de manejadores
  const user = useOutletContext()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    codigo: user.codigo,
    // Cadena vacía, no el guión: este valor entra en un <input type="date">.
    fechaNacimiento: dateFromMsToString(user.fechaNacimiento, ''),
    genero: user.genero,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar campos vacíos
    if (!formData.codigo || !formData.fechaNacimiento || !formData.genero) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos.',
        icon: 'warning',
      })
      return
    }

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
          throw new Error('Error al actualizar la cuenta')
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

  // useEffect para manejar efectos secundarios si es necesario
  useEffect(() => {
    // cargar datos iniciales si es necesario
  }, [])

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="bg-light">
        <h4 className="mb-0">Actualizar Información de Estudiante</h4>
      </CCardHeader>
      <CCardBody>
        <CForm className="row g-4" onSubmit={handleSubmit}>
          <CCol md={6}>
            <CFormFloating>
              {/* type="number" ignora maxLength, asi que el campo es de texto con
                  teclado numerico. El limite son los 8 caracteres de la columna. */}
              <CFormInput
                type="text"
                inputMode="numeric"
                maxLength={8}
                id="inputCodigoNumber"
                placeholder="Ingrese código"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
              />
              <label htmlFor="inputCodigoNumber">Código de Estudiante</label>
            </CFormFloating>
          </CCol>

          <CCol md={6}>
            <CFormFloating>
              <CFormInput
                type="date"
                id="inputFechaNacimiento"
                placeholder="Seleccione fecha"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
              />
              <label htmlFor="inputFechaNacimiento">Fecha de Nacimiento</label>
            </CFormFloating>
          </CCol>

          <CCol md={6}>
            <CFormFloating>
              <CFormSelect
                id="inputGenero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                aria-label="Seleccione género"
              >
                <option value="">Seleccione...</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="NO_DECIR">Prefiero no decirlo</option>
              </CFormSelect>
              <label htmlFor="inputGenero">Género</label>
            </CFormFloating>
          </CCol>

          <CCol
            xs={12}
            className="d-grid gap-2 d-md-flex justify-content-md-end"
          >
            <CButton
              color="primary"
              type="submit"
              className="px-4"
              style={{
                '--cui-btn-color': '#000000', // Changed to black
                '--cui-btn-bg': '#ffc107',
                '--cui-btn-border-color': '#ffc107',
                '--cui-btn-hover-bg': '#ffca2c',
                '--cui-btn-hover-border-color': '#ffc720',
              }}
            >
              Actualizar cuenta
            </CButton>
          </CCol>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default ActualizarEstudiante

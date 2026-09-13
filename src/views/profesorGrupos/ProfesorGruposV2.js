import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import Autosuggest from 'react-autosuggest'
import Papa from 'papaparse'

import {
  CCard,
  CCardBody,
  CCol,
  CCardHeader,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CButtonGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
} from '@coreui/react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  getGroups,
  buscarEstudiantes,
  deleteGrupo,
  createGrupo,
  addStudentsToGroup,
  getGroupById,
} from '../../util/services/grupoService'

const ProfesorGrupos = () => {
  const user = useOutletContext()
  const [nombre, setNombre] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [grupos, setGrupos] = useState([])
  const [expandedGrupoId, setExpandedGrupoId] = useState(null)
  const [emails, setEmails] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [currentGrupoId, setCurrentGrupoId] = useState(null)
  const [selectedNewStudents, setSelectedNewStudents] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getGroups()
      .then((data) => setGrupos(data))
      .catch((error) => {
        console.error('Error fetching grupos:', error)
      })
  }, [])


  const handleDelete = (grupo) => {
    Swal.fire({
      title: `¿Estás seguro que quieres eliminar el grupo ${grupo.nombre} con ${grupo.numEstudiantes} estudiantes?`,
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteGrupo(grupo.id)
          .then(() => {
            setGrupos(grupos.filter((g) => g.id !== grupo.id))
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El grupo ha sido eliminado.',
              icon: 'success',
            })
          })
          .catch((error) => {
            console.error('Error deleting grupo:', error)
            Swal.fire({
              title: 'Error',
              text: 'Hubo un error al eliminar el grupo.',
              icon: 'error',
            })
          })
      }
    })
  }

  const handleFileChangeCreateGroup = (e) => {
    const updatedStudents = []

    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    handleFileUpload(e.target.files[0], updatedStudents)
  }

  const handleFileUpload = (file, updatedStudents) => {
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const emailsArray = result.data
            .map((row) => {
              return { email: row.email ?? row.correo, nombre: row.nombre }
            })
            .filter((email) => email.email)
          const csvStudents = emailsArray.map((email) => ({
            email: email.email,
            fromCSV: true,
            nombre: email.nombre,
          }))

          const uniqueCsvStudents = csvStudents.filter(
            (csvStudent) =>
              !updatedStudents.some(
                (selectedStudent) => selectedStudent.email === csvStudent.email,
              ),
          )

          setSelectedStudents(uniqueCsvStudents)
        },
        header: true,
      })
    }
  }

  const handleCreateGroup = (e) => {
    e.preventDefault()
    if (!nombre) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos.',
        icon: 'warning',
      })
      return
    }

    const emailsArray = selectedStudents.map((student) => {
      return { email: student.email, nombre: student.nombre }
    })
    const grupoDTO = {
      nombre: nombre,
      profesorEmail: user.email,
      estudiantes: emailsArray,
    }

    getGroups()
      .then((res) => {
        const grupoExistente = res.find(
          (grupo) => grupo.nombre.toLowerCase() === nombre.toLowerCase(),
        )
        if (grupoExistente) {
          Swal.fire({
            title: 'Conflicto',
            text: 'Ya existe un grupo con este nombre.',
            icon: 'error',
          })
        } else {
          createGrupo(grupoDTO)
            .then((response) => {
              Swal.fire({
                title: '¡Grupo creado exitosamente!',
                text: 'El grupo ha sido creado con éxito.',
                icon: 'success',
              })
              setModalVisible(false)
              const x = {
                ...response,
                numEstudiantes: response.estudiantes.length,
              }
              setGrupos([...grupos, x])
              clearForm() // Limpiar la lista de estudiantes seleccionados y otros campos del formulario
            })
            .catch((error) => {
              console.error('Error creando el grupo:', error.message || error)
              Swal.fire({
                title: 'Error',
                text: error.message || 'Hubo un error al crear el grupo.',
                icon: 'error',
              })
            })
        }
      })
      .catch((error) => {
        console.error(
          'Error verificando el nombre del grupo:',
          error.message || error,
        )
        Swal.fire({
          title: 'Error',
          text:
            error.message || 'Hubo un error al verificar el nombre del grupo.',
          icon: 'error',
        })
      })
  }


  const getSuggestionValue = (suggestion) => suggestion.email

  const renderSuggestion = (suggestion) => <div>{suggestion.email}</div>

  const onSuggestionsFetchRequested = ({ value }) => {
    const termino = value.trim()
    // Con menos de dos caracteres la consulta devolveria medio padron sin acotar
    // nada; el usuario todavia no ha escrito lo suficiente para buscar.
    if (termino.length < 2) {
      setSuggestions([])
      return
    }
    buscarEstudiantes(termino)
      .then(setSuggestions)
      .catch((error) => {
        console.error('Error buscando estudiantes:', error.code, error.message)
        setSuggestions([])
      })
  }

  const onSuggestionsClearRequested = () => {
    setSuggestions([])
  }

  const onSuggestionSelected = (event, { suggestion }) => {
    if (
      !selectedStudents.some((student) => student.email === suggestion.email)
    ) {
      setSelectedStudents([...selectedStudents, suggestion])
    }
    setEmails('') // Limpiar el campo de búsqueda después de seleccionar un estudiante
  }

  const clearForm = () => {
    setNombre('')
    setEmails('')
    setSelectedStudents([])
    document.getElementById('file').value = null // Limpiar el input del archivo CSV
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CAlert
            color="info"
            className="mb-4 d-flex justify-content-between align-items-center"
            style={{
              backgroundColor: '#d3d3d3',
              border: '#d3d3d3',
              color: 'black',
            }}
          >
            Bienvenid@ Profesor {user.nombre}
          </CAlert>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>Listado de Grupos</span>
              <CButtonGroup
                role="group"
                aria-label="Basic mixed styles example"
              >
                <CButton
                  color="success"
                  onClick={() => setModalVisible(true)}
                  size="md"
                  style={{
                    color: 'white',
                  }}
                >
                  {' '}
                  Añadir Grupo{' '}
                </CButton>
              </CButtonGroup>
            </CCardHeader>
            <CCardBody>
              {grupos.length === 0 ? (
                <p>No hay grupos disponibles</p>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Nombre</CTableHeaderCell>
                      <CTableHeaderCell>Número de Estudiantes</CTableHeaderCell>
                      <CTableHeaderCell>
                        Administrar Cuestionarios
                      </CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {grupos.map((grupo) => (
                      <React.Fragment key={grupo.id}>
                        <CTableRow
                          onClick={() => navigate(`/grupos/${grupo.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <CTableDataCell>{grupo.nombre}</CTableDataCell>
                          <CTableDataCell>
                            {grupo.numEstudiantes}
                          </CTableDataCell>
                          <CTableDataCell className="text-left">
                            <CButton
                              color="warning"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/resultado/${grupo.id}`)
                              }}
                            >
                              Cuestionarios
                            </CButton>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(grupo)
                              }}
                            >
                              {' '}
                              -{' '}
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      </React.Fragment>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          clearForm()
        }}
      >
        <CModalHeader onClose={() => setModalVisible(false)}>
          <CModalTitle>Crear Nuevo Grupo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleCreateGroup}>
            <div className="mb-3">
              <CFormLabel htmlFor="nombre">Nombre del Grupo</CFormLabel>
              <CFormInput
                type="text"
                id="nombre"
                placeholder="Ingrese el nombre del grupo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mb-3"
              />
            </div>

            <div className="mb-3">
              <CFormLabel htmlFor="buscarEstudiantes">
                Buscar estudiantes
              </CFormLabel>
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={{
                  placeholder: 'Escribe un correo electrónico',
                  value: emails,
                  onChange: (e, { newValue }) => setEmails(newValue),
                }}
                onSuggestionSelected={onSuggestionSelected}
              />
            </div>

            <div className="mb-3">
              <CFormLabel htmlFor="file" className="mt-3">
                Subir archivo CSV (Columnas: correo, nombre)
              </CFormLabel>
              <CFormInput
                type="file"
                id="file"
                accept=".csv"
                onChange={handleFileChangeCreateGroup}
              />
            </div>

            <div className="mt-4">
              <CFormLabel>Estudiantes seleccionados</CFormLabel>
              <div
                className="border rounded p-3"
                style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa',
                }}
              >
                {selectedStudents.length > 0 ? (
                  <ul className="list-unstyled m-0">
                    {selectedStudents.map((student) => (
                      <li
                        key={student.email}
                        className="d-flex justify-content-between align-items-center mb-2 px-2 py-1 bg-white rounded"
                      >
                        <span className="text-truncate pe-2">
                          {student.email}
                        </span>
                        <CButton
                          color="danger"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const updatedStudents = selectedStudents.filter(
                              (s) => s.email !== student.email,
                            )
                            setSelectedStudents(updatedStudents)
                          }}
                          className="ms-2"
                        >
                          ×
                        </CButton>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted m-0 text-center">
                    No hay estudiantes seleccionados
                  </p>
                )}
              </div>
              {selectedStudents.length > 0 && (
                <small className="text-muted mt-1 d-block">
                  Total: {selectedStudents.length} estudiante
                  {selectedStudents.length !== 1 ? 's' : ''}
                </small>
              )}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton
            type="submit"
            color="success"
            onClick={handleCreateGroup}
            style={{ color: 'white' }}
            disabled={!nombre.trim() || selectedStudents.length === 0}
          >
            Crear Grupo
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProfesorGrupos
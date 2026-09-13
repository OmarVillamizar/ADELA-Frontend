import { useEffect, useState } from 'react'
import { useNavigate, useParams, useOutletContext } from 'react-router-dom'
import {
  addStudentsToGroup,
  deleteStudentFromGroup,
  buscarEstudiantes,
  getGroupById,
} from '../../util/services/grupoService'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAlert,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import Autosuggest from 'react-autosuggest'
import Swal from 'sweetalert2'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

const ProfesorGrupo = () => {
  const user = useOutletContext()

  const { id } = useParams()
  const [grupo, setGrupo] = useState({ estudiantes: [] })
  const [modalAddStudentVisible, setModalAddStudentVisible] = useState(false)
  const currentGrupoId = id
  const [suggestions, setSuggestions] = useState([])

  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [search, setSearch] = useState('')
  const [selectedNewStudents, setSelectedNewStudents] = useState([])
  const [searchStudentList, setSearchStudentList] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getGroupById(id).then((el) => {
      setGrupo(el)
      const bools = el.estudiantes.map(() => true)
      setSearchStudentList(bools)
    })
  }, [])


  const getSuggestionValue = (suggestion) => suggestion.email

  const renderSuggestion = (suggestion) => <div>{suggestion.email}</div>

  const onSuggestionsFetchRequested = ({ value }) => {
    const termino = value.trim()
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

  const handleDeleteEstudiante = (estudianteEmail, grupoId) => {
    deleteStudentFromGroup(grupoId, estudianteEmail)
      .then(() => {
        setGrupo({
          ...grupo,
          estudiantes: grupo.estudiantes.filter(
            (est) => est.email !== estudianteEmail,
          ),
        })
        setSearchStudentList(new Array(grupo.estudiantes.length - 1).fill(true))
        setSearch('')
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El estudiante ha sido eliminado.',
          icon: 'success',
        })
      })
      .catch((error) => {
        console.error('Error eliminando estudiante:', error)
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al eliminar el estudiante.',
          icon: 'error',
        })
      })
  }

  const handleAddStudentsToGroup = (e) => {
    e.preventDefault()

    if (selectedNewStudents.length === 0) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, ingresa al menos un correo de estudiante.',
        icon: 'warning',
      })
      return
    }

    addStudentsToGroup(currentGrupoId, selectedNewStudents)
      .then((response) => {
        // Hacer una solicitud adicional para obtener la información actualizada del grupo
        getGroupById(currentGrupoId)
          .then((updatedGrupo) => {
            setGrupo(updatedGrupo)
            setSearchStudentList(
              new Array(updatedGrupo.estudiantes.length).fill(true),
            )
            setSelectedNewStudents([])
            setModalAddStudentVisible(false)
            Swal.fire({
              title: '¡Añadidos!',
              text: 'Los estudiantes han sido añadidos.',
              icon: 'success',
            })
          })
          .catch((groupError) => {
            console.error(
              'Error al obtener la información del grupo:',
              groupError,
            )
            Swal.fire({
              title: 'Error',
              text: 'Hubo un error al obtener la información del grupo.',
              icon: 'error',
            })
          })
      })
      .catch((error) => {
        console.error('Error añadiendo estudiantes:', error)
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al añadir los estudiantes.',
          icon: 'error',
        })
      })
  }

  const filterStudent = (str) => {
    setSearch(str)
    if (str === '') {
      setSearchStudentList(new Array(grupo.estudiantes.length - 1).fill(true))
    } else {
      setSearchStudentList(
        grupo.estudiantes.map((e) => {
          return (
            e.email.toLowerCase().includes(str) ||
            e.nombre.toLowerCase().includes(str)
          )
        }),
      )
    }
  }

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
          margin: '0',
        }}
      >
        <span>Profesor {user.nombre}</span>
        <CButton
          color="secondary"
          className="ml-auto"
          onClick={() => navigate('/grupos/')}
        >
          Volver
        </CButton>
      </CAlert>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>Lista de Estudiantes Grupo - {grupo.nombre}</span>
          <div className="d-flex align-items-center gap-3">
            <CInputGroup style={{ width: '300px' }}>
              <CFormInput
                placeholder="Buscar estudiante..."
                aria-label="Buscar estudiante"
                value={search}
                onChange={(e) => filterStudent(e.target.value)}
              />
              <CInputGroupText>
                <CIcon icon={cilSearch} />
              </CInputGroupText>
            </CInputGroup>

            <CButton
              color="success"
              size="md"
              style={{
                color: 'white',
              }}
              onClick={(e) => {
                e.stopPropagation()
                setModalAddStudentVisible(true)
              }}
            >
              {' '}
              Añadir Estudiantes{' '}
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #d8dbe0',
            }}
          >
            <CTable hover striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Nombre</CTableHeaderCell>
                  <CTableHeaderCell>Correo</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">
                    Eliminar
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {grupo.estudiantes.map((estudiante, idx) =>
                  searchStudentList[idx] ? (
                    <CTableRow key={estudiante.email}>
                      <CTableDataCell>{estudiante.nombre}</CTableDataCell>
                      <CTableDataCell>{estudiante.email}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() =>
                            handleDeleteEstudiante(estudiante.email, grupo.id)
                          }
                        >
                          -
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    <></>
                  ),
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
      <CModal
        visible={modalAddStudentVisible}
        onClose={() => {
          setModalAddStudentVisible(false)
          setNewStudentEmail('')
          setSelectedNewStudents([])
        }}
      >
        <CModalHeader onClose={() => setModalAddStudentVisible(false)}>
          <CModalTitle>Agregar Estudiantes</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm
            onSubmit={(e) => {
              e.preventDefault()
              handleAddStudentsToGroup(e)
            }}
          >
            <CFormLabel htmlFor="newStudentEmail">
              Correo del Estudiante
            </CFormLabel>
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              inputProps={{
                id: 'newStudentEmail',
                placeholder: 'Escribe un correo electrónico',
                value: newStudentEmail,
                onChange: (e, { newValue }) => setNewStudentEmail(newValue),
              }}
              onSuggestionSelected={(event, { suggestion }) => {
                if (!selectedNewStudents.includes(suggestion.email)) {
                  setSelectedNewStudents([
                    ...selectedNewStudents,
                    suggestion.email,
                  ])
                }
                setNewStudentEmail('')
              }}
            />
            <CFormLabel htmlFor="file" className="mt-3">
              Subir archivo CSV (Columnas: correo, nombre)
            </CFormLabel>
            <CFormInput
              type="file"
              id="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    try {
                      const csvData = event.target.result
                      const lines = csvData.split('\n')

                      // Skip header row and process the rest
                      const newStudents = lines
                        .slice(1)
                        .map((line) => {
                          const [email] = line.split(',')
                          return email.trim()
                        })
                        .filter((email) => {
                          // Validate email format and check for duplicates
                          const isValidEmail =
                            email && /\S+@\S+\.\S+/.test(email)
                          const isDuplicate =
                            selectedNewStudents.includes(email)
                          if (!isValidEmail && email !== '') {
                            console.warn(`Email inválido encontrado: ${email}`)
                          }
                          return isValidEmail && !isDuplicate
                        })

                      if (newStudents.length > 0) {
                        setSelectedNewStudents((prevStudents) => {
                          const updatedStudents = [
                            ...prevStudents,
                            ...newStudents,
                          ]
                          return [...new Set(updatedStudents)] // Remove any duplicates
                        })
                        Swal.fire({
                          title: '¡Archivo procesado!',
                          text: `Se han añadido ${newStudents.length} correos válidos.`,
                          icon: 'success',
                        })
                      } else {
                        Swal.fire({
                          title: 'Archivo vacío',
                          text: 'No se encontraron correos válidos en el archivo CSV.',
                          icon: 'warning',
                        })
                      }
                    } catch (error) {
                      console.error('Error procesando el archivo CSV:', error)
                      Swal.fire({
                        title: 'Error',
                        text: 'Hubo un error al procesar el archivo CSV.',
                        icon: 'error',
                      })
                    }
                  }
                  reader.readAsText(file)
                }
              }}
            />

            <CFormLabel className="mt-3">Estudiantes seleccionados</CFormLabel>
            <div
              className="border rounded p-3"
              style={{ maxHeight: '150px', overflowY: 'auto' }}
            >
              {selectedNewStudents.length > 0 ? (
                <ul className="list-unstyled m-0">
                  {selectedNewStudents.map((email) => (
                    <li
                      key={email}
                      className="d-flex justify-content-between align-items-center mb-2"
                    >
                      {email}
                      <CButton
                        color="danger"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedNewStudents((prevStudents) =>
                            prevStudents.filter((e) => e !== email),
                          )
                        }}
                      >
                        ×
                      </CButton>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted m-0">
                  No hay estudiantes seleccionados
                </p>
              )}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setModalAddStudentVisible(false)
              setNewStudentEmail('')
              setSelectedNewStudents([])
            }}
          >
            Cancelar
          </CButton>
          <CButton
            color="success"
            onClick={(e) => handleAddStudentsToGroup(e)}
            disabled={selectedNewStudents.length === 0}
            style={{ color: 'white' }}
          >
            Agregar Estudiantes
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProfesorGrupo
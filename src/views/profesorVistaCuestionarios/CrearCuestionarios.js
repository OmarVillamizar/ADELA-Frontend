import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CRow,
  CCol,
  CListGroup,
  CListGroupItem,
  CCollapse,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormCheck,
} from '@coreui/react'
import Swal from 'sweetalert2'
import { crearCuestionario } from '../../util/services/cuestionarioService'
import './CrearCuestionario.css'

const CrearCuestionario = () => {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [siglas, setSiglas] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [autor, setAutor] = useState('')
  const [version, setVersion] = useState('')
  const [estiloNombre, setEstiloNombre] = useState('')
  const [estilos, setEstilos] = useState([])
  const [preguntaTitulo, setPreguntaTitulo] = useState('')
  const [preguntaSelecMulti, setPreguntaSelecMulti] = useState(false)
  const [preguntaEstilo, setPreguntaEstilo] = useState('')
  const [preguntas, setPreguntas] = useState([])
  const [opciones, setOpciones] = useState([{ id: 1, titulo: '' }])
  const [expandedPreguntaId, setExpandedPreguntaId] = useState(null)

  const handleBack = () => {
    navigate('/administrar-cuestionarios', { replace: true })
  }

  const handleAddEstilo = () => {
    if (estiloNombre.trim() !== '') {
      const newId = estilos.length + 1
      setEstilos([...estilos, { id: newId, nombre: estiloNombre }])
      setEstiloNombre('')
    }
  }

  const handleDeletePregunta = (id) => {
    setPreguntas(preguntas.filter((pregunta) => pregunta.id !== id))
  }

  const handleAddOpcion = () => {
    setOpciones([
      ...opciones,
      { id: opciones.length + 1, titulo: '', valor: 1, estiloId: null },
    ])
  }

  const handleOpcionChange = (index, field, value) => {
    const newOpciones = [...opciones]
    newOpciones[index][field] = value ?? 0
    setOpciones(newOpciones)
  }

  const handleCrearCuestionario = () => {
    // Verificar que los campos principales no estén vacíos
    if (
      nombre.trim() === '' ||
      siglas.trim() === '' ||
      descripcion.trim() === '' ||
      autor.trim() === '' ||
      version.trim() === '' ||
      preguntas.length === 0
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, asegúrate de que todos los campos estén llenos y que exista al menos una pregunta.',
      })
      return
    }

    // Mostrar alerta de confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Vas a crear el cuestionario, una vez creado no será editable, ¿estás seguro que terminaste?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crear',
    }).then((result) => {
      if (result.isConfirmed) {
        // Crear objeto de cuestionario
        const cuestionario = {
          nombre,
          siglas,
          descripcion,
          autor,
          version,
          preguntas: preguntas.map((pregunta, index) => ({
            pregunta: pregunta.titulo,
            orden: index + 1,
            opcionMultiple: pregunta.seleccionMultiple,
            opciones: pregunta.opciones.map((opcion, i) => ({
              orden: i + 1,
              respuesta: opcion.titulo,
              valor: opcion.valor,
              estiloId: opcion.estiloId,
            })),
          })),
          estilos: estilos.map((estilo) => ({
            nombre: estilo.nombre,
            id: estilo.id,
          })),
        }

        // Lógica para enviar el cuestionario al endpoint irá aquí
        crearCuestionario(cuestionario)
          .then((response) => {
            if (response.ok) {
              Swal.fire({
                icon: 'success',
                title: 'Cuestionario Creado',
                text: `El cuestionario "${nombre}" ha sido creado con éxito.`,
              })
              setNombre('')
              setSiglas('')
              setDescripcion('')
              setAutor('')
              setVersion('')
              setPreguntaTitulo('')
              setPreguntaEstilo('')
              setPreguntaSelecMulti(false)
              setOpciones([{ id: 1, titulo: '', valor: 1, estiloId: null }])
              setPreguntas([])
              setEstilos([])

              // Navegar y forzar actualización de la lista de cuestionarios
              navigate('/administrar-cuestionarios', { replace: true })
            } else throw new Error('error al actualizar la cuenta')
          })
          .catch((err) => {
            Swal.fire({
              title: 'Error',
              text: err.message,
              icon: 'error',
            })
          })
      }
    })
  }

  const handleDeleteEstilo = (id) => {
    setEstilos(estilos.filter((estilo) => estilo.id !== id))
  }

  const handleDeleteOpcion = (index) => {
    const newOpciones = opciones.filter((_, i) => i !== index)
    setOpciones(newOpciones)
  }

  const handleAddPregunta = () => {
    if (
      preguntaTitulo.trim() !== '' && // Verificar que el título de la pregunta no esté vacío
      opciones.every(
        (opcion) =>
          opcion.titulo.trim() !== '' &&
          opcion.estiloId &&
          opcion.valor != null &&
          opcion.valor != undefined,
      ) // Verificar que cada opción tenga título, estilo y valor
    ) {
      const newPregunta = {
        id: preguntas.length + 1,
        titulo: preguntaTitulo,
        seleccionMultiple: preguntaSelecMulti,
        opciones: opciones.filter((opcion) => opcion.titulo.trim() !== ''), // Filtrar solo las opciones con título
      }
      setPreguntas([...preguntas, newPregunta])
      // Reiniciar campos
      setPreguntaTitulo('')
      setPreguntaSelecMulti(false)
      setOpciones([{ id: 1, titulo: '', valor: 0, estiloId: null }])
    } else {
      // Mostrar una alerta utilizando SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Campos incompletos, asegúrate de que hay título de pregunta y que los campos de opción están completos.',
      })
    }
  }

  const toggleExpand = (id) => {
    setExpandedPreguntaId(expandedPreguntaId === id ? null : id)
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <h3>Crear Nuevo Cuestionario</h3>
        <CButton color="secondary" onClick={handleBack}>
          Volver
        </CButton>
      </CCardHeader>
      <CCardBody>
        <CForm>
          {/* Información del cuestionario */}
          <CRow className="mb-3">
            <CCol md="6">
              <CFormLabel htmlFor="nombre">Nombre del Cuestionario</CFormLabel>
              <CFormInput
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese el nombre del cuestionario"
              />
            </CCol>
            <CCol md="6">
              <CFormLabel htmlFor="siglas">Siglas</CFormLabel>
              <CFormInput
                id="siglas"
                value={siglas}
                onChange={(e) => setSiglas(e.target.value)}
                placeholder="Ingrese las siglas del cuestionario"
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md="6">
              <CFormLabel htmlFor="descripcion">Descripción corta</CFormLabel>
              <CFormInput
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ingrese una descripción del cuestionario"
              />
            </CCol>
            <CCol md="6">
              <CFormLabel htmlFor="autor">Autor</CFormLabel>
              <CFormInput
                id="autor"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Ingrese el nombre del autor"
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md="6">
              <CFormLabel htmlFor="version">Versión</CFormLabel>
              <CFormInput
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Ingrese la versión del cuestionario"
              />
            </CCol>
          </CRow>

          {/* Estilos */}
          <hr />
          <h5>Estilos de Aprendizaje</h5>
          <CRow className="mb-3">
            <CCol md="6">
              <CFormLabel htmlFor="estiloNombre">Nombre del Estilo</CFormLabel>
              <CFormInput
                id="estiloNombre"
                value={estiloNombre}
                onChange={(e) => setEstiloNombre(e.target.value)}
                placeholder="Ingrese el nombre del estilo"
              />
            </CCol>
            <CCol md="6" className="d-flex align-items-end">
              <CButton color="primary" onClick={handleAddEstilo}>
                Agregar Estilo
              </CButton>
            </CCol>
          </CRow>

          <CListGroup className="mb-3">
            {estilos.map((estilo) => (
              <CListGroupItem
                key={estilo.id}
                className="d-flex justify-content-between align-items-center"
              >
                {estilo.nombre}
                <CButton
                  color="danger"
                  size="sm"
                  onClick={() => handleDeleteEstilo(estilo.id)}
                >
                  X
                </CButton>
              </CListGroupItem>
            ))}
          </CListGroup>

          {/* Preguntas */}
          <hr />
          <h5>Preguntas</h5>
          <CRow className="mb-3">
            <CCol md="12">
              <div className="multiple-selection-container mb-3">
                <CFormCheck
                  checked={preguntaSelecMulti}
                  id="preguntaSM"
                  onChange={(e) => {
                    setPreguntaSelecMulti(e.target.checked)
                  }}
                  label="Será de Selección Múltiple:"
                  className="multiple-selection-checkbox"
                  labelPosition="right"
                />
              </div>
              <CFormLabel htmlFor="preguntaTitulo">
                Título de la Pregunta
              </CFormLabel>
              <CFormInput
                id="preguntaTitulo"
                value={preguntaTitulo}
                onChange={(e) => setPreguntaTitulo(e.target.value)}
                placeholder="Ingrese el título de la pregunta"
                style={{ height: '3.5rem' }}
              />
            </CCol>
          </CRow>

          <style>
            {`
        .multiple-selection-container {
          background-color: #f0f0f0;
          border: 2px solid #000000;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 15px;
        }

        .multiple-selection-checkbox {
          font-weight: bold;
          color: black;
          display: flex;
          align-items: center;
        }

        .multiple-selection-checkbox .form-check-input {
          transform: scale(1.5);
          margin-right: 10px;
          order: 2;
          margin-left: 10px;
        }

        .multiple-selection-checkbox .form-check-label {
          order: 1;
        }
        `}
          </style>

          <CRow className="mb-3">
            <CCol md="12">
              {opciones.map((opcion, index) => (
                <div key={opcion.id} className="d-flex align-items-center mb-2">
                  <CFormLabel className="me-2" style={{ minWidth: '100px' }}>
                    Opción {index + 1}
                  </CFormLabel>
                  <CFormInput
                    value={opcion.titulo}
                    onChange={(e) =>
                      handleOpcionChange(index, 'titulo', e.target.value)
                    }
                    placeholder={`Ingrese la opción ${index + 1}`}
                    className="me-2"
                    style={{ height: '3.5rem' }}
                  />
                  <CFormInput
                    type="number"
                    value={opcion.valor ?? '0'}
                    floatingLabel="Valor"
                    onChange={(e) =>
                      handleOpcionChange(
                        index,
                        'valor',
                        e.target.value ? parseFloat(e.target.value) : '0',
                      )
                    }
                    className="me-2"
                    style={{ width: '80px', height: '1rem' }}
                  />
                  <select
                    className="form-select me-2"
                    value={opcion.estiloId || ''}
                    onChange={(e) =>
                      handleOpcionChange(
                        index,
                        'estiloId',
                        parseInt(e.target.value),
                      )
                    }
                    style={{ height: '3.5rem' }}
                  >
                    <option value="">Seleccione Estilo</option>
                    {estilos.map((estilo) => (
                      <option key={estilo.id} value={estilo.id}>
                        {estilo.nombre}
                      </option>
                    ))}
                  </select>
                  <CButton
                    color="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleDeleteOpcion(index)}
                  >
                    X
                  </CButton>
                </div>
              ))}
              <CButton color="primary" onClick={handleAddOpcion}>
                Agregar Opción
              </CButton>
            </CCol>
          </CRow>
          <div className="multiple-selection-container mb-3">
            <CFormCheck
              checked={preguntaSelecMulti}
              id="preguntaSM"
              onChange={(e) => {
                setPreguntaSelecMulti(e.target.checked)
              }}
              label="La pregunta será de selección Múltiple:"
              className="multiple-selection-checkbox"
              labelPosition="right"
            />
          </div>
          <CButton
            color="success"
            style={{ color: 'white', marginTop: '0.5rem ' }}
            onClick={handleAddPregunta}
          >
            Finalizar Pregunta
          </CButton>

          {/* Lista de preguntas */}
          <CTable hover responsive className="mt-3">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Orden</CTableHeaderCell>
                <CTableHeaderCell>Título de la Pregunta</CTableHeaderCell>
                <CTableHeaderCell>Selección Múltiple</CTableHeaderCell>
                <CTableHeaderCell>Opciones</CTableHeaderCell>
                <CTableHeaderCell className="text-end">
                  Acciones
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {preguntas.map((pregunta) => (
                <React.Fragment key={pregunta.id}>
                  <CTableRow
                    onClick={() => toggleExpand(pregunta.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <CTableDataCell>{pregunta.id}</CTableDataCell>
                    <CTableDataCell>{pregunta.titulo}</CTableDataCell>
                    <CTableDataCell>
                      {pregunta.seleccionMultiple ? 'Sí' : 'No'}
                    </CTableDataCell>
                    <CTableDataCell>{pregunta.opciones.length}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation() // Evitar que el evento se propague
                          handleDeletePregunta(pregunta.id)
                        }}
                      >
                        -
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                  {expandedPreguntaId === pregunta.id && (
                    <CTableRow>
                      <CTableDataCell colSpan="4">
                        <CCollapse visible={expandedPreguntaId === pregunta.id}>
                          <CTable hover>
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell>Orden</CTableHeaderCell>
                                <CTableHeaderCell>Opción</CTableHeaderCell>
                                <CTableHeaderCell>Estilo</CTableHeaderCell>
                                <CTableHeaderCell>Valor</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {pregunta.opciones.map((opcion, index) => (
                                <CTableRow key={opcion.id}>
                                  <CTableDataCell>{index + 1}</CTableDataCell>
                                  <CTableDataCell>
                                    {opcion.titulo}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    {estilos.find(
                                      (cat) => cat.id === opcion.estiloId,
                                    )?.nombre || 'Sin estilo'}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    {opcion.valor}
                                  </CTableDataCell>
                                </CTableRow>
                              ))}
                            </CTableBody>
                          </CTable>
                        </CCollapse>
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </React.Fragment>
              ))}
            </CTableBody>
          </CTable>
          <CButton
            color="success"
            style={{ color: 'white', marginTop: '0.5rem ' }}
            onClick={handleCrearCuestionario}
          >
            Crear Cuestionario
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default CrearCuestionario
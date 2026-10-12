import { useEffect, useState } from 'react'
import { useNavigate, useParams, useOutletContext } from 'react-router-dom'
import {
  addStudentsToGroup,
  deleteStudentFromGroup,
  getGroupById,
  updateGrupo,
} from '../../util/services/grupoService'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
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
  CSpinner,
} from '@coreui/react'
import Swal from 'sweetalert2'
import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilPen,
  cilPlus,
  cilSearch,
  cilTrash,
} from '@coreui/icons'
import SelectorEstudiantes from './SelectorEstudiantes'

const sinTildes = (texto) =>
  (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const ProfesorGrupo = () => {
  const user = useOutletContext()
  const { id } = useParams()
  const navigate = useNavigate()

  const [grupo, setGrupo] = useState(null)
  const [cargaFallida, setCargaFallida] = useState(false)
  const [search, setSearch] = useState('')
  const [modalAddStudentVisible, setModalAddStudentVisible] = useState(false)
  const [selectedNewStudents, setSelectedNewStudents] = useState([])
  const [agregando, setAgregando] = useState(false)

  useEffect(() => {
    getGroupById(id)
      .then(setGrupo)
      .catch((error) => {
        console.error('Error cargando el grupo:', error)
        setCargaFallida(true)
      })
  }, [id])

  // Antes el filtro guardaba un array de booleanos paralelo a la lista que se
  // desalineaba al borrar (y con la búsqueda vacía ocultaba al último).
  const termino = sinTildes(search.trim())
  const visibles = (grupo?.estudiantes ?? []).filter(
    (e) =>
      !termino ||
      sinTildes(e.email).includes(termino) ||
      sinTildes(e.nombre).includes(termino),
  )

  const handleDeleteEstudiante = (estudiante) => {
    Swal.fire({
      title: `¿Quitar a ${estudiante.nombre || estudiante.email} del grupo?`,
      text: 'Se borrarán sus cuestionarios pendientes en este grupo. Los ya respondidos se conservan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return
      deleteStudentFromGroup(grupo.id, estudiante.email)
        .then(setGrupo)
        .catch((error) => {
          console.error('Error eliminando estudiante:', error)
          Swal.fire({
            title: 'Error',
            text: error.message || 'Hubo un error al quitar al estudiante.',
            icon: 'error',
          })
        })
    })
  }

  const handleRenombrar = async () => {
    const { value: nombre } = await Swal.fire({
      title: 'Renombrar grupo',
      input: 'text',
      inputValue: grupo.nombre,
      inputAttributes: { maxlength: 100 },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (v) => (!v.trim() ? 'Escribe un nombre.' : undefined),
    })
    if (!nombre || nombre.trim() === grupo.nombre) return
    try {
      const actualizado = await updateGrupo(grupo.id, {
        nombre: nombre.trim(),
        estudiantes: grupo.estudiantes.map(({ email, nombre }) => ({
          email,
          nombre,
        })),
      })
      setGrupo(actualizado)
    } catch (error) {
      console.error('Error renombrando el grupo:', error)
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo renombrar el grupo.',
        icon: 'error',
      })
    }
  }

  const cerrarModal = () => {
    setModalAddStudentVisible(false)
    setSelectedNewStudents([])
  }

  const handleAddStudentsToGroup = () => {
    if (selectedNewStudents.length === 0 || agregando) return
    setAgregando(true)
    addStudentsToGroup(
      grupo.id,
      selectedNewStudents.map(({ email, nombre }) => ({ email, nombre })),
    )
      .then((actualizado) => {
        const n = actualizado.estudiantes.length - grupo.estudiantes.length
        setGrupo(actualizado)
        cerrarModal()
        Swal.fire({
          title: '¡Añadidos!',
          text: `${n} estudiante${n !== 1 ? 's' : ''} añadido${n !== 1 ? 's' : ''} al grupo.`,
          icon: 'success',
        })
      })
      .catch((error) => {
        console.error('Error añadiendo estudiantes:', error)
        Swal.fire({
          title: 'Error',
          text: error.message || 'Hubo un error al añadir los estudiantes.',
          icon: 'error',
        })
      })
      .finally(() => setAgregando(false))
  }

  if (cargaFallida) {
    return (
      <CAlert
        color="danger"
        className="d-flex justify-content-between align-items-center"
      >
        No se pudo cargar el grupo.
        <CButton color="secondary" onClick={() => navigate('/grupos/')}>
          Volver
        </CButton>
      </CAlert>
    )
  }

  if (!grupo) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      <CAlert
        color="info"
        className="mb-3 d-flex justify-content-between align-items-center adela-bienvenida"
      >
        <span>
          Profesor <strong>{user.nombre}</strong>
        </span>
        <CButton
          color="secondary"
          variant="outline"
          className="adela-tactil"
          onClick={() => navigate('/grupos/')}
        >
          <CIcon icon={cilArrowLeft} className="me-1" />
          Volver
        </CButton>
      </CAlert>
      <CCard>
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2">
            <span>
              <strong>{grupo.nombre}</strong>
              <span className="text-body-secondary">
                {' | '}
                {grupo.estudiantes.length} estudiante
                {grupo.estudiantes.length !== 1 && 's'}
              </span>
            </span>
            <CButton
              color="secondary"
              variant="ghost"
              size="sm"
              aria-label="Renombrar grupo"
              title="Renombrar grupo"
              onClick={handleRenombrar}
            >
              <CIcon icon={cilPen} />
            </CButton>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <CInputGroup className="flex-nowrap" style={{ width: '280px' }}>
              <CFormInput
                placeholder="Buscar por nombre o correo"
                aria-label="Buscar estudiante"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <CInputGroupText>
                <CIcon icon={cilSearch} />
              </CInputGroupText>
            </CInputGroup>
            <CButton
              color="success"
              className="text-white adela-tactil"
              onClick={() => setModalAddStudentVisible(true)}
            >
              <CIcon icon={cilPlus} className="me-1" />
              Añadir Estudiantes
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {grupo.estudiantes.length === 0 ? (
            <p className="text-body-secondary text-center m-0 py-4">
              Este grupo aún no tiene estudiantes. Añádelos uno a uno o con una
              lista CSV.
            </p>
          ) : (
            <div
              style={{
                maxHeight: '480px',
                overflowY: 'auto',
                border: '1px solid var(--cui-border-color)',
              }}
            >
              <CTable hover striped responsive className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Correo</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">
                      Quitar
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {visibles.map((estudiante) => (
                    <CTableRow key={estudiante.email}>
                      <CTableDataCell>
                        {estudiante.nombre || (
                          <span className="text-body-secondary">
                            Sin nombre
                          </span>
                        )}
                        {estudiante.estado === 'INCOMPLETA' && (
                          <CBadge
                            color="warning"
                            textColor="dark"
                            shape="rounded-pill"
                            className="ms-2"
                            title="Aún no ha completado su perfil en ADELA."
                          >
                            Pendiente
                          </CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{estudiante.email}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          color="danger"
                          variant="ghost"
                          className="adela-tactil adela-btn-icono"
                          aria-label={`Quitar a ${estudiante.nombre || estudiante.email}`}
                          title="Quitar del grupo"
                          onClick={() => handleDeleteEstudiante(estudiante)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {visibles.length === 0 && (
                    <CTableRow>
                      <CTableDataCell
                        colSpan={3}
                        className="text-center text-body-secondary"
                      >
                        Nadie coincide con «{search}».
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>
      <CModal
        visible={modalAddStudentVisible}
        alignment="center"
        className="adela-modal"
        onClose={cerrarModal}
      >
        <CModalHeader>
          <CModalTitle>Añadir estudiantes a {grupo.nombre}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <SelectorEstudiantes
            seleccionados={selectedNewStudents}
            onChange={setSelectedNewStudents}
            enGrupo={grupo.estudiantes.map((e) => e.email)}
          />
        </CModalBody>
        <CModalFooter className="justify-content-between">
          <CButton
            color="secondary"
            variant="outline"
            className="adela-tactil"
            onClick={cerrarModal}
          >
            Cancelar
          </CButton>
          <CButton
            color="success"
            className="text-white adela-tactil"
            onClick={handleAddStudentsToGroup}
            disabled={selectedNewStudents.length === 0 || agregando}
          >
            {agregando && <CSpinner size="sm" className="me-2" />}
            Añadir ({selectedNewStudents.length})
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProfesorGrupo

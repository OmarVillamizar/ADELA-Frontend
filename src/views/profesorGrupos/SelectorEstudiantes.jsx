import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest'
import {
  CAlert,
  CBadge,
  CButton,
  CFormInput,
  CFormLabel,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilPlus, cilX } from '@coreui/icons'
import { buscarEstudiantes } from '../../util/services/grupoService'
import {
  descargarPlantillaCsv,
  esCorreo,
  leerEstudiantesCsv,
  normalizarCorreo,
} from '../../util/grupos/estudiantesCsv'

/**
 * Elección de estudiantes para un grupo: búsqueda, correo escrito a mano o CSV.
 * La comparten "Crear grupo" y "Añadir estudiantes", que antes tenían cada uno
 * su propio lector de CSV con reglas distintas.
 *
 * Cada elegido es { email, nombre, registrado }: registrado = true si ya tiene
 * cuenta, false si se preinscribirá, undefined mientras se comprueba.
 */
const SelectorEstudiantes = ({ seleccionados, onChange, enGrupo = [] }) => {
  const [termino, setTermino] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [resumenCsv, setResumenCsv] = useState(null)
  const archivoRef = useRef(null)
  const consulta = useRef(0)

  // Lo último elegido manda: los callbacks asíncronos leen de aquí y no del
  // render en que empezaron.
  const actuales = useRef(seleccionados)
  useEffect(() => {
    actuales.current = seleccionados
  }, [seleccionados])
  const publicar = (lista) => {
    actuales.current = lista
    onChange(lista)
  }
  const resaltada = useRef(null)

  const yaEnGrupo = new Set(enGrupo.map(normalizarCorreo))
  const yaElegido = new Set(seleccionados.map((s) => s.email))

  const estadoDe = (email) =>
    yaEnGrupo.has(email)
      ? 'Ya está en el grupo'
      : yaElegido.has(email)
        ? 'Ya añadido'
        : null

  const agregar = (nuevos) => {
    const lista = [...actuales.current]
    const indice = new Map(lista.map((s, i) => [s.email, i]))
    let agregados = 0
    nuevos.forEach((n) => {
      const email = normalizarCorreo(n.email)
      if (yaEnGrupo.has(email)) return
      if (indice.has(email)) {
        // Si ya estaba, completar lo que falte sin perder lo que se sabe.
        const previo = lista[indice.get(email)]
        lista[indice.get(email)] = {
          ...previo,
          nombre: n.registrado
            ? n.nombre || previo.nombre
            : previo.nombre || n.nombre,
          registrado: previo.registrado || n.registrado,
        }
        return
      }
      indice.set(email, lista.length)
      lista.push({ ...n, email })
      agregados += 1
    })
    publicar(lista)
    return agregados
  }

  /**
   * Los del CSV solo traen lo que dice la hoja. Se busca a cada uno para
   * mostrar el nombre con que está registrado y marcar quién es nuevo.
   */
  const identificar = async (estudiantes) => {
    const pendientes = [...estudiantes]
    const trabajador = async () => {
      while (pendientes.length) {
        const { email } = pendientes.shift()
        let encontrado = null
        try {
          const res = await buscarEstudiantes(email, 5)
          encontrado = res.find((e) => normalizarCorreo(e.email) === email)
        } catch {
          continue
        }
        publicar(
          actuales.current.map((s) =>
            s.email !== email
              ? s
              : encontrado
                ? {
                    ...s,
                    nombre: encontrado.nombre || s.nombre,
                    registrado: true,
                  }
                : { ...s, registrado: false },
          ),
        )
      }
    }
    await Promise.all(Array.from({ length: 4 }, trabajador))
  }

  const onArchivo = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    try {
      const { estudiantes, invalidos, repetidos } =
        await leerEstudiantesCsv(archivo)
      const agregados = agregar(estudiantes)
      setResumenCsv({
        agregados,
        omitidos: estudiantes.length - agregados + repetidos,
        invalidos,
      })
      identificar(estudiantes.filter((s) => !yaEnGrupo.has(s.email)))
    } catch (error) {
      console.error('Error leyendo el CSV:', error)
      setResumenCsv({ error: true })
    } finally {
      // Permite volver a cargar el mismo archivo tras corregirlo.
      if (archivoRef.current) archivoRef.current.value = ''
    }
  }

  const onSuggestionsFetchRequested = ({ value }) => {
    const texto = value.trim()
    // Con menos de dos caracteres la consulta devolveria medio padron sin acotar
    // nada; el usuario todavia no ha escrito lo suficiente para buscar.
    if (texto.length < 2) {
      setSugerencias([])
      return
    }
    const id = ++consulta.current
    setBuscando(true)
    buscarEstudiantes(texto)
      .then((res) => {
        if (id === consulta.current) setSugerencias(res)
      })
      .catch((error) => {
        console.error('Error buscando estudiantes:', error.code, error.message)
        if (id === consulta.current) setSugerencias([])
      })
      .finally(() => {
        if (id === consulta.current) setBuscando(false)
      })
  }

  const elegirSugerencia = (event, { suggestion }) => {
    event.preventDefault()
    if (!estadoDe(normalizarCorreo(suggestion.email))) {
      agregar([
        {
          email: suggestion.email,
          nombre: suggestion.nombre,
          registrado: true,
        },
      ])
    }
    setTermino('')
  }

  const correoEscrito = normalizarCorreo(termino)
  const puedeAgregarEscrito =
    esCorreo(correoEscrito) &&
    !estadoDe(correoEscrito) &&
    !sugerencias.some((s) => normalizarCorreo(s.email) === correoEscrito)

  const agregarEscrito = () => {
    if (!esCorreo(correoEscrito) || estadoDe(correoEscrito)) return
    const conocido = sugerencias.find(
      (s) => normalizarCorreo(s.email) === correoEscrito,
    )
    agregar([
      conocido
        ? { email: conocido.email, nombre: conocido.nombre, registrado: true }
        : { email: correoEscrito, nombre: '' },
    ])
    if (!conocido) identificar([{ email: correoEscrito }])
    setTermino('')
    setSugerencias([])
  }

  const renderSuggestion = (s) => {
    const estado = estadoDe(normalizarCorreo(s.email))
    return (
      <div className={`adela-sugerencia${estado ? ' is-elegida' : ''}`}>
        <div className="adela-sugerencia-texto">
          <span className="adela-sugerencia-nombre">
            {s.nombre || 'Sin nombre'}
          </span>
          <span className="adela-sugerencia-correo">{s.email}</span>
        </div>
        {estado && (
          <CBadge color="light" textColor="secondary" shape="rounded-pill">
            {estado}
          </CBadge>
        )}
      </div>
    )
  }

  const quitar = (email) =>
    publicar(actuales.current.filter((s) => s.email !== email))

  return (
    <>
      <div className="mb-3">
        <CFormLabel htmlFor="buscarEstudiantes">Buscar estudiantes</CFormLabel>
        <div className="adela-buscador">
          <Autosuggest
            suggestions={sugerencias}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={() => setSugerencias([])}
            getSuggestionValue={(s) => s.email}
            renderSuggestion={renderSuggestion}
            onSuggestionSelected={elegirSugerencia}
            onSuggestionHighlighted={({ suggestion }) => {
              resaltada.current = suggestion
            }}
            inputProps={{
              id: 'buscarEstudiantes',
              className: 'form-control',
              placeholder: 'Nombre o correo del estudiante',
              autoComplete: 'off',
              value: termino,
              onChange: (e, { newValue }) => setTermino(newValue),
              onKeyDown: (e) => {
                if (e.key !== 'Enter') return
                // Nunca enviar el formulario que envuelve al buscador.
                e.preventDefault()
                // Enter con un correo completo que no salió en la búsqueda lo
                // añade igual: se preinscribe y aparece cuando entre.
                if (!resaltada.current && puedeAgregarEscrito) agregarEscrito()
              },
            }}
          />
          {buscando && (
            <CSpinner size="sm" className="adela-buscador-spinner" />
          )}
        </div>
        {puedeAgregarEscrito ? (
          <CButton
            color="link"
            size="sm"
            className="px-0 mt-1"
            onClick={agregarEscrito}
          >
            <CIcon icon={cilPlus} className="me-1" />
            Añadir {correoEscrito} (aún no registrado)
          </CButton>
        ) : (
          <small className="text-body-secondary d-block mt-1">
            Si no aparece, escribe su correo completo y pulsa Enter.
          </small>
        )}
      </div>

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
          <CFormLabel htmlFor="archivoEstudiantes" className="mb-0">
            Cargar lista CSV
          </CFormLabel>
          <CButton
            color="primary"
            variant="ghost"
            size="sm"
            onClick={descargarPlantillaCsv}
          >
            <CIcon icon={cilCloudDownload} className="me-1" />
            Descargar plantilla
          </CButton>
        </div>
        <CFormInput
          ref={archivoRef}
          type="file"
          id="archivoEstudiantes"
          accept=".csv,text/csv,.txt"
          onChange={onArchivo}
        />
        <small className="text-body-secondary d-block mt-1">
          Columnas: correo y nombre. Sirve el CSV de Excel o Google Sheets.
        </small>
        {resumenCsv && (
          <CAlert
            color={
              resumenCsv.error
                ? 'danger'
                : resumenCsv.invalidos.length
                  ? 'warning'
                  : 'success'
            }
            className="py-2 px-3 mt-2 mb-0 small"
            dismissible
            onClose={() => setResumenCsv(null)}
          >
            {resumenCsv.error ? (
              'No se pudo leer el archivo. Guárdalo como CSV y vuelve a intentarlo.'
            ) : (
              <>
                {resumenCsv.agregados} añadido
                {resumenCsv.agregados !== 1 && 's'}
                {resumenCsv.omitidos > 0 &&
                  ` · ${resumenCsv.omitidos} repetido${resumenCsv.omitidos !== 1 ? 's' : ''} o ya incluido${resumenCsv.omitidos !== 1 ? 's' : ''}`}
                {resumenCsv.invalidos.length > 0 && (
                  <>
                    {' · '}
                    {resumenCsv.invalidos.length} fila
                    {resumenCsv.invalidos.length !== 1 && 's'} sin correo
                    válido:{' '}
                    <span className="text-break">
                      {resumenCsv.invalidos.slice(0, 5).join(', ')}
                      {resumenCsv.invalidos.length > 5 && '…'}
                    </span>
                  </>
                )}
              </>
            )}
          </CAlert>
        )}
      </div>

      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <CFormLabel className="mb-0">
            Estudiantes seleccionados
            {seleccionados.length > 0 && (
              <CBadge color="primary" shape="rounded-pill" className="ms-2">
                {seleccionados.length}
              </CBadge>
            )}
          </CFormLabel>
          {seleccionados.length > 0 && (
            <CButton
              color="danger"
              variant="ghost"
              size="sm"
              onClick={() => publicar([])}
            >
              Quitar todos
            </CButton>
          )}
        </div>
        <div className="adela-lista-seleccion">
          {seleccionados.length > 0 ? (
            <ul className="list-unstyled m-0">
              {seleccionados.map((s) => (
                <li key={s.email} className="adela-lista-seleccion-item">
                  <div className="adela-sugerencia-texto">
                    <span className="adela-sugerencia-nombre">
                      {s.nombre || 'Sin nombre'}
                    </span>
                    <span className="adela-sugerencia-correo">{s.email}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1 flex-shrink-0">
                    {s.registrado === false && (
                      <CBadge
                        color="warning"
                        textColor="dark"
                        shape="rounded-pill"
                        title="Aún no ha entrado a ADELA: queda preinscrito y verá el grupo al iniciar sesión."
                      >
                        Nuevo
                      </CBadge>
                    )}
                    <CButton
                      color="danger"
                      variant="ghost"
                      aria-label={`Quitar a ${s.nombre || s.email}`}
                      onClick={() => quitar(s.email)}
                      className="adela-tactil adela-btn-icono"
                    >
                      <CIcon icon={cilX} />
                    </CButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-secondary m-0 text-center small">
              Nadie todavía. Puedes añadir estudiantes ahora o más tarde.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

SelectorEstudiantes.propTypes = {
  seleccionados: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
      nombre: PropTypes.string,
      registrado: PropTypes.bool,
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  enGrupo: PropTypes.arrayOf(PropTypes.string),
}

export default SelectorEstudiantes

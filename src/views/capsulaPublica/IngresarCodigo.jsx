import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CForm,
  CFormInput,
  CRow,
} from '@coreui/react'
import adelalogo from 'src/assets/images/adelalogo.png'
import { normalizarCodigo } from '../../util/capsulas/capsulaUtils'

/**
 * Escribir un código para entrar a una cápsula (/c) o volver a un resultado
 * (/r). Acepta minúsculas, guiones y espacios, igual que el backend.
 */
const IngresarCodigo = ({
  titulo,
  ayuda,
  longitud,
  ejemplo,
  destino,
  boton,
  otro,
}) => {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState(null)

  const enviar = (e) => {
    e.preventDefault()
    const limpio = normalizarCodigo(codigo)
    if (limpio.length !== longitud) {
      setError(`El código tiene ${longitud} caracteres, por ejemplo ${ejemplo}`)
      return
    }
    navigate(`${destino}/${limpio}`)
  }

  return (
    <section className="ingreso-hero">
      {/* Logo de fondo, decorativo: el lector de pantalla no lo anuncia. */}
      <img
        src={adelalogo}
        alt=""
        aria-hidden="true"
        className="ingreso-hero-logo"
      />
      <CRow className="justify-content-center flex-grow-1">
        <CCol xs={12} sm={10} md={7} lg={5} xl={4}>
          <CCard className="ingreso-card">
            <CCardBody>
              <div className="adela-nodos" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
              <h1 className="ingreso-titulo">{titulo}</h1>
              <p className="ingreso-ayuda">{ayuda}</p>
              <CForm onSubmit={enviar}>
                <CFormInput
                  className="text-center codigo-resultado ingreso-input mb-3"
                  placeholder={ejemplo}
                  aria-label={titulo}
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoFocus
                  maxLength={longitud + 4}
                  value={codigo}
                  invalid={!!error}
                  feedbackInvalid={error}
                  onChange={(e) => setCodigo(e.target.value)}
                />
                <CButton
                  type="submit"
                  color="primary"
                  className="ingreso-boton adela-tactil"
                >
                  {boton}
                </CButton>
              </CForm>
              {otro && (
                <Link to={otro.to} className="ingreso-otro adela-tactil">
                  {otro.texto}
                </Link>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </section>
  )
}

IngresarCodigo.propTypes = {
  titulo: PropTypes.string.isRequired,
  ayuda: PropTypes.string.isRequired,
  longitud: PropTypes.number.isRequired,
  ejemplo: PropTypes.string.isRequired,
  destino: PropTypes.string.isRequired,
  boton: PropTypes.string.isRequired,
  otro: PropTypes.shape({ to: PropTypes.string, texto: PropTypes.string }),
}

/** /c: entrar a una cápsula con el código que da el expositor. */
export const EntrarCapsula = () => (
  <IngresarCodigo
    titulo="Ingresar a una cápsula"
    ayuda="Escribe el código que te dio el expositor o que aparece junto al QR."
    longitud={6}
    ejemplo="K7Q-M2X"
    destino="/c"
    boton="Entrar"
    otro={{ to: '/r', texto: '¿Ya respondiste? Consulta tu resultado' }}
  />
)

/** /r: volver a un resultado con su código. */
export const ConsultarResultado = () => (
  <IngresarCodigo
    titulo="Consultar mi resultado"
    ayuda="Escribe el código que recibiste al terminar la cápsula."
    longitud={12}
    ejemplo="K7QM-2XPA-9DTR"
    destino="/r"
    boton="Ver resultado"
    otro={{ to: '/c', texto: '¿Tienes el código de una cápsula? Entra aquí' }}
  />
)

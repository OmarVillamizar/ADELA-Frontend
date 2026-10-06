import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CRow,
} from '@coreui/react'
import { normalizarCodigo } from '../../util/capsulas/capsulaUtils'

/**
 * Escribir un código para entrar a una cápsula (/c) o volver a un resultado
 * (/r). Acepta minúsculas, guiones y espacios, igual que el backend.
 */
const IngresarCodigo = ({
  titulo,
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
    <CRow className="justify-content-center">
      <CCol md={8} lg={5}>
        <CCard className="shadow-sm">
          <CCardHeader className="text-center">
            <h5 className="mb-0">{titulo}</h5>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={enviar}>
              <CFormInput
                className="text-center codigo-resultado mb-3"
                style={{ fontSize: '1.3rem' }}
                placeholder={ejemplo}
                autoCapitalize="characters"
                autoComplete="off"
                autoFocus
                maxLength={longitud + 4}
                value={codigo}
                invalid={!!error}
                feedbackInvalid={error}
                onChange={(e) => setCodigo(e.target.value)}
              />
              <div className="text-center">
                <CButton type="submit" color="primary" className="px-5">
                  {boton}
                </CButton>
              </div>
            </CForm>
            {otro && (
              <div className="text-center mt-3">
                <Link to={otro.to} className="small">
                  {otro.texto}
                </Link>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

IngresarCodigo.propTypes = {
  titulo: PropTypes.string.isRequired,
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
    longitud={12}
    ejemplo="K7QM-2XPA-9DTR"
    destino="/r"
    boton="Ver resultado"
    otro={{ to: '/c', texto: '¿Tienes el código de una cápsula? Entra aquí' }}
  />
)

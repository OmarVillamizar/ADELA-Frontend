import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const LONGITUD_CODIGO = 12

/** Volver a un resultado de cápsula escribiendo su código. */
const ConsultarResultado = () => {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState(null)

  const consultar = (e) => {
    e.preventDefault()
    const limpio = normalizarCodigo(codigo)
    if (limpio.length !== LONGITUD_CODIGO) {
      setError(
        `El código tiene ${LONGITUD_CODIGO} caracteres, por ejemplo K7QM-2XPA-9DTR`,
      )
      return
    }
    navigate(`/r/${limpio}`)
  }

  return (
    <CRow className="justify-content-center">
      <CCol md={8} lg={5}>
        <CCard className="shadow-sm">
          <CCardHeader className="text-center">
            <h5 className="mb-0">Consultar mi resultado</h5>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={consultar}>
              <CFormInput
                className="text-center codigo-resultado mb-3"
                style={{ fontSize: '1.3rem' }}
                placeholder="XXXX-XXXX-XXXX"
                autoCapitalize="characters"
                autoComplete="off"
                maxLength={20}
                value={codigo}
                invalid={!!error}
                feedbackInvalid={error}
                onChange={(e) => setCodigo(e.target.value)}
              />
              <div className="text-center">
                <CButton type="submit" color="primary" className="px-5">
                  Ver resultado
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ConsultarResultado

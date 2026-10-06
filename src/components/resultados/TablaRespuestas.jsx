import React from 'react'
import PropTypes from 'prop-types'
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

/** Lo que la persona eligió en cada pregunta. */
const TablaRespuestas = ({ preguntas }) => (
  <CTable hover responsive>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell>#</CTableHeaderCell>
        <CTableHeaderCell>Pregunta</CTableHeaderCell>
        <CTableHeaderCell>Respuesta</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {[...preguntas]
        .sort((a, b) => a.orden - b.orden)
        .map((pregunta) => (
          <CTableRow key={pregunta.orden}>
            <CTableDataCell>{pregunta.orden}</CTableDataCell>
            <CTableDataCell>{pregunta.pregunta}</CTableDataCell>
            <CTableDataCell>
              Respondiste:{' '}
              {pregunta.respuestas.length === 0
                ? 'Ninguna'
                : pregunta.respuestas.join(', ')}
            </CTableDataCell>
          </CTableRow>
        ))}
    </CTableBody>
  </CTable>
)

TablaRespuestas.propTypes = {
  preguntas: PropTypes.arrayOf(
    PropTypes.shape({
      pregunta: PropTypes.string,
      orden: PropTypes.number,
      respuestas: PropTypes.arrayOf(PropTypes.string),
    }),
  ).isRequired,
}

export default TablaRespuestas

import React from 'react'
import PropTypes from 'prop-types'
import { CAlert, CButton } from '@coreui/react'

/**
 * Contiene un fallo de render para que no desmonte la aplicación entera.
 *
 * Sin esto, cualquier excepción en una vista dejaba la pantalla en blanco y la
 * única salida era recargar: es lo que ocurría al navegar a una ruta declarada
 * con `element: null`.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado en una vista:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <CAlert color="danger" className="m-4">
          <h5>Algo salió mal en esta pantalla</h5>
          <p className="mb-3">
            El resto de la aplicación sigue funcionando. Vuelve atrás o recarga
            para intentarlo de nuevo.
          </p>
          <CButton color="secondary" onClick={() => window.location.reload()}>
            Recargar
          </CButton>
        </CAlert>
      )
    }
    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
}

export default ErrorBoundary

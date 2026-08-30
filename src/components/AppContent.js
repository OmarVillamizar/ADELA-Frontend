import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import { protectedRoutes } from '../routes'
import RequireAuth from '../util/auth/RequireAuth'
import ErrorBoundary from './ErrorBoundary'

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <ErrorBoundary>
        <Suspense fallback={<CSpinner color="primary" />}>
          <Routes>
            {/* Una ruta sin componente hacia caer el arbol entero con
                "Element type is invalid" al instanciar <route.element />. */}
            {protectedRoutes
              .filter((route) => route.element)
              .map((route, idx) => (
                <Route key={idx} element={<RequireAuth roles={route.roles} />}>
                  <Route
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                </Route>
              ))}

            <Route path="/" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </CContainer>
  )
}

export default React.memo(AppContent)

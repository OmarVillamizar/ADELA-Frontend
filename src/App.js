import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import AuthProvider from './util/auth/AuthProvider'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))

// Cápsulas: públicas, fuera de DefaultLayout (que exige sesión)
const PublicLayout = React.lazy(() => import('./layout/PublicLayout'))
const ResolverCapsula = React.lazy(
  () => import('./views/capsulaPublica/ResolverCapsula'),
)
const ResultadoCapsula = React.lazy(
  () => import('./views/capsulaPublica/ResultadoCapsula'),
)
const ConsultarResultado = React.lazy(
  () => import('./views/capsulaPublica/ConsultarResultado'),
)

const App = () => {
  const { setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  useEffect(() => {
    setColorMode('light')
  }, [setColorMode])

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <Routes>
            <Route exact path="/login" name="Login Page" element={<Login />} />
            <Route element={<PublicLayout />}>
              <Route path="/c/:codigo" element={<ResolverCapsula />} />
              <Route path="/r" element={<ConsultarResultado />} />
              <Route path="/r/:codigo" element={<ResultadoCapsula />} />
            </Route>
            <Route path="*" name="Home" element={<DefaultLayout />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
import React, { Suspense, useEffect } from 'react'
import {
  AppContent,
  AppSidebar,
  AppFooter,
  AppHeader,
} from '../components/index'
import InsigniasProvider, {
  useInsignias,
} from '../util/insignias/InsigniasProvider'
import { insigniaPorCodigo } from '../views/insignias/catalogo'

const CelebracionInsignia = React.lazy(
  () => import('../components/insignias/CelebracionInsignia'),
)

const CelebracionPendiente = () => {
  const { pendiente, terminarCelebracion } = useInsignias()
  const insignia = pendiente ? insigniaPorCodigo(pendiente.codigo) : null
  const desconocida = pendiente && !insignia ? pendiente.codigo : null

  // Código que el cliente aún no conoce (backend más nuevo): se omite.
  useEffect(() => {
    if (desconocida) terminarCelebracion(desconocida)
  }, [desconocida, terminarCelebracion])

  if (!insignia) return null
  return (
    <Suspense fallback={null}>
      <CelebracionInsignia
        key={insignia.codigo}
        insignia={insignia}
        onTerminar={terminarCelebracion}
      />
    </Suspense>
  )
}

const DefaultLayout = () => {
  return (
    <InsigniasProvider>
      <div>
        <AppSidebar />
        <div className="wrapper d-flex flex-column min-vh-100">
          <AppHeader />
          <div className="body flex-grow-1">
            <AppContent />
          </div>
          <AppFooter />
        </div>
        <CelebracionPendiente />
      </div>
    </InsigniasProvider>
  )
}

export default DefaultLayout

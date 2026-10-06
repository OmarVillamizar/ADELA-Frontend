import React from 'react'
import { Roles } from './util/userUtils.js'

//CHAEA DEVELOP
//admin grupos

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard.js'))

//ACTUALIZAR CUENTA DE USUARIO
const ActualizarEstudiante = React.lazy(
  () => import('./views/miCuenta/actualizarEstudiante/ActualizarEstudiante.js'),
)

//ACTUALIZAR CUENTA DE USUARIO
const AsignarCuestionarios = React.lazy(
  () => import('./views/asigCuestionario/AsignarCuestionarios'),
)

//ACTUALIZAR CUENTA DE PROFESOR
const ActualizarProfesor = React.lazy(
  () => import('./views/miCuenta/actualizarProfesor/ActualizarProfesor.js'),
)

const ProfesorGrupo = React.lazy(
  () => import('./views/profesorGrupos/ProfesorGrupo'),
)

const ProfesorGruposV2 = React.lazy(
  () => import('./views/profesorGrupos/ProfesorGruposV2'),
)

const Capsulas = React.lazy(() => import('./views/capsulas/Capsulas'))

const CapsulaDetalle = React.lazy(
  () => import('./views/capsulas/CapsulaDetalle'),
)

const GestionarCuestionariosParaGrupo = React.lazy(
  () => import('./views/profesorGrupos/GestionarCuestionariosParaGrupo.jsx'),
)
const ReporteGrupo = React.lazy(
  () => import('./views/profesorGrupos/ReporteGrupo'),
)
const ReporteEstudiante = React.lazy(
  () => import('./views/profesorGrupos/ReporteEstudiante'),
)

//Estudiante Vista Cuestionarios
const EstudianteVistaCuestionarios = React.lazy(
  () =>
    import(
      './views/estudianteVistaCuestionarios/EstudianteVistaCuestionarios.js'
    ),
)
const ProfesorVistaCuestionarios = React.lazy(
  () =>
    import('./views/profesorVistaCuestionarios/ProfesorVistaCuestionarios.js'),
)

const CrearCuestionarios = React.lazy(
  () => import('./views/profesorVistaCuestionarios/CrearCuestionarios.js'),
)

const ResponderCuestionario = React.lazy(
  () =>
    import('./views/estudianteVistaCuestionarios/ResponderCuestionario.jsx'),
)

const AsignarRoles = React.lazy(() => import('./views/asigRoles/AsignarRoles'))

const ResultadoCuestionario = React.lazy(
  () => import('./views/estudianteVistaCuestionarios/CuestionarioResuelto.jsx'),
)

const Donaciones = React.lazy(() => import('./views/donaciones/Donaciones.js'))

const MisInsignias = React.lazy(() => import('./views/insignias/MisInsignias.jsx'))

const protectedRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    element: Dashboard,
    roles: Object.values(Roles),
  },

  {
    path: '/cuenta/actualizar-cuenta-estudiante/',
    name: 'Actualizar mi cuenta',
    element: ActualizarEstudiante,
    roles: [Roles.ESTUDIANTE_ACTIVO, Roles.ESTUDIANTE_INCOMPLETO],
  },
  {
    path: '/cuestionarios/',
    name: 'Cuestionarios',
    element: EstudianteVistaCuestionarios,
    roles: [Roles.ESTUDIANTE_ACTIVO],
  },
  {
    path: '/insignias/',
    name: 'Mis insignias',
    element: MisInsignias,
    roles: [Roles.ESTUDIANTE_ACTIVO, Roles.ESTUDIANTE_INCOMPLETO],
  },
  //GESTION DE CUESTIONARIOS PARA PROFESOR
  {
    path: '/administrar-cuestionarios/',
    name: 'Administrar Cuestionarios',
    element: ProfesorVistaCuestionarios,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  //CREACION CUESTIONARIOS
  {
    path: '/crear-cuestionarios/',
    name: 'Crear Cuestionarios',
    element: CrearCuestionarios,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  //ASIGNAR CUESTIONARIOS
  {
    path: '/asginar-cuestionarios/',
    name: 'Asignar Cuestionarios',
    element: AsignarCuestionarios,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  {
    path: '/cuestionario/:id/responder/',
    name: 'Responder cuestionario',
    element: ResponderCuestionario,
    roles: [Roles.ESTUDIANTE_ACTIVO],
  },
  {
    path: '/cuestionario/:id/resultado/',
    name: 'Resultado de cuestionario',
    element: ResultadoCuestionario,
    roles: [Roles.ESTUDIANTE_ACTIVO],
  },
  {
    path: '/reporte-estudiante/:id',
    name: 'Resultados de Estudiante',
    element: ReporteEstudiante,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  //REPORTE GRUPO
  {
    path: '/reporte/:id1/grupo/:id2',
    name: 'Resultados de Grupo',
    element: ReporteGrupo,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  {
    path: '/cuenta/actualizar-cuenta-profesor/',
    name: 'Actualizar mi cuenta',
    element: ActualizarProfesor,
    roles: [
      Roles.PROFESOR_ACTIVO,
      Roles.PROFESOR_INCOMPLETO,
      Roles.PROFESOR_NO_APROBADO,
      Roles.ADMINISTRADOR,
    ],
  },
  {
    path: '/grupos/',
    name: 'Mis Grupos',
    element: ProfesorGruposV2,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  {
    path: '/grupos/:id',
    name: 'Ver grupo',
    element: ProfesorGrupo,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  {
    path: '/capsulas/',
    name: 'Mis Cápsulas',
    element: Capsulas,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  {
    path: '/capsulas/:id',
    name: 'Ver cápsula',
    element: CapsulaDetalle,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  {
    path: '/resultado/:id',
    name: 'Ver Resultados grupo',
    element: GestionarCuestionariosParaGrupo,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  {
    path: '/grupos/aplicaciones-cuestionarios/',
    name: 'Resultados de Grupos',
    element: null,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  {
    path: '/estudiante/:id/resultados/',
    name: 'Resultado de Estudiante',
    element: null,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  {
    path: '/cuentas/',
    name: 'Administrar cuentas',
    element: AsignarRoles,
    roles: [Roles.ADMINISTRADOR],
  },
  {
    path: '/donar/',
    name: 'Donar',
    element: Donaciones,
    roles: [Roles.PROFESOR_ACTIVO,
      Roles.PROFESOR_INCOMPLETO,
      Roles.PROFESOR_NO_APROBADO, Roles.ADMINISTRADOR],
  },
]

export { protectedRoutes }

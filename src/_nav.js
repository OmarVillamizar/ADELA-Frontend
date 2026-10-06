import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilMoodGood,
  cilBadge,
  cilGroup,
  cilUser,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { Roles } from './util/userUtils'

const _nav = [
  //ADMINISTRAR GRUPOS
  {
    component: CNavTitle,
    name: 'Grupos',
    roles: [Roles.PROFESOR_ACTIVO, Roles.ADMINISTRADOR],
  },
   /////////CUESTIONARIOS
   {
    component: CNavTitle,
    name: 'Cuestionarios',
    roles: [Roles.ESTUDIANTE_ACTIVO]
  },
  {
    component: CNavItem,
    name: 'Mis cuestionarios',
    to: '/cuestionarios/',
    roles: [Roles.ESTUDIANTE_ACTIVO],
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Grupos',
    to: '/grupos/',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    roles: [Roles.ADMINISTRADOR, Roles.PROFESOR_ACTIVO],
  },
  //MI CUENTA
  {
    component: CNavTitle,
    name: 'Mi Cuenta',
  },
  //ACTUALIZAR USER
  {
    component: CNavItem,
    name: 'Actualizar Cuenta',
    icon: <CIcon icon={cilMoodGood} customClassName="nav-icon" />,
    to: '/cuenta/actualizar-cuenta-estudiante',
    roles: [Roles.ESTUDIANTE_ACTIVO, Roles.ESTUDIANTE_INCOMPLETO],
  },
  {
    component: CNavItem,
    name: 'Actualizar Cuenta',
    icon: <CIcon icon={cilMoodGood} customClassName="nav-icon" />,
    to: '/cuenta/actualizar-cuenta-profesor',
    roles: [
      Roles.PROFESOR_ACTIVO,
      Roles.PROFESOR_INCOMPLETO,
      Roles.PROFESOR_NO_APROBADO,
      Roles.ADMINISTRADOR,
    ],
  },
  {
    component: CNavItem,
    name: 'Mis insignias',
    to: '/insignias/',
    roles: [Roles.ESTUDIANTE_ACTIVO, Roles.ESTUDIANTE_INCOMPLETO],
    icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
    // Destino de la animación de insignia ganada; AppSidebar le pone el contador.
    'data-insignias-destino': '',
  },
  /////CUENTAS ADMINISTRADOR
  {
    component: CNavTitle,
    name: 'ADMINISTRADOR',
    roles: [Roles.ADMINISTRADOR],
  },
  {
    component: CNavItem,
    name: 'Administrar cuentas',
    to: '/cuentas/',
    roles: [Roles.ADMINISTRADOR],
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
    //ADMINISTRAR CUESTIONARIOS
    {
      component: CNavItem,
      name: 'Administrar Cuestionarios',
      to: '/administrar-cuestionarios/',
      icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
      roles: [Roles.ADMINISTRADOR],
    },
    {
    component: CNavTitle,
    name: 'SOPORTE',
    roles: [Roles.PROFESOR_ACTIVO,
      Roles.PROFESOR_INCOMPLETO,
      Roles.PROFESOR_NO_APROBADO, Roles.ADMINISTRADOR],
  },
  {
      component: CNavItem,
      name: 'Realizar Donación',
      to: '/donar/',
      icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
      roles: [Roles.PROFESOR_ACTIVO,
      Roles.PROFESOR_INCOMPLETO,
      Roles.PROFESOR_NO_APROBADO, Roles.ADMINISTRADOR],
    },
]

export default _nav

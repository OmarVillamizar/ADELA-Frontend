export const Roles = Object.freeze({
  ESTUDIANTE_INACTIVO: 0,
  ESTUDIANTE_INCOMPLETO: 1,
  ESTUDIANTE_ACTIVO: 2,
  PROFESOR_INACTIVO: 3,
  PROFESOR_INCOMPLETO: 4,
  PROFESOR_NO_APROBADO: 5,
  PROFESOR_ACTIVO: 6,
  ADMINISTRADOR: 7,
})

export function getRoleKey(value) {
  return Object.keys(Roles).find((key) => Roles[key] === value)
}

export const getRole = (user) => {
  if (!user || !user.estado || !user.tipoUsuario) {
    throw new Error('Error: usuario inválido')
  }
  const userType = user.tipoUsuario
  if (userType === 'ESTUDIANTE') {
    if (user.estado === 'INACTIVA') return Roles.ESTUDIANTE_INACTIVO
    if (user.estado === 'INCOMPLETA') return Roles.ESTUDIANTE_INCOMPLETO
    if (user.estado === 'ACTIVA') return Roles.ESTUDIANTE_ACTIVO
    throw new Error(`Error: estado de estudiante inválido (${user.estado})`)
  } else if (userType === 'PROFESOR' || userType === 'ADMINISTRADOR') {
    if (user.estado === 'INACTIVA') return Roles.PROFESOR_INACTIVO
    if (user.estado === 'INCOMPLETA') return Roles.PROFESOR_INCOMPLETO
    if (user.estado === 'ACTIVA') {
      if (user.estadoProfesor === 'INACTIVA') return Roles.PROFESOR_NO_APROBADO
      if (user.estadoProfesor === 'ACTIVA') {
        if (user.rol === 'PROFESOR') return Roles.PROFESOR_ACTIVO
        if (user.rol === 'ADMINISTRADOR') return Roles.ADMINISTRADOR
        throw new Error(`Error: rol de profesor inválido (${user.rol})`)
      }
      throw new Error(`Error: estado de profesor activo inválido (${user.estadoProfesor})`)
    }
    throw new Error(`Error: estado de profesor inválido (${user.estado})`)
  }
}

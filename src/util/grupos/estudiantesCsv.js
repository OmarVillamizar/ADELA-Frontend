import Papa from 'papaparse'

/**
 * Lectura de listas de estudiantes en CSV.
 *
 * Las listas llegan de Excel (en español guarda con ";" y en Windows-1252 si
 * no se elige "CSV UTF-8"), de Google Sheets o de exportaciones de Classroom y
 * formularios, con encabezados como "Dirección de correo electrónico" o el
 * nombre partido en "Nombres" y "Apellidos". Antes solo valía un encabezado
 * exacto `correo`/`email`: cualquier otra hoja se leía vacía y sin aviso.
 */

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const normalizarCorreo = (valor) =>
  (valor ?? '').toString().trim().toLowerCase()

export const esCorreo = (valor) => PATRON_CORREO.test(normalizarCorreo(valor))

const normalizarEncabezado = (valor) =>
  (valor ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()

const tipoDeColumna = (encabezado) => {
  const h = normalizarEncabezado(encabezado)
  if (/correo|e-?mail|mail/.test(h)) return 'correo'
  if (/apellido|surname|last ?name/.test(h)) return 'apellido'
  if (/nombre|name|estudiante|alumno/.test(h)) return 'nombre'
  return null
}

/** UTF-8 si el archivo lo es; si no, la codificación por defecto de Excel en Windows. */
const decodificar = (buffer) => {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    return new TextDecoder('windows-1252').decode(buffer)
  }
}

const parsear = (texto) => {
  // Excel a veces antepone "sep=;" para fijar el separador.
  const sinSep = texto.replace(/^﻿/, '').replace(/^sep=.\r?\n/i, '')
  return Papa.parse(sinSep, {
    skipEmptyLines: 'greedy',
    delimitersToGuess: [',', ';', '\t', '|'],
  }).data.map((fila) => fila.map((celda) => (celda ?? '').toString().trim()))
}

/** Une varias columnas de nombre (p. ej. "Nombres" y "Apellidos") en una. */
const unir = (fila, indices) =>
  indices
    .map((i) => fila[i])
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')

/**
 * Devuelve { estudiantes: [{ email, nombre }], invalidos: [texto], repetidos }.
 * Los correos salen normalizados y sin repetir.
 */
export const leerEstudiantesCsv = async (archivo) => {
  const filas = parsear(decodificar(await archivo.arrayBuffer()))
  if (filas.length === 0) {
    return { estudiantes: [], invalidos: [], repetidos: 0 }
  }

  const tipos = filas[0].map(tipoDeColumna)
  const conEncabezado = tipos.includes('correo')
  const columnaCorreo = tipos.indexOf('correo')
  const columnasNombre = [
    ...tipos.flatMap((t, i) => (t === 'nombre' ? [i] : [])),
    ...tipos.flatMap((t, i) => (t === 'apellido' ? [i] : [])),
  ]

  const vistos = new Map()
  const invalidos = []
  let repetidos = 0

  const cuerpo = conEncabezado ? filas.slice(1) : filas
  cuerpo.forEach((fila, n) => {
    let email
    let nombre
    if (conEncabezado) {
      email = fila[columnaCorreo]
      nombre = unir(fila, columnasNombre)
    } else {
      // Sin encabezado reconocible: el correo es la celda que lo parezca y el
      // nombre, el resto de la fila.
      const i = fila.findIndex(esCorreo)
      if (i === -1) {
        // Una primera fila sin correo es un encabezado que no reconocemos.
        if (n > 0 || fila.some((c) => c.includes('@'))) {
          invalidos.push(fila.filter(Boolean).join(' '))
        }
        return
      }
      email = fila[i]
      nombre = unir(
        fila,
        fila.map((_, j) => j).filter((j) => j !== i),
      )
    }

    if (!email && !nombre) return
    if (!esCorreo(email)) {
      invalidos.push(email || nombre)
      return
    }
    const correo = normalizarCorreo(email)
    if (vistos.has(correo)) {
      repetidos += 1
      if (!vistos.get(correo).nombre && nombre)
        vistos.get(correo).nombre = nombre
      return
    }
    vistos.set(correo, { email: correo, nombre })
  })

  return { estudiantes: [...vistos.values()], invalidos, repetidos }
}

/**
 * Plantilla con ";" y BOM: Excel en español la abre ya en columnas y con
 * tildes; Google Sheets y este mismo lector también la entienden.
 */
export const descargarPlantillaCsv = () => {
  const contenido =
    '﻿correo;nombre\r\n' +
    'ana.perez@ufps.edu.co;Ana Pérez\r\n' +
    'luis.gomez@ufps.edu.co;Luis Gómez\r\n'
  const url = URL.createObjectURL(
    new Blob([contenido], { type: 'text/csv;charset=utf-8' }),
  )
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = 'plantilla_estudiantes.csv'
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

/**
 * Sin la guarda, `new Date(null)` da el epoch y se imprimía como 1969-12-31 en
 * UTC−5, mientras que `new Date(undefined)` daba NaN-NaN-NaN. fechaResolucion es
 * nula por diseño mientras la asignación sigue pendiente, así que esas fechas
 * falsas aparecían en pantalla como si fueran datos reales.
 */
export const dateFromMsToString = (milliseconds, placeholder = '—') => {
  if (milliseconds === null || milliseconds === undefined) return placeholder
  const date = new Date(milliseconds)
  if (Number.isNaN(date.getTime())) return placeholder
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)
  const formattedDate = `${year}-${month}-${day}`
  return formattedDate
}

export const dateFromStringToMsUTC = (inputDate) => {
  const date = new Date(inputDate) // Local time Date object
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000) // Convert to UTC
  return utcDate.getTime()
}

import api from './api'

// Instrucciones (.md) que la persona copia a su propia IA. Solo administrador.
export const obtenerInstrucciones = async () => {
  const response = await api.get(
    '/api/cuestionarios/importacion/instrucciones',
    { responseType: 'text' },
  )
  return response.data
}

// Valida lo que pegó la persona sin guardar nada:
// { cuestionario, analisis, marcas, erroresDuros }.
export const validarImportacion = async (texto) => {
  const response = await api.post('/api/cuestionarios/importacion/validar', {
    texto,
  })
  return response.data
}

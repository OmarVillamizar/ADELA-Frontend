/**
 * Error normalizado de la API.
 *
 * Los servicios hacian `throw error.response.data`, lo que lanzaba un objeto
 * plano sin `.message`. Las vistas mostraban `error.message` y salia un modal
 * de error con el cuerpo vacio: el "error silencioso" al repetir un codigo.
 *
 * `from` cubre los tres casos posibles y siempre produce un `message` legible.
 */
export class ApiError extends Error {
  constructor({ status, code, message, fields, traceId }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
    this.traceId = traceId
  }

  static from(axiosError) {
    // 1. Sin respuesta: red caida, timeout, DNS o CORS.
    if (!axiosError.response) {
      return new ApiError({
        status: 0,
        code: 'RED',
        message: 'No se pudo conectar con el servidor. Revisa tu conexión.',
      })
    }

    const { status, data } = axiosError.response

    // 2. Endpoint que todavia responde un string plano.
    if (typeof data === 'string' && data.trim()) {
      return new ApiError({ status, code: 'DESCONOCIDO', message: data })
    }

    // 3. Contrato de error del backend.
    return new ApiError({
      status,
      code: data?.code ?? 'DESCONOCIDO',
      message: data?.message ?? `Error ${status}`,
      fields: data?.fields,
      traceId: data?.traceId,
    })
  }
}

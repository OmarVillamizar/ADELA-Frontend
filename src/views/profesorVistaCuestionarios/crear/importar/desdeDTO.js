/**
 * Importación de un cuestionario hecho fuera del editor (con la IA de la
 * persona o con Nelse): el inverso de aDTO. Devuelve un borrador en modo
 * avanzado, con ids locales nuevos, la convención del asistente aplicada
 * cuando el análisis la pide y las marcas que hay que revisar en b.ia.
 *
 * Vive aquí y no en borrador.js porque necesita MODELOS (asistente/modelos.js),
 * que a su vez importa borrador.js: dentro de borrador.js sería un ciclo de
 * importación que rompe según qué archivo se cargue primero.
 */
import { MODELOS } from '../asistente/modelos'
import {
  CORTE,
  ESCALA,
  ESQUEMA,
  ESQUINAS,
  FORMATO,
  LECTURA,
  TIPO,
  borradorVacio,
  complementariaDeDTO,
  compuestos,
  elegirCorte,
  interpretacionVacia,
  nuevoId,
  pasarAAvanzado,
  planoVacio,
  polosDe,
  primarios,
} from '../borrador'
import { seccionDeCampo } from './marcas'

const ORDEN_RIESGO = { ALTO: 0, MEDIO: 1, BAJO: 2 }

const normal = (s) => (s ?? '').toString().trim().toLowerCase()
const sinTildes = (s) => normal(s).normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Copia ordenada por `orden` (sin él, por posición); estable con empates. */
const porOrden = (lista) =>
  (lista ?? [])
    .map((x, i) => ({ ...x, orden: x.orden ?? i + 1 }))
    .sort((a, b) => a.orden - b.orden)

/** Marcas que dejan los errores duros del servidor, para que no pasen en silencio. */
export const marcasDeErroresDuros = (errores) =>
  Object.entries(errores ?? {}).map(([campo, mensaje]) => ({
    origen: 'VALIDADOR',
    riesgo: 'ALTO',
    seccion: seccionDeCampo(campo),
    refs: [],
    mensaje: String(mensaje),
    comoVerificar:
      'El servidor no aceptaría este dato tal como está: corrígelo en el editor.',
  }))

/**
 * Claves del modelo para los estilos del borrador, o null si no se puede.
 * Con estilos simples (cuatro estilos) se empareja por nombre y, si no
 * alcanza, por posición; con pares opuestos, por posición (comparten cortes).
 * Devuelve { claves: Map(id -> clave), porPosicion }.
 */
const asignarClaves = (b, m) => {
  const conPares = Boolean(m.pares)
  const destinos = conPares
    ? compuestos(b).filter((e) => polosDe(e))
    : primarios(b)
  const claves = conPares ? m.pares.map((p) => p.clave) : m.estilos
  if (destinos.length !== claves.length) return null
  if (conPares)
    return {
      claves: new Map(destinos.map((e, i) => [e.id, claves[i]])),
      porPosicion: false,
    }
  const porNombre = m.estilos.map((me) =>
    destinos.find((e) => sinTildes(e.nombre) === sinTildes(me.nombre)),
  )
  const coincide =
    porNombre.every(Boolean) && new Set(porNombre).size === porNombre.length
  const elegidos = coincide ? porNombre : destinos
  return {
    claves: new Map(elegidos.map((e, i) => [e.id, m.estilos[i].clave])),
    porPosicion: !coincide,
  }
}

/**
 * CuestionarioDTO (+ análisis y marcas del validador) -> borrador editable.
 * analisis y marcas pueden faltar; origen dice de dónde vino ('EXTERNA' o
 * 'NELSE').
 */
export const borradorDesdeDTO = (
  dto,
  analisis = null,
  marcas = [],
  origen = 'EXTERNA',
) => {
  const usados = new Set()
  const id = () => {
    let nuevo = nuevoId()
    while (usados.has(nuevo)) nuevo = nuevoId()
    usados.add(nuevo)
    return nuevo
  }
  // Marcas del propio importador (algo que no se pudo cargar o aplicar).
  const propias = []
  const marcar = (riesgo, seccion, mensaje, comoVerificar, refs = []) =>
    propias.push({
      origen: 'VALIDADOR',
      riesgo,
      seccion,
      refs,
      mensaje,
      comoVerificar,
    })

  let b = { ...borradorVacio(), modo: 'AVANZADO' }
  b.meta = Object.fromEntries(
    Object.keys(b.meta).map((k) => [k, String(dto?.[k] ?? '')]),
  )

  // Estilos: id del DTO -> id local.
  const idEstilo = new Map()
  const estilosDTO = dto?.estilos ?? []
  estilosDTO.forEach((e) => idEstilo.set(e.id, id()))
  b.estilos = estilosDTO.map((e) => ({
    id: idEstilo.get(e.id),
    nombre: e.nombre ?? '',
    tipo: e.tipo === TIPO.COMPUESTO ? TIPO.COMPUESTO : TIPO.PRIMARIO,
    coeficientes: (e.coeficientes ?? []).map((c) => ({
      estiloId: idEstilo.get(c.estiloId) ?? '',
      coeficiente: c.coeficiente,
    })),
  }))
  const estiloPorNombre = (nombre) => {
    const n = (nombre ?? '').trim()
    return (
      b.estilos.find((e) => e.nombre.trim() === n) ??
      b.estilos.find((e) => normal(e.nombre) === normal(n))
    )
  }

  // Preguntas: por `orden`; la forma es la de nuevaPregunta / nuevaOpcion.
  const idPregunta = new Map()
  b.preguntas = porOrden(dto?.preguntas).map((p) => {
    const formato = p.formato ?? FORMATO.UNICA
    const pregunta = {
      id: id(),
      texto: p.pregunta ?? '',
      formato,
      obligatoria: p.obligatoria ?? formato !== FORMATO.MULTIPLE,
      minSelecciones: p.minSelecciones ?? 0,
      maxSelecciones: p.maxSelecciones ?? '',
      puntosRepartir: p.puntosRepartir ?? '',
      opciones: porOrden(p.opciones).map((o) => ({
        id: id(),
        texto: o.respuesta ?? '',
        pesos: (o.pesos ?? []).map((w) => ({
          estiloId: idEstilo.get(w.estiloId) ?? '',
          peso: w.peso,
        })),
      })),
    }
    if (!idPregunta.has(p.orden)) idPregunta.set(p.orden, pregunta.id)
    return pregunta
  })

  // Interpretación en la forma del editor avanzado.
  const inter = dto?.interpretacion ?? {}
  const grupos = new Map()
  ;(inter.bandas ?? []).forEach((x, i) => {
    const clave = `${x.estilo}|${x.escala}`
    grupos.set(clave, [
      ...(grupos.get(clave) ?? []),
      { ...x, orden: x.orden ?? i + 1 },
    ])
  })
  const bandas = [...grupos.values()].flatMap((grupo) =>
    grupo
      .sort((a, c) => a.orden - c.orden)
      .flatMap((x) => {
        const estilo = estiloPorNombre(x.estilo)
        if (!estilo) {
          marcar(
            'ALTO',
            'bandas',
            `Un nivel («${x.etiqueta ?? ''}») apuntaba al estilo «${x.estilo ?? ''}», que no existe: se descartó.`,
            'Revisa los niveles de cada estilo y agrega el que haya quedado fuera.',
            [`estilo:${x.estilo ?? ''}`],
          )
          return []
        }
        return [
          {
            id: id(),
            estiloId: estilo.id,
            escala: x.escala ?? ESCALA.POMP,
            li: x.limiteInferior ?? '',
            ls: x.limiteSuperior ?? '',
            etiqueta: x.etiqueta ?? '',
          },
        ]
      }),
  )
  const p = inter.plano
  const plano = p
    ? {
        ...planoVacio(
          estiloPorNombre(p.ejeX)?.id ?? '',
          estiloPorNombre(p.ejeY)?.id ?? '',
        ),
        corteX: p.corteX ?? 0,
        corteY: p.corteY ?? 0,
        ...Object.fromEntries(ESQUINAS.map(([k]) => [k, p[k] ?? ''])),
        invertirX: Boolean(p.invertirX),
        invertirY: Boolean(p.invertirY),
      }
    : null
  b.interpretacion = {
    ...interpretacionVacia(),
    esquema: inter.esquema ?? ESQUEMA.NINGUNA,
    delta: inter.delta ?? 10,
    bandas,
    escalones: (inter.escalones ?? []).map((s) => ({
      totalMin: s.totalMin,
      totalMax: s.totalMax,
      distancia: s.distancia,
    })),
    complementaria: complementariaDeDTO(inter.complementaria),
    ...(plano ? { plano } : {}),
  }

  // Convención del asistente: la lectura que ADELA calcula sin fuente.
  const lectura = analisis?.lectura?.lecturaAsistente
  if (Object.values(LECTURA).includes(lectura)) {
    let aplicable = true
    let trabajo = {
      ...b,
      lectura,
      complementaria: b.interpretacion.complementaria,
    }
    if (lectura === LECTURA.CUADRANTES) {
      const ejes = compuestos(trabajo).map((e) => e.id)
      const ejesBien =
        ejes.length === 2 &&
        (!plano ||
          (ejes.includes(plano.ejeX) &&
            ejes.includes(plano.ejeY) &&
            plano.ejeX !== plano.ejeY))
      if (ejesBien) {
        const corte =
          analisis.lectura.corte === 'REFERENCIA'
            ? CORTE.REFERENCIA
            : CORTE.EQUILIBRIO
        trabajo = plano
          ? { ...trabajo, planoAsistente: { corte, plano } }
          : elegirCorte(trabajo, corte)
      } else {
        aplicable = false
        marcar(
          'ALTO',
          'plano',
          'El mapa de cuatro estilos necesita exactamente dos pares de polos opuestos como ejes, y no se encontraron: no se aplicó la lectura sugerida.',
          'Configura el mapa en Lectura de resultados o elige otra lectura.',
        )
      }
    }
    if (lectura === LECTURA.BAREMO_MODELO) {
      const m = MODELOS.find(
        (x) => x.id === analisis.modeloAsistente && x.baremo,
      )
      const asignacion = m ? asignarClaves(trabajo, m) : null
      if (asignacion) {
        trabajo = {
          ...trabajo,
          baremoModelo: m.baremo,
          estilos: trabajo.estilos.map((e) =>
            asignacion.claves.has(e.id)
              ? { ...e, clave: asignacion.claves.get(e.id) }
              : e,
          ),
        }
        if (asignacion.porPosicion)
          marcar(
            'MEDIO',
            'bandas',
            'Los cortes del modelo se asignaron a los estilos por su posición, porque los nombres no coinciden con los del modelo.',
            `Verifica que cada estilo reciba los cortes que le corresponden: ${trabajo.estilos
              .filter((e) => asignacion.claves.has(e.id))
              .map((e) => e.nombre)
              .join(', ')}.`,
          )
      } else {
        aplicable = false
        marcar(
          'ALTO',
          'bandas',
          'No se pudieron aplicar los cortes del modelo: los estilos no coinciden con su estructura. Los niveles quedan como llegaron.',
          'Revisa los niveles de cada estilo en Lectura de resultados.',
        )
      }
    }
    if (aplicable) b = pasarAAvanzado(trabajo)
  }

  // Marcas: las del validador y las del importador, por riesgo, con ids y
  // referencias a los elementos locales.
  const resolver = ({ refs, ...resto }, i) => {
    const preguntaIds = []
    const estiloIds = []
    ;(refs ?? []).forEach((ref) => {
      const [tipo, ...valor] = String(ref).split(':')
      const dato = valor.join(':').trim()
      if (tipo === 'pregunta' && idPregunta.has(Number(dato)))
        preguntaIds.push(idPregunta.get(Number(dato)))
      if (tipo === 'estilo' && estiloPorNombre(dato))
        estiloIds.push(estiloPorNombre(dato).id)
    })
    return {
      ...resto,
      id: `m${i + 1}`,
      riesgo: resto.riesgo in ORDEN_RIESGO ? resto.riesgo : 'MEDIO',
      refs: refs ?? [],
      preguntaIds,
      estiloIds,
    }
  }
  const todas = [...(marcas ?? []), ...propias]
    .map((m, i) => [m, i])
    .sort(
      ([a, i], [c, j]) =>
        (ORDEN_RIESGO[a.riesgo] ?? 1) - (ORDEN_RIESGO[c.riesgo] ?? 1) || i - j,
    )
    .map(([m], i) => resolver(m, i))

  b.ia = {
    origen,
    marcas: todas,
    revisadas: [],
    resumen: analisis
      ? {
          modo: analisis.modo ?? null,
          modeloAsistente: analisis.modeloAsistente ?? null,
          lectura: analisis.lectura ?? null,
          origen: analisis.origen ?? null,
          faltantes: analisis.faltantes ?? [],
          noSoportado: analisis.noSoportado ?? [],
          preguntasAlProfesor: analisis.preguntasAlProfesor ?? [],
        }
      : null,
  }
  return b
}

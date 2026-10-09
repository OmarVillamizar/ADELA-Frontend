/**
 * Borrador de un cuestionario en creación. Lo editan el asistente y el modo
 * avanzado: los dos leen y escriben esta misma forma, así que pasar de uno al
 * otro no pierde nada. Todo aquí es puro (sin React) y cada función devuelve
 * un borrador nuevo.
 *
 * Los ids son locales (texto) y solo sirven para enlazar opciones, estilos y
 * bandas mientras se edita. aDTO los traduce al contrato del servidor.
 */
import { FORMATO } from '../../../util/cuestionario/validarRespuesta'

export { FORMATO }

export const TIPO = { PRIMARIO: 'PRIMARIO', COMPUESTO: 'COMPUESTO' }
export const ESQUEMA = {
  NINGUNA: 'NINGUNA',
  BAREMO: 'BAREMO',
  RELATIVO: 'RELATIVO',
  RELATIVO_ESCALONADO: 'RELATIVO_ESCALONADO',
  CUADRANTES: 'CUADRANTES',
  NIVEL_SUPERIOR: 'NIVEL_SUPERIOR',
}
export const ESCALA = { BRUTO: 'BRUTO', POMP: 'POMP' }

export const PLANTILLA = {
  AFIRMACIONES: 'AFIRMACIONES',
  UNA_OPCION: 'UNA_OPCION',
  VARIAS: 'VARIAS',
  ORDENAR: 'ORDENAR',
}

export const LECTURA = {
  SOLO_PUNTAJES: 'SOLO_PUNTAJES',
  PREDOMINANTE: 'PREDOMINANTE',
  NIVELES: 'NIVELES',
  CUADRANTES: 'CUADRANTES',
  DOMINANCIA: 'DOMINANCIA',
  // Niveles con los cortes de un modelo, en proporción a las preguntas reales.
  BAREMO_MODELO: 'BAREMO_MODELO',
  // Perfil por distancia de paso, con la tabla escalada a las marcas posibles.
  ESCALONADO: 'ESCALONADO',
}

/** Dónde corta el mapa de cuatro estilos en el asistente. */
export const CORTE = {
  EQUILIBRIO: 'EQUILIBRIO',
  REFERENCIA: 'REFERENCIA',
  PERSONALIZADO: 'PERSONALIZADO',
}

const nuevoId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export const interpretacionVacia = () => ({
  esquema: ESQUEMA.NINGUNA,
  delta: 10,
  bandas: [],
  escalones: [],
  complementaria: null,
})

/** Esquemas que destacan varios estilos: con ellos puede salir "todos destacados". */
export const admiteComplementaria = (esquema) =>
  esquema === ESQUEMA.RELATIVO || esquema === ESQUEMA.RELATIVO_ESCALONADO

/**
 * Punto de partida editable de la pregunta complementaria: si la persona usa
 * sus estilos según la situación o combinándolos. Todo se puede reescribir.
 */
export const plantillaComplementaria = () => ({
  titulo: '¿Cómo prefieres aprender?',
  introduccion:
    'Tu resultado destaca todos los estilos por igual. Queremos conocer un poco mejor cómo prefieres utilizarlos.',
  enunciado:
    'Cuando aprendes algo nuevo, ¿cuál de estas situaciones describe mejor tu forma habitual de aprender?',
  nota: 'No hay respuestas correctas o incorrectas. Elige la opción con la que más te identifiques.',
  opciones: [
    {
      id: nuevoId(),
      texto: 'Adapto mi forma de aprender según la situación.',
      descripcion:
        'Prefiero elegir la forma de aprender que mejor se ajuste a lo que necesito. Por ejemplo, si debo estudiar un documento, prefiero leerlo; si necesito aprender una actividad práctica, prefiero realizarla.',
      resultado: 'Multimodal selectivo',
      resultadoDescripcion:
        'Prefiere adaptar su forma de aprender a cada situación, eligiendo el estilo más útil en cada momento.',
    },
    {
      id: nuevoId(),
      texto: 'Prefiero combinar diferentes formas de aprender.',
      descripcion:
        'Cuando quiero comprender algo nuevo, prefiero usar varias formas de aprendizaje a la vez. Por ejemplo, leer una explicación, observar un diagrama, conversar sobre el tema y ponerlo en práctica.',
      resultado: 'Multimodal integrativo',
      resultadoDescripcion:
        'Prefiere combinar varias formas de aprender para comprender algo nuevo, complementando unas con otras.',
    },
  ],
})

export const nuevaOpcionComplementaria = () => ({
  id: nuevoId(),
  texto: '',
  descripcion: '',
  resultado: '',
  resultadoDescripcion: '',
})

const texto = (v) => (v ?? '').trim()
const textoOpcional = (v) => texto(v) || null

/** ComplementariaConfigDTO desde la forma del editor (o null). */
export const complementariaADTO = (c) =>
  c
    ? {
        titulo: texto(c.titulo),
        introduccion: textoOpcional(c.introduccion),
        enunciado: texto(c.enunciado),
        nota: textoOpcional(c.nota),
        opciones: c.opciones.map((o) => ({
          texto: texto(o.texto),
          descripcion: textoOpcional(o.descripcion),
          resultado: texto(o.resultado),
          resultadoDescripcion: textoOpcional(o.resultadoDescripcion),
        })),
      }
    : null

/** ComplementariaConfigDTO del servidor -> forma del editor. */
export const complementariaDeDTO = (dto) =>
  dto
    ? {
        titulo: dto.titulo ?? '',
        introduccion: dto.introduccion ?? '',
        enunciado: dto.enunciado ?? '',
        nota: dto.nota ?? '',
        opciones: (dto.opciones ?? []).map((o) => ({
          id: nuevoId(),
          texto: o.texto ?? '',
          descripcion: o.descripcion ?? '',
          resultado: o.resultado ?? '',
          resultadoDescripcion: o.resultadoDescripcion ?? '',
        })),
      }
    : null

/** Problemas de la pregunta complementaria (mismas reglas que el servidor). */
export const erroresComplementaria = (c) => {
  if (!c) return []
  const errores = []
  const largo = (v, max, obligatorio, mensaje) => {
    if (obligatorio && !texto(v)) errores.push(mensaje)
    else if (texto(v).length > max) errores.push(`${mensaje} (máx. ${max}).`)
  }
  largo(c.titulo, 150, true, 'La pregunta complementaria necesita un título.')
  largo(c.introduccion, 500, false, 'La introducción es muy larga')
  largo(c.enunciado, 500, true, 'Escribe la pregunta complementaria.')
  largo(c.nota, 300, false, 'La nota es muy larga')
  if (c.opciones.length < 2)
    errores.push('La pregunta complementaria necesita al menos 2 opciones.')
  const vistos = new Set()
  c.opciones.forEach((o, i) => {
    const n = i + 1
    largo(o.texto, 200, true, `La opción ${n} necesita un texto.`)
    largo(
      o.descripcion,
      1000,
      false,
      `La descripción de la opción ${n} es muy larga`,
    )
    largo(
      o.resultado,
      100,
      true,
      `La opción ${n} necesita el nombre del resultado.`,
    )
    largo(
      o.resultadoDescripcion,
      1000,
      false,
      `La descripción del resultado ${n} es muy larga`,
    )
    const clave = texto(o.resultado).toLowerCase()
    if (clave && vistos.has(clave))
      errores.push(
        `La opción ${n} repite un resultado: cada opción debe llevar a uno distinto.`,
      )
    vistos.add(clave)
  })
  return errores
}

export const borradorVacio = () => ({
  modo: null,
  plantilla: null,
  // Solo en la plantilla ORDENAR: jerarquía o reparto, y cuántos puntos.
  formatoOrden: FORMATO.JERARQUIA,
  puntos: 10,
  // Solo en la plantilla AFIRMACIONES: cómo se responde cada frase.
  respuestaFrase: 'SI_NO',
  mideEscala: 'FRECUENCIA',
  puntosEscala: 4,
  meta: { nombre: '', siglas: '', descripcion: '', autor: '', version: '' },
  estilos: [],
  preguntas: [],
  lectura: null,
  // Modelo guía elegido en el asistente (asistente/modelos.js), o null.
  modelo: null,
  // Cortes del modelo para la lectura BAREMO_MODELO: clave de estilo ->
  // { min, max, niveles: [[desde, hasta, etiqueta]] } en la escala original.
  baremoModelo: null,
  // Las preguntas nuevas traen dos opciones, una por polo de cada par.
  preguntaPorPar: false,
  // Pregunta complementaria del asistente (lectura PREDOMINANTE), o null.
  complementaria: null,
  // Lo que el usuario fija en el asistente para la lectura CUADRANTES.
  planoAsistente: null,
  interpretacion: interpretacionVacia(),
})

/** Hay algo que valga la pena ofrecer para continuar. */
export const tieneContenido = (b) =>
  Boolean(b && (b.modo || b.estilos.length || b.preguntas.length))

export const primarios = (b) =>
  b.estilos.filter((e) => e.tipo === TIPO.PRIMARIO)
export const compuestos = (b) =>
  b.estilos.filter((e) => e.tipo === TIPO.COMPUESTO)
export const nombreDe = (b, id) =>
  b.estilos.find((e) => e.id === id)?.nombre ?? ''

const normal = (s) => (s ?? '').trim().toLowerCase()

/* ------------------------------------------------------------------ */
/* Estilos                                                              */
/* ------------------------------------------------------------------ */

export const agregarEstilo = (b, nombre, tipo = TIPO.PRIMARIO, coef = []) => ({
  ...b,
  estilos: [
    ...b.estilos,
    { id: nuevoId(), nombre: nombre.trim(), tipo, coeficientes: coef },
  ],
})

export const actualizarEstilo = (b, id, cambios) => ({
  ...b,
  estilos: b.estilos.map((e) => (e.id === id ? { ...e, ...cambios } : e)),
})

/**
 * Quita un estilo y todo lo que lo usa: pesos, coeficientes y bandas. Un
 * compuesto que se queda sin coeficientes también se va (era un par con él).
 */
export const quitarEstilo = (b, id) => {
  const estilos = b.estilos
    .filter((e) => e.id !== id)
    .map((e) => ({
      ...e,
      coeficientes: e.coeficientes.filter((c) => c.estiloId !== id),
    }))
  const huerfanos = estilos
    .filter((e) => e.tipo === TIPO.COMPUESTO && e.coeficientes.length < 2)
    .filter(
      (e) => b.estilos.find((x) => x.id === e.id).coeficientes.length >= 2,
    )
    .map((e) => e.id)
  const fuera = new Set([id, ...huerfanos])
  const plano = b.interpretacion.plano
  const sinPlano =
    Boolean(plano) && (fuera.has(plano.ejeX) || fuera.has(plano.ejeY))
  return {
    ...b,
    estilos: estilos.filter((e) => !fuera.has(e.id)),
    preguntas: b.preguntas.map((p) => ({
      ...p,
      opciones: p.opciones.map((o) => ({
        ...o,
        pesos: o.pesos.filter((w) => !fuera.has(w.estiloId)),
      })),
    })),
    interpretacion: {
      ...b.interpretacion,
      bandas: b.interpretacion.bandas.filter((x) => !fuera.has(x.estiloId)),
      // Sin uno de sus ejes el mapa no tiene sentido: se borra y, si el
      // esquema sigue en CUADRANTES, la validación pide reconfigurarlo.
      ...(sinPlano ? { plano: undefined } : {}),
    },
  }
}

/** Par de polos opuestos: el compuesto "A − B" con +1 y −1. */
export const agregarPar = (b, aId, bId) =>
  agregarEstilo(
    b,
    `${nombreDe(b, aId)} − ${nombreDe(b, bId)}`,
    TIPO.COMPUESTO,
    [
      { estiloId: aId, coeficiente: 1 },
      { estiloId: bId, coeficiente: -1 },
    ],
  )

/** Los dos polos de un compuesto "A − B", o null si no tiene esa forma. */
export const polosDe = (e) => {
  if (e.tipo !== TIPO.COMPUESTO || e.coeficientes.length !== 2) return null
  const a = e.coeficientes.find((c) => Number(c.coeficiente) > 0)
  const z = e.coeficientes.find((c) => Number(c.coeficiente) < 0)
  return a && z ? { a: a.estiloId, b: z.estiloId } : null
}

/**
 * Cambia el nombre de un estilo. Los pares "A − B" que lo usan se renombran
 * con él, para que el reporte no muestre el nombre viejo; los grupos que suman
 * conservan el suyo, que no se deriva de sus partes.
 */
export const renombrarEstilo = (b, id, nombre) => {
  const conNombre = actualizarEstilo(b, id, { nombre })
  return {
    ...conNombre,
    estilos: conNombre.estilos.map((e) => {
      const p = polosDe(e)
      return p && (p.a === id || p.b === id)
        ? {
            ...e,
            nombre: `${nombreDe(conNombre, p.a).trim()} − ${nombreDe(conNombre, p.b).trim()}`,
          }
        : e
    }),
  }
}

/** Polos (nombres) de un compuesto "A − B" a partir de su nombre, o null. */
export const polosDeNombre = (nombre) => {
  const partes = (nombre ?? '').split(/\s+[−-]\s+/)
  return partes.length === 2 && partes[0] && partes[1]
    ? { a: partes[0], b: partes[1] }
    : null
}

/* ------------------------------------------------------------------ */
/* Mapa de cuatro estilos (cuadrantes)                                  */
/* ------------------------------------------------------------------ */

/** Cortes de referencia (inventario de ciclo de aprendizaje 3.1): X ≤ 6, Y ≤ 7 es lado bajo. */
const LUGARES = [
  [false, true, 'izquierda arriba'],
  [true, true, 'derecha arriba'],
  [false, false, 'izquierda abajo'],
  [true, false, 'derecha abajo'],
]

/**
 * Esquinas del plano en orden de lectura (arriba izq., arriba der., abajo
 * izq., abajo der.) con su rótulo. La clave nombra el puntaje (alto = por
 * encima del corte); dónde se dibuja depende de la orientación: con invertirX
 * el lado alto de X va a la izquierda y con invertirY el de Y va abajo.
 */
export const esquinasDe = (plano) =>
  LUGARES.map(([der, arriba, lugar]) => [
    `x${der !== Boolean(plano?.invertirX) ? 'Alto' : 'Bajo'}Y${arriba !== Boolean(plano?.invertirY) ? 'Alto' : 'Bajo'}`,
    lugar,
  ])

/** Esquinas con la orientación por defecto (lado alto a la derecha y arriba). */
export const ESQUINAS = esquinasDe(null)

/** Polo que se dibuja en cada lado del plano. polosX/Y son { a: alto, b: bajo }. */
export const ladosDe = (plano, polosX, polosY) => ({
  izq: plano.invertirX ? polosX.a : polosX.b,
  der: plano.invertirX ? polosX.b : polosX.a,
  arriba: plano.invertirY ? polosY.b : polosY.a,
  abajo: plano.invertirY ? polosY.a : polosY.b,
})

export const CORTES_REFERENCIA = { x: 6, y: 7 }

export const planoVacio = (ejeX = '', ejeY = '') => ({
  ejeX,
  ejeY,
  corteX: 0,
  corteY: 0,
  xAltoYAlto: '',
  xBajoYAlto: '',
  xBajoYBajo: '',
  xAltoYBajo: '',
  invertirX: false,
  invertirY: false,
})

/**
 * Nombres sugeridos de las cuatro esquinas, "polo + polo". polosX y polosY
 * son { a, b } con los nombres de los polos: a es el lado alto (coeficiente
 * +1) y b el bajo.
 */
export const sugerirEsquinas = (polosX, polosY) => {
  const unir = (x, y) => `${x} + ${y}`.slice(0, 60)
  return {
    xAltoYAlto: unir(polosX.a, polosY.a),
    xBajoYAlto: unir(polosX.b, polosY.a),
    xBajoYBajo: unir(polosX.b, polosY.b),
    xAltoYBajo: unir(polosX.a, polosY.b),
  }
}

/* ------------------------------------------------------------------ */
/* Preguntas y opciones                                                 */
/* ------------------------------------------------------------------ */

export const nuevaOpcion = (texto = '', estiloId = null) => ({
  id: nuevoId(),
  texto,
  pesos: estiloId ? [{ estiloId, peso: 1 }] : [],
})

export const nuevaPregunta = (formato = FORMATO.UNICA, opciones = []) => ({
  id: nuevoId(),
  texto: '',
  formato,
  obligatoria: formato !== FORMATO.MULTIPLE,
  minSelecciones: 0,
  maxSelecciones: '',
  puntosRepartir: formato === FORMATO.REPARTO ? 10 : '',
  opciones,
})

/* Frases (plantilla AFIRMACIONES): se responden con Sí/No o con una escala. */

export const RESPUESTA_FRASE = { SI_NO: 'SI_NO', ESCALA: 'ESCALA' }
export const MIDE_ESCALA = {
  FRECUENCIA: 'FRECUENCIA',
  ACUERDO: 'ACUERDO',
  DESEMPENO: 'DESEMPENO',
}

/**
 * Etiquetas de cada escala, de menos a más. La de 4 puntos no tiene punto
 * medio y obliga a inclinarse; la de 5 tiene uno neutral.
 */
const ETIQUETAS_ESCALA = {
  FRECUENCIA: {
    4: [
      'Nunca o casi nunca',
      'Algunas veces',
      'Bastantes veces',
      'Siempre o casi siempre',
    ],
    5: ['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  },
  ACUERDO: {
    4: [
      'Totalmente en desacuerdo',
      'En desacuerdo',
      'De acuerdo',
      'Totalmente de acuerdo',
    ],
    5: [
      'Totalmente en desacuerdo',
      'En desacuerdo',
      'Ni de acuerdo ni en desacuerdo',
      'De acuerdo',
      'Totalmente de acuerdo',
    ],
  },
  DESEMPENO: {
    4: ['Lo hago mal', 'Lo hago regular', 'Lo hago bien', 'Lo hago muy bien'],
    5: [
      'Lo hago peor',
      'Lo hago menos bien',
      'Lo hago regular',
      'Lo hago bien',
      'Lo hago mejor',
    ],
  },
}

/** Respuestas que verá el estudiante en cada frase, en el orden en que aparecen. */
export const etiquetasFrase = (b) =>
  b.respuestaFrase === RESPUESTA_FRASE.ESCALA
    ? ETIQUETAS_ESCALA[b.mideEscala][b.puntosEscala]
    : ['De acuerdo', 'En desacuerdo']

/**
 * Opciones de una frase. Sí/No: "De acuerdo" suma 1 al estilo. Escala: cada
 * respuesta suma de 1 (la primera) a N (la última). Una frase al revés, escrita
 * en contra del estilo, puntúa al contrario: "En desacuerdo" suma 1, o la
 * escala va de N a 1.
 */
export const opcionesFrase = (b, estiloId, inversa = false) => {
  if (b.respuestaFrase !== RESPUESTA_FRASE.ESCALA) {
    return [
      nuevaOpcion('De acuerdo', inversa ? null : estiloId),
      nuevaOpcion('En desacuerdo', inversa ? estiloId : null),
    ]
  }
  const etiquetas = etiquetasFrase(b)
  const n = etiquetas.length
  return etiquetas.map((texto, i) => ({
    ...nuevaOpcion(texto),
    pesos: estiloId ? [{ estiloId, peso: inversa ? n - i : i + 1 }] : [],
  }))
}

/** Estilo al que pertenece una frase: el de la opción que puntúa. */
export const estiloDeAfirmacion = (p) =>
  p.opciones.find((o) => o.pesos.length > 0)?.pesos[0]?.estiloId ?? null

/** Rehace las opciones de todas las frases al cambiar la forma de responder. */
export const sincronizarFrases = (b) =>
  b.plantilla !== PLANTILLA.AFIRMACIONES
    ? b
    : {
        ...b,
        preguntas: b.preguntas.map((p) => ({
          ...p,
          opciones: opcionesFrase(b, estiloDeAfirmacion(p), p.inversa),
        })),
      }

/** Pregunta nueva según la plantilla del asistente. */
export const preguntaDePlantilla = (
  b,
  texto = '',
  estiloId = null,
  inversa = false,
) => {
  const prim = primarios(b)
  const unaPorEstilo = () => prim.map((e) => nuevaOpcion('', e.id))
  switch (b.plantilla) {
    case PLANTILLA.AFIRMACIONES: {
      const p = nuevaPregunta(
        FORMATO.UNICA,
        opcionesFrase(b, estiloId ?? prim[0]?.id, inversa),
      )
      return { ...p, texto, inversa }
    }
    case PLANTILLA.VARIAS:
      return { ...nuevaPregunta(FORMATO.MULTIPLE, unaPorEstilo()), texto }
    case PLANTILLA.ORDENAR: {
      const p = nuevaPregunta(b.formatoOrden, unaPorEstilo())
      return { ...p, texto, puntosRepartir: b.puntos }
    }
    default: {
      // Con pares de polos, cada pregunta es a/b de un par, rotando entre
      // ellos para que queden repartidas.
      const pares = compuestos(b).filter((e) => polosDe(e))
      if (b.preguntaPorPar && pares.length > 0) {
        const par = pares[b.preguntas.length % pares.length]
        const { a, b: z } = polosDe(par)
        return {
          ...nuevaPregunta(FORMATO.UNICA, [
            nuevaOpcion('', a),
            nuevaOpcion('', z),
          ]),
          texto,
        }
      }
      return { ...nuevaPregunta(FORMATO.UNICA, unaPorEstilo()), texto }
    }
  }
}

export const agregarPregunta = (b, p) => ({
  ...b,
  preguntas: [...b.preguntas, p],
})

export const actualizarPregunta = (b, id, cambios) => ({
  ...b,
  preguntas: b.preguntas.map((p) =>
    p.id === id
      ? { ...p, ...(typeof cambios === 'function' ? cambios(p) : cambios) }
      : p,
  ),
})

export const quitarPregunta = (b, id) => ({
  ...b,
  preguntas: b.preguntas.filter((p) => p.id !== id),
})

export const moverPregunta = (b, id, paso) => {
  const i = b.preguntas.findIndex((p) => p.id === id)
  const j = i + paso
  if (i < 0 || j < 0 || j >= b.preguntas.length) return b
  const preguntas = [...b.preguntas]
  ;[preguntas[i], preguntas[j]] = [preguntas[j], preguntas[i]]
  return { ...b, preguntas }
}

/** Copia con ids nuevos, justo debajo de la original. */
export const duplicarPregunta = (b, id) => {
  const i = b.preguntas.findIndex((p) => p.id === id)
  if (i < 0) return b
  const original = b.preguntas[i]
  const copia = {
    ...original,
    id: nuevoId(),
    opciones: original.opciones.map((o) => ({ ...o, id: nuevoId() })),
  }
  const preguntas = [...b.preguntas]
  preguntas.splice(i + 1, 0, copia)
  return { ...b, preguntas }
}

/**
 * Plantilla ORDENAR: cada pregunta tiene exactamente una opción por estilo
 * primario. Si se agregan o quitan estilos después, se ajustan las preguntas
 * conservando los textos ya escritos.
 */
export const sincronizarOrdenar = (b) => {
  if (b.plantilla !== PLANTILLA.ORDENAR) return b
  const prim = primarios(b)
  return {
    ...b,
    preguntas: b.preguntas.map((p) => ({
      ...p,
      formato: b.formatoOrden,
      puntosRepartir: b.formatoOrden === FORMATO.REPARTO ? b.puntos : '',
      opciones: prim.map(
        (e) =>
          p.opciones.find((o) => o.pesos[0]?.estiloId === e.id) ??
          nuevaOpcion('', e.id),
      ),
    })),
  }
}

/* ------------------------------------------------------------------ */
/* Lecturas listas del asistente                                        */
/* ------------------------------------------------------------------ */

const TERCIOS = [
  [0, 33.3],
  [33.3, 66.7],
  [66.7, 100],
]

/**
 * Dominancia por nivel: con una escala de 1 a 5, 50 % y 75 % del máximo
 * equivalen a los cortes de 60 y 80 sobre 100 del perfil de pensamiento por
 * cuadrantes. No comparten límite: 50 y 75 exactos son del nivel de arriba,
 * como 60 y 80 en el original (con límite compartido ganaría el de abajo).
 */
const NIVELES_DOMINANCIA = [
  [0, 49.99, 'Terciaria'],
  [50, 74.99, 'Secundaria'],
  [75, 100, 'Primaria'],
]

/** Polos (nombres) de un estilo: los de un compuesto, o "alto"/"bajo". */
export const polosNombres = (b, e) => {
  const p = polosDe(e)
  return p
    ? { a: nombreDe(b, p.a), b: nombreDe(b, p.b) }
    : { a: `${e.nombre} alto`, b: `${e.nombre} bajo` }
}

/**
 * Mapa de cuatro estilos del asistente: { corte, plano }. Si el usuario aún
 * no lo ha tocado (o sus pares cambiaron), el de siempre: primer par en X,
 * segundo en Y, corte 0 y nombres sugeridos.
 */
export const planoAsistenteDe = (b) => {
  const [x, y] = compuestos(b)
  const g = b.planoAsistente
  const ejes = g ? [g.plano.ejeX, g.plano.ejeY] : []
  if (g && x && y && ejes.includes(x.id) && ejes.includes(y.id)) return g
  return {
    corte: CORTE.EQUILIBRIO,
    plano:
      x && y
        ? {
            ...planoVacio(x.id, y.id),
            ...sugerirEsquinas(polosNombres(b, x), polosNombres(b, y)),
          }
        : planoVacio(),
  }
}

/** Cambia nombres (o cortes personalizados) del mapa del asistente. */
export const editarPlano = (b, cambios) => {
  const g = planoAsistenteDe(b)
  return { ...b, planoAsistente: { ...g, plano: { ...g.plano, ...cambios } } }
}

/** Elige dónde corta el mapa: en 0, en los cortes de referencia o a medida. */
export const elegirCorte = (b, corte) => {
  const fijos = {
    [CORTE.EQUILIBRIO]: { corteX: 0, corteY: 0 },
    [CORTE.REFERENCIA]: {
      corteX: CORTES_REFERENCIA.x,
      corteY: CORTES_REFERENCIA.y,
    },
  }[corte]
  const g = editarPlano(b, fijos ?? {}).planoAsistente
  return { ...b, planoAsistente: { ...g, corte } }
}

/**
 * Intercambia horizontal y vertical. Cada nombre se queda con su esquina
 * (el estilo "alto en el antiguo Y, bajo en el antiguo X" pasa de arriba a
 * la izquierda a abajo a la derecha), y los cortes se cambian de lado.
 */
export const intercambiarEjes = (b) => {
  const g = planoAsistenteDe(b)
  const p = g.plano
  const plano = {
    ...p,
    ejeX: p.ejeY,
    ejeY: p.ejeX,
    corteX: p.corteY,
    corteY: p.corteX,
    xBajoYAlto: p.xAltoYBajo,
    xAltoYBajo: p.xBajoYAlto,
    invertirX: p.invertirY,
    invertirY: p.invertirX,
  }
  return { ...b, planoAsistente: { ...g, plano } }
}

/* ------------------------------------------------------------------ */
/* Cortes proporcionales: los de un modelo, ajustados a las preguntas   */
/* reales. Con la misma estructura que el original dan sus mismos cortes. */
/* ------------------------------------------------------------------ */

const redondear = (v, decimales = 2) => {
  const f = 10 ** decimales
  return Math.round(v * f) / f
}

/** Peso que suma una opción a un estilo: directo, o combinado si es compuesto. */
const pesoEn = (b, o, e) => {
  const w = (id) =>
    Number(o.pesos.find((x) => x.estiloId === id)?.peso ?? 0) || 0
  if (e.tipo !== TIPO.COMPUESTO) return w(e.id)
  return e.coeficientes.reduce(
    (s, c) => s + (Number(c.coeficiente) || 0) * w(c.estiloId),
    0,
  )
}

/** Mínimo y máximo que aporta una pregunta a un estilo (mismas reglas que el motor). */
const rangoPregunta = (p, w) => {
  const k = w.length
  if (k === 0) return [0, 0]
  let lo
  let hi
  if (p.formato === FORMATO.MULTIPLE) {
    const min = Math.max(Number(p.minSelecciones) || 0, p.obligatoria ? 1 : 0)
    const max =
      p.maxSelecciones === '' || p.maxSelecciones == null
        ? k
        : Math.min(Number(p.maxSelecciones), k)
    const asc = [...w].sort((x, y) => x - y)
    const desc = [...w].sort((x, y) => y - x)
    const suma = (lista, t) => lista.slice(0, t).reduce((s, v) => s + v, 0)
    lo = Infinity
    hi = -Infinity
    for (let t = min; t <= max; t++) {
      lo = Math.min(lo, suma(asc, t))
      hi = Math.max(hi, suma(desc, t))
    }
  } else if (p.formato === FORMATO.JERARQUIA) {
    // El rango más alto (k) va a la opción de mayor peso para el máximo.
    const asc = [...w].sort((x, y) => x - y)
    hi = asc.reduce((s, v, i) => s + v * (i + 1), 0)
    lo = asc.reduce((s, v, i) => s + v * (k - i), 0)
  } else if (p.formato === FORMATO.REPARTO) {
    const pts = Number(p.puntosRepartir) || 0
    lo = pts * Math.min(...w)
    hi = pts * Math.max(...w)
  } else {
    lo = Math.min(...w)
    hi = Math.max(...w)
  }
  return p.obligatoria === false ? [Math.min(lo, 0), Math.max(hi, 0)] : [lo, hi]
}

/**
 * Puntaje mínimo y máximo posible de un estilo con las preguntas actuales,
 * y cuántas preguntas lo puntúan. Sirve para mostrar los cortes en puntos.
 */
export const rangoEstilo = (b, e) => {
  let min = 0
  let max = 0
  let preguntas = 0
  b.preguntas.forEach((p) => {
    const w = p.opciones.map((o) => pesoEn(b, o, e))
    if (w.every((v) => v === 0)) return
    preguntas += 1
    const [lo, hi] = rangoPregunta(p, w)
    min += lo
    max += hi
  })
  return { min, max, preguntas }
}

/** % del máximo de un puntaje, como lo calcula el motor. */
export const porcentajeDelMaximo = (valor, { min, max }) =>
  max - min < 1e-9 ? null : ((valor - min) / (max - min)) * 100

/**
 * Niveles de un modelo como bandas de % del máximo. El original da cada nivel
 * en puntos ({min, max, niveles: [[desde, hasta, etiqueta]]}); el corte entre
 * dos niveles queda a mitad de camino entre ellos, convertido a %. Así, con
 * el mismo número de preguntas que el original los niveles son idénticos, y
 * con otro se conservan las proporciones.
 */
export const bandasProporcionales = ({ min, max, niveles }, polos = null) => {
  const pct = (v) => redondear(((v - min) / (max - min)) * 100)
  const rotulo = (t) =>
    polos ? t.replace('{a}', polos.a).replace('{b}', polos.b) : t
  return niveles.map(([, hasta, etiqueta], i) => ({
    li: i === 0 ? 0 : pct((niveles[i - 1][1] + niveles[i][0]) / 2),
    ls: i === niveles.length - 1 ? 100 : pct((hasta + niveles[i + 1][0]) / 2),
    etiqueta: rotulo(etiqueta),
  }))
}

/**
 * Tabla de distancia de paso de referencia: pensada para 64 marcas posibles
 * (16 preguntas de 4 opciones). Total de marcas -> diferencia tolerada.
 */
export const ESCALONES_REFERENCIA = {
  marcas: 64,
  tabla: [
    [1, 21, 1],
    [22, 27, 2],
    [28, 32, 3],
    [33, 64, 4],
  ],
}

/** Marcas posibles: la suma de opciones de todas las preguntas. */
export const marcasPosibles = (b) =>
  b.preguntas.reduce((s, p) => s + p.opciones.length, 0)

/**
 * Escalones de referencia escalados a las marcas posibles reales. Los totales
 * se escalan y redondean; la distancia también, sin bajar de 1 (con puntajes
 * enteros, menos de 1 solo admitiría empates).
 */
export const escalonesProporcionales = (b) => {
  const ref = ESCALONES_REFERENCIA
  const marcas = marcasPosibles(b) || ref.marcas
  const f = marcas / ref.marcas
  let desde = 1
  return ref.tabla.map(([, hasta, distancia], i) => {
    const ultimo = i === ref.tabla.length - 1
    const fin = ultimo
      ? Math.max(marcas, desde)
      : Math.max(desde, Math.round(hasta * f))
    const escalon = {
      totalMin: desde,
      totalMax: fin,
      distancia: Math.max(1, Math.round(distancia * f)),
    }
    desde = fin + 1
    return escalon
  })
}

/**
 * Cortes de referencia del mapa de cuatro estilos, escalados. Se pensaron para
 * 12 preguntas de ordenar 4 opciones, donde cada eje va de −36 a 36; con otra
 * estructura se conserva la misma proporción del eje.
 */
export const cortesReferencia = (b) => {
  const k = primarios(b).length || 4
  const n = b.preguntas.length || 12
  const f = (n * (k - 1)) / (12 * 3)
  return {
    corteX: redondear(CORTES_REFERENCIA.x * f, 1),
    corteY: redondear(CORTES_REFERENCIA.y * f, 1),
  }
}

/** Interpretación que produce cada lectura lista con los estilos actuales. */
export const interpretacionDeLectura = (b, lectura = b.lectura) => {
  if (lectura === LECTURA.PREDOMINANTE) {
    return {
      ...interpretacionVacia(),
      esquema: ESQUEMA.RELATIVO,
      complementaria: b.complementaria ?? null,
    }
  }
  if (lectura === LECTURA.ESCALONADO) {
    return {
      ...interpretacionVacia(),
      esquema: ESQUEMA.RELATIVO_ESCALONADO,
      escalones: escalonesProporcionales(b),
      complementaria: b.complementaria ?? null,
    }
  }
  if (lectura === LECTURA.CUADRANTES) {
    if (compuestos(b).length !== 2) return interpretacionVacia()
    const { corte, plano } = planoAsistenteDe(b)
    return {
      ...interpretacionVacia(),
      esquema: ESQUEMA.CUADRANTES,
      plano: {
        ...plano,
        ...(corte === CORTE.REFERENCIA ? cortesReferencia(b) : {}),
      },
    }
  }
  if (lectura === LECTURA.BAREMO_MODELO) {
    const baremo = b.baremoModelo ?? {}
    const bandas = b.estilos.flatMap((e) => {
      const def = baremo[e.clave]
      if (!def) return []
      const polos = polosDe(e) ? polosNombres(b, e) : null
      return bandasProporcionales(def, polos).map((x) => ({
        id: nuevoId(),
        estiloId: e.id,
        escala: ESCALA.POMP,
        ...x,
      }))
    })
    return { ...interpretacionVacia(), esquema: ESQUEMA.BAREMO, bandas }
  }
  if (lectura === LECTURA.DOMINANCIA) {
    const bandas = primarios(b).flatMap((e) =>
      NIVELES_DOMINANCIA.map(([li, ls, etiqueta]) => ({
        id: nuevoId(),
        estiloId: e.id,
        escala: ESCALA.POMP,
        li,
        ls,
        etiqueta,
      })),
    )
    return {
      ...interpretacionVacia(),
      esquema: ESQUEMA.NIVEL_SUPERIOR,
      bandas,
    }
  }
  if (lectura !== LECTURA.NIVELES) return interpretacionVacia()
  const bandas = b.estilos.flatMap((e) => {
    const polos = polosDe(e)
    const etiquetas = polos
      ? [
          `Tiende a ${nombreDe(b, polos.b)}`,
          'Equilibrado',
          `Tiende a ${nombreDe(b, polos.a)}`,
        ]
      : ['Bajo', 'Medio', 'Alto']
    return TERCIOS.map(([li, ls], k) => ({
      id: nuevoId(),
      estiloId: e.id,
      escala: ESCALA.POMP,
      li,
      ls,
      etiqueta: etiquetas[k],
    }))
  })
  return { ...interpretacionVacia(), esquema: ESQUEMA.BAREMO, bandas }
}

/** Al pasar al modo avanzado, la lectura elegida se vuelve editable. */
export const pasarAAvanzado = (b) => ({
  ...b,
  modo: 'AVANZADO',
  interpretacion: b.lectura ? interpretacionDeLectura(b) : b.interpretacion,
  lectura: null,
})

/* ------------------------------------------------------------------ */
/* Contrato del servidor                                                */
/* ------------------------------------------------------------------ */

const numero = (v) => (v === '' || v == null ? null : Number(v))

/** Interpretación vigente: la de la lectura lista o la editada a mano. */
export const interpretacionVigente = (b) =>
  b.modo === 'ASISTIDO' && b.lectura
    ? interpretacionDeLectura(b)
    : b.interpretacion

/**
 * InterpretacionDTO desde la forma del editor. nombre traduce el id local de
 * un estilo a su nombre (el servidor identifica las bandas por nombre); el
 * orden de cada banda es su posición dentro de su estilo y escala.
 */
export const interpretacionADTO = (inter, nombre, esIpsativo = null) => {
  const ordenBanda = new Map()
  return {
    esquema: inter.esquema,
    delta: numero(inter.delta),
    esIpsativo,
    bandas: inter.bandas.map((x) => {
      const clave = `${x.estiloId}|${x.escala}`
      const orden = (ordenBanda.get(clave) ?? 0) + 1
      ordenBanda.set(clave, orden)
      return {
        estilo: nombre(x.estiloId).trim(),
        escala: x.escala,
        limiteInferior: numero(x.li),
        limiteSuperior: numero(x.ls),
        etiqueta: (x.etiqueta ?? '').trim(),
        orden,
      }
    }),
    escalones:
      inter.esquema === ESQUEMA.RELATIVO_ESCALONADO
        ? inter.escalones.map((s) => ({
            totalMin: numero(s.totalMin),
            totalMax: numero(s.totalMax),
            distancia: numero(s.distancia),
          }))
        : [],
    complementaria: admiteComplementaria(inter.esquema)
      ? complementariaADTO(inter.complementaria)
      : null,
    ...(inter.esquema === ESQUEMA.CUADRANTES && inter.plano
      ? {
          plano: {
            ejeX: nombre(inter.plano.ejeX).trim(),
            ejeY: nombre(inter.plano.ejeY).trim(),
            corteX: numero(inter.plano.corteX) ?? 0,
            corteY: numero(inter.plano.corteY) ?? 0,
            ...Object.fromEntries(
              ESQUINAS.map(([k]) => [k, (inter.plano[k] ?? '').trim()]),
            ),
            invertirX: Boolean(inter.plano.invertirX),
            invertirY: Boolean(inter.plano.invertirY),
          },
        }
      : {}),
  }
}

/** CuestionarioDTO para POST /api/cuestionarios. */
export const aDTO = (b) => {
  const idx = new Map(b.estilos.map((e, i) => [e.id, i + 1]))
  const inter = interpretacionVigente(b)
  return {
    ...Object.fromEntries(
      Object.entries(b.meta).map(([k, v]) => [k, (v ?? '').trim()]),
    ),
    estilos: b.estilos.map((e) => ({
      id: idx.get(e.id),
      nombre: e.nombre.trim(),
      tipo: e.tipo,
      coeficientes:
        e.tipo === TIPO.COMPUESTO
          ? e.coeficientes.map((c) => ({
              estiloId: idx.get(c.estiloId),
              coeficiente: numero(c.coeficiente),
            }))
          : null,
    })),
    preguntas: b.preguntas.map((p, i) => {
      const multiple = p.formato === FORMATO.MULTIPLE
      return {
        pregunta: p.texto.trim(),
        orden: i + 1,
        formato: p.formato,
        obligatoria: p.obligatoria,
        minSelecciones: multiple ? (numero(p.minSelecciones) ?? 0) : null,
        maxSelecciones: multiple ? numero(p.maxSelecciones) : null,
        puntosRepartir:
          p.formato === FORMATO.REPARTO ? numero(p.puntosRepartir) : null,
        opciones: p.opciones.map((o, j) => ({
          orden: j + 1,
          respuesta: o.texto.trim(),
          pesos: o.pesos.map((w) => ({
            estiloId: idx.get(w.estiloId),
            peso: numero(w.peso),
          })),
        })),
      }
    }),
    interpretacion: interpretacionADTO(inter, (id) => nombreDe(b, id)),
  }
}

/** Forma de CuestionarioParaResponderDTO para la vista previa. */
export const aVistaPrevia = (b) => {
  const dto = aDTO(b)
  return {
    descripcion: dto.descripcion,
    preguntas: dto.preguntas.map((p, i) => ({
      id: i + 1,
      pregunta: p.pregunta || `Pregunta ${i + 1}`,
      orden: p.orden,
      formato: p.formato,
      obligatoria: p.obligatoria,
      minSelecciones: p.minSelecciones ?? 0,
      maxSelecciones: p.maxSelecciones,
      puntosRepartir: p.puntosRepartir,
      opciones: p.opciones.map((o, j) => ({
        id: (i + 1) * 1000 + j,
        respuesta: o.respuesta || `Opción ${j + 1}`,
        orden: o.orden,
      })),
    })),
  }
}

/* ------------------------------------------------------------------ */
/* Validación (espejo de validarEstructura e InterpretacionService)     */
/* ------------------------------------------------------------------ */

const esNumero = (v) => v !== '' && v != null && Number.isFinite(Number(v))

/** Problemas de la lectura de resultados (mismas reglas que el servidor). */
export const erroresInterpretacion = (inter, nombre) => {
  const errores = []
  const error = (seccion, mensaje, ref = null) =>
    errores.push({ seccion, mensaje, ref })
  if (inter.esquema === ESQUEMA.RELATIVO) {
    const d = numero(inter.delta)
    if (d == null || d < 0 || d > 100)
      error('interpretacion', 'El margen de empate debe estar entre 0 y 100.')
  }
  const grupos = new Map()
  inter.bandas.forEach((x) => {
    const estilo = nombre(x.estiloId) || 'un estilo'
    if (!(x.etiqueta ?? '').trim() || x.etiqueta.trim().length > 60)
      error(
        'interpretacion',
        `Un nivel de ${estilo} no tiene nombre (máx. 60).`,
        x.id,
      )
    if (!esNumero(x.li) || !esNumero(x.ls) || Number(x.li) > Number(x.ls))
      error(
        'interpretacion',
        `Un nivel de ${estilo} tiene "desde" mayor que "hasta".`,
        x.id,
      )
    const clave = `${x.estiloId}|${x.escala}`
    grupos.set(clave, [...(grupos.get(clave) ?? []), x])
  })
  grupos.forEach((lista) => {
    const ord = lista
      .filter((x) => esNumero(x.li) && esNumero(x.ls))
      .sort((p, q) => Number(p.li) - Number(q.li))
    for (let i = 1; i < ord.length; i++) {
      const li = Number(ord[i].li)
      const anterior = Number(ord[i - 1].ls)
      const solapa =
        ord[i].escala === ESCALA.POMP ? li < anterior : li <= anterior
      if (solapa) {
        error(
          'interpretacion',
          `Los niveles de ${nombre(ord[i].estiloId)} (${ord[i].escala === ESCALA.POMP ? '%' : 'puntaje'}) se superponen.`,
          ord[i].id,
        )
        break
      }
    }
  })
  if (inter.esquema === ESQUEMA.NIVEL_SUPERIOR && inter.bandas.length === 0)
    error(
      'interpretacion',
      'Dominancia por nivel necesita los niveles de cada estilo.',
    )
  if (inter.esquema === ESQUEMA.RELATIVO_ESCALONADO) {
    if (inter.escalones.length === 0)
      error(
        'interpretacion',
        'El perfil escalonado necesita la tabla de escalones.',
      )
    const ok = inter.escalones.every(
      (s) =>
        esNumero(s.totalMin) &&
        esNumero(s.totalMax) &&
        esNumero(s.distancia) &&
        Number(s.totalMin) <= Number(s.totalMax) &&
        Number(s.distancia) >= 0,
    )
    if (!ok)
      error(
        'interpretacion',
        'Cada escalón necesita "total desde" ≤ "total hasta" y una distancia ≥ 0.',
      )
    const ord = [...inter.escalones].sort(
      (p, q) => Number(p.totalMin) - Number(q.totalMin),
    )
    for (let i = 1; i < ord.length; i++) {
      if (Number(ord[i].totalMin) <= Number(ord[i - 1].totalMax)) {
        error('interpretacion', 'Los escalones se superponen.')
        break
      }
    }
  }
  if (admiteComplementaria(inter.esquema))
    erroresComplementaria(inter.complementaria).forEach((m) =>
      error('interpretacion', m, 'complementaria'),
    )
  if (inter.esquema === ESQUEMA.CUADRANTES) {
    const p = inter.plano
    if (!p) {
      error(
        'interpretacion',
        'Falta configurar los dos ejes del mapa.',
        'plano',
      )
      return errores
    }
    const x = nombre(p.ejeX)
    const y = nombre(p.ejeY)
    if (!x) error('interpretacion', 'Elige el eje horizontal.', 'plano.ejeX')
    if (!y) error('interpretacion', 'Elige el eje vertical.', 'plano.ejeY')
    if (x && p.ejeX === p.ejeY)
      error(
        'interpretacion',
        'Los dos ejes del mapa deben ser distintos.',
        'plano.ejeY',
      )
    ;[
      ['corteX', 'horizontal'],
      ['corteY', 'vertical'],
    ].forEach(([k, lado]) => {
      if (!esNumero(p[k]))
        error(
          'interpretacion',
          `El corte ${lado} debe ser un número.`,
          `plano.${k}`,
        )
    })
    const vistos = new Set()
    esquinasDe(p).forEach(([k, lugar]) => {
      const nombreEsquina = (p[k] ?? '').trim()
      if (!nombreEsquina || nombreEsquina.length > 60)
        error(
          'interpretacion',
          `La esquina ${lugar} necesita un nombre (máx. 60).`,
          `plano.${k}`,
        )
      else if (vistos.has(normal(nombreEsquina)))
        error(
          'interpretacion',
          `El nombre "${nombreEsquina}" está repetido en el mapa.`,
          `plano.${k}`,
        )
      vistos.add(normal(nombreEsquina))
    })
  }
  return errores
}

/**
 * Problemas que impiden crear, en lenguaje llano. Cada uno dice a qué sección
 * pertenece (datos, estilos, preguntas, interpretacion) y, si aplica, el id del
 * elemento para poder señalarlo.
 */
export const validarBorrador = (b) => {
  const errores = []
  const error = (seccion, mensaje, ref = null) =>
    errores.push({ seccion, mensaje, ref })

  const CAMPOS = {
    nombre: 'el nombre',
    siglas: 'las siglas',
    descripcion: 'la descripción',
    autor: 'el autor',
    version: 'la versión',
  }
  Object.entries(CAMPOS).forEach(([k, texto]) => {
    if (!(b.meta[k] ?? '').trim()) error('datos', `Falta ${texto}.`, k)
  })
  if ((b.meta.descripcion ?? '').length > 1000)
    error(
      'datos',
      'La descripción admite hasta 1000 caracteres.',
      'descripcion',
    )

  // Estilos
  const prim = primarios(b)
  if (prim.length === 0) error('estilos', 'Agrega al menos un estilo.')
  const vistos = new Set()
  b.estilos.forEach((e) => {
    const n = normal(e.nombre)
    if (!n) error('estilos', 'Hay un estilo sin nombre.', e.id)
    else if (vistos.has(n))
      error('estilos', `El estilo "${e.nombre.trim()}" está repetido.`, e.id)
    vistos.add(n)
    if (e.tipo !== TIPO.COMPUESTO) return
    if (e.coeficientes.length === 0)
      error(
        'estilos',
        `"${e.nombre}" necesita al menos un estilo que combinar.`,
        e.id,
      )
    const usados = new Set()
    e.coeficientes.forEach((c) => {
      const base = b.estilos.find((x) => x.id === c.estiloId)
      if (!base || base.tipo !== TIPO.PRIMARIO)
        error(
          'estilos',
          `"${e.nombre}" solo puede combinar estilos simples.`,
          e.id,
        )
      if (!esNumero(c.coeficiente) || Number(c.coeficiente) === 0)
        error(
          'estilos',
          `"${e.nombre}" tiene un coeficiente vacío o en 0.`,
          e.id,
        )
      if (usados.has(c.estiloId))
        error('estilos', `"${e.nombre}" repite un estilo.`, e.id)
      usados.add(c.estiloId)
    })
  })

  // Preguntas
  if (b.preguntas.length === 0)
    error('preguntas', 'Agrega al menos una pregunta.')
  const puntuados = new Set()
  b.preguntas.forEach((p, i) => {
    const n = `Pregunta ${i + 1}`
    const k = p.opciones.length
    if (!p.texto.trim()) error('preguntas', `${n}: escribe el enunciado.`, p.id)
    const minimo = p.formato === FORMATO.MULTIPLE ? 1 : 2
    if (k < minimo)
      error('preguntas', `${n}: necesita al menos ${minimo} opciones.`, p.id)
    if (p.opciones.some((o) => !o.texto.trim()))
      error('preguntas', `${n}: hay una opción sin texto.`, p.id)
    p.opciones.forEach((o) => {
      const usados = new Set()
      o.pesos.forEach((w) => {
        const e = b.estilos.find((x) => x.id === w.estiloId)
        if (!e || e.tipo !== TIPO.PRIMARIO)
          error(
            'preguntas',
            `${n}: una opción suma a un estilo que no existe.`,
            p.id,
          )
        if (!esNumero(w.peso))
          error('preguntas', `${n}: una opción tiene un peso vacío.`, p.id)
        if (usados.has(w.estiloId))
          error('preguntas', `${n}: una opción repite un estilo.`, p.id)
        usados.add(w.estiloId)
        if (esNumero(w.peso) && Number(w.peso) !== 0) puntuados.add(w.estiloId)
      })
    })
    if (p.formato === FORMATO.MULTIPLE) {
      const min = numero(p.minSelecciones) ?? 0
      const max = numero(p.maxSelecciones)
      if (!Number.isInteger(min) || min < 0 || min > k)
        error('preguntas', `${n}: el mínimo debe estar entre 0 y ${k}.`, p.id)
      else if (
        max != null &&
        (!Number.isInteger(max) || max < Math.max(min, 1) || max > k)
      )
        error(
          'preguntas',
          `${n}: el máximo debe estar entre ${Math.max(min, 1)} y ${k}.`,
          p.id,
        )
    }
    if (p.formato === FORMATO.REPARTO) {
      const pts = numero(p.puntosRepartir)
      if (!Number.isInteger(pts) || pts <= 0)
        error('preguntas', `${n}: indica cuántos puntos se reparten.`, p.id)
    }
  })
  prim.forEach((e) => {
    if (e.nombre.trim() && b.preguntas.length > 0 && !puntuados.has(e.id))
      error(
        'estilos',
        `Ninguna opción suma al estilo "${e.nombre.trim()}": su puntaje sería siempre 0.`,
        e.id,
      )
  })

  errores.push(
    ...erroresInterpretacion(interpretacionVigente(b), (id) => nombreDe(b, id)),
  )
  return errores
}

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
})

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
/** Esquinas del plano con su rótulo para mensajes. */
export const ESQUINAS = [
  ['xBajoYAlto', 'izquierda arriba'],
  ['xAltoYAlto', 'derecha arriba'],
  ['xBajoYBajo', 'izquierda abajo'],
  ['xAltoYBajo', 'derecha abajo'],
]

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
export const MIDE_ESCALA = { FRECUENCIA: 'FRECUENCIA', ACUERDO: 'ACUERDO' }

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
    default:
      return { ...nuevaPregunta(FORMATO.UNICA, unaPorEstilo()), texto }
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
  }
  return { ...b, planoAsistente: { ...g, plano } }
}

/**
 * Los cortes de referencia solo valen con la puntuación original: preguntas
 * de ordenar, 12 de ellas, con 4 opciones cada una.
 */
export const reproducePuntuacionOriginal = (b) =>
  b.plantilla === PLANTILLA.ORDENAR &&
  b.formatoOrden === FORMATO.JERARQUIA &&
  b.preguntas.length === 12 &&
  b.preguntas.every((p) => p.opciones.length === 4)

/**
 * Modelo listo "Ciclo de aprendizaje: cuatro modos y dos ejes". Deja la
 * estructura (estilos, pares, mapa y cortes de referencia) sin ningún
 * enunciado: las preguntas las escribe el usuario.
 */
export const aplicarModeloCiclo = (b) => {
  let n = {
    ...b,
    modo: 'ASISTIDO',
    plantilla: PLANTILLA.ORDENAR,
    formatoOrden: FORMATO.JERARQUIA,
    estilos: [],
    preguntas: [],
    lectura: LECTURA.CUADRANTES,
    planoAsistente: null,
    interpretacion: interpretacionVacia(),
  }
  const ids = {}
  ;[
    'Experiencia concreta',
    'Observación reflexiva',
    'Conceptualización abstracta',
    'Experimentación activa',
  ].forEach((nombre) => {
    n = agregarEstilo(n, nombre)
    ids[nombre] = n.estilos.at(-1).id
  })
  // Lo alto de cada eje es hacia el primer polo: hacer − observar, pensar − sentir.
  n = agregarPar(n, ids['Experimentación activa'], ids['Observación reflexiva'])
  n = agregarPar(
    n,
    ids['Conceptualización abstracta'],
    ids['Experiencia concreta'],
  )
  const [x, y] = compuestos(n)
  return elegirCorte(
    editarPlano(n, {
      ...planoVacio(x.id, y.id),
      xAltoYAlto: 'Convergente',
      xBajoYAlto: 'Asimilador',
      xBajoYBajo: 'Divergente',
      xAltoYBajo: 'Acomodador',
    }),
    CORTE.REFERENCIA,
  )
}

/** Interpretación que produce cada lectura lista con los estilos actuales. */
export const interpretacionDeLectura = (b, lectura = b.lectura) => {
  if (lectura === LECTURA.PREDOMINANTE) {
    return { ...interpretacionVacia(), esquema: ESQUEMA.RELATIVO }
  }
  if (lectura === LECTURA.CUADRANTES) {
    if (compuestos(b).length !== 2) return interpretacionVacia()
    return {
      ...interpretacionVacia(),
      esquema: ESQUEMA.CUADRANTES,
      plano: { ...planoAsistenteDe(b).plano },
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
    ESQUINAS.forEach(([k, lugar]) => {
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

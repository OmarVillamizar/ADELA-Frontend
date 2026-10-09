/**
 * Modelos guía del asistente. Cada uno reproduce la ESTRUCTURA y la FORMA DE
 * CALCULAR de un instrumento conocido (estilos, forma de responder, niveles,
 * cortes y pregunta extra), pero las preguntas las escribe quien crea el
 * cuestionario y su número es libre: los cortes se ajustan en proporción.
 *
 * En pantalla no se nombran los instrumentos (posibles marcas o licencias).
 * El instrumento que imita cada modelo está en docs/cuestionarios/README.md.
 * Los ejemplos de redacción son originales, no ítems de los instrumentos.
 */
import {
  CORTE,
  FORMATO,
  LECTURA,
  MIDE_ESCALA,
  PLANTILLA,
  RESPUESTA_FRASE,
  TIPO,
  actualizarEstilo,
  agregarEstilo,
  agregarPar,
  agregarPregunta,
  compuestos,
  editarPlano,
  elegirCorte,
  interpretacionVacia,
  planoVacio,
  plantillaComplementaria,
  preguntaDePlantilla,
  primarios,
} from '../borrador'

export const MODELOS = [
  // ---------------------------------------------------------------- Frases
  {
    id: 'CUATRO_ESTILOS',
    plantilla: PLANTILLA.AFIRMACIONES,
    nombre: 'Cuatro estilos con frases de acuerdo',
    resumen:
      'El estudiante lee frases y marca si se identifica o no. Cada estilo recibe un nivel de «Muy baja» a «Muy alta».',
    config: { respuestaFrase: RESPUESTA_FRASE.SI_NO },
    estilos: [
      {
        clave: 'ACTIVO',
        nombre: 'Activo',
        describe:
          'Se lanza a lo nuevo y aprende haciendo, mejor en grupo y con retos.',
        ejemplos: [
          'Me entusiasma probar actividades que nunca he hecho.',
          'Prefiero empezar a hacer algo antes que planearlo demasiado.',
          'Disfruto trabajar en equipo cuando hay que resolver algo rápido.',
        ],
      },
      {
        clave: 'REFLEXIVO',
        nombre: 'Reflexivo',
        describe:
          'Observa, escucha y analiza con calma antes de decidir o actuar.',
        ejemplos: [
          'Antes de opinar, prefiero escuchar lo que piensan los demás.',
          'Reviso varias veces mi trabajo antes de entregarlo.',
          'Me tomo mi tiempo para pensar antes de tomar una decisión.',
        ],
      },
      {
        clave: 'TEORICO',
        nombre: 'Teórico',
        describe: 'Busca lógica, orden y explicaciones que integren las ideas.',
        ejemplos: [
          'Me gusta entender por qué funciona algo antes de usarlo.',
          'Prefiero las explicaciones ordenadas paso a paso.',
          'Me incomodan las ideas que no tienen una base lógica.',
        ],
      },
      {
        clave: 'PRAGMATICO',
        nombre: 'Pragmático',
        describe:
          'Prefiere lo práctico: aplicar lo aprendido a problemas reales.',
        ejemplos: [
          'Valoro lo que aprendo cuando puedo aplicarlo enseguida.',
          'Busco la forma más práctica de resolver un problema.',
          'Me aburren las discusiones que no llevan a nada concreto.',
        ],
      },
    ],
    sugerido: {
      porEstilo: 20,
      texto: 'unas 20 frases por estilo, mezcladas (80 en total)',
    },
    respuesta: {
      texto:
        'Una frase, dos respuestas: «De acuerdo» suma 1 punto a su estilo.',
      ejemplo:
        '«Me tomo mi tiempo para pensar antes de decidir» → De acuerdo · En desacuerdo',
    },
    lectura: LECTURA.BAREMO_MODELO,
    // Baremo general del instrumento original (sobre 20 frases por estilo).
    baremo: Object.fromEntries(
      [
        ['ACTIVO', [6, 8, 12, 14]],
        ['REFLEXIVO', [10, 13, 17, 19]],
        ['TEORICO', [6, 9, 13, 15]],
        ['PRAGMATICO', [8, 10, 13, 15]],
      ].map(([clave, [c1, c2, c3, c4]]) => [
        clave,
        {
          min: 0,
          max: 20,
          niveles: [
            [0, c1, 'Muy baja'],
            [c1 + 1, c2, 'Baja'],
            [c2 + 1, c3, 'Moderada'],
            [c3 + 1, c4, 'Alta'],
            [c4 + 1, 20, 'Muy alta'],
          ],
        },
      ]),
    ),
    explica: {
      titulo:
        'Niveles de «Muy baja» a «Muy alta», con cortes propios de cada estilo',
      calculo:
        'Puntaje de un estilo = cuántas de sus frases marcó «De acuerdo». Ese puntaje se compara con el máximo posible y cae en uno de cinco niveles. Cada estilo tiene sus propios cortes: ser muy reflexivo exige más que ser muy activo.',
      ejemplo:
        'Con 20 frases de Activo: 13 marcadas → 65 % del máximo → «Alta» (de 13 a 14). Con 10 frases el corte se ajusta solo: 7 marcadas → 70 % → «Alta».',
    },
  },
  {
    id: 'CUADRANTES_PENSAMIENTO',
    plantilla: PLANTILLA.AFIRMACIONES,
    nombre: 'Cuatro cuadrantes de pensamiento',
    resumen:
      'El estudiante valora de 1 a 5 qué tan bien hace cada actividad. Domina el cuadrante que llega al nivel primario y el perfil sale como un código, por ejemplo 1-2-3-2.',
    config: {
      respuestaFrase: RESPUESTA_FRASE.ESCALA,
      mideEscala: MIDE_ESCALA.DESEMPENO,
      puntosEscala: 5,
    },
    estilos: [
      {
        clave: 'A',
        nombre: 'Cuadrante A · Lógico',
        describe: 'Analítico y racional: datos, cifras y razonamiento.',
        ejemplos: [
          'Analizar datos para sacar conclusiones.',
          'Resolver problemas con cálculos o razonamientos.',
          'Encontrar el error en un argumento.',
        ],
      },
      {
        clave: 'B',
        nombre: 'Cuadrante B · Organizado',
        describe: 'Secuencial y cuidadoso: planes, orden y detalles.',
        ejemplos: [
          'Planificar mis tareas con fechas y prioridades.',
          'Seguir instrucciones paso a paso sin saltarme ninguna.',
          'Mantener ordenados mis materiales y archivos.',
        ],
      },
      {
        clave: 'C',
        nombre: 'Cuadrante C · Interpersonal',
        describe: 'Emocional y comunicativo: personas, ayuda y sentimientos.',
        ejemplos: [
          'Escuchar y apoyar a un compañero que tiene un problema.',
          'Trabajar en equipo cuidando el buen ambiente.',
          'Expresar con claridad lo que siento.',
        ],
      },
      {
        clave: 'D',
        nombre: 'Cuadrante D · Creativo',
        describe: 'Imaginativo e integrador: ideas nuevas y visión global.',
        ejemplos: [
          'Imaginar soluciones que nadie ha propuesto.',
          'Relacionar ideas de temas muy distintos.',
          'Ver el panorama general de un proyecto.',
        ],
      },
    ],
    sugerido: {
      porEstilo: 10,
      texto: 'unas 10 actividades por cuadrante (40 en total)',
    },
    respuesta: {
      texto:
        'Cada actividad se valora de 1 (lo hago peor) a 5 (lo hago mejor).',
      ejemplo:
        '«Planificar mis tareas con fechas» → Lo hago peor · menos bien · regular · bien · mejor',
    },
    lectura: LECTURA.DOMINANCIA,
    explica: {
      titulo: 'Dominancia por nivel: primaria, secundaria o terciaria',
      calculo:
        'Se suman las valoraciones de cada cuadrante y se mira qué tan cerca quedó del máximo, contando desde el mínimo: desde el 75 % es primaria (domina), desde el 50 % secundaria y por debajo terciaria. El código lista el nivel de A, B, C y D: 1 primaria, 2 secundaria, 3 terciaria.',
      ejemplo:
        'Con 10 actividades por cuadrante (de 10 a 50 puntos): A suma 42 → (42 − 10) ÷ (50 − 10) = 80 % → primaria. Si B, C y D quedan en 2, 3 y 2, el código es 1-2-3-2: dominancia simple en A.',
    },
  },
  {
    id: 'ENFOQUES',
    plantilla: PLANTILLA.AFIRMACIONES,
    nombre: 'Enfoques de estudio: profundo y superficial',
    resumen:
      'Frases de acuerdo de 1 a 5 sobre cómo estudia. Cuatro subescalas que se suman en dos enfoques. Sin niveles: se comparan los puntajes.',
    config: {
      respuestaFrase: RESPUESTA_FRASE.ESCALA,
      mideEscala: MIDE_ESCALA.ACUERDO,
      puntosEscala: 5,
    },
    estilos: [
      {
        clave: 'MP',
        nombre: 'Motivo profundo',
        describe: 'Estudia por interés y por el gusto de comprender.',
        ejemplos: [
          'Estudiar un tema nuevo me genera curiosidad.',
          'Disfruto cuando por fin entiendo algo difícil.',
          'Me interesan los temas aunque no vengan en el examen.',
        ],
      },
      {
        clave: 'EP',
        nombre: 'Estrategia profunda',
        describe: 'Relaciona ideas, profundiza y va más allá de lo pedido.',
        ejemplos: [
          'Cuando una explicación es difícil, la relaciono con lo que ya sé.',
          'Después de estudiar un concepto, intento explicarlo con mis palabras.',
          'Busco información extra sobre los temas que más me interesan.',
        ],
      },
      {
        clave: 'MS',
        nombre: 'Motivo superficial',
        describe: 'Estudia sobre todo para aprobar, con el menor esfuerzo.',
        ejemplos: [
          'Mi principal meta en una materia es la nota para aprobar.',
          'Prefiero no esforzarme en temas que no se evalúan.',
          'Si apruebo, no me importa haber entendido el tema a fondo.',
        ],
      },
      {
        clave: 'ES',
        nombre: 'Estrategia superficial',
        describe: 'Memoriza lo justo para el examen, sin buscar comprender.',
        ejemplos: [
          'Cuando tengo poco tiempo, memorizo datos sin buscar entenderlos.',
          'Me concentro en recordar respuestas concretas para el examen.',
          'Estudio solo lo que el profesor dijo que entra.',
        ],
      },
    ],
    grupos: [
      {
        clave: 'PROFUNDO',
        nombre: 'Enfoque profundo',
        partes: ['MP', 'EP'],
        describe: 'Motivo profundo + Estrategia profunda.',
      },
      {
        clave: 'SUPERFICIAL',
        nombre: 'Enfoque superficial',
        partes: ['MS', 'ES'],
        describe: 'Motivo superficial + Estrategia superficial.',
      },
    ],
    sugerido: {
      porEstilo: 5,
      texto: 'unas 5 frases por subescala (20 en total)',
    },
    respuesta: {
      texto:
        'Cada frase se valora de 1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo).',
      ejemplo: '«Estudio solo lo que dijo que entra» → 1 · 2 · 3 · 4 · 5',
    },
    lectura: LECTURA.SOLO_PUNTAJES,
    explica: {
      titulo: 'Solo puntajes, sin niveles ni estilo dominante',
      calculo:
        'Cada frase suma de 1 a 5 a su subescala. Cada enfoque es la suma de su motivo y su estrategia. El original no define niveles y desaconseja etiquetar al estudiante: lo que se lee es cuánto puntúa cada enfoque y cómo se comparan.',
      ejemplo:
        'Con 5 frases por subescala: Motivo profundo 22 + Estrategia profunda 19 = Enfoque profundo 41, en una escala de 10 a 50.',
    },
  },

  // ------------------------------------------------- Una respuesta (a/b)
  {
    id: 'POLOS',
    plantilla: PLANTILLA.UNA_OPCION,
    nombre: 'Cuatro pares de polos opuestos',
    resumen:
      'Cada pregunta tiene dos respuestas, a) y b), una por polo de un par. Cada par recibe un nivel: equilibrado, moderado o fuerte hacia un lado.',
    config: {},
    estilos: [
      {
        clave: 'ACT',
        nombre: 'Activo',
        describe: 'Aprende haciendo y discutiendo con otros.',
      },
      {
        clave: 'REF',
        nombre: 'Reflexivo',
        describe: 'Aprende pensando primero, a solas.',
      },
      {
        clave: 'SEN',
        nombre: 'Sensorial',
        describe: 'Prefiere hechos, datos y procedimientos probados.',
      },
      {
        clave: 'INT',
        nombre: 'Intuitivo',
        describe: 'Prefiere ideas, posibilidades y teorías.',
      },
      {
        clave: 'VIS',
        nombre: 'Visual',
        describe: 'Recuerda lo que ve: imágenes, esquemas, mapas.',
      },
      {
        clave: 'VER',
        nombre: 'Verbal',
        describe: 'Recuerda lo que lee o escucha.',
      },
      {
        clave: 'SEC',
        nombre: 'Secuencial',
        describe: 'Avanza paso a paso, en orden lógico.',
      },
      {
        clave: 'GLO',
        nombre: 'Global',
        describe: 'Necesita ver el panorama completo de golpe.',
      },
    ],
    pares: [
      {
        clave: 'ACT_REF',
        a: 'ACT',
        b: 'REF',
        ejemplos: [
          {
            pregunta: 'Cuando aprendo algo nuevo, prefiero…',
            a: 'probarlo de inmediato',
            b: 'pensarlo antes de intentarlo',
          },
          {
            pregunta: 'En un trabajo en grupo, suelo…',
            a: 'proponer y empezar a hacer',
            b: 'escuchar y analizar las ideas',
          },
        ],
      },
      {
        clave: 'SEN_INT',
        a: 'SEN',
        b: 'INT',
        ejemplos: [
          {
            pregunta: 'Me siento más cómodo con…',
            a: 'hechos y datos concretos',
            b: 'ideas y posibilidades',
          },
          {
            pregunta: 'Al resolver un problema, prefiero…',
            a: 'seguir un método probado',
            b: 'buscar una forma nueva',
          },
        ],
      },
      {
        clave: 'VIS_VER',
        a: 'VIS',
        b: 'VER',
        ejemplos: [
          {
            pregunta: 'Recuerdo mejor…',
            a: 'lo que veo: imágenes y esquemas',
            b: 'lo que leo o escucho',
          },
          {
            pregunta: 'Para entender una explicación, prefiero…',
            a: 'un diagrama',
            b: 'un texto o una charla',
          },
        ],
      },
      {
        clave: 'SEC_GLO',
        a: 'SEC',
        b: 'GLO',
        ejemplos: [
          {
            pregunta: 'Cuando estudio un tema, prefiero…',
            a: 'avanzar paso a paso',
            b: 'ver primero el panorama completo',
          },
          {
            pregunta: 'Al leer un libro técnico, suelo…',
            a: 'ir capítulo por capítulo',
            b: 'hojear todo antes de empezar',
          },
        ],
      },
    ],
    sugerido: {
      porPar: 11,
      texto:
        'unas 11 preguntas por par (44 en total); el asistente las va rotando entre los pares',
    },
    respuesta: {
      texto: 'Una pregunta, dos respuestas: cada una suma 1 punto a su polo.',
      ejemplo:
        'Cuando aprendo algo nuevo, prefiero… a) probarlo de inmediato · b) pensarlo antes',
    },
    lectura: LECTURA.BAREMO_MODELO,
    // Niveles del par (polo a − polo b) sobre 11 preguntas: de −11 a 11.
    baremo: Object.fromEntries(
      ['ACT_REF', 'SEN_INT', 'VIS_VER', 'SEC_GLO'].map((clave) => [
        clave,
        {
          min: -11,
          max: 11,
          niveles: [
            [-11, -8, '{b} fuerte'],
            [-7, -4, '{b} moderado'],
            [-3, 3, 'Equilibrado'],
            [4, 7, '{a} moderado'],
            [8, 11, '{a} fuerte'],
          ],
        },
      ]),
    ),
    explica: {
      titulo:
        'Hacia qué polo se inclina cada par: equilibrado, moderado o fuerte',
      calculo:
        'Cada respuesta a) suma 1 a su polo y cada b) al opuesto. El par se lee como la resta de los dos (a − b): cerca de 0 es equilibrado; cuanto más lejos, más fuerte la preferencia hacia ese lado.',
      ejemplo:
        'Con 11 preguntas del par Activo − Reflexivo: 8 respuestas a) y 3 b) → 8 − 3 = 5 → «Activo moderado» (de 4 a 7). Con 6 preguntas los cortes se ajustan: 5 a) y 1 b) → 4 → «Activo moderado»; las 6 en a) → 6 → «Activo fuerte».',
    },
  },

  // ----------------------------------------------------- Varias respuestas
  {
    id: 'CANALES',
    plantilla: PLANTILLA.VARIAS,
    nombre: 'Canales: ver, oír, leer, hacer',
    resumen:
      'Cada pregunta trae una opción por canal y se pueden marcar varias. El perfil reúne los canales que quedan cerca del más alto y, si salen los cuatro, pregunta cómo los usa.',
    config: {},
    estilos: [
      {
        clave: 'V',
        nombre: 'Visual',
        describe: 'Aprende con imágenes, gráficos, mapas y esquemas.',
      },
      {
        clave: 'A',
        nombre: 'Auditivo',
        describe: 'Aprende escuchando y conversando.',
      },
      {
        clave: 'R',
        nombre: 'Lectura/Escritura',
        describe: 'Aprende leyendo y escribiendo: listas, apuntes, textos.',
      },
      {
        clave: 'K',
        nombre: 'Kinestésico',
        describe: 'Aprende haciendo, con ejemplos reales y práctica.',
      },
    ],
    ejemplosPregunta: [
      {
        pregunta: 'Para aprender a usar una aplicación nueva, prefiero…',
        opciones: {
          V: 'ver capturas o un esquema de los menús',
          A: 'que alguien me la explique',
          R: 'leer las instrucciones',
          K: 'explorarla y probar',
        },
      },
      {
        pregunta: 'Para preparar un examen, me sirve…',
        opciones: {
          V: 'hacer mapas y diagramas',
          A: 'repasar en voz alta o con alguien',
          R: 'releer y resumir mis apuntes',
          K: 'resolver ejercicios prácticos',
        },
      },
      {
        pregunta:
          'Cuando tengo que indicarle a alguien cómo llegar a un lugar…',
        opciones: {
          V: 'le dibujo un mapa',
          A: 'se lo explico de palabra',
          R: 'le escribo los pasos',
          K: 'lo acompaño hasta allá',
        },
      },
    ],
    sugerido: {
      total: 16,
      texto: 'unas 16 situaciones, cada una con las 4 opciones',
    },
    respuesta: {
      texto:
        'Una situación, cuatro opciones (una por canal). Marca todas las que apliquen o ninguna.',
      ejemplo:
        'Para preparar un examen: ☐ hago mapas ☐ repaso en voz alta ☐ resumo mis apuntes ☐ resuelvo ejercicios',
    },
    lectura: LECTURA.ESCALONADO,
    complementaria: true,
    explica: {
      titulo: 'Perfil escalonado: los canales que quedan cerca del más alto',
      calculo:
        'Cada marca suma 1 punto a su canal. Se ordenan de mayor a menor y se van sumando al perfil mientras la diferencia con el anterior no supere una tolerancia. La tolerancia crece con el total de marcas: quien marca mucho tiene puntajes más altos y diferencias más grandes.',
      ejemplo:
        'Con 16 preguntas: Visual 10, Kinestésico 9, Lectura 6, Auditivo 2 → total 27 → tolera hasta 2. Visual→Kinestésico difiere 1 (entra); Kinestésico→Lectura difiere 3 (se detiene). Perfil: Visual + Kinestésico.',
    },
  },

  // --------------------------------------------------------------- Ordenar
  {
    id: 'CICLO',
    plantilla: PLANTILLA.ORDENAR,
    nombre: 'Ciclo de aprendizaje: cuatro modos y dos ejes',
    resumen:
      'Cada pregunta trae cuatro frases para ordenar de la que más a la que menos lo describe. Dos ejes (hacer frente a observar, pensar frente a sentir) ubican al estudiante en uno de cuatro estilos.',
    config: { formatoOrden: FORMATO.JERARQUIA },
    estilos: [
      {
        clave: 'EC',
        nombre: 'Experiencia concreta',
        describe:
          'Aprende sintiendo: vivencias, personas y situaciones reales.',
      },
      {
        clave: 'OR',
        nombre: 'Observación reflexiva',
        describe: 'Aprende observando y escuchando con calma.',
      },
      {
        clave: 'CA',
        nombre: 'Conceptualización abstracta',
        describe: 'Aprende pensando: ideas, teorías y lógica.',
      },
      {
        clave: 'EA',
        nombre: 'Experimentación activa',
        describe: 'Aprende haciendo: probar y aplicar.',
      },
    ],
    // Lo alto de cada eje es el primer polo: hacer − observar, pensar − sentir.
    pares: [
      { clave: 'HACER_OBSERVAR', a: 'EA', b: 'OR' },
      { clave: 'PENSAR_SENTIR', a: 'CA', b: 'EC' },
    ],
    // Se dibuja como la rejilla original: hacer a la izquierda, pensar abajo.
    plano: {
      xAltoYAlto: 'Convergente',
      xBajoYAlto: 'Asimilador',
      xBajoYBajo: 'Divergente',
      xAltoYBajo: 'Acomodador',
      invertirX: true,
      invertirY: true,
    },
    ejemplosPregunta: [
      {
        pregunta: 'Cuando aprendo…',
        opciones: {
          EC: 'me guío por lo que siento',
          OR: 'observo y escucho',
          CA: 'pienso en las ideas',
          EA: 'me pongo a hacer algo',
        },
      },
      {
        pregunta: 'Aprendo mejor cuando…',
        opciones: {
          EC: 'me relaciono con otras personas',
          OR: 'tengo tiempo para observar',
          CA: 'entiendo la teoría',
          EA: 'puedo practicar',
        },
      },
    ],
    sugerido: { total: 12, texto: 'unas 12 preguntas de 4 frases' },
    respuesta: {
      texto:
        'Cuatro frases por pregunta, cada una de un modo: se ordenan de 4 (la que más) a 1 (la que menos).',
      ejemplo:
        'Cuando aprendo: 4 · me pongo a hacer algo   3 · observo   2 · pienso   1 · siento',
    },
    lectura: LECTURA.CUADRANTES,
    explica: {
      titulo: 'Mapa de cuatro estilos con los cortes de referencia',
      calculo:
        'Cada frase suma a su modo el número que recibió (4 a la que más lo describe). Luego se restan: hacer − observar da el eje horizontal y pensar − sentir el vertical. Comparando cada eje con su corte se elige la esquina: Convergente, Asimilador, Divergente o Acomodador.',
      ejemplo:
        'Con 12 preguntas: hacer 36, observar 24 → +12, por encima del corte +6. Pensar 30, sentir 30 → 0, por debajo del corte +7. Esquina: Acomodador.',
    },
  },
]

/** Modelos que se ofrecen bajo una forma de responder. */
export const modelosDe = (plantilla) =>
  MODELOS.filter((m) => m.plantilla === plantilla)

/** Modelo en uso en el borrador, o null. */
export const modeloDe = (b) => MODELOS.find((m) => m.id === b.modelo) ?? null

/** Estilo del borrador con una clave del modelo. */
export const estiloDeClave = (b, clave) =>
  b.estilos.find((e) => e.clave === clave)

/** Nombre visible de un par del modelo: «Activo ↔ Reflexivo». */
export const nombrePar = (m, par) => {
  const nombre = (c) => m.estilos.find((e) => e.clave === c)?.nombre ?? c
  return `${nombre(par.a)} ↔ ${nombre(par.b)}`
}

/** Cuántas preguntas en total sugiere el modelo. */
export const totalSugerido = (m) => {
  const s = m.sugerido
  if (s.total) return s.total
  if (s.porPar) return s.porPar * m.pares.length
  return s.porEstilo * m.estilos.length
}

/**
 * Arma el borrador con la estructura del modelo: forma de responder, estilos
 * (con su clave y su descripción), pares, grupos que se suman, lectura,
 * cortes y pregunta extra. Las preguntas quedan vacías.
 */
export const aplicarModelo = (b, m) => {
  let n = {
    ...b,
    modo: 'ASISTIDO',
    modelo: m.id,
    plantilla: m.plantilla,
    ...m.config,
    estilos: [],
    preguntas: [],
    lectura: m.lectura,
    baremoModelo: m.baremo ?? null,
    preguntaPorPar: m.plantilla === PLANTILLA.UNA_OPCION && Boolean(m.pares),
    complementaria: m.complementaria ? plantillaComplementaria() : null,
    planoAsistente: null,
    interpretacion: interpretacionVacia(),
  }
  const ids = {}
  const marcar = (clave, describe) => {
    const id = n.estilos.at(-1).id
    ids[clave] = id
    n = actualizarEstilo(n, id, { clave, describe })
  }
  m.estilos.forEach((e) => {
    n = agregarEstilo(n, e.nombre)
    marcar(e.clave, e.describe)
  })
  ;(m.pares ?? []).forEach((p) => {
    n = agregarPar(n, ids[p.a], ids[p.b])
    marcar(p.clave, null)
  })
  ;(m.grupos ?? []).forEach((g) => {
    n = agregarEstilo(
      n,
      g.nombre,
      TIPO.COMPUESTO,
      g.partes.map((c) => ({ estiloId: ids[c], coeficiente: 1 })),
    )
    marcar(g.clave, g.describe)
  })
  if (m.plano) {
    const [x, y] = compuestos(n)
    n = elegirCorte(
      editarPlano(n, { ...planoVacio(x.id, y.id), ...m.plano }),
      CORTE.REFERENCIA,
    )
  }
  return n
}

/**
 * El borrador con las preguntas que sugiere el modelo, vacías. Sirve para
 * mostrar cómo quedarían los cortes antes de escribir ninguna pregunta.
 */
export const conEstructuraSugerida = (b, m) => {
  let n = { ...b, preguntas: [] }
  if (m.plantilla === PLANTILLA.AFIRMACIONES) {
    primarios(n).forEach((e) => {
      for (let i = 0; i < m.sugerido.porEstilo; i++)
        n = agregarPregunta(n, preguntaDePlantilla(n, '', e.id))
    })
    return n
  }
  for (let i = 0; i < totalSugerido(m); i++)
    n = agregarPregunta(n, preguntaDePlantilla(n))
  return n
}

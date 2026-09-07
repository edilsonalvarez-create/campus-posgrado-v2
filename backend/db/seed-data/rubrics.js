// Rúbricas de evaluación del Máster IEP (Fase 1).
// Una por asignatura (rubric-master-i .. rubric-master-xi) + TFM.
// Cada rúbrica: 4 criterios, 4 niveles (Insuficiente / En desarrollo / Competente / Ejemplar),
// puntos que suman 100. El primer criterio (peso 35) es el "apartado que casi todo el
// mundo se salta" que define el dominio de la asignatura (proyectos-practicos.js `mastery`).
// El seed las siembra en las tablas rubrics / rubric_criteria / rubric_levels y las
// enlaza a cada proyecto vía content_json.rubricSlug = 'rubric-<slug>'.

// Helper: 4 niveles estándar a partir del máximo de puntos del criterio.
function niveles(max, descriptores) {
  const [ins, des, com, eje] = descriptores;
  return [
    { label: 'Insuficiente', points: 0, descriptor: ins },
    { label: 'En desarrollo', points: Math.round(max * 0.45), descriptor: des },
    { label: 'Competente', points: Math.round(max * 0.75), descriptor: com },
    { label: 'Ejemplar', points: max, descriptor: eje },
  ];
}

const RUBRICS = [
  {
    slug: 'rubric-master-i',
    title: 'Rúbrica — Memo de evaluación de una propuesta de IA (Asignatura I)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'entrada-salida',
        title: 'Entrada y salida nombradas sin rodeos',
        description:
          'La entrada exacta (qué datos entran) y la salida exacta (qué produce el sistema, sobre qué catálogo cerrado) están cada una en una sola frase. Si no se puede, se declara explícitamente que la propuesta todavía es una intención.',
        levels: niveles(35, [
          'No distingue entrada de salida, o las describe con generalidades ("mejorar la eficiencia").',
          'Nombra una de las dos con claridad; la otra queda difusa o mezclada con el objetivo de negocio.',
          'Entrada y salida en una frase cada una, verificables; el catálogo de salida es cerrado.',
          'Entrada y salida impecables y, además, señala qué ejemplos históricos harían falta para entrenarlo o por qué aún no es un proyecto.',
        ]),
      },
      {
        key: 'clasificacion',
        title: 'Clasificación IA estrecha vs. intención mal formulada',
        description: 'Determina si lo propuesto es IA estrecha aplicable hoy o una intención sin problema técnico definido, y lo argumenta.',
        levels: niveles(25, [
          'Acepta la etiqueta del proveedor ("IA que entiende") sin análisis.',
          'Cuestiona la propuesta pero sin apoyarse en el criterio entrada/salida/ejemplos.',
          'Clasifica correctamente y lo justifica con el marco de la asignatura.',
          'Clasifica, justifica y distingue qué parte de la propuesta sí es viable y qué parte es marketing.',
        ]),
      },
      {
        key: 'automatizacion',
        title: 'Nivel de automatización de la decisión',
        description: 'Identifica si la IA asiste, recomienda o automatiza plenamente la decisión, y qué implica cada nivel para la responsabilidad.',
        levels: niveles(20, [
          'No aborda el nivel de automatización.',
          'Menciona el nivel pero sin consecuencias.',
          'Identifica el nivel correcto y su implicación operativa.',
          'Identifica el nivel, su implicación y propone dónde bajar un escalón si el riesgo lo exige.',
        ]),
      },
      {
        key: 'riesgo-etico',
        title: 'Riesgo ético concreto del caso',
        description: 'Señala al menos un riesgo ético específico del caso (no genérico), con el mecanismo por el que se produciría.',
        levels: niveles(20, [
          'Sin riesgo ético, o solo una frase genérica ("puede haber sesgo").',
          'Nombra un riesgo pero sin el mecanismo concreto en este caso.',
          'Riesgo concreto con el mecanismo por el que ocurriría en esta propuesta.',
          'Riesgo concreto, mecanismo y una salvaguarda proporcional y accionable.',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-ii',
    title: 'Rúbrica — Ficha de evaluación de una tecnología disruptiva (Asignatura II)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'barrera-adopcion-real',
        title: 'Barrera de adopción organizacional (no técnica)',
        description:
          'Identifica qué impediría de verdad que la organización adoptara la tecnología mañana: capacidades internas, procesos, incentivos, dependencia de terceros — no la limitación técnica del proveedor.',
        levels: niveles(35, [
          'No hay barrera de adopción, o solo repite la limitación técnica que anuncia el proveedor.',
          'Menciona una barrera organizacional pero de forma abstracta.',
          'Barrera organizacional concreta y específica de esta organización.',
          'Barrera concreta, por qué persiste, y qué habría que cambiar (no solo "un piloto") para superarla.',
        ]),
      },
      {
        key: 'problema-resuelto',
        title: 'Problema que resolvería exactamente',
        description: 'El problema está formulado como algo medible y actual, no como una aspiración.',
        levels: niveles(25, [
          'Problema vago o inventado para justificar la tecnología.',
          'Problema real pero sin magnitud ni dueño.',
          'Problema real, medible, con dueño en la organización.',
          'Problema real y una estimación de cuánto cuesta hoy no resolverlo.',
        ]),
      },
      {
        key: 'madurez-y-dependencias',
        title: 'Fase de madurez y tecnologías de las que depende',
        description: 'Ubica la tecnología en su ciclo de expectativa y enumera qué otras piezas necesita para funcionar en este caso.',
        levels: niveles(20, [
          'No ubica madurez ni dependencias.',
          'Ubica una de las dos.',
          'Madurez razonada y dependencias principales identificadas.',
          'Madurez, dependencias y cuál de esas dependencias es el verdadero cuello de botella.',
        ]),
      },
      {
        key: 'criterio-vs-entusiasmo',
        title: 'Lectura crítica frente al entusiasmo del proveedor',
        description: 'El veredicto se apoya en el criterio de la asignatura (problema / madurez / dependencias / barrera) y no en la narrativa comercial.',
        levels: niveles(20, [
          'Reproduce el discurso del proveedor.',
          'Escéptico pero sin criterio explícito.',
          'Veredicto anclado al criterio de la asignatura.',
          'Veredicto anclado al criterio y con la condición concreta que cambiaría la recomendación.',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-iii',
    title: 'Rúbrica — Arquitectura de Big Data + justificación (Asignatura III)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'batch-vs-streaming-costeado',
        title: 'Batch vs. streaming justificado por costo real',
        description:
          'La elección de patrón de procesamiento se justifica con el costo real de cada opción (latencia exigida, complejidad operativa, infraestructura) y no con "suena más avanzado".',
        levels: niveles(35, [
          'Elige streaming/batch por moda; sin análisis de costo ni de si el problema exige tiempo real.',
          'Menciona costo pero la decisión no se sigue de él.',
          'Decisión que se deriva de si el problema exige tiempo real y del costo operativo de cada opción.',
          'Decisión costeada y, además, el punto exacto de volumen o latencia en que cambiaría de patrón.',
        ]),
      },
      {
        key: 'arquitectura-completa',
        title: 'Arquitectura completa y coherente',
        description: 'Ingesta, almacenamiento, procesamiento y servicio están presentes y conectados; las tecnologías elegidas encajan con el volumen descrito.',
        levels: niveles(25, [
          'Diagrama incompleto o con piezas inconexas.',
          'Piezas presentes pero alguna elección no encaja con el volumen.',
          'Arquitectura completa y coherente con el escenario.',
          'Arquitectura completa, coherente y con el punto único de fallo señalado.',
        ]),
      },
      {
        key: 'ml-en-el-flujo',
        title: 'Dónde entra el modelo en el flujo',
        description: 'Sitúa un árbol de decisión o una regresión simple en un punto concreto del pipeline y explica qué decide ahí.',
        levels: niveles(20, [
          'El modelo no aparece o está "flotando" sin conexión con los datos.',
          'Aparece pero sin decir qué decide ni con qué features.',
          'Ubicado en un punto concreto, con la decisión que toma.',
          'Ubicado, con la decisión, las features y cómo se reentrenaría.',
        ]),
      },
      {
        key: 'escalabilidad-x10',
        title: 'Qué se sacrifica si el volumen ×10',
        description: 'Anticipa el primer cuello de botella al multiplicar por diez el volumen y qué habría que ceder (costo, latencia, exactitud).',
        levels: niveles(20, [
          'No aborda el crecimiento.',
          'Dice "habría que escalar" sin concretar dónde.',
          'Identifica el primer cuello de botella y el sacrificio asociado.',
          'Identifica el cuello, el sacrificio y en qué punto Spark deja de compensar.',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-iv',
    title: 'Rúbrica — Plan de sprint de dos semanas (Asignatura IV)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'retrospectiva-honesta',
        title: 'Retrospectiva honesta con al menos un fallo real',
        description:
          'La retrospectiva reconoce al menos un fallo concreto (no genérico), con su causa, y una acción de mejora verificable para el siguiente sprint.',
        levels: niveles(35, [
          'Retrospectiva ausente o "todo salió bien".',
          'Menciona un problema genérico sin causa ni acción.',
          'Un fallo concreto con causa y una acción de mejora.',
          'Varios aprendizajes, al menos uno incómodo, cada uno con causa y acción medible.',
        ]),
      },
      {
        key: 'historias-bien-formadas',
        title: 'Historias con criterios de aceptación verificables',
        description: '5–8 historias en forma de valor para un usuario, cada una con criterios de aceptación comprobables.',
        levels: niveles(25, [
          'Tareas técnicas sin usuario ni criterio de aceptación.',
          'Historias con formato pero criterios vagos.',
          'Historias con valor claro y criterios verificables.',
          'Historias verificables, con dependencias y tamaño relativo estimado.',
        ]),
      },
      {
        key: 'priorizacion-justificada',
        title: 'Backlog priorizado con criterio explícito',
        description: 'El orden del backlog responde a un criterio declarado (valor, riesgo, dependencia) y no a la comodidad del equipo.',
        levels: niveles(20, [
          'Sin priorización o por orden de llegada.',
          'Priorizado pero sin criterio explícito.',
          'Priorizado con criterio explícito y consistente.',
          'Priorizado, con criterio, y con lo que se dejaría fuera si el sprint se acorta.',
        ]),
      },
      {
        key: 'metricas-de-flujo',
        title: 'Uso de métricas de flujo (throughput, lead time, DoD)',
        description: 'Define la Definición de Hecho y plantea cómo mediría throughput o lead time para estimar el resto del plan.',
        levels: niveles(20, [
          'Sin DoD ni métricas.',
          'DoD presente; métricas mencionadas sin uso.',
          'DoD clara y una métrica de flujo con su uso.',
          'DoD, métrica y una estimación del cierre del plan basada en throughput, no en optimismo.',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-v',
    title: 'Rúbrica — Anexo de gobernanza de IA para un SGSI ISO 27001 (Asignatura V)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'mapeo-42001-anexoA',
        title: 'Mapeo ISO 42001 ↔ Anexo A de ISO 27001 con brechas',
        description:
          'Tabla de correspondencia entre al menos 10 controles de ISO/IEC 42001 y sus equivalentes (o vacíos) en el Anexo A de ISO/IEC 27001, con al menos 3 brechas identificadas y una remediación concreta por brecha.',
        levels: niveles(35, [
          'Sin tabla de correspondencia, o mezcla marcos sin mapear controles.',
          'Tabla con pocos controles y sin identificar brechas.',
          'Tabla ≥10 controles, ≥3 brechas señaladas.',
          'Tabla ≥10 controles, ≥3 brechas, cada una con remediación concreta e integrable al SGSI.',
        ]),
      },
      {
        key: 'punto-supervision-humana',
        title: 'Punto exacto de supervisión humana significativa',
        description: 'Señala el punto concreto del flujo donde un humano debe poder intervenir, con qué información y con qué poder de veto.',
        levels: niveles(25, [
          'Solo afirma "debe haber supervisión humana" en abstracto.',
          'Ubica la supervisión en una fase amplia ("en el despliegue").',
          'Punto exacto del flujo, con la información que ve el humano.',
          'Punto exacto, información, poder de veto y qué se registra de esa intervención.',
        ]),
      },
      {
        key: 'nivel-de-riesgo-justificado',
        title: 'Nivel de riesgo asignado y justificado',
        description: 'Clasifica el sistema por nivel de riesgo con el criterio de la asignatura y deduce las obligaciones que le aplican.',
        levels: niveles(20, [
          'Sin clasificación o sin criterio.',
          'Clasifica pero no deriva obligaciones.',
          'Clasifica con criterio y deriva las obligaciones principales.',
          'Clasifica, deriva obligaciones y señala la más difícil de cumplir hoy.',
        ]),
      },
      {
        key: 'formato-anexo-accionable',
        title: 'Formato de anexo integrable y política accionable',
        description: 'El entregable tiene forma de anexo real (política de uso + registro de riesgos) que una organización podría adjuntar a su SGSI, no un ensayo.',
        levels: niveles(20, [
          'Ensayo sobre ética de la IA sin forma de anexo.',
          'Estructura de anexo pero política genérica.',
          'Anexo con política de uso y registro de riesgos usables.',
          'Anexo de calidad de producción: política, registro con ≥8 riesgos (probabilidad×impacto, dueño, tratamiento).',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-vi',
    title: 'Rúbrica — Flujo de trabajo de Machine Learning (Asignatura VI)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'metrica-antes-de-resultados',
        title: 'Métrica de evaluación justificada antes de entrenar',
        description:
          'La métrica se elige y se justifica en función de la naturaleza del problema (desbalanceo, costo asimétrico de errores) antes de ver ningún resultado.',
        levels: niveles(35, [
          'Elige "precisión" (accuracy) por defecto, sin preguntar por el desbalanceo.',
          'Menciona varias métricas sin comprometerse ni justificar.',
          'Elige la métrica y la justifica por la estructura del problema.',
          'Justifica la métrica, descarta explícitamente las alternativas y define el umbral operativo aceptable.',
        ]),
      },
      {
        key: 'encuadre-entrada-salida',
        title: 'Encuadre del problema como entrada → salida',
        description: 'El problema está formulado como una función de entrada a salida, con la unidad de predicción y la ventana temporal claras.',
        levels: niveles(25, [
          'Problema difuso; no se sabe qué predice cada fila.',
          'Entrada/salida presentes pero sin unidad ni ventana.',
          'Entrada, salida, unidad de predicción y ventana temporal claras.',
          'Todo lo anterior y la fuente de verdad de la etiqueta identificada.',
        ]),
      },
      {
        key: 'diagnostico-sesgo-varianza',
        title: 'Diagnóstico honesto de sesgo/varianza antes de entrenar',
        description: 'Anticipa si el mayor riesgo será sesgo o varianza y por qué, dado el volumen y la complejidad esperada.',
        levels: niveles(20, [
          'No hay diagnóstico previo.',
          'Diagnóstico sin fundamento en los datos del caso.',
          'Diagnóstico razonado a partir del volumen y la señal disponible.',
          'Diagnóstico razonado y la estrategia de validación que lo confirmaría o refutaría.',
        ]),
      },
      {
        key: 'fuga-de-datos',
        title: 'Prevención de fuga de datos',
        description: 'Identifica al menos un punto donde podría colarse información del futuro o de la etiqueta en las features, y cómo evitarlo.',
        levels: niveles(20, [
          'No menciona fuga de datos.',
          'La menciona en abstracto.',
          'Identifica un punto concreto de fuga en este pipeline y cómo evitarlo.',
          'Identifica varios puntos, el orden correcto de split/transform y cómo se auditaría.',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-vii',
    title: 'Rúbrica — Biblioteca de prompts multimodales iterados (Asignatura VII)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'fallo-de-la-primera-version',
        title: 'Fallo de la primera versión documentado',
        description:
          'Para cada prompt se registra la versión inicial, qué falló exactamente al probarla (con evidencia) y la corrección. Sin ese registro no se puede saber si la mejora fue por método o por azar.',
        levels: niveles(35, [
          'Solo se entrega la versión final; no hay iteraciones.',
          'Se menciona que hubo iteraciones pero sin el fallo concreto.',
          'Cada prompt tiene versión inicial, fallo concreto observado y corrección.',
          'Además, el fallo se ilustra con la salida real y la corrección ataca la causa, no el síntoma.',
        ]),
      },
      {
        key: 'criterio-de-evaluacion-medible',
        title: 'Criterio explícito de "funciona"',
        description: 'Define, antes de iterar, cómo se decide si un prompt funciona: tasa de éxito de tarea, reformulaciones, o un rúbrica de salida.',
        levels: niveles(25, [
          'Sin criterio; "funciona" es una impresión.',
          'Criterio cualitativo vago.',
          'Criterio medible aplicado de forma consistente.',
          'Criterio medible con casos de prueba y un delta reportado entre versiones.',
        ]),
      },
      {
        key: 'diseno-multimodal',
        title: 'Diseño para entrada multimodal',
        description: 'Los prompts aprovechan de verdad la modalidad (imagen, audio) y manejan la desalineación entre modalidades.',
        levels: niveles(20, [
          'El componente multimodal es decorativo; el prompt funcionaría igual solo con texto.',
          'Usa la modalidad pero sin manejar ambigüedad ni desalineación.',
          'Usa la modalidad y gestiona la ambigüedad entre lo que dice el texto y lo que muestra la imagen.',
          'Además, define qué hacer cuando las modalidades se contradicen.',
        ]),
      },
      {
        key: 'diagnostico-prompt-modelo-contexto',
        title: 'Distingue problema de prompt vs. de modelo vs. de contexto',
        description: 'Ante un fallo, razona si la causa está en el prompt, en las capacidades del modelo o en el contexto que se le da.',
        levels: niveles(20, [
          'Atribuye todo al prompt.',
          'Reconoce que puede haber otras causas sin diagnosticarlas.',
          'Diagnostica correctamente al menos un caso donde el problema no era el prompt.',
          'Diagnóstico sistemático con la señal que distingue cada causa.',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-viii',
    title: 'Rúbrica — Recorrido de Design Thinking (Asignatura VIII)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'el-problema-cambio',
        title: 'El problema cambió tras la empatía',
        description:
          'Se muestra el problema tal como se enunció antes de investigar y cómo quedó después de las entrevistas/observación. Si es idéntico, probablemente no hubo investigación real.',
        levels: niveles(35, [
          'El problema final es idéntico al inicial; no hay evidencia de investigación.',
          'Cambió la redacción pero no el fondo.',
          'El problema cambió de fondo y se explica qué observación lo provocó.',
          'El problema cambió, se documenta la observación concreta que lo cambió y qué hipótesis quedó refutada.',
        ]),
      },
      {
        key: 'evidencia-de-empatia',
        title: 'Evidencia de empatía (entrevistas / observación)',
        description: 'Notas reales de al menos una conversación de empatía, con lo que la persona dijo frente a lo que hace.',
        levels: niveles(25, [
          'Sin notas o claramente inventadas.',
          'Notas de una conversación superficial (preguntas cerradas).',
          'Notas de ≥1 entrevista abierta con observación de comportamiento.',
          'Notas de varias conversaciones y una contradicción decir/hacer identificada.',
        ]),
      },
      {
        key: 'ideacion-divergente',
        title: 'Tres ideas genuinamente divergentes',
        description: 'Las ideas exploran soluciones realmente distintas, no tres variantes de la misma.',
        levels: niveles(20, [
          'Una sola idea disfrazada de tres.',
          'Dos ideas distintas y una de relleno.',
          'Tres ideas divergentes sin filtrar prematuramente.',
          'Tres ideas divergentes y el criterio explícito con que se eligió una.',
        ]),
      },
      {
        key: 'prototipo-fidelidad-correcta',
        title: 'Prototipo de la fidelidad adecuada a la pregunta',
        description: 'El prototipo tiene la fidelidad justa para responder la pregunta de diseño, sin sobre-invertir.',
        levels: niveles(20, [
          'Sin prototipo, o una descripción textual.',
          'Prototipo de fidelidad desproporcionada (muy alta o muy baja) para la pregunta.',
          'Prototipo de baja fidelidad que responde la pregunta clave.',
          'Prototipo de fidelidad justa y la pregunta concreta que permite validar con un usuario.',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-ix',
    title: 'Rúbrica — Especificación de una aplicación de IA generativa industrial (Asignatura IX)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'arquitectura-por-criterio-correcto',
        title: 'Elección de arquitectura por el criterio correcto',
        description:
          'GAN / VAE / difusión se elige por estabilidad de entrenamiento frente a costo de inferencia (y calidad requerida), no por novedad. Se descartan explícitamente las otras.',
        levels: niveles(35, [
          'Elige por moda ("difusión porque es lo último"); sin comparar trade-offs.',
          'Nombra el trade-off estabilidad/costo pero la elección no se sigue de él.',
          'Elige y justifica por estabilidad vs. costo de inferencia; descarta una alternativa.',
          'Justifica con el trade-off, descarta ambas alternativas y anticipa el fallo típico de la elegida (p. ej. colapso de modo).',
        ]),
      },
      {
        key: 'datos-de-entrada',
        title: 'Datos de entrada necesarios y su disponibilidad',
        description: 'Especifica qué datos necesita el sistema, en qué cantidad y calidad, y si la organización los tiene.',
        levels: niveles(25, [
          'No especifica datos.',
          'Lista datos sin cantidad ni disponibilidad.',
          'Datos, cantidad aproximada y disponibilidad realista.',
          'Además, el plan si los datos son insuficientes (síntesis, aumento, transfer).',
        ]),
      },
      {
        key: 'punto-de-revision-humana',
        title: 'Punto de revisión humana antes de usar el resultado',
        description: 'Define dónde y con qué criterio una persona valida la salida generada antes de que se use.',
        levels: niveles(20, [
          'La salida se usa sin revisión.',
          'Revisión mencionada sin punto ni criterio.',
          'Punto de revisión concreto y criterio de aceptación.',
          'Punto, criterio y qué se hace con las salidas rechazadas (bucle de mejora).',
        ]),
      },
      {
        key: 'madurez-piloto-vs-produccion',
        title: 'Distinción piloto vs. producción',
        description: 'Reconoce qué de la propuesta es demostrable en un piloto y qué haría falta para producción (coste, latencia, mantenimiento).',
        levels: niveles(20, [
          'Trata el piloto como si fuera producción.',
          'Menciona la diferencia sin concretar.',
          'Separa piloto de producción con los requisitos que faltan.',
          'Separa ambos, cuantifica el salto y prioriza qué resolver primero.',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-x',
    title: 'Rúbrica — Arquitectura cloud + comparativa de proveedores (Asignatura X)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'justificacion-no-precio',
        title: 'Recomendación final justificada por un factor que no es el precio de lista',
        description:
          'La elección de proveedor se apoya en integración existente, cumplimiento, fortaleza específica o coste total de operación — no en "es el más grande" ni en el precio por hora publicado.',
        levels: niveles(35, [
          '"Elegimos X porque es el más grande / el más barato por hora."',
          'Da un factor no-precio pero genérico ("mejor soporte").',
          'Factor no-precio concreto y verificable para este caso.',
          'Factor concreto, el trade-off que se acepta al elegirlo, y la condición que cambiaría la recomendación.',
        ]),
      },
      {
        key: 'arquitectura-de-referencia-completa',
        title: 'Arquitectura de referencia completa',
        description: 'Ingesta, entrenamiento gestionado, registro de modelos, endpoint y monitoreo de deriva están presentes y nombrados con el servicio equivalente en cada nube.',
        levels: niveles(25, [
          'Faltan piezas clave (registro de modelos o monitoreo).',
          'Todas las piezas pero sin el servicio equivalente por nube.',
          'Arquitectura completa con el servicio equivalente en cada proveedor.',
          'Completa, con el flujo de despliegue automático desde el repo.',
        ]),
      },
      {
        key: 'comparativa-util',
        title: 'Tabla comparativa AWS/Azure/GCP centrada en el caso',
        description: 'La comparativa evalúa las tres nubes en las dimensiones que importan para este escenario concreto, no un listado genérico.',
        levels: niveles(20, [
          'Copia de tabla de marketing genérica.',
          'Tabla propia pero con dimensiones irrelevantes al caso.',
          'Dimensiones relevantes al caso, evaluación honesta.',
          'Dimensiones relevantes, evaluación honesta y un "empate técnico" reconocido donde lo hay.',
        ]),
      },
      {
        key: 'operacion-y-coste',
        title: 'Operación del modelo desplegado y noción de coste mensual',
        description: 'Considera qué pasa tras el despliegue: monitoreo, reentrenamiento, y un orden de magnitud del coste mensual con la palanca que se bajaría primero.',
        levels: niveles(20, [
          'La propuesta termina en el despliegue.',
          'Menciona operación sin coste.',
          'Operación y un rango de coste mensual razonado.',
          'Operación, coste y qué palanca se bajaría primero para reducirlo a la mitad.',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-xi',
    title: 'Rúbrica — Modelo de amenazas IA-defensa / IA-ataque (Asignatura XI)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'mitigacion-riesgo-ofensivo',
        title: 'Mitigación concreta del riesgo ofensivo',
        description:
          'Para el ataque asistido por IA generativa identificado, se propone al menos una mitigación concreta y accionable que lo dificulte de verdad — no solo la descripción del ataque.',
        levels: niveles(35, [
          'Describe el ataque; no propone ninguna mitigación, o solo "concienciar al personal".',
          'Mitigación genérica sin encaje con este sistema.',
          'Mitigación concreta que ataca el paso explotado.',
          'Mitigación concreta, en qué control de ISO 27001/42001 encaja, y su coste/fricción.',
        ]),
      },
      {
        key: 'doble-angulo',
        title: 'Los dos ángulos: IA que defiende e IA que ataca',
        description: 'Analiza cómo la IA podría detectar/clasificar la amenaza y, por separado, cómo la IA generativa podría usarse para atacar el mismo sistema.',
        levels: niveles(25, [
          'Solo cubre un ángulo.',
          'Cubre los dos de forma superficial.',
          'Ambos ángulos con mecanismo concreto en cada uno.',
          'Ambos ángulos, mecanismos, y la interacción entre ellos (el detector como nuevo objetivo).',
        ]),
      },
      {
        key: 'modelo-de-amenazas-disciplinado',
        title: 'Modelo de amenazas con formato de pentesting',
        description: 'Hallazgos con criticidad, evidencia/escenario y activo afectado, como en un informe de seguridad.',
        levels: niveles(20, [
          'Lista informal de miedos.',
          'Hallazgos sin criticidad ni evidencia.',
          'Hallazgos con criticidad y escenario de explotación.',
          'Hallazgos con criticidad, escenario, activo y probabilidad, priorizados.',
        ]),
      },
      {
        key: 'costes-asimetricos',
        title: 'Costes asimétricos de falsos positivos y negativos',
        description: 'Reconoce que en detección el costo de un FP y el de un FN no son iguales, y calibra el umbral a la capacidad real de respuesta del equipo.',
        levels: niveles(20, [
          'Trata FP y FN como equivalentes.',
          'Reconoce la asimetría sin usarla.',
          'Calibra el umbral según la asimetría y la capacidad del equipo.',
          'Calibra, y define qué se hace con la cola de alertas que no se puede atender.',
        ]),
      },
    ],
  },

  {
    slug: 'rubric-master-tfm',
    title: 'Rúbrica — Proyecto Fin de Programa (TFM)',
    scope: 'asignatura',
    passThreshold: 70,
    criteria: [
      {
        key: 'evaluacion-cuantitativa',
        title: 'Evaluación con números',
        description:
          'El trabajo se evalúa con métricas apropiadas al problema, sobre un conjunto de prueba honesto, con línea base y con intervalo o varianza — no con una demostración cualitativa.',
        levels: niveles(30, [
          'Solo demostración cualitativa ("funciona bien").',
          'Una métrica sin línea base ni conjunto de prueba claro.',
          'Métricas apropiadas, conjunto de prueba honesto y línea base.',
          'Métricas, línea base, varianza/intervalo y análisis de errores por categoría.',
        ]),
      },
      {
        key: 'coste-real',
        title: 'Coste real del sistema',
        description: 'Estima el coste de operar el sistema (infraestructura, tokens/inferencia, mantenimiento) a un horizonte de 12 meses, con la palanca principal.',
        levels: niveles(25, [
          'No aborda el coste.',
          'Coste mencionado sin desglose.',
          'Coste desglosado a 12 meses con supuestos explícitos.',
          'Coste desglosado, la palanca principal y el margen de error de la estimación.',
        ]),
      },
      {
        key: 'metodo-y-estado-del-arte',
        title: 'Método reproducible y estado del arte',
        description: 'El método está descrito con detalle suficiente para reproducirlo y situado frente a alternativas conocidas, con repositorio público.',
        levels: niveles(25, [
          'Método opaco; sin repositorio.',
          'Método parcialmente reproducible; estado del arte anecdótico.',
          'Método reproducible, repositorio público, estado del arte con las alternativas relevantes.',
          'Todo lo anterior y la justificación de por qué este método frente a las alternativas.',
        ]),
      },
      {
        key: 'riesgos-etica-y-defensa',
        title: 'Riesgos, ética y defensa',
        description: 'Analiza riesgos y consideraciones éticas del sistema y sostiene una defensa grabada de 10 minutos que responde a las preguntas difíciles.',
        levels: niveles(20, [
          'Sin análisis de riesgos ni defensa entregada.',
          'Riesgos genéricos; defensa que solo repite la memoria.',
          'Riesgos específicos del sistema; defensa que argumenta las decisiones.',
          'Riesgos, mitigaciones, límites reconocidos y una defensa que responde bien a la objeción más fuerte.',
        ]),
      },
    ],
  },

  // ---------- Rúbricas de los tracks hands-on (Fase 2, asignaturas III/VI/IX/X) ----------
  ...['iii', 'vi', 'ix', 'x'].map((n) => {
    const dominio = {
      iii: {
        key: 'batch-vs-streaming-medido',
        title: 'La decisión de motor/patrón se apoya en TU medición',
        desc: 'La conclusión sobre qué motor usar y en qué punto Spark deja de compensar se justifica con los tiempos y memoria que mediste, no con una regla aprendida.',
        lv: [
          'Conclusión sin datos propios o contradicha por la tabla de resultados.',
          'Menciona los números pero la conclusión no se sigue de ellos.',
          'Conclusión derivada de la medición, con el punto de corte identificado.',
          'Además, el análisis de qué se sacrifica al escalar ×10 con evidencia.',
        ],
      },
      vi: {
        key: 'metrica-y-fuga',
        title: 'Métrica justificada antes de entrenar + fuga de datos detectada',
        desc: 'Cada problema declara y justifica su métrica antes de ver resultados, y se identifica un punto concreto de posible fuga de datos y cómo se evitó.',
        lv: [
          'Métrica por defecto sin justificar; sin análisis de fuga.',
          'Justifica la métrica en un caso; fuga mencionada en abstracto.',
          'Métrica justificada en los tres problemas y un punto de fuga concreto evitado.',
          'Además, el orden correcto de split/transform y cómo se auditaría la fuga.',
        ],
      },
      ix: {
        key: 'recuperacion-vs-generacion',
        title: 'Métricas de recuperación separadas de las de generación + diagnóstico de fallo',
        desc: 'El panel mide recuperación y generación por separado, hay tasa de alucinación sobre casos conocidos, y ante un fallo se diagnostica la etapa antes de tocar el prompt.',
        lv: [
          'Métrica única agregada; sin diagnóstico de fallo.',
          'Separa recuperación de generación pero sin alucinación ni coste.',
          'Recuperación, generación, alucinación y coste, más un fallo diagnosticado.',
          'Además, varios fallos por etapa con la señal que los distingue.',
        ],
      },
      x: {
        key: 'coste-y-palanca',
        title: 'Coste mensual conocido + palanca de reducción + justificación no-precio',
        desc: 'Se conoce el coste mensual (real o proyectado con supuestos), la palanca que se bajaría primero para reducirlo a la mitad, y la elección de proveedor se justifica por un factor que no es el precio de lista.',
        lv: [
          'La entrega termina en el despliegue; sin coste ni palanca.',
          'Coste mencionado sin desglose ni palanca.',
          'Coste desglosado, palanca principal y justificación no-precio del proveedor.',
          'Además, el trade-off aceptado y la condición que cambiaría la decisión.',
        ],
      },
    }[n];
    return {
      slug: `rubric-handson-master-${n}`,
      title: `Rúbrica — Práctica computacional (Asignatura ${n.toUpperCase()})`,
      scope: 'asignatura',
      passThreshold: 70,
      criteria: [
        {
          key: 'codigo-ejecutable-reproducible',
          title: 'Código ejecutable y reproducible',
          description:
            'El repositorio o notebook se ejecuta de principio a fin siguiendo el README, con dependencias declaradas y datos obtenibles; otra persona puede reproducir los resultados.',
          levels: niveles(35, [
            'No ejecuta, faltan dependencias/datos, o no hay repositorio.',
            'Ejecuta con retoques manuales no documentados.',
            'Ejecuta siguiendo el README; dependencias y datos resueltos.',
            'Reproducible sin fricción, con semillas fijadas y resultados verificables.',
          ]),
        },
        {
          key: 'resultados-con-numeros',
          title: 'Resultados medidos con números',
          description: 'Hay una tabla/panel de resultados con las magnitudes que pide la práctica, sobre una base honesta (no cherry-picking).',
          levels: niveles(25, [
            'Sin mediciones, o solo capturas sin contexto.',
            'Algunas cifras sueltas sin condiciones de medición.',
            'Tabla completa con las magnitudes pedidas y condiciones claras.',
            'Además, varianza/repeticiones y análisis de por qué salen esos números.',
          ]),
        },
        {
          key: dominio.key,
          title: dominio.title,
          description: dominio.desc,
          levels: niveles(25, dominio.lv),
        },
        {
          key: 'comunicacion-del-informe',
          title: 'Claridad del informe',
          description: 'El informe conecta el objetivo, el método, los resultados y la conclusión de forma que un revisor entiende qué se hizo y por qué en una lectura.',
          levels: niveles(15, [
            'Difícil de seguir; falta el hilo objetivo→método→resultado→conclusión.',
            'Se entiende con esfuerzo; saltos entre secciones.',
            'Hilo claro y conclusión que se sigue de los resultados.',
            'Claro, conciso y con las limitaciones del trabajo reconocidas.',
          ]),
        },
      ],
    };
  }),

  // ---------- Rúbricas de los 4 hitos del TFM (Fase 2) ----------
  {
    slug: 'rubric-tfm-propuesta',
    title: 'Rúbrica — TFM Hito 1: Propuesta',
    scope: 'tfm-milestone',
    passThreshold: 70,
    criteria: [
      {
        key: 'problema-y-pregunta',
        title: 'Problema real dimensionado y pregunta concreta',
        description: 'El problema es real y actual, con una cifra que lo dimensiona, y la pregunta de investigación es concreta y respondible en 8 semanas.',
        levels: niveles(35, [
          'Problema vago o aspiracional; pregunta difusa.',
          'Problema real pero sin magnitud, o pregunta demasiado amplia.',
          'Problema dimensionado y pregunta concreta y acotada.',
          'Además, por qué esta pregunta importa a la organización o al campo.',
        ]),
      },
      {
        key: 'alcance-y-viabilidad',
        title: 'Alcance (qué sí / qué no) y viabilidad',
        description: 'El alcance está delimitado y el plan de 8 semanas es realista dados los datos y recursos disponibles.',
        levels: niveles(35, [
          'Sin delimitación de alcance; plan irrealista o ausente.',
          'Alcance parcial; plan optimista sin holguras.',
          'Alcance claro (qué sí y qué no) y plan de 8 semanas con hitos.',
          'Además, los riesgos del plan y qué se recortaría si el tiempo aprieta.',
        ]),
      },
      {
        key: 'datos',
        title: 'Datos: qué se necesita y si está disponible',
        description: 'Identifica los datos necesarios, su cantidad y calidad, y confirma su disponibilidad o el plan para obtenerlos.',
        levels: niveles(30, [
          'No aborda los datos.',
          'Lista datos sin cantidad ni disponibilidad.',
          'Datos, cantidad aproximada y disponibilidad confirmada.',
          'Además, el plan B si los datos resultan insuficientes.',
        ]),
      },
    ],
  },
  {
    slug: 'rubric-tfm-estado-arte',
    title: 'Rúbrica — TFM Hito 2: Estado del arte',
    scope: 'tfm-milestone',
    passThreshold: 70,
    criteria: [
      {
        key: 'cobertura-y-relevancia',
        title: 'Cobertura y relevancia de las fuentes',
        description: '4–8 fuentes realmente relevantes al problema (no de relleno), con las alternativas y sistemas comparables principales.',
        levels: niveles(30, [
          'Fuentes escasas o irrelevantes.',
          'Fuentes relevantes pero falta alguna alternativa principal.',
          'Cobertura adecuada de las alternativas y comparables.',
          'Cobertura completa, incluyendo trabajo reciente.',
        ]),
      },
      {
        key: 'sintesis-en-matriz',
        title: 'Síntesis en matriz (método, métricas, limitación)',
        description: 'Cada fuente se resume en qué resuelve, con qué método, qué métricas reporta y qué limita, en formato comparable.',
        levels: niveles(35, [
          'Resúmenes sueltos sin estructura comparable.',
          'Matriz incompleta (faltan métricas o limitaciones).',
          'Matriz completa y comparable entre fuentes.',
          'Además, patrones transversales identificados entre las fuentes.',
        ]),
      },
      {
        key: 'vacio-identificado',
        title: 'El vacío que cubre el TFM',
        description: 'Del estado del arte se deriva con claridad el vacío concreto que el TFM aborda y por qué su enfoque frente a las alternativas.',
        levels: niveles(35, [
          'No se identifica un vacío, o es genérico ("hacer algo mejor").',
          'Vacío mencionado pero no se sigue del análisis.',
          'Vacío concreto derivado del estado del arte.',
          'Vacío concreto y justificación del enfoque propio frente a cada alternativa.',
        ]),
      },
    ],
  },
  {
    slug: 'rubric-tfm-revision-intermedia',
    title: 'Rúbrica — TFM Hito 3: Revisión intermedia',
    scope: 'tfm-milestone',
    passThreshold: 70,
    criteria: [
      {
        key: 'avance-funcional',
        title: 'Avance funcional con un primer resultado medible',
        description: 'El repositorio muestra el sistema a medio construir produciendo ya un resultado que se puede medir.',
        levels: niveles(35, [
          'Sin avance verificable o solo planificación.',
          'Código que aún no produce ningún resultado.',
          'Primer resultado medible reproducible.',
          'Resultado medible y comparado con la línea base preliminar.',
        ]),
      },
      {
        key: 'metodologia-de-evaluacion',
        title: 'Metodología de evaluación definida',
        description: 'Conjunto de prueba honesto, línea base y métricas están definidos antes del resultado final.',
        levels: niveles(35, [
          'Sin metodología de evaluación.',
          'Métricas sin conjunto de prueba claro o sin línea base.',
          'Conjunto de prueba honesto, línea base y métricas definidos.',
          'Además, cómo se evitará la fuga de datos y el sobreajuste al conjunto de prueba.',
        ]),
      },
      {
        key: 'gestion-de-cambios-y-riesgos',
        title: 'Registro de riesgos y cambios respecto al plan',
        description: 'Documenta qué ha cambiado respecto a la propuesta, por qué, y qué riesgos del proyecto están activos.',
        levels: niveles(30, [
          'No reconoce cambios ni riesgos.',
          'Menciona cambios sin causa ni impacto.',
          'Cambios con causa e impacto, y riesgos activos identificados.',
          'Además, la mitigación de cada riesgo y el criterio para pivotar si hace falta.',
        ]),
      },
    ],
  },
  {
    slug: 'rubric-tfm-final',
    title: 'Rúbrica — TFM Hito 4: Memoria final y defensa',
    scope: 'tfm-milestone',
    passThreshold: 70,
    criteria: [
      {
        key: 'evaluacion-cuantitativa',
        title: 'Evaluación con números',
        description: 'Métricas apropiadas sobre un conjunto de prueba honesto, con línea base y con varianza/intervalo, más análisis de errores.',
        levels: niveles(30, [
          'Solo demostración cualitativa.',
          'Una métrica sin línea base ni conjunto de prueba claro.',
          'Métricas apropiadas, conjunto de prueba honesto y línea base.',
          'Además, varianza/intervalo y análisis de errores por categoría.',
        ]),
      },
      {
        key: 'coste-real',
        title: 'Coste real a 12 meses',
        description: 'Coste de operar el sistema (infraestructura, inferencia, mantenimiento) proyectado a 12 meses, con la palanca principal.',
        levels: niveles(25, [
          'No aborda el coste.',
          'Coste sin desglose.',
          'Coste desglosado a 12 meses con supuestos explícitos.',
          'Además, la palanca principal y el margen de error de la estimación.',
        ]),
      },
      {
        key: 'memoria-y-reproducibilidad',
        title: 'Memoria completa y repositorio reproducible',
        description: 'La memoria sigue el orden problema→estado del arte→método→implementación→evaluación→riesgos→coste→conclusiones, con repositorio público reproducible.',
        levels: niveles(25, [
          'Memoria incompleta o repositorio ausente/no reproducible.',
          'Memoria con el orden pero secciones flojas; repositorio parcial.',
          'Memoria completa y coherente; repositorio reproducible.',
          'Además, límites del trabajo reconocidos y trabajo futuro concreto.',
        ]),
      },
      {
        key: 'defensa',
        title: 'Defensa grabada de 10 minutos',
        description: 'El vídeo de defensa argumenta las decisiones de diseño y responde a la objeción más fuerte, no solo resume la memoria.',
        levels: niveles(20, [
          'Sin vídeo, o solo lee la memoria.',
          'Resume la memoria sin argumentar las decisiones.',
          'Argumenta las decisiones de diseño con solvencia.',
          'Además, responde bien a la objeción más fuerte contra el trabajo.',
        ]),
      },
    ],
  },
];

module.exports = RUBRICS;

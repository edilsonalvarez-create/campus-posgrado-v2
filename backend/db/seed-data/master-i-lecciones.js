// Lecciones propias de la Asignatura I — Artificial Intelligence.
// Piloto de la FASE 3 del plan de reconstrucción del Máster: una lección por cada
// "Contenido" que declara el documento oficial del programa para esta asignatura.
// Sigue el modelo estándar de lección (plan, sección F): objetivo, introducción,
// conceptos clave, contenido, ejemplo, actividad, pregunta de reflexión, quiz de 3
// preguntas, resumen y criterio de finalización. Contenido original, informado por
// las aulas ya escritas del campus (AI for Everyone, Elements of AI, Introduction
// to Generative AI), no copiado literalmente de ellas.

const lecciones = [
  {
    contenidoOficial: 'IA y Toma de Decisiones Automatizadas',
    title: 'IA y Toma de Decisiones Automatizadas',
    objetivo: 'Distinguir qué es y qué no es una decisión automatizada por IA, y saber formular cualquier propuesta de IA como un par entrada→salida evaluable.',
    introduccion: 'Antes de estudiar técnicas concretas conviene fijar el vocabulario que usará el resto de la asignatura. La mayor fuente de confusión al hablar de IA en una organización no es técnica: es que la palabra se usa para cosas muy distintas, y esa ambigüedad produce decisiones de inversión equivocadas.',
    conceptosClave: [
      'IA estrecha frente a IA general',
      'Aprendizaje supervisado como función entrada→salida',
      'Automatización frente a asistencia a la decisión',
      'Umbral de confianza y intervención humana',
      'Coste del error frente a coste de la revisión manual',
    ],
    contenido: [
      'La inteligencia artificial estrecha resuelve una tarea concreta, a veces mejor que una persona, y nada más. La inteligencia artificial general —un sistema capaz de cualquier tarea humana— no existe hoy y no debería figurar en la planificación de ninguna organización. Todo lo que se automatiza en la práctica, incluidos los sistemas más sofisticados de generación de texto o imagen, es IA estrecha: una función que aprende a producir una salida a partir de una entrada, ajustada sobre ejemplos.',
      'Esa definición operativa —entrada, salida, ejemplos históricos de la correspondencia entre ambas— es la herramienta más útil de esta lección. Sirve para separar, en cualquier propuesta de "automatizar con IA", lo que es un proyecto real de lo que todavía es una intención. "Optimizar el mantenimiento con IA" no es un proyecto; "entrada: lecturas de vibración y temperatura de un equipo en las últimas 72 horas, salida: probabilidad de fallo en los próximos 7 días" sí lo es, porque se puede construir, medir y auditar.',
      'Automatizar una decisión no significa siempre eliminar a la persona del proceso. Existe un espectro entre asistir (el sistema sugiere, la persona decide siempre), automatizar con supervisión (el sistema decide, una persona revisa una muestra o los casos de baja confianza) y automatizar por completo (el sistema decide sin revisión). Dónde situarse en ese espectro depende de dos factores: el coste de un error del modelo y el coste de mantener una revisión humana. Un sistema de recomendación de contenido tolera errores baratos y puede automatizarse por completo; un sistema que decide sobre crédito o seguridad de una planta no.',
      'El umbral de confianza es el mecanismo técnico que materializa ese espectro: la mayoría de los modelos no solo producen una predicción, sino una probabilidad asociada. Fijar el punto a partir del cual el sistema actúa solo y por debajo del cual pide revisión humana es una decisión de negocio, no un parámetro técnico menor, y debe revisarse con la misma disciplina que cualquier otra política de riesgo de la organización.',
      'Esta forma de pensar —entrada, salida, ejemplos, espectro de automatización, umbral de confianza— es el hilo conductor de todo el máster: cada asignatura posterior profundiza en una técnica o un dominio distinto, pero la pregunta de fondo siempre es la misma que aquí se plantea por primera vez: qué decisión concreta cambia, con qué datos, y con qué grado de intervención humana. Dominar este marco antes de entrar en detalles técnicos evita el error más común al evaluar propuestas de IA: juzgar la tecnología por su sofisticación aparente en vez de por la calidad de la decisión que automatiza.',
    ],
    ejemplo: {
      titulo: 'Mantenimiento predictivo en una planta de la Industria 4.0',
      texto: 'Una planta instala sensores de vibración en sus motores. La propuesta "usar IA para el mantenimiento" se convierte en un proyecto real cuando se formula así: entrada, la serie temporal de vibración y temperatura de cada motor en la última semana; salida, la probabilidad de fallo en los próximos 7 días. Con umbral de confianza al 85%: por debajo, el sistema solo alerta y un técnico decide; por encima, genera automáticamente una orden de mantenimiento. El umbral se revisa cada trimestre según cuántas órdenes automáticas resultaron innecesarias.',
    },
    actividad: {
      minutos: 20,
      texto: 'Identifica tres decisiones que hoy se toman manualmente en tu organización (o una que conozcas bien) y que podrían apoyarse en IA. Para cada una, escribe en una sola línea el par entrada→salida, y clasifícala en el espectro asistir / automatizar con supervisión / automatizar por completo, justificando el coste del error en cada caso.',
    },
    preguntaReflexion: '¿Qué decisión de tu organización nunca deberías automatizar por completo, sin importar cuán preciso fuera el modelo, y por qué?',
    diagram: {
      title: 'El espectro de automatización de decisiones',
      mermaid: 'graph LR\n  A["Asistir\\nel sistema sugiere,\\nla persona decide siempre"] --> B["Automatizar con supervisión\\nel sistema decide,\\nse revisan casos de baja confianza"]\n  B --> C["Automatizar por completo\\nel sistema decide sin revisión"]\n  style A fill:#dbeafe\n  style B fill:#fef3c7\n  style C fill:#fecaca',
    },
    recursos: {
      videos: [{ titulo: 'AI, Machine Learning, Deep Learning and Generative AI Explained', canal: 'IBM Technology', url: 'https://www.youtube.com/watch?v=qYNweeDHiyU' }],
    },
    quiz: [
      {
        q: 'Un proveedor ofrece un sistema que "entiende las necesidades del cliente y decide la mejor oferta". ¿Cómo se evalúa correctamente esa propuesta?',
        opts: [
          'Es IA general, porque interpreta necesidades humanas',
          'Exigiendo que se defina la entrada exacta (datos del cliente) y la salida exacta (oferta entre un catálogo cerrado)',
          'No es IA porque no usa redes neuronales',
          'Aceptando la propuesta si el proveedor es reconocido en el mercado',
        ],
        a: 1,
        why: [
          'La IA general no existe en ningún producto comercial disponible hoy.',
          'Correcto: sin entrada y salida definidas y ejemplos históricos, la propuesta sigue siendo una intención, no un proyecto evaluable.',
          'El tipo de técnica no determina si algo es o no IA; el aprendizaje sobre ejemplos sí.',
          'La reputación del proveedor no sustituye la definición técnica del problema.',
        ],
      },
      {
        q: '¿Qué determina principalmente si una decisión debe automatizarse por completo o mantenerse con supervisión humana?',
        opts: [
          'La antigüedad de la tecnología usada',
          'El coste del error del modelo frente al coste de mantener revisión humana',
          'El tamaño del equipo de datos disponible',
          'Si el proceso ya estaba digitalizado antes',
        ],
        a: 1,
        why: [
          'La antigüedad de la técnica es irrelevante para esta decisión de negocio.',
          'Correcto: es un balance de riesgo, no una cuestión técnica.',
          'El tamaño del equipo afecta la viabilidad del proyecto, no el nivel de automatización adecuado.',
          'La digitalización previa facilita el proyecto pero no decide el nivel de automatización.',
        ],
      },
      {
        q: 'En un sistema de mantenimiento predictivo con umbral de confianza al 85%, ¿qué ocurre con una predicción de fallo con 70% de confianza?',
        opts: [
          'Se ignora automáticamente por baja confianza',
          'Genera una orden de mantenimiento automática igualmente',
          'Se registra como alerta y un técnico decide, porque está por debajo del umbral fijado',
          'El sistema se detiene hasta recalibrarse',
        ],
        a: 2,
        why: [
          'Ignorarla desperdicia información útil bajo el umbral.',
          'Automatizar por debajo del umbral fijado contradice la política de riesgo definida.',
          'Correcto: ese es exactamente el propósito de fijar un umbral de confianza.',
          'El sistema no necesita detenerse por una predicción individual de baja confianza.',
        ],
      },
    ],
    resumen: [
      'Toda propuesta de IA debe poder formularse como un par entrada→salida con ejemplos históricos disponibles; si no, es una intención, no un proyecto.',
      'La IA general no existe; toda automatización real hoy es IA estrecha, sea cual sea su sofisticación aparente.',
      'Automatizar una decisión es un espectro (asistir, supervisar, automatizar por completo), no una elección binaria.',
      'El umbral de confianza es una decisión de negocio sobre riesgo, y debe revisarse periódicamente como tal.',
    ],
    criterioFinalizacion: 'Completar la actividad (3 decisiones formuladas como entrada→salida) y responder correctamente al menos 2 de las 3 preguntas del quiz.',
  },

  {
    contenidoOficial: 'Machine Learning',
    title: 'Machine Learning: cómo aprende una máquina de sus ejemplos',
    objetivo: 'Explicar los tres paradigmas del aprendizaje automático y reconocer cuándo un problema tiene forma de aprendizaje supervisado, no supervisado o por refuerzo.',
    introduccion: 'El machine learning es la técnica que hace posible casi todo lo que en la lección anterior llamamos "automatizar una decisión". Esta lección entra en el mecanismo: cómo aprende un sistema y qué tipos de aprendizaje existen.',
    conceptosClave: [
      'Aprendizaje supervisado (etiquetas conocidas)',
      'Aprendizaje no supervisado (estructura sin etiquetas)',
      'Aprendizaje por refuerzo (recompensa por acción)',
      'Sobreajuste y generalización',
      'Conjunto de entrenamiento frente a conjunto de prueba',
    ],
    contenido: [
      'El aprendizaje supervisado es el paradigma dominante en la práctica empresarial: se le muestran al sistema muchos ejemplos ya etiquetados —una radiografía y si tiene o no fractura, un historial de compras y si el cliente abandonó o no— y el sistema ajusta una función que, dado un ejemplo nuevo sin etiqueta, produce una predicción. Cuanto mejor y más representativo es el conjunto de ejemplos, mejor generaliza el modelo a casos que nunca vio.',
      'El aprendizaje no supervisado no tiene etiquetas: el sistema recibe datos y busca estructura por sí mismo, típicamente agrupando elementos parecidos (clustering) o reduciendo la dimensionalidad de los datos para encontrar los factores que más varianza explican. Es la técnica adecuada cuando el objetivo es explorar —"¿qué segmentos naturales hay en mi base de clientes?"— y no existe todavía una etiqueta correcta que aprender.',
      'El aprendizaje por refuerzo es distinto de los dos anteriores: no hay un conjunto de ejemplos fijo, sino un agente que actúa sobre un entorno y recibe una recompensa o penalización según el resultado, ajustando su comportamiento para maximizar la recompensa acumulada a lo largo del tiempo. Es el paradigma detrás de sistemas que juegan, que optimizan rutas o que controlan procesos con retroalimentación continua; es más costoso de entrenar de forma segura que el aprendizaje supervisado, porque requiere explorar acciones cuyo resultado no se conoce de antemano.',
      'El riesgo técnico común a los tres paradigmas es el sobreajuste: un modelo que memoriza las particularidades del conjunto de entrenamiento en vez de aprender el patrón general, y que por tanto rinde muy bien en los datos que ya vio y mal en los nuevos. La defensa estándar es separar los datos disponibles en un conjunto de entrenamiento y uno de prueba que el modelo nunca ve durante el ajuste, y medir el rendimiento real sobre este último. Un modelo que "funciona perfecto" solo en los datos de entrenamiento no funciona en absoluto.',
      'Los tres paradigmas no compiten entre sí, se combinan según qué datos existen para cada parte del problema: un mismo sistema de mantenimiento predictivo puede usar aprendizaje no supervisado para agrupar tipos de fallo desconocidos, supervisado para clasificar el tipo de fallo una vez etiquetados algunos casos, y en sistemas más avanzados de control, refuerzo para ajustar la respuesta óptima ante cada tipo. Elegir el paradigma correcto para cada parte del problema, y no forzar todo a uno solo, es la habilidad práctica que distingue a un equipo de datos maduro.',
    ],
    ejemplo: {
      titulo: 'Tres paradigmas, tres preguntas de negocio',
      texto: 'Supervisado: "¿este correo es spam?", con miles de correos ya etiquetados como spam o no. No supervisado: "¿qué grupos naturales de clientes existen en nuestra base?", sin ninguna etiqueta previa de segmento. Por refuerzo: "¿qué secuencia de acciones minimiza el consumo energético de esta línea de producción?", donde el sistema prueba configuraciones y recibe una señal de consumo tras cada una.',
    },
    actividad: {
      minutos: 20,
      texto: 'Toma tres problemas reales de tu contexto (uno por paradigma) y para cada uno responde: ¿tengo ejemplos etiquetados históricos? ¿Busco estructura desconocida en los datos? ¿Hay un agente que actúa y recibe una señal de resultado tras cada acción? Justifica en una frase por qué cada problema corresponde a ese paradigma y no a otro.',
    },
    preguntaReflexion: 'Piensa en un modelo que "funcionó perfecto en las pruebas internas" y falló en producción. ¿Qué señales de sobreajuste se habrían podido detectar antes de desplegarlo?',
    diagram: {
      title: 'Los tres paradigmas de Machine Learning',
      mermaid: 'graph TD\n  D["Datos disponibles"] --> S{"¿Tienen\\netiquetas históricas?"}\n  S -->|Sí| SUP["Aprendizaje supervisado\\nentrada→salida conocida"]\n  S -->|No| NOSUP["Aprendizaje no supervisado\\ndescubrir estructura oculta"]\n  D --> REF["Aprendizaje por refuerzo\\nun agente actúa y recibe una señal tras cada acción"]',
    },
    recursos: {
      videos: [{ titulo: 'But what is a Neural Network? | Deep learning', canal: '3Blue1Brown', url: 'https://www.youtube.com/watch?v=aircAruvnKk' }],
      libros: [{ titulo: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow', autor: 'Aurélien Géron' }],
    },
    quiz: [
      {
        q: 'Un equipo quiere descubrir qué patrones de consumo existen entre sus clientes, sin tener ninguna categoría predefinida. ¿Qué paradigma corresponde?',
        opts: ['Aprendizaje supervisado', 'Aprendizaje no supervisado', 'Aprendizaje por refuerzo', 'Ninguno, requiere reglas manuales'],
        a: 1,
        why: [
          'Supervisado exige etiquetas previas, que aquí no existen.',
          'Correcto: buscar estructura sin etiquetas previas es exactamente aprendizaje no supervisado.',
          'Refuerzo requiere un agente que actúa y recibe recompensa, no es el caso aquí.',
          'El problema tiene forma de aprendizaje automático; no hace falta descartarlo a reglas manuales.',
        ],
      },
      {
        q: '¿Por qué se separa un conjunto de prueba del conjunto de entrenamiento?',
        opts: [
          'Para acelerar el entrenamiento del modelo',
          'Para medir cómo generaliza el modelo a datos que no vio, y detectar sobreajuste',
          'Porque los modelos no pueden entrenarse con todos los datos disponibles',
          'Es un requisito legal en proyectos de IA',
        ],
        a: 1,
        why: [
          'La separación no acelera el entrenamiento; incluso lo reduce al usar menos datos para ajustar.',
          'Correcto: es la única forma honesta de saber si el modelo generaliza o solo memorizó.',
          'No es una limitación técnica, es una práctica deliberada de validación.',
          'No es un requisito legal, es una práctica metodológica estándar.',
        ],
      },
      {
        q: 'Un sistema que prueba distintas configuraciones de una línea de producción y ajusta su estrategia según el consumo energético resultante de cada prueba, ¿qué paradigma usa?',
        opts: ['Supervisado', 'No supervisado', 'Por refuerzo', 'Ninguno, es control clásico sin aprendizaje'],
        a: 2,
        why: [
          'No hay ejemplos etiquetados de antemano, hay acción y consecuencia.',
          'No busca estructura oculta en datos estáticos, actúa sobre un entorno.',
          'Correcto: agente que actúa, recibe una señal de resultado y ajusta su comportamiento es la definición de aprendizaje por refuerzo.',
          'Si ajusta su estrategia a partir del resultado de sus acciones, sí hay aprendizaje, aunque se apoye en control.',
        ],
      },
    ],
    resumen: [
      'Supervisado aprende de ejemplos etiquetados; no supervisado busca estructura sin etiquetas; por refuerzo aprende de la consecuencia de sus propias acciones.',
      'La elección de paradigma depende de qué datos existen realmente, no de cuál suena más avanzado.',
      'El sobreajuste es el riesgo técnico común a los tres: un modelo que memoriza en vez de generalizar.',
      'Separar entrenamiento y prueba es la defensa estándar contra el sobreajuste, y su ausencia es una señal de alarma en cualquier proyecto.',
    ],
    criterioFinalizacion: 'Completar la actividad de los tres problemas clasificados por paradigma y responder correctamente al menos 2 de las 3 preguntas del quiz.',
  },

  {
    contenidoOficial: 'Generative AI',
    title: 'Generative AI: de predecir una etiqueta a generar contenido nuevo',
    objetivo: 'Explicar en qué se diferencia un modelo generativo de un modelo discriminativo, y qué son los modelos fundacionales.',
    introduccion: 'Todo lo visto hasta ahora —clasificar, predecir, agrupar— comparte una característica: el sistema produce una respuesta acotada dentro de un conjunto conocido de posibilidades. La IA generativa rompe ese molde: produce contenido nuevo, no una etiqueta entre opciones fijas.',
    conceptosClave: [
      'Modelo discriminativo frente a modelo generativo',
      'Modelo fundacional (foundation model)',
      'Modelo de lenguaje y predicción del siguiente token',
      'Ajuste fino (fine-tuning) frente a anclaje en datos propios (RAG)',
      'Alucinación y límites del modelo',
    ],
    contenido: [
      'Un modelo discriminativo aprende a distinguir entre categorías: dado un correo, decide spam o no spam; dada una imagen, decide qué objeto contiene. Un modelo generativo aprende, en cambio, la distribución de probabilidad completa de los datos, y puede usarla para producir ejemplos nuevos y plausibles que nunca existieron en el conjunto de entrenamiento: un párrafo de texto, una imagen, una voz sintética. La diferencia no es de grado sino de naturaleza: uno elige entre opciones, el otro construye una opción nueva.',
      'Los modelos generativos actuales más influyentes son modelos fundacionales: se entrenan una sola vez sobre cantidades masivas de datos generales, con un coste de entrenamiento enorme, y después se adaptan —sin volver a entrenarse desde cero— a tareas muy distintas mediante instrucciones (prompting), ejemplos dentro del propio mensaje, o ajuste fino sobre un conjunto de datos específico. Esa reutilización es lo que ha abaratado tan rápido el acceso a capacidades que antes exigían un equipo de investigación dedicado.',
      'Dentro de los modelos fundacionales, los modelos de lenguaje merecen mención aparte por su impacto. Su tarea de entrenamiento es, en esencia, sencilla: dado un fragmento de texto, predecir la palabra o fragmento siguiente, repetido miles de millones de veces sobre textos muy diversos. De esa tarea aparentemente mecánica emerge la capacidad de responder preguntas, resumir, traducir o escribir código, porque predecir bien el texto siguiente exige, en la práctica, haber capturado una enorme cantidad de regularidades del lenguaje y del conocimiento que contiene.',
      'Adaptar un modelo fundacional a un contexto propio tiene dos caminos principales. El ajuste fino reentrena parte del modelo sobre datos específicos de la organización, cambiando sus parámetros; es potente pero costoso y exige volver a entrenar si los datos cambian. El anclaje en datos propios —conocido como RAG, retrieval-augmented generation— deja el modelo intacto y en cambio le entrega, en cada consulta, los documentos relevantes recuperados de una base propia, para que responda con base en ellos. RAG es hoy la vía más usada en la empresa porque es más barata, más auditable y se actualiza simplemente cambiando los documentos, sin reentrenar nada. Ambos caminos conviven con un límite estructural: el modelo puede generar contenido plausible pero incorrecto —una alucinación— porque su tarea de entrenamiento nunca fue "decir la verdad", fue "continuar el texto de forma probable".',
      'Para una organización que evalúa dónde aplicar IA generativa, el criterio práctico es sencillo: cuanto mayor sea el coste de un error no detectado, más importante es exigir que la respuesta cite su fuente y sea verificable, en vez de confiar en la fluidez del texto generado como señal de corrección. Fluidez y veracidad son dos propiedades independientes de un modelo de lenguaje, y confundirlas es el error de adopción más frecuente en los primeros proyectos de IA generativa dentro de una empresa.',
    ],
    ejemplo: {
      titulo: 'RAG en un manual técnico',
      texto: 'Una planta tiene miles de páginas de manuales de mantenimiento. En vez de reentrenar un modelo de lenguaje con ese contenido (caro, y desactualizado en cuanto cambie un manual), se indexan los documentos y, cuando un técnico pregunta "¿cuál es el par de apriete del tornillo X del motor Y?", el sistema recupera el fragmento del manual correspondiente y se lo entrega al modelo como contexto para que redacte la respuesta citando la fuente. Si el manual cambia, basta con reindexarlo.',
    },
    actividad: {
      minutos: 15,
      texto: 'Elige una tarea de tu trabajo que hoy resolverías consultando un documento interno (una política, un manual, un procedimiento). Describe cómo se vería resuelta con RAG: qué documentos habría que indexar, qué pregunta harías, y qué riesgo de alucinación tendría una respuesta sin esa fuente.',
    },
    preguntaReflexion: '¿En qué situación preferirías ajuste fino sobre RAG, a pesar de su mayor coste, y por qué?',
    diagram: {
      title: 'Dos caminos para adaptar un modelo fundacional',
      mermaid: 'graph LR\n  M["Modelo fundacional\\npreentrenado"] --> AF["Ajuste fino\\nreentrena parte del modelo\\ncon datos propios"]\n  M --> RAG["RAG (anclaje en datos propios)\\nel modelo no cambia,\\nse le entregan documentos relevantes en cada consulta"]\n  AF --> R1["Más costoso, exige reentrenar si cambian los datos"]\n  RAG --> R2["Más barato, auditable, se actualiza solo cambiando documentos"]',
    },
    recursos: {
      videos: [{ titulo: 'What is Generative AI? Explained in 60 Seconds | AI for Beginners', canal: 'AI for Beginners', url: 'https://www.youtube.com/watch?v=KhpF1Y7f6-0' }],
    },
    quiz: [
      {
        q: '¿Cuál es la diferencia esencial entre un modelo discriminativo y uno generativo?',
        opts: [
          'El generativo es siempre más preciso',
          'El discriminativo elige entre categorías existentes; el generativo produce contenido nuevo',
          'El discriminativo usa redes neuronales y el generativo no',
          'No hay diferencia real, son sinónimos',
        ],
        a: 1,
        why: [
          'La precisión depende del problema, no del tipo de modelo.',
          'Correcto: uno clasifica entre opciones fijas, el otro construye una salida nueva.',
          'Ambos tipos pueden usar redes neuronales.',
          'La distinción es real y relevante para elegir la técnica adecuada.',
        ],
      },
      {
        q: '¿Qué ventaja principal tiene RAG frente al ajuste fino para responder con documentación interna?',
        opts: [
          'RAG siempre produce respuestas más creativas',
          'RAG no requiere reentrenar el modelo y se actualiza cambiando los documentos indexados',
          'RAG elimina por completo el riesgo de alucinación',
          'RAG es la única técnica compatible con modelos fundacionales',
        ],
        a: 1,
        why: [
          'La creatividad no es el objetivo de RAG, que busca precisión con fuentes.',
          'Correcto: esa es la ventaja operativa central que explica su adopción.',
          'RAG reduce el riesgo, pero no lo elimina: el modelo puede seguir generando de forma incorrecta.',
          'El ajuste fino también es compatible con modelos fundacionales.',
        ],
      },
      {
        q: 'Un modelo de lenguaje responde con seguridad una cifra que resulta ser incorrecta y no existe en ninguna fuente real. ¿Cómo se llama este fenómeno?',
        opts: ['Sobreajuste', 'Alucinación', 'Aprendizaje por refuerzo', 'Ajuste fino'],
        a: 1,
        why: [
          'El sobreajuste es un problema de generalización en entrenamiento, no de generación de contenido falso.',
          'Correcto: generar contenido plausible pero incorrecto es la alucinación característica de estos modelos.',
          'No tiene relación con el paradigma de aprendizaje por refuerzo.',
          'El ajuste fino es una técnica de adaptación, no el nombre de este fenómeno.',
        ],
      },
    ],
    resumen: [
      'Un modelo generativo produce contenido nuevo; uno discriminativo elige entre categorías ya conocidas.',
      'Los modelos fundacionales se entrenan una vez a gran escala y se adaptan después a tareas concretas sin reentrenarse desde cero.',
      'RAG ancla las respuestas del modelo en documentos propios sin reentrenarlo; el ajuste fino cambia sus parámetros.',
      'La alucinación es un límite estructural: el modelo predice texto probable, no verifica hechos.',
    ],
    criterioFinalizacion: 'Completar la actividad de RAG aplicada a un caso propio y responder correctamente al menos 2 de las 3 preguntas del quiz.',
  },

  {
    contenidoOficial: 'Ethics in AI',
    title: 'Ética en IA: sesgo, impacto social y decisión responsable',
    objetivo: 'Identificar las principales fuentes de sesgo algorítmico y aplicar un criterio de decisión responsable ante un despliegue de IA.',
    introduccion: 'Un sistema de IA no es neutral porque aprende de datos que reflejan decisiones humanas pasadas, con sus sesgos incluidos. Esta lección trata cómo aparece ese sesgo, qué otros riesgos sociales trae la IA, y cómo decidir con responsabilidad.',
    conceptosClave: [
      'Sesgo algorítmico (de datos, de medición, de despliegue)',
      'Equidad frente a exactitud agregada',
      'Ataques adversarios y robustez del modelo',
      'Impacto en el empleo y transición de roles',
      'Marco de decisión responsable',
    ],
    contenido: [
      'El sesgo algorítmico rara vez nace de una intención discriminatoria explícita en el código; nace de los datos. Si un modelo de selección de personal se entrena con las contrataciones históricas de una empresa que durante años favoreció, sin proponérselo, a un perfil concreto, el modelo aprenderá y reproducirá ese patrón, incluso si el atributo protegido —género, origen— no aparece explícitamente como variable de entrada, porque suele estar correlacionado con otras variables que sí aparecen. Eliminar la variable sensible no elimina el sesgo si sus proxies siguen presentes.',
      'La exactitud agregada de un modelo puede ocultar inequidad: un sistema con 95% de exactitud global puede acertar 99% de las veces para un grupo y 80% para otro, y ese segundo número es el que determina si el sistema es justo para esa población. Medir el rendimiento desagregado por subgrupo relevante —no solo el promedio— es una práctica mínima antes de desplegar cualquier sistema que afecte a personas.',
      'Más allá del sesgo, los sistemas de IA son vulnerables a ataques adversarios: perturbaciones diseñadas, a veces imperceptibles para un humano, que hacen que el modelo se equivoque de forma predecible y explotable. Un sistema de reconocimiento de imágenes puede clasificar mal una señal de tráfico con una pegatina cuidadosamente diseñada; un filtro de spam puede burlarse insertando ciertos caracteres. La robustez frente a estos ataques es tan parte de la seguridad de un sistema como la ciberseguridad tradicional, y crece en importancia según el sistema tiene más autonomía.',
      'El impacto en el empleo no se resume en "la IA destruye trabajos": la evidencia disponible muestra sobre todo transformación de tareas dentro de los roles existentes, con desplazamiento real en tareas rutinarias y repetitivas y creación de nuevas tareas ligadas a supervisar, auditar y mejorar los propios sistemas. La responsabilidad de una organización que automatiza no termina en el despliegue técnico: incluye anticipar qué roles cambian y cómo se acompaña esa transición. Un marco simple de decisión responsable pasa por cuatro preguntas antes de cualquier despliegue: ¿qué población se ve afectada y cómo se midió el impacto para cada subgrupo relevante?, ¿qué mecanismo de apelación o revisión humana existe si el sistema se equivoca?, ¿quién es responsable del resultado si el sistema falla?, y ¿se ha comunicado con claridad a los afectados que están interactuando con un sistema automatizado?',
      'Estas cuatro preguntas no son un trámite de cumplimiento que se responde una sola vez antes del lanzamiento: son una práctica que se repite en cada revisión periódica del sistema, porque tanto los datos de entrada como el contexto de uso cambian con el tiempo, y un sistema responsable en su despliegue inicial puede dejar de serlo si nadie vuelve a hacerse estas preguntas. La ética en IA, en la práctica, es menos una lista de principios abstractos y más una disciplina de revisión continua.',
    ],
    ejemplo: {
      titulo: 'Auditoría de un sistema de priorización de mantenimiento',
      texto: 'Un sistema que prioriza qué líneas de producción reciben mantenimiento primero podría, sin intención, penalizar sistemáticamente las líneas más antiguas —correlacionadas con plantas en regiones con menor inversión histórica— dejándolas siempre al final de la cola. Antes de desplegarlo, se mide el tiempo de espera resultante por planta, no solo el promedio global, y se fija una regla de revisión humana si una planta lleva más de dos ciclos sin ser priorizada.',
    },
    actividad: {
      minutos: 20,
      texto: 'Toma un sistema de IA (real o hipotético) relevante para tu organización. Aplica el marco de cuatro preguntas de decisión responsable: población afectada y medición desagregada, mecanismo de apelación, responsable del resultado, y comunicación a los afectados. Señala cuál de las cuatro es hoy la más débil en tu contexto.',
    },
    preguntaReflexion: '¿Puede un sistema ser "justo en promedio" y a la vez profundamente injusto? Explica con un ejemplo propio, distinto al de la lección.',
    diagram: {
      title: 'El ciclo del sesgo algorítmico',
      mermaid: 'graph LR\n  A["Datos históricos\\ncon sesgo humano previo"] --> B["Modelo entrenado\\naprende ese sesgo como patrón válido"]\n  B --> C["Predicciones sesgadas\\nen producción"]\n  C --> D["Decisiones reales afectadas\\n(crédito, contratación, etc.)"]\n  D -.->|Retroalimenta| A',
    },
    recursos: {
      videos: [{ titulo: 'What is Algorithmic Bias in AI?', canal: 'IBM Technology', url: 'https://www.youtube.com/watch?v=htcPiuxMXCM' }],
    },
    quiz: [
      {
        q: 'Un modelo de contratación no usa el género como variable, pero reproduce un sesgo de género histórico. ¿Cuál es la explicación más probable?',
        opts: [
          'El modelo tiene un error de programación',
          'El género está correlacionado con otras variables (proxies) que sí entraron al modelo',
          'Es imposible que ocurra si el género no es una variable explícita',
          'El modelo está mal entrenado y necesita más datos, sin más',
        ],
        a: 1,
        why: [
          'No es necesariamente un error de programación; puede ser un modelo funcionando "correctamente" sobre datos sesgados.',
          'Correcto: eliminar la variable sensible no elimina el sesgo si existen proxies correlacionados.',
          'Sí puede ocurrir, y es precisamente el mecanismo más común de sesgo indirecto.',
          'Más datos del mismo histórico sesgado no corrige el problema, puede incluso reforzarlo.',
        ],
      },
      {
        q: '¿Por qué no basta con mirar la exactitud agregada de un modelo para juzgar si es justo?',
        opts: [
          'Porque la exactitud agregada nunca es un buen indicador de nada',
          'Porque puede ocultar un rendimiento muy desigual entre subgrupos, aunque el promedio sea alto',
          'Porque la exactitud agregada solo aplica a modelos generativos',
          'Porque los reguladores prohíben calcularla',
        ],
        a: 1,
        why: [
          'La exactitud agregada sí es útil, pero es insuficiente por sí sola.',
          'Correcto: un promedio alto puede esconder un desempeño muy pobre en un subgrupo específico.',
          'Aplica a cualquier tipo de modelo predictivo, no solo generativos.',
          'No es una prohibición regulatoria, es una limitación estadística de la métrica.',
        ],
      },
      {
        q: 'Según el marco de decisión responsable de la lección, ¿qué pregunta debe hacerse antes de desplegar un sistema que afecta personas?',
        opts: [
          'Solo si el sistema es técnicamente preciso en promedio',
          'Solo si el proyecto se entregó a tiempo y dentro de presupuesto',
          'Quién es responsable del resultado si el sistema falla, entre otras',
          'Si el modelo usa la arquitectura más reciente disponible',
        ],
        a: 2,
        why: [
          'La precisión promedio es necesaria pero no es la única pregunta relevante.',
          'El cumplimiento de plazos y presupuesto no forma parte del marco de responsabilidad hacia los afectados.',
          'Correcto: identificar responsabilidad ante un fallo es una de las cuatro preguntas del marco.',
          'La arquitectura del modelo no es un criterio de responsabilidad hacia las personas afectadas.',
        ],
      },
    ],
    resumen: [
      'El sesgo algorítmico nace principalmente de los datos históricos, no de una intención explícita en el código.',
      'Eliminar una variable sensible no elimina el sesgo si existen proxies correlacionados con ella.',
      'La exactitud agregada puede ocultar inequidad; hay que medir por subgrupo relevante.',
      'Un marco mínimo de decisión responsable exige definir población afectada, apelación, responsable del fallo y comunicación clara.',
    ],
    criterioFinalizacion: 'Completar la actividad del marco de cuatro preguntas aplicado a un caso propio y responder correctamente al menos 2 de las 3 preguntas del quiz.',
  },

  {
    contenidoOficial: 'Casos de Uso en Diferentes Sectores',
    title: 'Casos de Uso en Diferentes Sectores',
    objetivo: 'Reconocer patrones de aplicación de IA que se repiten entre sectores distintos, más allá de los ejemplos específicos de cada industria.',
    introduccion: 'Cada sector tiene su propio vocabulario para hablar de IA, pero por debajo hay un número pequeño de patrones que se repiten. Reconocerlos es más útil que memorizar ejemplos aislados, porque permite trasladar una solución de un sector a otro.',
    conceptosClave: [
      'Patrón de mantenimiento predictivo',
      'Patrón de personalización y recomendación',
      'Patrón de detección de anomalías',
      'Patrón de optimización de procesos y recursos',
      'Transferencia de patrones entre sectores',
    ],
    contenido: [
      'El patrón de mantenimiento predictivo aparece en manufactura sobre maquinaria industrial, en energía sobre turbinas y transformadores, y en transporte sobre flotas de vehículos: en todos los casos, sensores generan series temporales que un modelo usa para predecir fallos antes de que ocurran, sustituyendo el mantenimiento por calendario fijo por uno basado en condición real. El valor no está en la industria, está en tener una señal medible que precede al fallo con suficiente antelación para actuar.',
      'El patrón de personalización y recomendación domina el comercio electrónico y el entretenimiento, pero el mismo mecanismo —predecir qué opción prefiere un usuario dado su historial y el de usuarios similares— aparece en banca (ofertas de producto), salud (planes de tratamiento ajustados) y educación (rutas de aprendizaje adaptativas). La condición para que este patrón funcione es tener suficiente historial de interacciones para que el modelo aprenda preferencias, no solo reglas generales.',
      'El patrón de detección de anomalías es central en ciberseguridad (tráfico de red inusual), en finanzas (transacciones fraudulentas) y en manufactura (piezas defectuosas en una línea de producción): el sistema aprende qué es "normal" a partir de grandes volúmenes de comportamiento habitual y señala lo que se desvía, sin necesidad de haber visto antes cada tipo específico de anomalía. Es especialmente útil cuando los casos anómalos son raros y cambiantes, por lo que enumerar reglas para cada uno no es sostenible.',
      'El patrón de optimización de procesos y recursos aparece en logística (rutas de reparto), en energía (balance de carga en una red eléctrica) y en Industria 4.0 (programación de una línea de producción con múltiples restricciones): un sistema evalúa un espacio muy grande de configuraciones posibles y propone la que minimiza un coste —tiempo, energía, desperdicio— dado un conjunto de restricciones. Cuando el número de combinaciones posibles es demasiado grande para la intuición o las reglas humanas, este patrón suele aportar más valor que los tres anteriores.',
      'Reconocer estos cuatro patrones cambia la forma de evaluar una propuesta de IA: en vez de preguntar "¿qué hace esto en mi sector?", conviene preguntar "¿a cuál de estos patrones se parece, y qué organización de otro sector ya lo resolvió?". La mayoría de los proyectos de IA con más retorno no inventan un patrón nuevo, adaptan uno ya probado en otra industria a datos y restricciones propias.',
      'En el contexto específico de la Industria 4.0 —el eje de este máster— los cuatro patrones conviven casi siempre en la misma planta: mantenimiento predictivo sobre la maquinaria, detección de anomalías en la calidad del producto, optimización de la programación de producción y, cada vez más, personalización cuando la planta fabrica a medida del pedido. Reconocer que son cuatro instancias del mismo puñado de patrones ayuda a priorizar: conviene empezar por el que tenga datos históricos ya disponibles y un coste de error bajo, no por el que suene más innovador.',
    ],
    ejemplo: {
      titulo: 'El mismo patrón, dos sectores',
      texto: 'Detección de anomalías: un banco lo usa para marcar transacciones con tarjeta que se desvían del patrón habitual del titular. Una planta de manufactura usa exactamente el mismo patrón técnico —aprender el comportamiento normal y señalar desviaciones— para detectar piezas defectuosas en una línea de inspección visual automatizada. El algoritmo subyacente puede ser prácticamente el mismo; lo que cambia es el dato de entrada y el coste de un falso positivo.',
    },
    actividad: {
      minutos: 20,
      texto: 'Elige dos sectores distintos al tuyo (por ejemplo salud y logística) y para cada uno de los cuatro patrones (mantenimiento predictivo, personalización, detección de anomalías, optimización) escribe un ejemplo concreto de ese sector. Después identifica cuál de los cuatro patrones es más aplicable a tu propio contexto y por qué.',
    },
    preguntaReflexion: '¿Qué patrón de los cuatro está hoy menos explotado en tu sector, y qué dato haría falta para empezar a aplicarlo?',
    diagram: {
      title: 'Un mismo patrón, distintos sectores',
      mermaid: 'graph TD\n  P["Patrón: predecir un evento futuro\\na partir de datos históricos"] --> S1["Salud: riesgo de reingreso hospitalario"]\n  P --> S2["Finanzas: probabilidad de impago"]\n  P --> S3["Manufactura: falla de un equipo"]\n  P --> S4["Retail: quiebre de inventario"]',
    },
    quiz: [
      {
        q: '¿Qué tienen en común el mantenimiento predictivo en manufactura y en energía?',
        opts: [
          'Usan exactamente el mismo software comercial',
          'Ambos predicen un fallo a partir de una señal medible que lo precede en el tiempo',
          'Ambos requieren intervención humana constante',
          'No tienen nada en común, son problemas distintos',
        ],
        a: 1,
        why: [
          'El software puede ser distinto; el patrón técnico es lo que se comparte.',
          'Correcto: esa es la esencia del patrón, independiente del sector.',
          'El objetivo del patrón es reducir precisamente la necesidad de intervención constante.',
          'Comparten el mismo patrón subyacente aunque el dominio sea distinto.',
        ],
      },
      {
        q: '¿Cuándo aporta más valor el patrón de optimización de procesos frente a reglas fijas diseñadas por humanos?',
        opts: [
          'Siempre, en cualquier proceso por simple que sea',
          'Cuando el número de configuraciones posibles es demasiado grande para evaluarlas por intuición',
          'Solo en procesos que ya estaban optimizados manualmente',
          'Nunca, las reglas humanas son siempre más fiables',
        ],
        a: 1,
        why: [
          'En procesos simples, reglas fijas pueden ser suficientes y más baratas.',
          'Correcto: ese es exactamente el escenario donde el patrón de optimización aporta más.',
          'No depende de que ya existiera optimización manual previa.',
          'En espacios de combinaciones muy grandes, las reglas humanas suelen quedarse cortas.',
        ],
      },
      {
        q: 'Un equipo pregunta "¿qué hace la IA en nuestro sector?" en vez de "¿a qué patrón se parece nuestro problema?". ¿Qué riesgo tiene ese enfoque?',
        opts: [
          'Ninguno, es la forma correcta de empezar',
          'Puede llevar a reinventar soluciones que ya existen y están probadas en otros sectores',
          'Hace el proyecto más rápido siempre',
          'Es obligatorio legalmente empezar así',
        ],
        a: 1,
        why: [
          'Ese enfoque limita el aprendizaje de soluciones ya validadas en otros contextos.',
          'Correcto: pensar por patrón, no por sector, permite reutilizar soluciones probadas.',
          'No necesariamente acelera el proyecto; puede ralentizarlo al partir de cero.',
          'No existe tal obligación legal.',
        ],
      },
    ],
    resumen: [
      'Un número pequeño de patrones —mantenimiento predictivo, personalización, detección de anomalías, optimización— explica la mayoría de los casos de uso de IA en cualquier sector.',
      'El mismo patrón técnico puede resolver problemas de sectores muy distintos con solo cambiar el dato de entrada.',
      'Preguntar "a qué patrón se parece" es más productivo que preguntar "qué hace esto en mi sector".',
      'La optimización de procesos aporta más valor cuando el espacio de configuraciones es demasiado grande para la intuición humana.',
    ],
    criterioFinalizacion: 'Completar la actividad de los cuatro patrones en dos sectores distintos y responder correctamente al menos 2 de las 3 preguntas del quiz.',
  },

  {
    contenidoOficial: 'Plataformas de Software',
    title: 'Plataformas de Software para construir con IA',
    objetivo: 'Ubicar las principales categorías de plataformas de software para IA y los criterios para elegir entre ellas.',
    introduccion: 'Un proyecto de IA no se construye desde cero: se apoya en un ecosistema de plataformas que cubren desde experimentar con un modelo hasta ponerlo en producción y vigilarlo. Esta lección cierra la asignatura con un mapa de ese ecosistema.',
    conceptosClave: [
      'Entornos de experimentación (notebooks)',
      'Plataformas de nube con servicios de IA gestionados',
      'Repositorios de modelos preentrenados',
      'Acceso a modelos por API frente a modelo propio',
      'Plataformas de MLOps para producción y monitoreo',
    ],
    contenido: [
      'La primera categoría son los entornos de experimentación, típicamente notebooks —Jupyter, o su versión en la nube como Google Colab— que permiten escribir y ejecutar código por celdas, ver resultados intermedios y iterar rápido sobre datos y modelos antes de construir nada productivo. Son el punto de partida casi universal de cualquier equipo de datos, precisamente porque priorizan la velocidad de exploración sobre la robustez de producción.',
      'La segunda categoría son las plataformas de nube con servicios de IA gestionados —Amazon Web Services, Microsoft Azure, Google Cloud, entre otras— que ofrecen desde cómputo bruto para entrenar modelos propios hasta servicios ya entrenados y listos por API (visión, voz, traducción) que evitan construir un modelo desde cero para tareas comunes. La asignatura X de este máster profundiza en esta categoría; aquí basta con saber que existe y que suele ser el punto de entrada más rápido para una organización sin equipo de investigación propio.',
      'La tercera categoría son los repositorios de modelos preentrenados, con Hugging Face como referencia más conocida: miles de modelos ya entrenados por la comunidad o por empresas, listos para descargarse y ajustarse (fine-tuning) o usarse directamente, lo que evita repetir un entrenamiento que puede costar millones de dólares si ya existe un modelo con licencia adecuada para la tarea.',
      'La cuarta decisión, transversal a las anteriores, es si acceder a un modelo por API de un proveedor —pagar por uso, sin gestionar infraestructura, pero con los datos saliendo hacia un tercero y dependencia de su disponibilidad y precios— o alojar un modelo propio, con más control y privacidad de datos, pero con el coste y la complejidad de operarlo. No es una decisión técnica pura: involucra criterios de coste, privacidad regulatoria del sector y madurez del equipo interno.',
      'Por último, cuando un modelo pasa de experimento a producción entran en juego las plataformas de MLOps, que gestionan el ciclo de vida completo: versionado de datos y modelos, despliegue controlado, monitoreo de si el rendimiento del modelo se degrada con el tiempo (deriva de datos) y reentrenamiento cuando corresponde. Un modelo desplegado sin monitoreo es una decisión automatizada que nadie está vigilando, y es el error operativo más común en proyectos que sí superaron con éxito la fase de experimentación.',
      'Ninguna de estas plataformas sustituye el criterio desarrollado en las cinco lecciones anteriores: elegir la plataforma correcta es la última decisión de un proyecto de IA, no la primera. Empezar por "qué plataforma usamos" antes que por "qué decisión queremos automatizar y con qué datos" es la forma más común de gastar presupuesto en herramientas sin resolver ningún problema real, y cierra el círculo de esta asignatura con la misma disciplina con la que empezó en la primera lección.',
    ],
    ejemplo: {
      titulo: 'De la idea al despliegue en cuatro plataformas',
      texto: 'Un equipo explora un caso de clasificación de tickets de soporte en un notebook (experimentación). Encuentra en Hugging Face un modelo de lenguaje preentrenado en español que ajusta con sus propios tickets etiquetados (repositorio de modelos). Lo despliega usando los servicios gestionados de su proveedor de nube habitual (plataforma de nube) y configura alertas que avisan si la exactitud del modelo cae por debajo de un umbral en producción (MLOps).',
    },
    actividad: {
      minutos: 15,
      texto: 'Para un caso de IA que te interese, decide en qué categoría de plataforma empezarías (experimentación, nube gestionada, modelo preentrenado, o API de terceros) y justifica la elección considerando coste, privacidad de datos y madurez de tu equipo.',
    },
    preguntaReflexion: '¿En qué caso preferirías alojar un modelo propio en vez de usar la API de un proveedor externo, a pesar del coste adicional?',
    diagram: {
      title: 'Niveles de abstracción para construir con IA',
      mermaid: 'graph BT\n  A["Infraestructura básica\\n(máquinas virtuales, GPU)"] --> B["Servicio gestionado de ML\\n(entrenar y desplegar modelo propio)"]\n  B --> C["API de IA preentrenada\\n(consumir directamente, sin entrenar)"]\n  A -.->|más control, más esfuerzo| Z1[" "]\n  C -.->|menos esfuerzo, menos control| Z2[" "]',
    },
    quiz: [
      {
        q: '¿Cuál es la ventaja principal de partir de un modelo del repositorio de Hugging Face en vez de entrenar uno desde cero?',
        opts: [
          'Siempre es gratuito sin ninguna condición',
          'Evita repetir un entrenamiento que puede costar mucho más que ajustar uno ya existente',
          'Elimina por completo la necesidad de datos propios',
          'Garantiza mejor precisión que cualquier modelo propio',
        ],
        a: 1,
        why: [
          'Muchos modelos tienen licencias con condiciones; no todo es gratuito sin restricciones.',
          'Correcto: reutilizar y ajustar es normalmente mucho más barato que entrenar desde cero.',
          'El ajuste fino sigue requiriendo datos propios relevantes para la tarea.',
          'La precisión depende de la tarea y los datos, no está garantizada por el origen del modelo.',
        ],
      },
      {
        q: '¿Qué riesgo describe mejor la ausencia de MLOps en un modelo ya desplegado?',
        opts: [
          'Ninguno, una vez desplegado el modelo funciona igual para siempre',
          'Que el rendimiento se degrade con el tiempo sin que nadie lo detecte (deriva de datos)',
          'Que el modelo deje de ser generativo',
          'Que el coste de la nube aumente automáticamente',
        ],
        a: 1,
        why: [
          'Los datos del mundo real cambian, y el rendimiento del modelo puede degradarse con ellos.',
          'Correcto: sin monitoreo, esa degradación pasa desapercibida hasta que causa un problema visible.',
          'El tipo de modelo (generativo o no) no cambia por falta de monitoreo.',
          'El coste de la nube no depende directamente de tener o no MLOps.',
        ],
      },
      {
        q: '¿Qué factor NO debería ser el único criterio para elegir entre API de terceros y modelo propio alojado internamente?',
        opts: [
          'La privacidad regulatoria de los datos del sector',
          'La madurez del equipo interno para operar infraestructura',
          'Cuál de las dos opciones es más popular en redes sociales',
          'El coste total esperado a mediano plazo',
        ],
        a: 2,
        why: [
          'La privacidad regulatoria es un criterio legítimo y a menudo decisivo.',
          'La madurez del equipo es un criterio operativo válido.',
          'Correcto: la popularidad en redes sociales no es un criterio técnico ni de negocio válido para esta decisión.',
          'El coste a mediano plazo es un criterio central y legítimo.',
        ],
      },
    ],
    resumen: [
      'El ecosistema de plataformas cubre desde la experimentación (notebooks) hasta la producción vigilada (MLOps), pasando por nube gestionada y repositorios de modelos.',
      'Elegir entre API de terceros y modelo propio es una decisión de coste, privacidad y madurez del equipo, no solo técnica.',
      'Reutilizar un modelo preentrenado suele ser mucho más barato que entrenar uno desde cero.',
      'Un modelo en producción sin monitoreo es un riesgo operativo, no una tarea terminada.',
    ],
    criterioFinalizacion: 'Completar la actividad de elección de plataforma justificada y responder correctamente al menos 2 de las 3 preguntas del quiz.',
  },
]

// Examen de la asignatura: 10 preguntas de opción múltiple cubriendo las 6 lecciones.
// Mismo formato que los exámenes de unidad ya usados en las aulas (q/opts/a/why),
// que CourseView y QuizView ya saben renderizar y puntuar sin cambios de código.
const examen = [
  {
    q: 'Un proveedor propone "una IA que entiende al cliente y decide lo mejor para él". ¿Qué falta para convertir eso en un proyecto evaluable?',
    opts: ['Un presupuesto mayor', 'Definir la entrada y la salida exactas, con ejemplos históricos de esa correspondencia', 'Contratar más ingenieros', 'Nada, ya es un proyecto viable'],
    a: 1,
    why: [
      'El presupuesto no resuelve la falta de definición del problema.',
      'Correcto: sin entrada, salida y ejemplos históricos, sigue siendo una intención.',
      'Más personas no ayuda si el problema no está bien planteado.',
      'Tal como está formulado, sigue siendo una intención, no un proyecto.',
    ],
  },
  {
    q: '¿Qué determina si una decisión automatizada por IA debería mantenerse con supervisión humana?',
    opts: ['El tamaño de la empresa', 'El coste del error frente al coste de mantener revisión humana', 'La antigüedad del sistema', 'El número de usuarios del sistema'],
    a: 1,
    why: [
      'El tamaño de la empresa no determina el nivel de riesgo de una decisión concreta.',
      'Correcto: es un balance de riesgo, no una característica de la organización.',
      'La antigüedad del sistema no es relevante para esta decisión.',
      'El número de usuarios no determina por sí solo el nivel de riesgo del error.',
    ],
  },
  {
    q: 'Un sistema aprende a agrupar clientes en segmentos sin que existan categorías previas. ¿Qué paradigma de machine learning es?',
    opts: ['Supervisado', 'No supervisado', 'Por refuerzo', 'Generativo'],
    a: 1,
    why: [
      'Supervisado requiere etiquetas previas, que aquí no existen.',
      'Correcto: buscar estructura sin etiquetas es aprendizaje no supervisado.',
      'No hay un agente que actúe y reciba recompensa en este caso.',
      'Generativo no es un paradigma de aprendizaje, es un tipo de modelo.',
    ],
  },
  {
    q: '¿Para qué sirve separar un conjunto de prueba del conjunto de entrenamiento?',
    opts: ['Para entrenar más rápido', 'Para medir si el modelo generaliza o solo memorizó (detectar sobreajuste)', 'Es un trámite legal obligatorio', 'Para reducir el coste de almacenamiento'],
    a: 1,
    why: [
      'Usar menos datos para entrenar no acelera el proceso de forma relevante.',
      'Correcto: es la forma estándar de detectar sobreajuste.',
      'No existe tal obligación legal.',
      'No es una práctica orientada a reducir almacenamiento.',
    ],
  },
  {
    q: '¿Qué distingue a un modelo generativo de uno discriminativo?',
    opts: ['El generativo elige entre categorías fijas', 'El generativo produce contenido nuevo; el discriminativo elige entre categorías existentes', 'No hay diferencia real', 'El discriminativo siempre es más grande'],
    a: 1,
    why: [
      'Eso describe al modelo discriminativo, no al generativo.',
      'Correcto: esa es la distinción esencial entre ambos tipos.',
      'La distinción es real y determina qué técnica usar según el problema.',
      'El tamaño del modelo no está determinado por ser discriminativo o generativo.',
    ],
  },
  {
    q: '¿Qué ventaja aporta RAG (anclaje en datos propios) frente al ajuste fino de un modelo de lenguaje?',
    opts: ['Es siempre más creativo', 'No requiere reentrenar el modelo; se actualiza cambiando los documentos indexados', 'Elimina cualquier posibilidad de alucinación', 'Es la única técnica compatible con modelos fundacionales'],
    a: 1,
    why: [
      'La creatividad no es el criterio relevante para elegir RAG.',
      'Correcto: esa es la ventaja operativa principal de RAG.',
      'RAG reduce pero no elimina el riesgo de alucinación.',
      'El ajuste fino también es compatible con modelos fundacionales.',
    ],
  },
  {
    q: 'Un modelo de selección de personal no usa el género como variable pero reproduce sesgo de género histórico. ¿Por qué puede ocurrir esto?',
    opts: ['Es imposible, no puede ocurrir', 'El género está correlacionado con otras variables (proxies) que sí entraron al modelo', 'El modelo tiene un virus', 'Solo ocurre con modelos generativos'],
    a: 1,
    why: [
      'Sí puede ocurrir, y es un mecanismo de sesgo bien documentado.',
      'Correcto: los proxies correlacionados con la variable sensible reproducen el sesgo aunque esta no se use directamente.',
      'No tiene relación con seguridad informática ni virus.',
      'Puede ocurrir en cualquier tipo de modelo predictivo, no solo generativos.',
    ],
  },
  {
    q: '¿Por qué la exactitud agregada de un modelo puede ser engañosa al evaluar su equidad?',
    opts: ['Porque nunca es un número fiable', 'Porque puede ocultar un rendimiento muy desigual entre subgrupos', 'Porque solo aplica a modelos no supervisados', 'Porque los reguladores la prohíben'],
    a: 1,
    why: [
      'Es un número fiable, pero insuficiente por sí solo.',
      'Correcto: un promedio alto puede esconder inequidad entre subgrupos.',
      'Aplica a cualquier modelo predictivo evaluado por desempeño.',
      'No existe tal prohibición regulatoria.',
    ],
  },
  {
    q: '¿Qué patrón de caso de uso comparten la detección de fraude bancario y la inspección visual de piezas defectuosas en una fábrica?',
    opts: ['Personalización y recomendación', 'Detección de anomalías', 'Optimización de rutas', 'Generación de contenido'],
    a: 1,
    why: [
      'Personalización predice preferencias, no es el caso aquí.',
      'Correcto: ambos aprenden qué es "normal" y señalan desviaciones, el mismo patrón técnico.',
      'La optimización de rutas no aplica a estos dos ejemplos.',
      'Ninguno de los dos genera contenido nuevo, ambos clasifican/detectan.',
    ],
  },
  {
    q: 'Un equipo despliega un modelo en producción sin ningún proceso de monitoreo posterior. ¿Qué riesgo principal corre?',
    opts: ['Ninguno, un modelo desplegado funciona igual para siempre', 'Que su rendimiento se degrade con el tiempo (deriva de datos) sin que nadie lo note', 'Que deje de ser un modelo de IA', 'Que el proveedor de nube lo elimine automáticamente'],
    a: 1,
    why: [
      'Los datos del mundo real cambian, y el modelo puede dejar de rendir bien sin monitoreo que lo detecte.',
      'Correcto: la deriva de datos no detectada es el riesgo operativo central de no monitorear.',
      'El modelo no deja de ser IA por falta de monitoreo.',
      'Los proveedores de nube no eliminan modelos automáticamente por falta de monitoreo.',
    ],
  },
]

module.exports = { lecciones, examen }

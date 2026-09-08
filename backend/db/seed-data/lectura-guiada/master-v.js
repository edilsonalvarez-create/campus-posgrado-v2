// Lectura guiada — Asignatura V: Ética y regulaciones en el uso de la IA.
// Panel de refuerzo de términos por lección (WS-7). Fuentes: los recursos
// curados de la asignatura (AI Act, NIST AI RMF, ISO 42001/23894, Ley 1581,
// CONPES de IA, Fairlearn, Weapons of Math Destruction).

const F = {
  aiact: { titulo: 'Reglamento Europeo de IA (AI Act) — explorador de artículos', url: 'https://artificialintelligenceact.eu/' },
  nist: { titulo: 'NIST AI Risk Management Framework (AI RMF 1.0)', url: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  iso42001: { titulo: 'ISO/IEC 42001:2023 — Sistema de gestión de IA', url: 'https://www.iso.org/standard/81230.html' },
  iso23894: { titulo: 'ISO/IEC 23894 — Gestión del riesgo en IA', url: 'https://www.iso.org/standard/77304.html' },
  ley1581: { titulo: 'Ley 1581 de 2012 — Protección de datos personales (Colombia)', url: 'https://www.sic.gov.co/tema/proteccion-de-datos-personales' },
  conpes: { titulo: 'Política nacional de IA — documento CONPES vigente (DNP)', url: 'https://www.dnp.gov.co/' },
  fairlearn: { titulo: 'Fairlearn — medición y mitigación de sesgo', url: 'https://fairlearn.org/' },
  oneil: { titulo: 'Weapons of Math Destruction — Cathy O’Neil' },
};

module.exports = {
  'Introducción a la Inteligencia Artificial': {
    objetivo:
      'Fijar por qué la IA necesita gobernanza propia y no basta con la gobernanza de datos: cuatro rasgos la hacen distinta.',
    terminos: [
      {
        n: 1,
        termino: 'Opacidad del proceso de decisión (caja negra)',
        definicionTextual:
          'Un sistema es opaco cuando quien lo usa no puede reconstruir, en términos comprensibles, por qué produjo una salida concreta para una entrada concreta.',
        fuente: 'NIST AI RMF 1.0 (función "Map")',
        idea: [
          'La opacidad no es solo un problema técnico: impide la revisión, la apelación y la mejora. Si nadie sabe por qué el modelo negó algo, nadie puede corregirlo cuando se equivoca de forma sistemática.',
        ],
        ejemplo:
          'Un banco rechaza un crédito y el analista solo puede decir "el sistema lo denegó". La persona afectada no tiene un motivo que pueda rebatir.',
        errorComun:
          'Confundir "el modelo es preciso" con "el modelo es entendible". Un modelo puede acertar mucho y aun así ser una caja negra que no se puede auditar.',
        fraseClave: 'Si no puedes explicar la decisión, no puedes gobernarla.',
      },
      {
        n: 2,
        termino: 'Escala del impacto de una sola decisión de diseño',
        definicionTextual:
          'Una elección de diseño en un sistema de IA (una variable, un umbral, un criterio de entrenamiento) se aplica de forma idéntica a todas las personas que pasan por el sistema.',
        fuente: 'NIST AI RMF 1.0',
        idea: [
          'Un empleado que se equivoca afecta a un caso. Un modelo mal calibrado afecta a millones con el mismo error, a la vez y sin que nadie lo note hasta que el daño es grande.',
        ],
        ejemplo:
          'Un criterio de puntuación que penaliza sin querer a un grupo se aplica a cada solicitud, todos los días, hasta que alguien lo detecta.',
        errorComun: 'Tratar un sesgo del modelo como "casos aislados" cuando es una propiedad del sistema que se repite en cada ejecución.',
        fraseClave: 'El error humano es un incidente; el error del modelo es una política.',
      },
      {
        n: 3,
        termino: 'Adaptabilidad del sistema tras su despliegue',
        definicionTextual:
          'Muchos sistemas de IA cambian su comportamiento después de puestos en producción, porque los datos de entrada evolucionan o porque se reentrenan.',
        fuente: 'ISO/IEC 23894 (gestión del riesgo a lo largo del ciclo de vida)',
        idea: [
          'Un sistema aprobado hoy puede no ser el mismo dentro de seis meses. La gobernanza no puede ser una foto en el lanzamiento; tiene que ser una revisión periódica.',
        ],
        ejemplo:
          'Un detector de fraude se reentrena cada mes; sin control, puede ir desplazando su umbral y empezar a bloquear clientes legítimos.',
        errorComun: 'Aprobar el sistema una vez y archivar el expediente, como si fuera un producto físico que no cambia.',
        fraseClave: 'Lo que apruebas hoy no es lo que operará mañana.',
      },
      {
        n: 4,
        termino: 'Asimetría de información entre quien decide y quien es afectado',
        definicionTextual:
          'La organización que despliega el sistema conoce sus datos, su lógica y sus límites; la persona afectada normalmente no sabe ni que hubo un sistema de por medio.',
        fuente: 'Weapons of Math Destruction (O’Neil)',
        idea: [
          'Esa asimetría es la razón de las obligaciones de transparencia: informar de que hay una decisión automatizada y dar una vía de revisión humana.',
        ],
        ejemplo: 'Un candidato descartado por un cribado automático nunca sabe que su CV no llegó a manos de una persona.',
        errorComun: 'Suponer que "si preguntan, se lo explicamos" es suficiente. La mayoría no sabe que hay algo que preguntar.',
        fraseClave: 'El que no sabe que fue evaluado no puede defenderse.',
      },
      {
        n: 5,
        termino: 'Regulación basada en riesgo, no en tecnología',
        definicionTextual:
          'El marco regulatorio no clasifica por la técnica usada (red neuronal, árbol, reglas) sino por el nivel de riesgo del uso concreto para las personas y sus derechos.',
        fuente: F.aiact.titulo,
        idea: [
          'Esto significa que un modelo sencillo en un uso crítico puede tener más obligaciones que un modelo sofisticado en un uso trivial. La pregunta es "¿para qué se usa?", no "¿cómo está hecho?".',
        ],
        ejemplo:
          'Un filtro de spam (riesgo mínimo) y un sistema de triaje sanitario (alto riesgo) pueden usar la misma técnica y tener obligaciones completamente distintas.',
        errorComun: 'Pensar que "usamos algo básico, no nos aplica la norma". Aplica por el uso, no por la complejidad.',
        fraseClave: 'La norma pregunta para qué, no con qué.',
      },
    ],
    casoCompleto: {
      escenario:
        'Tu organización quiere desplegar un modelo que prioriza qué solicitudes de soporte se atienden primero.',
      pasos: [
        { titulo: 'Opacidad', texto: 'Exige que el modelo pueda explicar por qué una solicitud quedó al final de la cola.' },
        { titulo: 'Escala', texto: 'Un criterio mal elegido retrasa sistemáticamente a un tipo de cliente; mídelo por subgrupo.' },
        { titulo: 'Adaptabilidad', texto: 'Programa una revisión trimestral: los patrones de solicitud cambian.' },
        { titulo: 'Asimetría', texto: 'Informa al cliente de que hay una priorización automática y ofrece una vía de escalado humano.' },
        { titulo: 'Riesgo', texto: 'Clasifica el uso: si un retraso puede causar daño real, es alto riesgo y acarrea obligaciones reforzadas.' },
      ],
    },
    preguntas: [
      {
        q: 'Un área dice: "nuestro modelo es una regresión lineal simple, la normativa de IA no nos aplica". ¿Es correcto?',
        opts: [
          'Sí, la normativa solo aplica a redes neuronales.',
          'No: la regulación se basa en el riesgo del uso, no en la técnica; una regresión en un uso de alto riesgo tiene las mismas obligaciones.',
          'Sí, si el modelo tiene menos de 100 parámetros.',
          'No se puede saber sin ver el código.',
        ],
        a: 1,
        why: 'El enfoque regulatorio es por riesgo del uso: una técnica simple en un uso crítico está plenamente sujeta a las obligaciones.',
      },
      {
        q: '¿Por qué no basta con la gobernanza de datos que ya tiene la organización?',
        opts: [
          'Porque la de datos es más cara.',
          'Porque la IA añade riesgos que la de datos no cubre: opacidad de la decisión, escala del impacto, deriva tras el despliegue y asimetría con el afectado.',
          'Porque la gobernanza de datos está prohibida para IA.',
          'Sí basta, no hace falta nada más.',
        ],
        a: 1,
        why: 'La gobernanza de datos es la base, pero la IA introduce cuatro riesgos propios que exigen controles adicionales.',
      },
    ],
    fuentes: [F.nist, F.iso23894, F.aiact, F.oneil],
  },

  'Regulación jurídica de la IA': {
    objetivo: 'Distinguir los niveles de riesgo regulatorio y qué obligación acarrea cada uno, sin memorizar números de artículo.',
    terminos: [
      {
        n: 1,
        termino: 'Riesgo inaceptable (prohibido)',
        definicionTextual:
          'Usos de IA que se consideran incompatibles con derechos fundamentales y quedan prohibidos, con independencia de las salvaguardas que se propongan.',
        fuente: F.aiact.titulo,
        idea: ['No es "muy regulado": es "no se puede". Por ejemplo, ciertos sistemas de puntuación social o de manipulación del comportamiento.'],
        ejemplo: 'Un sistema que explota vulnerabilidades de un colectivo para inducir decisiones en su perjuicio.',
        errorComun: 'Creer que con suficiente documentación cualquier uso se puede autorizar. Los usos prohibidos no se rescatan con papeleo.',
        fraseClave: 'Prohibido es prohibido, no "difícil".',
      },
      {
        n: 2,
        termino: 'Alto riesgo (obligaciones estrictas)',
        definicionTextual:
          'Usos que pueden afectar de forma significativa la seguridad o los derechos de las personas (empleo, crédito, servicios esenciales, justicia, sanidad).',
        fuente: F.aiact.titulo,
        idea: [
          'Acarrea: gestión de riesgos documentada, datos de calidad, documentación técnica, registro de actividad, supervisión humana significativa y evaluación de conformidad antes del despliegue.',
        ],
        ejemplo: 'Un modelo que decide la elegibilidad para una prestación pública.',
        errorComun: 'Subestimar el alcance: "solo recomienda, no decide". Si la recomendación se sigue casi siempre, en la práctica decide.',
        fraseClave: 'Alto riesgo = expediente completo antes de encender el sistema.',
      },
      {
        n: 3,
        termino: 'Riesgo limitado (obligaciones de transparencia)',
        definicionTextual:
          'Usos donde el principal riesgo es que la persona no sepa que interactúa con una IA o con contenido generado.',
        fuente: F.aiact.titulo,
        idea: ['La obligación central es informar: "estás hablando con un asistente automático", "esta imagen fue generada por IA".'],
        ejemplo: 'Un chatbot de atención debe dejar claro que no es una persona.',
        errorComun: 'Esconder la naturaleza automática "para que la experiencia sea más natural". La transparencia es obligatoria, no opcional.',
        fraseClave: 'Si es una IA, dilo.',
      },
      {
        n: 4,
        termino: 'Riesgo mínimo (sin obligaciones específicas)',
        definicionTextual: 'Usos sin impacto relevante sobre derechos o seguridad, como filtros de spam o recomendadores de productos triviales.',
        fuente: F.aiact.titulo,
        idea: ['No están exentos de la ley general (protección de datos, consumo), pero no acarrean obligaciones adicionales por ser IA.'],
        ejemplo: 'Un sistema que ordena los correos por probabilidad de spam.',
        errorComun: 'Asumir que todo lo interno es riesgo mínimo. El nivel lo da el impacto sobre las personas, no si es interno o externo.',
        fraseClave: 'Mínimo por impacto, no por ubicación.',
      },
      {
        n: 5,
        termino: 'Regulación horizontal frente a sectorial',
        definicionTextual:
          'Horizontal: una norma general que aplica a la IA en cualquier sector. Sectorial: normas específicas de un ámbito (sanidad, finanzas, transporte) que se suman.',
        fuente: F.nist.titulo,
        idea: ['Un sistema de IA en un hospital cumple a la vez la norma horizontal de IA y la normativa sanitaria y de datos de salud. Se acumulan, no se sustituyen.'],
        ejemplo: 'Un modelo de apoyo al diagnóstico: norma de IA + regulación de producto sanitario + protección de datos de salud.',
        errorComun: 'Pensar que cumplir la norma de IA exime de la sectorial, o viceversa.',
        fraseClave: 'Las capas de regulación se suman.',
      },
    ],
    casoCompleto: {
      escenario: 'Vas a clasificar tres sistemas de IA de tu organización por nivel de riesgo.',
      pasos: [
        { titulo: 'Chatbot de soporte', texto: 'Riesgo limitado: obligación de informar que es automático.' },
        { titulo: 'Modelo de scoring para aprobar anticipos a empleados', texto: 'Alto riesgo: afecta acceso a un beneficio; expediente completo y supervisión humana.' },
        { titulo: 'Recomendador de artículos del blog interno', texto: 'Riesgo mínimo: sin obligaciones adicionales por IA.' },
      ],
    },
    preguntas: [
      {
        q: 'Un modelo "solo recomienda" a un evaluador humano a quién contratar, pero el evaluador sigue la recomendación el 95% de las veces. ¿Nivel de riesgo?',
        opts: [
          'Mínimo, porque hay un humano.',
          'Alto riesgo: si la recomendación se sigue casi siempre, en la práctica decide sobre el acceso al empleo, y la supervisión humana no es "significativa".',
          'Limitado: basta con avisar al candidato.',
          'Inaceptable, queda prohibido.',
        ],
        a: 1,
        why: 'La supervisión humana debe ser real; un humano que ratifica el 95% de las veces no ejerce control efectivo, y el uso (empleo) es de alto riesgo.',
      },
      {
        q: '¿Qué implica que la regulación de IA sea "horizontal"?',
        opts: [
          'Que sustituye a toda otra normativa del sector.',
          'Que aplica a la IA en cualquier sector, y se suma a las normas sectoriales y de datos que ya existan.',
          'Que solo aplica en la Unión Europea.',
          'Que solo aplica a modelos de lenguaje.',
        ],
        a: 1,
        why: 'Horizontal significa transversal a sectores; no exime del cumplimiento sectorial ni de la protección de datos.',
      },
    ],
    fuentes: [F.aiact, F.nist, F.ley1581, F.conpes],
  },

  'Consideraciones éticas en el uso de la IA': {
    objetivo: 'Convertir principios éticos en prácticas verificables: la diferencia entre "queremos ser justos" y "así lo medimos".',
    terminos: [
      {
        n: 1,
        termino: 'Principio frente a práctica verificable',
        definicionTextual: 'Un principio es una declaración de valor ("la IA debe ser justa"); una práctica verificable es un procedimiento con un resultado que se puede comprobar.',
        fuente: F.nist.titulo,
        idea: ['El trabajo de gobernanza consiste en traducir cada principio a un control con evidencia: qué se mide, con qué frecuencia, quién revisa y qué se hace si falla.'],
        ejemplo: 'Principio: "transparencia". Práctica: "todo modelo en producción tiene una ficha pública con su propósito, sus datos y sus límites, revisada cada 6 meses".',
        errorComun: 'Publicar un decálogo de principios y considerarlo hecho. Sin controles, un principio no cambia nada.',
        fraseClave: 'Un principio sin control es un cartel.',
      },
      {
        n: 2,
        termino: 'Equidad operacionalizada (métrica concreta, no aspiración)',
        definicionTextual: 'Definir la equidad como una o varias métricas medibles para el caso concreto, con un umbral de diferencia aceptable entre grupos.',
        fuente: F.fairlearn.titulo,
        idea: ['No existe "la" métrica de equidad universal; hay que elegir cuál importa aquí (igualdad de oportunidades, de tasa de error, de selección) y justificar la elección.'],
        ejemplo: 'Para un modelo de cribado: "la diferencia en tasa de falsos rechazos entre grupos no debe superar 5 puntos; se mide cada mes con Fairlearn".',
        errorComun: 'Decir "el modelo es justo porque no usa la variable protegida". Los proxies reintroducen el sesgo; hay que medir el resultado.',
        fraseClave: 'Equidad que no se mide es equidad que no existe.',
      },
      {
        n: 3,
        termino: 'Transparencia hacia el usuario frente a explicabilidad técnica',
        definicionTextual:
          'Transparencia hacia el usuario: informar de que hay una decisión automatizada y de sus efectos. Explicabilidad técnica: poder reconstruir por qué el modelo produjo una salida.',
        fuente: F.aiact.titulo,
        idea: ['Son necesidades distintas y para públicos distintos: una es para la persona afectada, la otra para el auditor o el ingeniero.'],
        ejemplo: 'Al cliente: "tu solicitud fue evaluada por un sistema automático; puedes pedir revisión humana". Al auditor: el informe SHAP de las variables que más pesaron.',
        errorComun: 'Dar al usuario un informe técnico ilegible y llamarlo "transparencia".',
        fraseClave: 'Al afectado, el qué y el cómo apelar; al auditor, el porqué.',
      },
      {
        n: 4,
        termino: 'Responsabilidad asignada a una persona o rol específico',
        definicionTextual: 'Para cada sistema de IA, hay un rol nombrado que responde de su funcionamiento, sus riesgos y sus decisiones de despliegue.',
        fuente: F.iso42001.titulo,
        idea: ['"Responsabilidad de todos" es responsabilidad de nadie. La gobernanza exige un dueño concreto por sistema, con autoridad para pararlo.'],
        ejemplo: 'El inventario de sistemas de IA incluye una columna "responsable" con un nombre y un rol, no "el área de tecnología".',
        errorComun: 'Difuminar la responsabilidad entre el proveedor, el integrador y el usuario final hasta que nadie responde.',
        fraseClave: 'Cada sistema, un dueño con nombre.',
      },
      {
        n: 5,
        termino: 'Ética como proceso continuo, no como checklist único',
        definicionTextual: 'La evaluación ética se repite a lo largo del ciclo de vida del sistema, no se hace una vez antes del lanzamiento.',
        fuente: F.iso23894.titulo,
        idea: ['Los datos cambian, el contexto de uso cambia y aparecen efectos no previstos; la revisión periódica es parte del control, no un extra.'],
        ejemplo: 'Revisión semestral obligatoria: métricas de equidad, incidencias reportadas, cambios en el uso y en la población.',
        errorComun: 'Cerrar la evaluación ética con el "visto bueno" del comité y no volver a mirarla.',
        fraseClave: 'La ética se audita, no se firma y se archiva.',
      },
    ],
    casoCompleto: {
      escenario: 'Tienes que convertir el principio "nuestra IA será equitativa" en algo auditable para un modelo de cribado de currículos.',
      pasos: [
        { titulo: 'Elegir métrica', texto: 'Igualdad de tasa de falsos rechazos entre grupos, porque el daño es descartar a alguien válido.' },
        { titulo: 'Fijar umbral', texto: 'Diferencia máxima de 5 puntos porcentuales.' },
        { titulo: 'Instrumentar', texto: 'Medición mensual con Fairlearn sobre las decisiones reales.' },
        { titulo: 'Asignar dueño', texto: 'El responsable del sistema revisa el informe y tiene autoridad para pausar el modelo.' },
        { titulo: 'Repetir', texto: 'Revisión completa cada 6 meses, no solo el número mensual.' },
      ],
    },
    preguntas: [
      {
        q: 'Un equipo afirma que su modelo "es justo porque eliminamos el género y la edad de las variables de entrada". ¿Qué objeción aplica?',
        opts: [
          'Ninguna, es la forma correcta.',
          'Quitar las variables directas no elimina el sesgo si hay proxies (universidad, código postal, aficiones); la equidad se comprueba midiendo el resultado por subgrupo.',
          'Habría que eliminar también el nombre del archivo.',
          'El modelo debería ser más grande.',
        ],
        a: 1,
        why: 'El sesgo se cuela por variables correlacionadas; la única forma de saber si el modelo es equitativo es medir sus resultados por grupo.',
      },
      {
        q: 'Diferencia entre transparencia hacia el usuario y explicabilidad técnica:',
        opts: [
          'Son sinónimos.',
          'Transparencia: informar al afectado de que hubo decisión automática y cómo pedir revisión. Explicabilidad: poder reconstruir técnicamente por qué el modelo dio esa salida.',
          'La primera es para ingenieros y la segunda para clientes.',
          'La explicabilidad solo aplica a redes neuronales.',
        ],
        a: 1,
        why: 'Son necesidades para públicos distintos: la persona afectada necesita el "qué y cómo apelar"; el auditor necesita el "porqué".',
      },
    ],
    fuentes: [F.nist, F.fairlearn, F.iso42001, F.aiact],
  },

  'Principales Retos y desafíos en el uso de IA': {
    objetivo: 'Reconocer los obstáculos organizacionales —no técnicos— que hacen fracasar la gobernanza de IA.',
    terminos: [
      {
        n: 1,
        termino: 'Brecha de talento en gobernanza de IA (no solo técnico)',
        definicionTextual: 'La escasez no es solo de ingenieros de ML, sino de perfiles que entienden a la vez la técnica, el riesgo, el marco legal y el negocio.',
        fuente: F.nist.titulo,
        idea: ['Gobernar IA exige un perfil híbrido; contratar solo data scientists deja la gobernanza sin quien la haga.'],
        ejemplo: 'El modelo lo construye el equipo técnico, pero nadie sabe traducir sus riesgos a controles ISO ni a obligaciones del AI Act.',
        errorComun: 'Asumir que el equipo de datos "también hará la gobernanza" en su tiempo libre.',
        fraseClave: 'El cuello de botella es el perfil puente, no el algoritmo.',
      },
      {
        n: 2,
        termino: 'Tensión entre velocidad de innovación y rigor de cumplimiento',
        definicionTextual: 'La presión por desplegar rápido choca con el tiempo que exige documentar riesgos, validar datos y obtener aprobaciones.',
        fuente: F.iso42001.titulo,
        idea: ['Si el proceso de gobernanza es un cuello de botella opaco, los equipos lo rodean. La solución es un proceso proporcional al riesgo y predecible en plazos.'],
        ejemplo: 'Un uso de riesgo mínimo no debería pasar por la misma revisión de 6 semanas que uno de alto riesgo.',
        errorComun: 'Aplicar el mismo nivel de control a todo, lo que hace que se incumpla en todo.',
        fraseClave: 'Control proporcional o control esquivado.',
      },
      {
        n: 3,
        termino: 'Cadena de responsabilidad en sistemas con proveedores externos',
        definicionTextual: 'Cuando el modelo viene de un tercero, la responsabilidad se reparte entre quien lo entrenó, quien lo integró y quien lo usa, y hay que asignarla por contrato y por rol.',
        fuente: F.iso23894.titulo,
        idea: ['El proveedor responde de las propiedades del modelo; la organización responde de la idoneidad para su uso y de la supervisión. Ninguno responde "de todo".'],
        ejemplo: 'Un API de terceros para análisis de sentimiento: el proveedor responde de su rendimiento general; tú, de haber validado que sirve para tu caso y tu idioma.',
        errorComun: '"Es del proveedor, que responda él" — la responsabilidad del uso no es transferible.',
        fraseClave: 'La responsabilidad del uso se queda en casa.',
      },
      {
        n: 4,
        termino: 'Fatiga de cumplimiento (compliance fatigue)',
        definicionTextual: 'La saturación de un equipo que gestiona varios marcos solapados (datos, seguridad, IA), que lleva a cumplir de forma mecánica o a saltarse pasos.',
        fuente: F.iso42001.titulo,
        idea: ['Se mitiga integrando marcos: un solo inventario de sistemas, controles comunes reutilizados, una sola cadencia de revisión.'],
        ejemplo: 'En vez de tres registros de riesgos (datos, seguridad, IA), un registro único con etiquetas por marco.',
        errorComun: 'Añadir el marco de IA como un silo más encima de los existentes.',
        fraseClave: 'Integra los marcos o los ignorarán todos.',
      },
      {
        n: 5,
        termino: 'Desafío de mantener el proceso vivo tras el primer despliegue',
        definicionTextual: 'El esfuerzo de gobernanza suele concentrarse en el lanzamiento y decae después, justo cuando el sistema empieza a derivar.',
        fuente: F.iso23894.titulo,
        idea: ['La revisión periódica tiene que estar calendarizada y con dueño; si depende de que "alguien se acuerde", no ocurre.'],
        ejemplo: 'Recordatorio automático trimestral al responsable de cada sistema para revisar métricas e incidencias.',
        errorComun: 'Celebrar el lanzamiento y desmontar el equipo de gobernanza.',
        fraseClave: 'El día después del despliegue empieza el trabajo, no termina.',
      },
    ],
    casoCompleto: {
      escenario: 'Tu organización despliega su primer modelo con un proveedor externo y un equipo de datos pequeño.',
      pasos: [
        { titulo: 'Talento', texto: 'Designa un rol puente (aunque sea parcial) que conecte técnica, legal y negocio.' },
        { titulo: 'Proporcionalidad', texto: 'Define una vía rápida para riesgo mínimo y una completa para alto riesgo.' },
        { titulo: 'Proveedor', texto: 'Fija por contrato qué responde el proveedor; documenta tu validación del uso.' },
        { titulo: 'Integración', texto: 'Un único registro de riesgos con etiquetas de marco.' },
        { titulo: 'Continuidad', texto: 'Revisión trimestral calendarizada con recordatorio automático y dueño nombrado.' },
      ],
    },
    preguntas: [
      {
        q: 'El equipo de datos rodea sistemáticamente el proceso de gobernanza. ¿Cuál es la respuesta más eficaz?',
        opts: [
          'Sancionar a quien lo rodee.',
          'Rediseñar el proceso para que sea proporcional al riesgo y predecible en plazos, de modo que cumplirlo cueste menos que esquivarlo.',
          'Eliminar la gobernanza.',
          'Aplicar el control máximo a todo para que aprendan.',
        ],
        a: 1,
        why: 'Un proceso opaco y uniforme se esquiva; uno proporcional y predecible se cumple.',
      },
      {
        q: 'Un modelo de un proveedor externo produce un resultado discriminatorio. ¿Quién responde?',
        opts: [
          'Solo el proveedor, siempre.',
          'La responsabilidad se reparte: el proveedor por las propiedades del modelo, y tu organización por haber validado su idoneidad para el uso y por la supervisión; hay que tenerlo asignado por contrato y rol.',
          'Solo tu organización, siempre.',
          'Nadie, porque es un tercero.',
        ],
        a: 1,
        why: 'La responsabilidad del uso no es transferible; se asigna explícitamente entre proveedor e integrador.',
      },
    ],
    fuentes: [F.nist, F.iso42001, F.iso23894],
  },

  'Inteligencia Artificial aplicada para la detección y prevención de riesgos': {
    objetivo: 'Entender la detección de riesgo como un problema de detección de anomalías con costes asimétricos, y el peligro de sobre-confiar en el detector.',
    terminos: [
      {
        n: 1,
        termino: 'Detección de riesgo como patrón de detección de anomalías',
        definicionTextual: 'Muchos problemas de riesgo (fraude, incumplimiento, fallo) son casos raros dentro de un flujo mayoritariamente normal; el modelo aprende lo "normal" y marca lo que se desvía.',
        fuente: F.nist.titulo,
        idea: ['Como los positivos son escasos, la exactitud global es una métrica engañosa: un modelo que nunca marca nada acierta casi siempre.'],
        ejemplo: 'De 100 000 transacciones, 50 son fraude; "todo legítimo" acierta el 99,95% y no sirve de nada.',
        errorComun: 'Presentar "99% de exactitud" como un logro en un problema con 1% de positivos.',
        fraseClave: 'En lo raro, la exactitud miente.',
      },
      {
        n: 2,
        termino: 'Riesgo financiero, operacional y reputacional',
        definicionTextual: 'Tres dimensiones del daño: pérdida económica directa (financiero), interrupción de procesos (operacional) y pérdida de confianza pública (reputacional).',
        fuente: F.iso23894.titulo,
        idea: ['Un mismo incidente golpea las tres a distinta velocidad: el financiero es inmediato, el reputacional puede tardar y durar años.'],
        ejemplo: 'Una brecha de datos: multa (financiero), sistemas caídos (operacional), clientes que se van (reputacional).',
        errorComun: 'Medir solo la pérdida económica directa y dar por cerrado el análisis de impacto.',
        fraseClave: 'El daño tiene tres relojes.',
      },
      {
        n: 3,
        termino: 'Falsos positivos frente a falsos negativos en detección de riesgo',
        definicionTextual: 'Falso positivo: marcar como riesgo algo que no lo era (coste: trabajo perdido, fricción con el cliente). Falso negativo: no detectar un riesgo real (coste: el daño completo).',
        fuente: F.nist.titulo,
        idea: ['Casi nunca cuestan lo mismo. El umbral del modelo se calibra según esa asimetría y según cuántas alertas puede investigar el equipo.'],
        ejemplo: 'En fraude grave, un falso negativo puede costar millones; un falso positivo, 15 minutos de un analista. El umbral debe favorecer la sensibilidad.',
        errorComun: 'Optimizar el modelo para "minimizar el error total" como si ambos errores pesaran igual.',
        fraseClave: 'Calibra por el coste del error, no por su cantidad.',
      },
      {
        n: 4,
        termino: 'Sistemas de alerta temprana',
        definicionTextual: 'Mecanismos que detectan señales débiles de un riesgo emergente antes de que se materialice, dando margen para actuar.',
        fuente: F.iso23894.titulo,
        idea: ['Su valor está en el tiempo que ganan; su riesgo, en la fatiga de alertas si generan más de las que el equipo puede atender.'],
        ejemplo: 'Un indicador que sube dos semanas antes de que un proceso falle, si alguien lo mira.',
        errorComun: 'Montar el sistema de alerta y no definir quién actúa sobre cada alerta ni en qué plazo.',
        fraseClave: 'Una alerta sin dueño es ruido.',
      },
      {
        n: 5,
        termino: 'El riesgo de sobre-confiar en el propio sistema de detección',
        definicionTextual: 'Cuando el equipo empieza a tratar "lo que el modelo no marcó" como "seguro", los falsos negativos dejan de tener cualquier control humano.',
        fuente: F.oneil.titulo,
        idea: ['El detector reduce la carga, no la elimina. Hace falta muestreo aleatorio de lo no marcado y vigilancia de la deriva del modelo.'],
        ejemplo: 'Un equipo aprueba automáticamente el 98% que el modelo no marca; el fraude que el modelo no ve ya no lo revisa nadie.',
        errorComun: 'Interpretar "el modelo no lo marcó" como "está limpio".',
        fraseClave: 'Lo que el modelo no ve, alguien tiene que seguir mirándolo.',
      },
    ],
    casoCompleto: {
      escenario: 'Despliegas un detector de operaciones anómalas. El modelo marca 200 al día; el equipo puede revisar 40.',
      pasos: [
        { titulo: 'Métrica', texto: 'No mires la exactitud; mira sensibilidad y precisión sobre los casos raros.' },
        { titulo: 'Asimetría', texto: 'Un falso negativo cuesta mucho más que un falso positivo: favorece la sensibilidad hasta el límite de las 40 revisiones.' },
        { titulo: 'Priorización', texto: 'Ordena las 200 por riesgo esperado; las 40 investigadas son las 40 de mayor riesgo.' },
        { titulo: 'Cola no atendida', texto: 'Documenta qué se hace con las 160 restantes: reglas dedicadas + muestreo aleatorio.' },
        { titulo: 'Sobre-confianza', texto: 'Muestrea también lo que el modelo NO marcó, para no perder de vista los falsos negativos.' },
      ],
    },
    preguntas: [
      {
        q: 'Un detector de fraude reporta 99,7% de exactitud. El fraude es el 0,3% de las operaciones. ¿Qué concluyes?',
        opts: [
          'Es un modelo excelente.',
          'La cifra es engañosa: "no marcar nada" ya alcanza el 99,7%. Hay que evaluar por sensibilidad, precisión y el coste de cada tipo de error.',
          'Hay que subir la exactitud al 100%.',
          'El modelo usa demasiadas variables.',
        ],
        a: 1,
        why: 'Con clases muy desbalanceadas la exactitud no informa; lo relevante es cuánto fraude real detecta y a qué coste de falsos positivos.',
      },
      {
        q: 'El equipo empieza a aprobar automáticamente todo lo que el detector no marca. ¿Qué riesgo se introduce?',
        opts: [
          'Ninguno, es más eficiente.',
          'Sobre-confianza: los falsos negativos dejan de tener revisión humana; hay que mantener muestreo aleatorio de lo no marcado y vigilar la deriva del modelo.',
          'El modelo consumirá más CPU.',
          'El 0,3% marcado es demasiado alto.',
        ],
        a: 1,
        why: 'El detector reduce la carga pero no elimina el error; confiar ciegamente en "lo no marcado" quita la última red de seguridad.',
      },
    ],
    fuentes: [F.nist, F.iso23894, F.oneil, F.fairlearn],
  },

  'Modelo de Gobernanza de la IA. Big Data, Blockchain y otras tecnologías disruptivas': {
    objetivo: 'Armar el modelo de gobernanza que el entregable de la asignatura pide: comité, inventario, trazabilidad y revisión periódica, apoyado en el SGSI existente.',
    terminos: [
      {
        n: 1,
        termino: 'Comité de gobernanza multidisciplinar',
        definicionTextual: 'Un órgano con representación de técnica, legal, seguridad, negocio y —según el caso— ética o riesgo, que aprueba los despliegues de IA y revisa los incidentes.',
        fuente: F.iso42001.titulo,
        idea: ['Su valor es que ninguna decisión de despliegue de alto riesgo depende de una sola función; su riesgo es convertirse en un trámite lento y opaco.'],
        ejemplo: 'El comité revisa cada nuevo sistema de alto riesgo antes de producción y da un veredicto con condiciones.',
        errorComun: 'Un comité que solo se reúne para el lanzamiento y nunca revisa lo ya desplegado.',
        fraseClave: 'Decide en comité lo que afecta a muchos.',
      },
      {
        n: 2,
        termino: 'Inventario de sistemas y su nivel de riesgo',
        definicionTextual: 'Un registro vivo de todos los sistemas de IA en uso o en desarrollo, con su propósito, sus datos, su responsable y su nivel de riesgo asignado.',
        fuente: F.iso42001.titulo,
        idea: ['Es el punto de partida de toda la gobernanza: no puedes gobernar lo que no sabes que tienes. Incluye los modelos "informales" (una macro con reglas, un servicio de terceros).'],
        ejemplo: 'Una hoja de cálculo o base de datos con una fila por sistema y columnas: propósito, datos, responsable, nivel de riesgo, última revisión.',
        errorComun: 'Inventariar solo los proyectos oficiales de ML y dejar fuera los sistemas de reglas o las APIs de terceros.',
        fraseClave: 'Lo que no está en el inventario no está gobernado.',
      },
      {
        n: 3,
        termino: 'Gobernanza de datos como base de la gobernanza de IA',
        definicionTextual: 'Un modelo solo es tan bueno y tan auditable como los datos con que se entrena y se alimenta; la calidad, el linaje y los permisos de esos datos son prerequisito de la gobernanza de IA.',
        fuente: F.ley1581.titulo,
        idea: ['Si no sabes de dónde vienen los datos de entrenamiento ni si había base legal para usarlos, no puedes defender el modelo.'],
        ejemplo: 'Antes de aprobar un modelo, se verifica el linaje de su dataset y la base de tratamiento de los datos personales que contiene.',
        errorComun: 'Auditar el modelo y no auditar sus datos.',
        fraseClave: 'La gobernanza de IA empieza en el dato.',
      },
      {
        n: 4,
        termino: 'Trazabilidad end-to-end (dato → modelo → decisión → auditoría)',
        definicionTextual: 'Poder reconstruir, para una decisión concreta, qué datos entraron, qué versión del modelo la produjo, qué salida dio y quién la revisó.',
        fuente: F.iso23894.titulo,
        idea: ['Es lo que permite responder una reclamación, una auditoría o un incidente. Requiere registro de versiones del modelo y registro de actividad de las decisiones.'],
        ejemplo: 'Ante una queja: "esta decisión, del 3 de marzo, la produjo la versión 2.4 del modelo con estos datos de entrada; la revisó Ana el mismo día".',
        errorComun: 'Guardar solo el resultado final y no la versión del modelo ni las entradas.',
        fraseClave: 'Si no puedes reconstruir la decisión, no puedes defenderla.',
      },
      {
        n: 5,
        termino: 'Revisión periódica frente a aprobación única',
        definicionTextual: 'La gobernanza no termina con el "sí" del comité: cada sistema se revisa en un calendario fijo (métricas, incidencias, cambios de uso y de población).',
        fuente: F.iso42001.titulo,
        idea: ['La revisión periódica es un control, con dueño y fecha; sin ella, la aprobación inicial pierde validez a medida que el sistema deriva.'],
        ejemplo: 'Revisión semestral obligatoria de cada sistema de alto riesgo; el responsable presenta métricas al comité.',
        errorComun: 'Tratar la aprobación del comité como un permiso permanente.',
        fraseClave: 'La aprobación caduca; la revisión la renueva.',
      },
    ],
    casoCompleto: {
      escenario:
        'Tienes que redactar el anexo de gobernanza de IA para el SGSI ISO 27001 de tu organización (el entregable de esta asignatura).',
      pasos: [
        { titulo: 'Comité', texto: 'Define su composición, qué aprueba y con qué cadencia se reúne.' },
        { titulo: 'Inventario', texto: 'Crea el registro de sistemas con propósito, datos, responsable y nivel de riesgo; incluye los informales.' },
        { titulo: 'Datos', texto: 'Enlaza cada sistema con el linaje y la base legal de sus datos, apoyándote en la gobernanza de datos existente.' },
        { titulo: 'Trazabilidad', texto: 'Exige registro de versiones del modelo y log de decisiones para los sistemas de alto riesgo.' },
        { titulo: 'Mapeo 42001↔Anexo A', texto: 'Tabla de correspondencia con las brechas concretas y qué controles añadir al SGSI.' },
        { titulo: 'Revisión', texto: 'Calendario de revisión periódica por sistema, con dueño y recordatorio.' },
      ],
    },
    preguntas: [
      {
        q: 'Antes de aprobar un modelo, el comité solo revisa las métricas de rendimiento del modelo. ¿Qué falta según el modelo de gobernanza?',
        opts: [
          'Nada, el rendimiento es lo único que importa.',
          'Verificar el linaje y la base legal de los datos de entrenamiento, asignar un responsable, exigir trazabilidad de las decisiones y fijar la revisión periódica.',
          'Comprobar el color de los gráficos del informe.',
          'Pedir que el modelo sea más grande.',
        ],
        a: 1,
        why: 'La gobernanza cubre datos, responsabilidad, trazabilidad y continuidad, no solo el rendimiento puntual del modelo.',
      },
      {
        q: '¿Por qué la aprobación del comité no puede ser permanente?',
        opts: [
          'Porque el comité cambia de miembros.',
          'Porque el sistema deriva (datos, uso y población cambian) y aparecen efectos no previstos; la revisión periódica es un control con dueño y fecha que renueva la validez de la aprobación.',
          'Porque lo prohíbe la ley de sociedades.',
          'Sí puede ser permanente si el modelo no se reentrena.',
        ],
        a: 1,
        why: 'Aunque no se reentrene, el entorno de uso cambia; por eso la gobernanza exige revisión calendarizada, no una aprobación única.',
      },
    ],
    fuentes: [F.iso42001, F.iso23894, F.ley1581, F.nist],
  },
};

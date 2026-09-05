// Contenido propio de la aula "Made With ML" (recrea el temario público del
// curso de MLOps de Goku Mohandas). Ver aula-enterprise-design-thinking.js
// para el patrón general.

module.exports = {
  units: [
    {
      n: 'Unidad 1',
      title: 'Diseño del sistema',
      hours: 4,
      lessons: [
        {
          title: 'Del producto al problema de aprendizaje',
          mins: 22,
          body: [
            'El error más caro en un proyecto de machine learning no ocurre durante el entrenamiento: ocurre antes, cuando se traduce mal una necesidad de producto a un problema de aprendizaje. "Queremos reducir las devoluciones" es una necesidad de producto; no es todavía un problema que un modelo pueda resolver. Traducirla exige decidir qué predecirá exactamente el modelo, con qué información disponible en el momento de la predicción, y qué acción concreta se tomará con esa predicción.',
            'Esta traducción tiene una restricción que se pasa por alto con frecuencia: la información usada para predecir debe estar disponible en el momento real de la predicción, no solo en los datos históricos de entrenamiento. Un modelo que predice devoluciones usando "si el cliente contactó a soporte después de la compra" es inútil en producción si esa señal solo se conoce después del hecho que se quiere predecir — es una fuga de información hacia el futuro, un problema que reaparece constantemente en proyectos que funcionan bien en el entrenamiento y fallan en producción.',
            'La segunda decisión —qué acción se toma con la predicción— determina en la práctica si el proyecto vale la pena antes de escribir una sola línea de código de modelado. Si predecir una devolución probable no cambia ninguna acción (no se ajusta el empaque, no se contacta al cliente, no se ofrece una alternativa), el modelo más preciso del mundo no genera ningún valor. Made With ML insiste en este punto como punto de partida obligatorio: definir la acción antes que la métrica de modelo.',
            'Con la acción y las señales disponibles decididas, recién entonces tiene sentido elegir la formulación técnica: ¿es clasificación binaria, regresión, ranking? Esa elección técnica, que suele consumir la mayor parte del entusiasmo inicial de un equipo, es en realidad la decisión más fácil de las tres, y la última que debería tomarse.',
          ],
          diagram: {
            title: 'De la necesidad de producto al problema de aprendizaje',
            mermaid: 'graph LR\n  A["Necesidad de producto:\\nreducir devoluciones"] --> B["¿Qué acción se toma\\ncon la predicción?"]\n  B --> C["¿Qué señales existen\\nen el momento real?"]\n  C --> D["Formulación técnica\\n(clasificación / regresión / ranking)"]',
          },
          example: { title: 'La fuga de información al revés', text: 'Un equipo entrena un modelo que predice con 94% de precisión si un pedido será devuelto, usando entre las variables "el cliente abrió un ticket de soporte". En producción, ese ticket casi siempre se abre después de decidir devolver el producto, no antes. El modelo funcionaba en el entrenamiento porque esa variable ya "sabía" la respuesta.' },
          keys: [
            'Una necesidad de producto no es todavía un problema de aprendizaje: falta decidir qué se predice, con qué señales y qué acción se toma con la predicción.',
            'La información usada para predecir debe estar disponible en el momento real de la predicción, no solo en los datos históricos — lo contrario es fuga de información.',
            'Si la predicción no cambia ninguna acción concreta, el modelo no genera valor sin importar su precisión.',
            'La formulación técnica (clasificación, regresión, ranking) es la decisión más fácil de las tres y debería tomarse al final, no al principio.',
          ],
          recursos: {
            libros: [
              { titulo: 'Designing Machine Learning Systems', autor: 'Chip Huyen' },
            ],
            videos: [
              { titulo: 'Made With ML — Learning How to Apply MLOps with Goku Mohandas', canal: 'Anyscale', url: 'https://www.youtube.com/watch?v=QlSI_JLYiBQ' },
            ],
          },
          exercise: { mins: 15, text: 'Toma una necesidad de producto real de tu organización expresada en lenguaje de negocio. Identifica: (1) qué acción concreta se tomaría con una predicción, (2) qué señales estarían realmente disponibles en el momento de predecir, (3) recién entonces, qué formulación técnica encajaría.' },
          quiz: [
            { q: '¿Por qué "queremos reducir las devoluciones" no es todavía un problema de aprendizaje?', opts: ['Porque las devoluciones no se pueden predecir nunca', 'Porque falta decidir qué se predice exactamente, con qué señales y qué acción se toma con la predicción', 'Porque requiere demasiados datos históricos', 'Porque solo aplica a comercio electrónico'], a: 1, why: ['Sí se pueden predecir en muchos casos.', 'Correcto.', 'No es un problema de volumen de datos.', 'El principio aplica a cualquier dominio, no solo comercio electrónico.'] },
            { q: '¿Qué es la "fuga de información" descrita en la lección?', opts: ['Un problema de seguridad de datos personales', 'Usar en el entrenamiento una señal que en producción no está disponible en el momento real de predecir', 'Compartir datos con un proveedor externo', 'Un error de tipeo en el conjunto de datos'], a: 1, why: ['No se refiere a seguridad de datos personales en este contexto.', 'Correcto.', 'No se refiere a compartir datos con terceros.', 'No es un error tipográfico.'] },
            { q: '¿Por qué la formulación técnica (clasificación, regresión, ranking) debería decidirse al final?', opts: ['Porque es la decisión más difícil de las tres', 'Porque es la más fácil de las tres, y las otras dos (acción y señales disponibles) determinan si el proyecto vale la pena', 'Porque la ley lo exige', 'Porque siempre debe ser clasificación binaria'], a: 1, why: ['Es la más fácil, no la más difícil, según la lección.', 'Correcto.', 'No hay tal exigencia legal.', 'No siempre debe ser clasificación binaria; depende del problema.'] },
          ],
        },
        {
          title: 'Datos, etiquetado y exploración',
          mins: 25,
          body: [
            'Una vez definido el problema, la calidad del proyecto depende más de los datos que del algoritmo elegido — una afirmación que suena a lugar común hasta que se experimenta la diferencia real entre un conjunto de datos bien etiquetado y uno etiquetado con prisa. El etiquetado no es una tarea administrativa que se delega sin supervisión: son las instrucciones de etiquetado, escritas con la misma precisión que un contrato, las que determinan qué aprenderá el modelo.',
            'Instrucciones de etiquetado ambiguas producen etiquetas inconsistentes entre distintos anotadores, y un modelo entrenado sobre etiquetas inconsistentes aprende, en el mejor de los casos, una versión promediada y borrosa del criterio real, y en el peor, un patrón que no corresponde a nada útil. Medir el acuerdo entre anotadores sobre una misma muestra —qué tan seguido coinciden dos personas etiquetando el mismo caso— es una práctica barata que revela este problema antes de haber etiquetado todo el conjunto de datos, no después.',
            'La exploración de datos que sigue al etiquetado tiene un propósito más específico que "conocer los datos": buscar activamente las formas en que la distribución real difiere de lo que el equipo asume. Clases desbalanceadas, valores atípicos, correlaciones espurias entre variables y la fecha de recolección, huecos temporales o geográficos en la cobertura — cada uno de estos hallazgos cambia decisiones posteriores de modelado que, si no se detectan aquí, se manifiestan más tarde como errores de producción difíciles de diagnosticar.',
            'Una práctica que distingue a los equipos maduros es explorar los datos ya divididos en los conjuntos que se usarán después (entrenamiento, validación, prueba) y no solo el conjunto completo: una clase rara puede estar bien representada en el conjunto completo pero prácticamente ausente en el conjunto de prueba, lo que hace que la evaluación del modelo sobre esa clase sea, en la práctica, ruido estadístico disfrazado de métrica confiable.',
          ],
          keys: [
            'Las instrucciones de etiquetado, escritas con precisión, determinan qué aprende realmente el modelo; la ambigüedad produce inconsistencia entre anotadores.',
            'Medir el acuerdo entre anotadores sobre una misma muestra revela problemas de etiquetado antes de etiquetar todo el conjunto, no después.',
            'La exploración de datos busca activamente diferencias entre la distribución real y lo que el equipo asume: desbalance, atípicos, correlaciones espurias, huecos de cobertura.',
            'Explorar los datos ya divididos en entrenamiento/validación/prueba revela si una clase rara quedó mal representada en algún conjunto, algo invisible al mirar solo el conjunto completo.',
          ],
          diagram: {
            title: 'De instrucciones ambiguas a datos inconsistentes',
            mermaid: 'graph LR\n  I["Instrucción ambigua"] --> A1["Anotador 1: positiva"]\n  I --> A2["Anotador 2: negativa"]\n  A1 --> M["Modelo aprende\\nun criterio inconsistente"]\n  A2 --> M',
          },
          example: { title: 'Instrucciones ambiguas, etiquetas inconsistentes', text: 'Dos anotadores etiquetan reseñas de producto como "positiva" o "negativa". Ante "el envío tardó pero el producto es excelente", uno la marca positiva (por el producto) y otro negativa (por el envío). Sin una instrucción explícita sobre qué pesa más, el modelo aprenderá una mezcla inconsistente de ambos criterios sin que nadie lo haya decidido a propósito.' },
          exercise: { mins: 20, text: 'Escribe las instrucciones de etiquetado para una tarea de clasificación de tu contexto (dos o tres frases). Dáselas a otra persona sin más contexto y pídele que etiquete cinco ejemplos ambiguos. Compara sus etiquetas con las tuyas: donde discrepen, esa es la ambigüedad real de tu instrucción.' },
          quiz: [
            { q: '¿Qué determina, según la lección, qué aprenderá realmente el modelo?', opts: ['Únicamente el algoritmo elegido', 'La precisión de las instrucciones de etiquetado, tanto como los datos mismos', 'El tamaño del equipo de anotadores', 'El lenguaje de programación usado'], a: 1, why: ['El algoritmo importa, pero no es lo único determinante según esta lección.', 'Correcto.', 'El tamaño del equipo no es el factor determinante.', 'El lenguaje de programación es irrelevante para esto.'] },
            { q: '¿Para qué sirve medir el acuerdo entre anotadores sobre una misma muestra?', opts: ['Para despedir a los anotadores menos productivos', 'Para revelar problemas de ambigüedad en las instrucciones antes de etiquetar todo el conjunto', 'Para acelerar el proceso de etiquetado', 'Para cumplir un requisito administrativo sin valor técnico'], a: 1, why: ['No es una herramienta de evaluación de desempeño individual.', 'Correcto.', 'No necesariamente lo acelera, lo hace más confiable.', 'Sí tiene valor técnico real, no es solo administrativo.'] },
            { q: '¿Por qué conviene explorar los datos ya divididos en entrenamiento/validación/prueba, no solo el conjunto completo?', opts: ['Porque es más rápido de hacer', 'Porque una clase rara puede quedar mal representada en algún conjunto específico, aunque esté bien representada en el conjunto completo', 'Porque la ley exige explorar cada conjunto por separado', 'Porque el conjunto completo nunca contiene errores'], a: 1, why: ['No es una cuestión de velocidad.', 'Correcto.', 'No existe tal exigencia legal.', 'El conjunto completo puede contener errores igual que cualquier otro.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Qué falta para convertir una necesidad de producto en un problema de aprendizaje?', opts: ['Solo elegir el algoritmo', 'Decidir qué se predice, con qué señales disponibles y qué acción se toma con la predicción', 'Contratar más ingenieros', 'Aumentar el presupuesto de cómputo'], a: 1, why: ['El algoritmo es la decisión menos importante de las tres.', 'Correcto.', 'No es un problema de personal.', 'No es un problema de presupuesto de cómputo.'] },
        { q: '¿Qué es la fuga de información hacia el futuro?', opts: ['Un problema de privacidad de datos', 'Usar en entrenamiento una señal que en producción no existe todavía en el momento de predecir', 'Perder datos por un fallo técnico', 'Compartir el modelo con la competencia'], a: 1, why: ['No es sobre privacidad en este contexto.', 'Correcto.', 'No se refiere a pérdida de datos por fallo técnico.', 'No se refiere a compartir el modelo.'] },
        { q: '¿Por qué debe definirse la acción antes que la métrica de modelo?', opts: ['Porque si la predicción no cambia ninguna acción, el modelo no genera valor sin importar su precisión', 'Porque las métricas son irrelevantes', 'Porque la acción siempre determina el algoritmo a usar', 'Porque es un requisito de la certificación'], a: 0, why: ['Correcto.', 'Las métricas sí importan, solo que después de definir la acción.', 'No determina directamente el algoritmo.', 'No es un requisito de certificación.'] },
        { q: '¿Qué determina qué aprende realmente un modelo, además del algoritmo?', opts: ['El nombre del proyecto', 'La precisión de las instrucciones de etiquetado', 'El color de la interfaz de anotación', 'La hora del día en que se etiquetó'], a: 1, why: ['El nombre no tiene efecto técnico.', 'Correcto.', 'El color de interfaz no afecta el aprendizaje.', 'La hora del día no es relevante.'] },
        { q: '¿Para qué sirve medir el acuerdo entre anotadores?', opts: ['Para evaluar el desempeño individual de cada anotador', 'Para revelar ambigüedad en las instrucciones antes de etiquetar todo el conjunto', 'Para acelerar el etiquetado sin más objetivo', 'Para cumplir un trámite administrativo'], a: 1, why: ['No es su propósito principal.', 'Correcto.', 'No es solo para acelerar.', 'Tiene valor técnico real.'] },
        { q: '¿Qué busca activamente la exploración de datos, según la lección?', opts: ['Confirmar que los datos son perfectos', 'Formas en que la distribución real difiere de lo que el equipo asume: desbalance, atípicos, correlaciones espurias', 'El nombre de cada columna del conjunto de datos', 'El tamaño en bytes del archivo'], a: 1, why: ['No busca confirmar perfección, busca discrepancias.', 'Correcto.', 'Los nombres de columnas no son el foco.', 'El tamaño en bytes no es relevante aquí.'] },
        { q: '¿Por qué explorar los datos ya divididos en entrenamiento/validación/prueba?', opts: ['Porque una clase rara puede quedar mal representada en un conjunto específico', 'Porque es obligatorio hacerlo tres veces por regulación', 'Porque el conjunto completo nunca tiene errores', 'Porque acelera el entrenamiento del modelo'], a: 0, why: ['Correcto.', 'No hay tal obligación regulatoria.', 'El conjunto completo puede tener los mismos errores.', 'No se relaciona con la velocidad de entrenamiento.'] },
        { q: 'Un modelo predice devoluciones con alta precisión usando si el cliente contactó a soporte después de la compra. ¿Qué problema tiene esto?', opts: ['Ninguno, es una señal válida', 'Esa señal probablemente no está disponible en el momento real de predecir: es fuga de información', 'El modelo es demasiado simple', 'Falta más datos de entrenamiento'], a: 1, why: ['Sí tiene un problema real de fuga de información.', 'Correcto.', 'La simplicidad no es el problema aquí.', 'No es un problema de cantidad de datos.'] },
        { q: '¿Qué formulación técnica debería decidirse primero según la lección?', opts: ['Clasificación, regresión o ranking, antes que cualquier otra cosa', 'Ninguna: primero se decide la acción y las señales disponibles', 'Siempre clasificación binaria por defecto', 'La que use el algoritmo más reciente disponible'], a: 1, why: ['Es al revés: se decide al final, no al principio.', 'Correcto.', 'No siempre es clasificación binaria.', 'La novedad del algoritmo no es el criterio de elección.'] },
        { q: '¿Qué libro se recomienda en esta unidad sobre diseño de sistemas de machine learning?', opts: ['Designing Machine Learning Systems, de Chip Huyen', 'Cien años de soledad, de Gabriel García Márquez', 'El principito, de Antoine de Saint-Exupéry', 'Sapiens, de Yuval Noah Harari'], a: 0, why: ['Correcto.', 'No relacionado con la materia.', 'No relacionado con la materia.', 'No relacionado con la materia.'] },
      ],
    },
    {
      n: 'Unidad 2',
      title: 'Desarrollo',
      hours: 8,
      lessons: [
        {
          title: 'Preparación, entrenamiento y seguimiento de experimentos',
          mins: 30,
          body: [
            'Un proyecto de machine learning que dura más de unas semanas genera, casi sin proponérselo, decenas o cientos de variantes de entrenamiento: distintos conjuntos de características, distintos hiperparámetros, distintas versiones de los datos. Sin un sistema explícito de seguimiento de experimentos, esa historia se pierde, y con ella se pierde la capacidad de responder a la pregunta más básica de un proyecto maduro: ¿por qué el modelo actual es mejor que el de la semana pasada, exactamente?',
            'Un sistema de seguimiento de experimentos registra, para cada corrida de entrenamiento, tres cosas de forma sistemática: los parámetros usados, las métricas resultantes, y los artefactos producidos —el modelo entrenado, gráficas de diagnóstico, ejemplos de predicciones—. Esa disciplina convierte una carpeta de archivos con nombres como "modelo_final_v3_bueno.pkl" en un historial consultable donde cualquier resultado puede reproducirse y compararse con el resto.',
            'La preparación de datos que precede al entrenamiento merece el mismo rigor de versión: si el conjunto de datos usado para entrenar un modelo cambia sin quedar registrado, ninguna comparación posterior entre experimentos es válida, porque parte de la diferencia observada podría deberse al cambio de datos, no al cambio de configuración del modelo. Esto conecta directamente con la reproducibilidad, tema central de la unidad de producción de este curso: un experimento que no se puede reproducir no es, en sentido estricto, un experimento — es una anécdota.',
            'La disciplina de seguimiento no es un lujo reservado a equipos grandes: un cuaderno de experimentos tan simple como una hoja de cálculo con columnas para configuración, métrica y fecha ya es infinitamente mejor que no tener ninguno, y las herramientas especializadas de seguimiento (que automatizan ese registro y añaden comparación visual) solo aportan valor una vez que el equipo ya tiene el hábito de registrar, no antes.',
          ],
          diagram: {
            title: 'Ciclo de un experimento registrado',
            mermaid: 'graph LR\n  A["Datos versionados"] --> B["Configuración\\n(parámetros)"]\n  B --> C["Entrenamiento"]\n  C --> D["Métricas + artefactos\\nregistrados"]\n  D --> E["Comparar contra\\nexperimentos anteriores"]\n  E -->|ajustar| B',
          },
          keys: [
            'Un sistema de seguimiento registra, por cada corrida, parámetros, métricas y artefactos — convirtiendo una carpeta de archivos en un historial consultable.',
            'Si el conjunto de datos cambia sin quedar versionado, ninguna comparación entre experimentos posteriores es válida.',
            'Un experimento que no se puede reproducir no es un experimento: es una anécdota.',
            'La disciplina de registrar experimentos —aunque sea en una hoja de cálculo simple— importa más que la herramienta específica usada para hacerlo.',
          ],
          exercise: { mins: 15, text: 'Revisa cómo tu equipo (o tú mismo) registra actualmente los experimentos de un proyecto de datos. ¿Podrías responder hoy, con certeza, por qué la versión actual de un modelo es mejor que la de hace un mes? Si no, diseña las tres columnas mínimas que empezarías a registrar desde ya.' },
          quiz: [
            { q: '¿Qué registra un sistema de seguimiento de experimentos por cada corrida de entrenamiento?', opts: ['Solo el nombre del archivo final', 'Parámetros usados, métricas resultantes y artefactos producidos', 'Únicamente la fecha de ejecución', 'El nombre de la persona que ejecutó el entrenamiento'], a: 1, why: ['El nombre del archivo no basta como registro.', 'Correcto.', 'La fecha sola es insuficiente.', 'El nombre de la persona no es el foco del registro.'] },
            { q: '¿Por qué es problemático que el conjunto de datos cambie sin quedar versionado?', opts: ['No es problemático, los datos siempre se pueden recuperar', 'Porque ninguna comparación posterior entre experimentos es válida: la diferencia podría deberse al cambio de datos, no de configuración', 'Porque ocupa más espacio en disco', 'Porque ralentiza el entrenamiento'], a: 1, why: ['Sí es problemático, como explica la lección.', 'Correcto.', 'El espacio en disco no es el problema central.', 'No se trata de velocidad de entrenamiento.'] },
            { q: '¿Qué es, según la lección, "más importante que la herramienta específica" para el seguimiento de experimentos?', opts: ['El costo de la herramienta', 'La disciplina de registrar cada experimento de forma consistente', 'El número de personas en el equipo', 'La marca del proveedor de la herramienta'], a: 1, why: ['El costo no es el punto central.', 'Correcto.', 'El tamaño del equipo no es el factor determinante.', 'La marca del proveedor no es relevante.'] },
          ],
        },
        {
          title: 'Optimización y evaluación rigurosa',
          mins: 28,
          body: [
            'Optimizar hiperparámetros sin una evaluación rigurosa produce un resultado peligroso: un modelo que parece cada vez mejor en la métrica que se está observando, y cada vez peor generalizando a datos nuevos, sin que nadie lo note hasta que llega a producción. Esto ocurre porque ajustar repetidamente los hiperparámetros mirando el mismo conjunto de validación termina, indirectamente, sobreajustando el modelo a ese conjunto, aunque nunca se haya entrenado directamente sobre él.',
            'La defensa estándar contra este problema es mantener tres conjuntos estrictamente separados, con roles que no se intercambian bajo ninguna circunstancia: entrenamiento (donde el modelo ajusta sus parámetros internos), validación (donde se ajustan los hiperparámetros y se toman decisiones de diseño) y prueba (que se consulta una única vez, al final, y cuyo resultado es la única estimación honesta de cómo se comportará el modelo con datos que nunca ha visto de ninguna forma).',
            'Muchos equipos violan esta separación sin darse cuenta: si el conjunto de prueba se consulta varias veces durante el desarrollo —"solo para ver cómo vamos"— deja de cumplir su función, porque cada consulta es una oportunidad de ajustar decisiones en función de su resultado, exactamente lo que se suponía debía evitarse. El conjunto de prueba pierde su valor la primera vez que influye, aunque sea indirectamente, en una decisión de diseño.',
            'La evaluación rigurosa exige además elegir la métrica correcta para el problema, no la más cómoda de calcular: en un problema con clases muy desbalanceadas, una precisión global del 98% puede significar simplemente que el modelo predice siempre la clase mayoritaria, un resultado inútil que una métrica mal elegida no revela. Antes de optimizar cualquier hiperparámetro, conviene confirmar que la métrica elegida realmente penaliza los errores que le importan al negocio.',
          ],
          diagram: {
            title: 'Tres conjuntos, roles que no se intercambian',
            mermaid: 'graph LR\n  E["Entrenamiento\\najusta parámetros"] --> V["Validación\\najusta hiperparámetros"]\n  V --> P["Prueba\\nse consulta UNA sola vez, al final"]',
          },
          example: { title: 'El conjunto de prueba que dejó de servir', text: 'Un equipo consulta el conjunto de prueba cada semana "solo para monitorear el progreso" durante tres meses de desarrollo. Al llegar a producción, el modelo rinde notablemente peor que lo estimado. La causa: sin que nadie lo decidiera explícitamente, el equipo había ido ajustando el modelo en función de ese resultado repetido, convirtiendo de facto el conjunto de prueba en un segundo conjunto de validación.' },
          keys: [
            'Ajustar hiperparámetros repetidamente contra el mismo conjunto de validación sobreajusta indirectamente el modelo a ese conjunto.',
            'Entrenamiento, validación y prueba tienen roles que no se intercambian: el conjunto de prueba se consulta una única vez, al final.',
            'Un conjunto de prueba consultado varias veces durante el desarrollo pierde su función, aunque nunca se haya entrenado directamente sobre él.',
            'Antes de optimizar hiperparámetros, hay que confirmar que la métrica elegida penaliza los errores que realmente le importan al negocio — la precisión global puede ocultar un modelo inútil en problemas desbalanceados.',
          ],
          recursos: {
            libros: [
              { titulo: 'Machine Learning Design Patterns', autor: 'Valliappa Lakshmanan, Sara Robinson, Michael Munn' },
            ],
          },
          exercise: { mins: 20, text: 'Revisa el último proyecto de modelado en el que participaste: ¿cuántas veces se consultó el conjunto de prueba durante el desarrollo, no solo al final? Si fue más de una vez, ¿qué decisiones podrían haber estado influenciadas por ese resultado sin que el equipo lo notara?' },
          quiz: [
            { q: '¿Por qué ajustar hiperparámetros repetidamente contra el mismo conjunto de validación es riesgoso?', opts: ['No es riesgoso, es la práctica recomendada sin límites', 'Porque sobreajusta indirectamente el modelo a ese conjunto, aunque nunca se haya entrenado sobre él', 'Porque consume demasiado tiempo de cómputo', 'Porque requiere más memoria RAM'], a: 1, why: ['Sí es riesgoso, como explica la lección.', 'Correcto.', 'El tiempo de cómputo no es el riesgo central.', 'La memoria RAM no es el punto de la lección.'] },
            { q: '¿Cuántas veces debería consultarse el conjunto de prueba durante un proyecto?', opts: ['Tantas veces como sea necesario durante el desarrollo', 'Una única vez, al final, para que su resultado sea una estimación honesta', 'Nunca, se reserva solo para auditorías externas', 'Diariamente, como parte del monitoreo rutinario'], a: 1, why: ['Consultarlo repetidamente le hace perder su función.', 'Correcto.', 'Sí se usa, pero una sola vez, no nunca.', 'La consulta diaria contradice el propósito del conjunto de prueba.'] },
            { q: '¿Por qué una precisión global del 98% puede ser engañosa en un problema con clases desbalanceadas?', opts: ['Porque el 98% siempre es un resultado excelente sin excepción', 'Porque puede significar que el modelo predice siempre la clase mayoritaria, un resultado inútil que esa métrica no revela', 'Porque la precisión nunca es una métrica válida', 'Porque el desbalance de clases no afecta a ninguna métrica'], a: 1, why: ['No siempre es excelente; puede ocultar un modelo inútil.', 'Correcto.', 'La precisión sí es válida en muchos contextos, el problema es el desbalance.', 'El desbalance sí afecta a esta métrica en particular.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Qué registra un sistema de seguimiento de experimentos?', opts: ['Solo el nombre del archivo', 'Parámetros, métricas y artefactos de cada corrida', 'Solo la fecha', 'El nombre de quien lo ejecutó'], a: 1, why: ['No basta con el nombre.', 'Correcto.', 'La fecha sola es insuficiente.', 'No es el foco del registro.'] },
        { q: '¿Por qué versionar el conjunto de datos usado en cada experimento?', opts: ['Para ahorrar espacio en disco', 'Para que las comparaciones entre experimentos sean válidas y no confundan cambios de datos con cambios de configuración', 'Porque lo exige la ley', 'Para acelerar el entrenamiento'], a: 1, why: ['No se trata de espacio en disco.', 'Correcto.', 'No hay tal exigencia legal específica.', 'No acelera el entrenamiento.'] },
        { q: '¿Qué es un experimento que no se puede reproducir?', opts: ['Un experimento fallido pero válido', 'En sentido estricto, no es un experimento: es una anécdota', 'El tipo de experimento más común y aceptable', 'Un experimento válido solo si el resultado es bueno'], a: 1, why: ['No es simplemente "fallido pero válido".', 'Correcto.', 'No debería ser el más común ni aceptable.', 'La validez no depende de si el resultado es bueno.'] },
        { q: '¿Qué es más importante que la herramienta específica de seguimiento?', opts: ['El costo de la herramienta', 'La disciplina de registrar cada experimento de forma consistente', 'El número de personas del equipo', 'La marca del proveedor'], a: 1, why: ['El costo no es el punto central.', 'Correcto.', 'El tamaño del equipo no es determinante.', 'La marca no es relevante.'] },
        { q: '¿Por qué es riesgoso ajustar hiperparámetros repetidamente contra el mismo conjunto de validación?', opts: ['No es riesgoso en ningún caso', 'Sobreajusta indirectamente el modelo a ese conjunto', 'Consume demasiado tiempo únicamente', 'Requiere más memoria RAM únicamente'], a: 1, why: ['Sí es riesgoso.', 'Correcto.', 'El tiempo no es el riesgo central.', 'La memoria no es el punto central.'] },
        { q: '¿Cuántas veces debería consultarse el conjunto de prueba?', opts: ['Tantas como se necesite', 'Una única vez, al final del desarrollo', 'Nunca', 'Diariamente'], a: 1, why: ['Consultarlo repetidamente le hace perder su función.', 'Correcto.', 'Sí se usa, solo que una vez.', 'La consulta diaria contradice su propósito.'] },
        { q: '¿Qué ocurre si el conjunto de prueba se consulta varias veces durante el desarrollo?', opts: ['No pasa nada, sigue siendo válido', 'Pierde su función como estimación honesta, aunque el modelo nunca se haya entrenado directamente sobre él', 'Se vuelve más preciso con cada consulta', 'Se convierte automáticamente en el conjunto de entrenamiento'], a: 1, why: ['Sí pierde su función.', 'Correcto.', 'No se vuelve más preciso, pierde validez.', 'No se convierte en conjunto de entrenamiento.'] },
        { q: '¿Por qué puede ser engañosa una precisión global alta en un problema desbalanceado?', opts: ['Nunca es engañosa', 'Puede significar que el modelo predice siempre la clase mayoritaria, sin utilidad real', 'La precisión nunca aplica a problemas desbalanceados', 'El desbalance no afecta ninguna métrica'], a: 1, why: ['Sí puede ser engañosa.', 'Correcto.', 'Sí aplica, el problema es interpretarla sola.', 'El desbalance sí afecta esta métrica.'] },
        { q: '¿Qué debe confirmarse antes de optimizar hiperparámetros?', opts: ['Que el equipo tenga suficiente presupuesto', 'Que la métrica elegida penalice los errores que realmente importan al negocio', 'Que el modelo use la arquitectura más reciente', 'Que el conjunto de datos sea el más grande posible'], a: 1, why: ['El presupuesto no es el punto de esta lección.', 'Correcto.', 'La novedad de arquitectura no es el criterio.', 'El tamaño del conjunto no es lo que se confirma aquí.'] },
        { q: '¿Qué libro se recomienda sobre patrones de diseño de sistemas de ML?', opts: ['Machine Learning Design Patterns, de Lakshmanan, Robinson y Munn', 'Don Quijote de la Mancha', 'El alquimista', 'Los pilares de la tierra'], a: 0, why: ['Correcto.', 'No relacionado con la materia.', 'No relacionado con la materia.', 'No relacionado con la materia.'] },
      ],
    },
    {
      n: 'Unidad 3',
      title: 'Producción',
      hours: 10,
      lessons: [
        {
          title: 'Pruebas de código, datos y modelos',
          mins: 28,
          body: [
            'Un proyecto de machine learning maduro necesita tres categorías de pruebas, no una: pruebas de código (que las funciones hacen lo que deberían, igual que en cualquier proyecto de software), pruebas de datos (que los datos de entrada cumplen las expectativas de esquema, rango y distribución antes de entrar al pipeline) y pruebas de modelo (que el modelo entrenado se comporta de forma sensata ante casos concretos, no solo que su métrica agregada supera un umbral).',
            'Las pruebas de datos son la categoría menos familiar para equipos que vienen de un entorno de software puro, y son las que con más frecuencia faltan en proyectos que luego fallan en producción de forma silenciosa: verificar que una columna numérica no tenga valores negativos donde no deberían existir, que las categorías observadas coincidan con las esperadas, que el porcentaje de valores faltantes no supere un umbral razonable. Un pipeline sin estas verificaciones puede seguir entrenando modelos "exitosamente" durante meses sobre datos silenciosamente corrompidos.',
            'Las pruebas de modelo van más allá de comprobar que la métrica global supera un umbral: incluyen pruebas de invarianza —cambios que no deberían alterar la predicción, como el orden de palabras irrelevantes en un texto— y pruebas de comportamiento dirigido —verificar explícitamente que el modelo responde correctamente ante un conjunto pequeño de casos críticos conocidos, aunque esos casos sean raros en el conjunto de datos general—. Un modelo con una métrica global excelente puede fallar sistemáticamente en exactamente los casos que más importan al negocio, y una métrica agregada nunca lo revelaría por sí sola.',
            'Estas tres categorías de prueba no reemplazan la evaluación estadística rigurosa vista en la lección anterior: la complementan, cubriendo el tipo de fallo que una métrica agregada, por diseño, no puede detectar — un fallo puntual, sistemático, sobre un subconjunto pequeño pero crítico de los casos posibles.',
          ],
          diagram: {
            title: 'Tres categorías de prueba, no una',
            mermaid: 'graph TD\n  P["Proyecto maduro de ML"] --> C["Pruebas de código\\n(funciones correctas)"]\n  P --> D["Pruebas de datos\\n(esquema, rango, distribución)"]\n  P --> M["Pruebas de modelo\\n(invarianza, casos críticos)"]',
          },
          keys: [
            'Un proyecto maduro necesita tres categorías de prueba: de código, de datos y de modelo — no basta con una sola.',
            'Las pruebas de datos verifican esquema, rango y distribución antes de que los datos entren al pipeline; su ausencia permite corrupción silenciosa durante meses.',
            'Las pruebas de invarianza verifican que cambios irrelevantes no alteren la predicción; las de comportamiento dirigido verifican casos críticos conocidos aunque sean raros en el conjunto general.',
            'Una métrica agregada excelente puede convivir con fallos sistemáticos sobre un subconjunto pequeño pero crítico de casos, invisibles sin pruebas de modelo específicas.',
          ],
          exercise: { mins: 20, text: 'Elige un modelo o pipeline de datos de tu contexto. Escribe una prueba de datos concreta (una verificación de esquema o rango), y una prueba de comportamiento dirigido (un caso crítico específico donde el modelo debería responder de una forma conocida, sin importar cuán raro sea ese caso en el conjunto general).' },
          quiz: [
            { q: '¿Cuáles son las tres categorías de prueba que necesita un proyecto de ML maduro?', opts: ['De código, de rendimiento, de seguridad', 'De código, de datos, de modelo', 'De diseño, de usabilidad, de accesibilidad', 'Unitarias, de integración, de humo'], a: 1, why: ['No son las categorías descritas en la lección.', 'Correcto.', 'No son las categorías descritas en la lección.', 'Son categorías de software genérico, no las tres específicas de ML descritas aquí.'] },
            { q: '¿Qué verifican las pruebas de datos?', opts: ['Que el código compile sin errores', 'Que los datos de entrada cumplan expectativas de esquema, rango y distribución antes de entrar al pipeline', 'Que el modelo tenga una métrica alta', 'Que la interfaz de usuario funcione correctamente'], a: 1, why: ['Eso lo verifican las pruebas de código, no de datos.', 'Correcto.', 'Eso es evaluación de modelo, no prueba de datos.', 'No se refiere a interfaz de usuario.'] },
            { q: '¿Por qué una métrica agregada excelente puede convivir con un problema real del modelo?', opts: ['Porque las métricas agregadas siempre mienten', 'Porque puede ocultar un fallo sistemático sobre un subconjunto pequeño pero crítico de casos', 'Porque las métricas agregadas no existen en la práctica', 'Porque el modelo nunca se equivoca si la métrica es alta'], a: 1, why: ['No siempre mienten, tienen una limitación específica.', 'Correcto.', 'Sí existen y se usan ampliamente.', 'Sí puede equivocarse en casos específicos pese a la métrica alta.'] },
          ],
        },
        {
          title: 'Reproducibilidad y control de versiones',
          mins: 25,
          body: [
            'La reproducibilidad en machine learning exige versionar más elementos de los que un proyecto de software convencional necesita: no basta con versionar el código, hace falta versionar también los datos de entrenamiento, la configuración exacta de hiperparámetros, y en muchos casos la semilla aleatoria usada, porque cualquiera de estos elementos puede cambiar el resultado final de un modelo entrenado, no solo el código que lo produce.',
            'El control de versiones de datos es el elemento que más equipos omiten, en parte porque las herramientas convencionales de control de versiones (diseñadas para archivos de texto pequeños) no manejan bien conjuntos de datos grandes y binarios. Existen herramientas específicas para este propósito, pero la disciplina importa más que la herramienta particular: como mínimo, cada conjunto de datos usado para entrenar un modelo en producción debe quedar identificado de forma única e inmutable, de modo que "qué datos entrenaron este modelo" tenga siempre una respuesta exacta, no aproximada.',
            'Un entorno de ejecución también forma parte de lo que hay que versionar, aunque se pase por alto con frecuencia: las versiones exactas de las bibliotecas usadas pueden cambiar sutilmente el comportamiento numérico de un modelo entre una ejecución y otra, incluso con el mismo código y los mismos datos. Fijar esas versiones explícitamente —no depender de "la versión más reciente disponible" en el momento de instalar— es parte de la misma disciplina de reproducibilidad, no un detalle de infraestructura sin relación con la calidad del modelo.',
            'La recompensa de esta disciplina, aunque cueste tiempo de configuración inicial, aparece meses después: cuando un modelo en producción empieza a fallar y hay que auditar exactamente qué combinación de datos, código, configuración y entorno lo produjo, un proyecto sin este versionado completo enfrenta una investigación que puede tomar semanas; uno con la disciplina completa responde esa pregunta en minutos.',
          ],
          diagram: {
            title: 'Todo lo que hay que versionar',
            mermaid: 'graph TD\n  R["Reproducibilidad completa"] --> C["Código"]\n  R --> D["Datos\\n(identificados de forma única)"]\n  R --> H["Configuración de\\nhiperparámetros"]\n  R --> E["Entorno\\n(versiones de bibliotecas)"]',
          },
          example: { title: 'La pregunta que solo la reproducibilidad completa responde', text: 'Un modelo en producción empieza a fallar en un subgrupo de clientes. El equipo necesita saber: ¿qué versión exacta de los datos, qué configuración de hiperparámetros y qué versión de las bibliotecas produjeron el modelo actualmente desplegado? Sin versionado de datos y entorno, esa pregunta —aparentemente simple— puede tomar semanas de reconstrucción manual.' },
          keys: [
            'La reproducibilidad exige versionar código, datos, configuración de hiperparámetros y, en muchos casos, la semilla aleatoria — no solo el código.',
            'El control de versiones de datos es el elemento más omitido, en parte porque las herramientas de código convencionales no manejan bien archivos binarios grandes.',
            'Cada conjunto de datos de entrenamiento debe quedar identificado de forma única e inmutable, para que "qué datos entrenaron este modelo" tenga siempre una respuesta exacta.',
            'Fijar explícitamente las versiones de las bibliotecas del entorno de ejecución es parte de la misma disciplina de reproducibilidad, porque pueden alterar el comportamiento numérico del modelo.',
          ],
          recursos: {
            videos: [
              { titulo: 'Made with ML — Goku Mohandas', canal: 'MLOps Community', url: 'https://www.youtube.com/watch?v=1SvoSnzV37k' },
            ],
          },
          exercise: { mins: 15, text: 'Para el último modelo que entrenaste o usaste: si tuvieras que reproducir exactamente ese mismo modelo hoy, ¿podrías? Identifica qué elemento (datos, configuración, entorno) no está versionado de forma que te impediría hacerlo con certeza.' },
          quiz: [
            { q: '¿Qué elementos hace falta versionar en machine learning, más allá del código?', opts: ['Nada más, el código es suficiente', 'Los datos de entrenamiento, la configuración de hiperparámetros y, en muchos casos, la semilla aleatoria', 'Solo el nombre del proyecto', 'Solo la fecha de entrenamiento'], a: 1, why: ['El código no es suficiente por sí solo.', 'Correcto.', 'El nombre del proyecto no afecta la reproducibilidad.', 'La fecha sola no basta.'] },
            { q: '¿Por qué el control de versiones de datos es el elemento más omitido?', opts: ['Porque no es importante', 'Porque las herramientas convencionales de control de versiones no manejan bien conjuntos de datos grandes y binarios', 'Porque está prohibido por regulación', 'Porque los datos nunca cambian una vez recolectados'], a: 1, why: ['Sí es importante, como explica la lección.', 'Correcto.', 'No hay tal prohibición.', 'Los datos sí pueden cambiar o actualizarse con el tiempo.'] },
            { q: '¿Por qué fijar las versiones de las bibliotecas del entorno es parte de la reproducibilidad?', opts: ['Porque las bibliotecas nunca cambian de comportamiento', 'Porque versiones distintas pueden alterar sutilmente el comportamiento numérico del modelo, incluso con el mismo código y datos', 'Porque es un requisito estético del código', 'Porque acelera la instalación del entorno'], a: 1, why: ['Sí pueden cambiar de comportamiento entre versiones.', 'Correcto.', 'No es un requisito estético.', 'No se trata de velocidad de instalación.'] },
          ],
        },
        {
          title: 'Despliegue, CI/CD y monitoreo de deriva',
          mins: 30,
          body: [
            'Desplegar un modelo no es el final del proyecto: es el punto en que empieza la parte del ciclo de vida que con más frecuencia se subestima al planificar. Un pipeline de integración y despliegue continuo (CI/CD) adaptado a machine learning añade, sobre el CI/CD de software convencional, pasos específicos: validar el nuevo modelo contra un conjunto de prueba fijo antes de promoverlo, comparar su rendimiento contra el modelo actualmente en producción, y solo entonces decidir si reemplazarlo.',
            'Esa comparación contra el modelo actual —no solo contra un umbral absoluto— es una disciplina que evita un error común: promover un modelo nuevo porque "mejoró la métrica en el conjunto de prueba interno" sin verificar que realmente supera, de forma consistente, al que ya está sirviendo tráfico real. Estrategias de despliegue gradual —servir el modelo nuevo a un pequeño porcentaje de tráfico real antes de un reemplazo completo— permiten detectar problemas que ningún conjunto de prueba offline habría revelado, antes de que afecten a todos los usuarios.',
            'Una vez en producción, el trabajo se traslada del entrenamiento al monitoreo de deriva: vigilar si la distribución de los datos que el modelo recibe en producción empieza a diferir de la distribución con la que fue entrenado. Esa deriva puede ser gradual —el comportamiento de los usuarios cambia lentamente con el tiempo— o abrupta —un cambio de proceso, una nueva categoría de producto, un evento externo—, y ambas formas degradan silenciosamente el rendimiento del modelo si nadie las está midiendo activamente.',
            'El monitoreo de deriva no sustituye la evaluación con datos etiquetados reales cuando esa evaluación existe, pero cubre el caso —extremadamente común en producción— en que las etiquetas verdaderas tardan días, semanas o nunca llegan a estar disponibles: en ese escenario, comparar la distribución de las entradas actuales contra las de entrenamiento es, con frecuencia, la única señal temprana disponible de que algo está cambiando antes de que el impacto en el negocio se vuelva evidente.',
          ],
          diagram: {
            title: 'Ciclo de despliegue y monitoreo continuo',
            mermaid: 'graph TD\n  A["Modelo candidato"] --> B["Validar contra\\nconjunto de prueba fijo"]\n  B --> C{"¿Supera al modelo\\nen producción?"}\n  C -->|Sí| D["Despliegue gradual\\n(tráfico parcial)"]\n  C -->|No| A\n  D --> E["Monitoreo de deriva\\nen producción"]\n  E -->|deriva detectada| F["Reentrenar con\\ndatos recientes"]\n  F --> A',
          },
          example: { title: 'Deriva sin que nadie la note', text: 'Un modelo de recomendación de productos entrenado antes de una temporada alta sigue en producción sin cambios durante esa temporada. El comportamiento de compra cambia drásticamente por la estacionalidad, pero como las etiquetas reales (qué compró finalmente cada usuario) tardan semanas en consolidarse, nadie detecta la caída de rendimiento hasta revisar las métricas de negocio del trimestre completo — mucho después de que el monitoreo de deriva de las entradas lo habría señalado.' },
          keys: [
            'CI/CD para machine learning añade pasos específicos: validar contra un conjunto fijo y comparar contra el modelo actual en producción, no solo contra un umbral absoluto.',
            'El despliegue gradual —servir el modelo nuevo a una fracción del tráfico real— detecta problemas que ningún conjunto de prueba offline revelaría.',
            'El monitoreo de deriva vigila si la distribución de entradas en producción se aleja de la distribución de entrenamiento, de forma gradual o abrupta.',
            'Cuando las etiquetas verdaderas tardan en llegar o nunca llegan, comparar la distribución de entradas es con frecuencia la única señal temprana disponible de que algo está cambiando.',
          ],
          recursos: {
            libros: [
              { titulo: 'Reliable Machine Learning', autor: 'Cathy Chen, Niall Richard Murphy, Kranti Parisa, D. Sculley, Todd Underwood' },
            ],
          },
          exercise: { mins: 20, text: 'Para un modelo en producción de tu contexto (o uno hipotético): ¿cuánto tiempo tardan en llegar las etiquetas reales que permitirían evaluar su rendimiento? Si ese tiempo es de semanas o más, diseña qué señal de deriva de entradas monitorearías mientras tanto como alerta temprana.' },
          quiz: [
            { q: '¿Qué añade CI/CD para machine learning sobre el CI/CD de software convencional?', opts: ['Nada distinto, es exactamente igual', 'Validar el modelo nuevo contra un conjunto fijo y compararlo contra el modelo actual en producción antes de reemplazarlo', 'Solo pruebas de código más rápidas', 'Un proceso de aprobación puramente manual sin automatización'], a: 1, why: ['Sí añade pasos específicos distintos.', 'Correcto.', 'No se trata solo de velocidad de pruebas de código.', 'No es puramente manual; combina automatización y decisión informada.'] },
            { q: '¿Qué permite detectar un despliegue gradual que un conjunto de prueba offline no revelaría?', opts: ['Nada adicional', 'Problemas que solo aparecen con tráfico real, sirviendo el modelo nuevo a una fracción de los usuarios antes del reemplazo completo', 'Errores de sintaxis en el código', 'El costo total del proyecto'], a: 1, why: ['Sí revela problemas adicionales relevantes.', 'Correcto.', 'Los errores de sintaxis se detectan antes, en pruebas de código.', 'El costo del proyecto no es lo que revela el despliegue gradual.'] },
            { q: '¿Por qué el monitoreo de deriva de entradas es especialmente útil cuando las etiquetas reales tardan en llegar?', opts: ['Porque reemplaza permanentemente la necesidad de etiquetas reales', 'Porque comparar la distribución de entradas actuales contra las de entrenamiento es, con frecuencia, la única señal temprana disponible mientras tanto', 'Porque las etiquetas nunca son necesarias en ningún escenario', 'Porque acelera la llegada de las etiquetas reales'], a: 1, why: ['No la reemplaza permanentemente, la complementa mientras no está disponible.', 'Correcto.', 'Las etiquetas sí son necesarias cuando están disponibles.', 'No acelera la llegada de las etiquetas.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Cuáles son las tres categorías de prueba de un proyecto de ML maduro?', opts: ['De código, de rendimiento, de seguridad', 'De código, de datos, de modelo', 'De diseño, usabilidad, accesibilidad', 'Unitarias, integración, humo'], a: 1, why: ['No son las categorías descritas.', 'Correcto.', 'No son las categorías descritas.', 'Son categorías genéricas de software, no las tres de ML descritas aquí.'] },
        { q: '¿Qué verifican las pruebas de datos?', opts: ['Que el código compile', 'Esquema, rango y distribución de los datos antes de entrar al pipeline', 'Que la métrica del modelo sea alta', 'La interfaz de usuario'], a: 1, why: ['Eso lo verifican las pruebas de código.', 'Correcto.', 'Eso es evaluación de modelo.', 'No se refiere a interfaz de usuario.'] },
        { q: '¿Qué son las pruebas de comportamiento dirigido?', opts: ['Pruebas que verifican casos críticos conocidos, aunque sean raros en el conjunto general', 'Pruebas de velocidad de entrenamiento', 'Pruebas de la interfaz gráfica', 'Pruebas de seguridad de red'], a: 0, why: ['Correcto.', 'No se refiere a velocidad de entrenamiento.', 'No se refiere a interfaz gráfica.', 'No se refiere a seguridad de red.'] },
        { q: '¿Qué hace falta versionar en ML, más allá del código?', opts: ['Nada más', 'Datos de entrenamiento, configuración de hiperparámetros y semilla aleatoria', 'Solo el nombre del proyecto', 'Solo la fecha'], a: 1, why: ['El código no basta.', 'Correcto.', 'El nombre no afecta la reproducibilidad.', 'La fecha sola no basta.'] },
        { q: '¿Por qué se omite con frecuencia el versionado de datos?', opts: ['No es importante', 'Las herramientas convencionales no manejan bien archivos binarios grandes', 'Está prohibido por regulación', 'Los datos nunca cambian'], a: 1, why: ['Sí es importante.', 'Correcto.', 'No hay tal prohibición.', 'Los datos sí pueden cambiar.'] },
        { q: '¿Por qué fijar versiones de bibliotecas del entorno es parte de la reproducibilidad?', opts: ['Las bibliotecas nunca cambian de comportamiento', 'Versiones distintas pueden alterar sutilmente el comportamiento numérico del modelo', 'Es un requisito estético', 'Acelera la instalación'], a: 1, why: ['Sí pueden cambiar de comportamiento.', 'Correcto.', 'No es estético.', 'No se trata de velocidad de instalación.'] },
        { q: '¿Qué añade CI/CD para ML sobre CI/CD convencional?', opts: ['Nada distinto', 'Validar contra conjunto fijo y comparar contra el modelo actual en producción', 'Solo pruebas de código más rápidas', 'Aprobación puramente manual'], a: 1, why: ['Sí añade pasos específicos.', 'Correcto.', 'No es solo velocidad.', 'Combina automatización con decisión informada.'] },
        { q: '¿Qué permite detectar el despliegue gradual?', opts: ['Nada adicional', 'Problemas que solo aparecen con tráfico real antes del reemplazo completo', 'Errores de sintaxis', 'El costo total del proyecto'], a: 1, why: ['Sí revela problemas adicionales.', 'Correcto.', 'Los errores de sintaxis se detectan antes.', 'No revela el costo del proyecto.'] },
        { q: '¿Qué vigila el monitoreo de deriva?', opts: ['El costo de cómputo del modelo', 'Si la distribución de entradas en producción se aleja de la distribución de entrenamiento', 'El número de usuarios activos', 'La velocidad de respuesta del servidor'], a: 1, why: ['No se centra en el costo de cómputo.', 'Correcto.', 'No es el número de usuarios activos.', 'No es la velocidad de respuesta del servidor.'] },
        { q: '¿Por qué el monitoreo de deriva de entradas es útil cuando las etiquetas reales tardan en llegar?', opts: ['Reemplaza permanentemente la necesidad de etiquetas', 'Es con frecuencia la única señal temprana disponible mientras las etiquetas no llegan', 'Las etiquetas nunca son necesarias', 'Acelera la llegada de etiquetas'], a: 1, why: ['No la reemplaza permanentemente.', 'Correcto.', 'Sí son necesarias cuando están disponibles.', 'No acelera su llegada.'] },
      ],
    },
  ],
}

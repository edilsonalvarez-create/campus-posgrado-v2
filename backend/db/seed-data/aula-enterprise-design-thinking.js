// Contenido propio de la aula "Enterprise Design Thinking — Practitioner"
// (recrea el temario público de IBM Enterprise Design Thinking). Antes solo
// tenía esqueleto (título + duración por lección); esto añade lecciones
// completas con diagramas, libros y videos recomendados, siguiendo el mismo
// patrón que ya usan "AI for Everyone" y "Elements of AI".
//
// Formato: se fusiona en aulas.json en tiempo de siembra bajo la clave
// "Enterprise Design Thinking — Practitioner" (ver seed.js).

module.exports = {
  units: [
    {
      n: 'Unidad 1',
      title: 'El bucle: observar, reflexionar, hacer',
      hours: 1,
      lessons: [
        {
          title: 'Los tres principios y el bucle continuo',
          mins: 18,
          body: [
            'Enterprise Design Thinking parte de tres principios que, a diferencia de la mayoría de metodologías corporativas, caben en una frase cada uno: enfocar en resultados humanos, no en entregables; formar equipos diversos, no departamentos aislados; y trabajar en un bucle continuo, no en fases que terminan. Este último principio es el que más rompe con la forma en que la mayoría de organizaciones planifican un proyecto tecnológico, y es el que estudia esta lección.',
            'El bucle tiene tres momentos —observar, reflexionar, hacer— y su propiedad distintiva no es la secuencia sino que no termina: al hacer algo (un prototipo, una versión mínima, un cambio de proceso) se genera nueva información que exige volver a observar, no avanzar a una supuesta "siguiente fase". Un plan de proyecto tradicional trata la investigación de usuarios como una etapa que se cierra con un documento; el bucle la trata como una actividad que nunca deja de correr en paralelo a construir.',
            'Esa diferencia no es cosmética. Un equipo que "cierra" la fase de investigación pierde la capacidad de corregir el rumbo cuando el prototipo revela que el problema estaba mal entendido —y eso pasa en la mayoría de proyectos, no en una minoría—. Un equipo que mantiene el bucle abierto trata ese hallazgo como información valiosa que llegó en el momento correcto, no como un retraso que hay que justificar ante un comité.',
            'En la práctica, esto exige un cambio de métrica: en vez de medir avance por fases completadas, se mide por vueltas de bucle completadas y por lo que cada vuelta cambió en la comprensión del equipo. Un equipo que dio diez vueltas pequeñas y ajustó su dirección tres veces está, casi siempre, en mejor posición que uno que ejecutó un plan de seis meses sin desviarse ni una vez — la ausencia de desviación en un proyecto de esta escala es señal de que nadie estaba mirando de verdad lo que ocurría.',
          ],
          diagram: {
            title: 'El bucle de Enterprise Design Thinking',
            mermaid: 'graph LR\n  A["Observar\\n(entender a las personas y el contexto)"] --> B["Reflexionar\\n(dar sentido a lo observado)"]\n  B --> C["Hacer\\n(prototipar, probar, construir)"]\n  C --> A',
          },
          example: {
            title: 'Cerrar el bucle en vez de cerrar la fase',
            text: 'Un equipo prototipa un flujo de aprobación de gastos y lo prueba con cinco empleados. Tres de ellos se saltan un paso obligatorio sin darse cuenta. Un equipo en modo "fases" registraría esto como un defecto a corregir antes de pasar a "desarrollo". Un equipo en modo bucle vuelve a observar por qué ese paso es invisible para las personas, y esa observación puede cambiar el diseño completo del flujo, no solo ese paso.',
          },
          keys: [
            'Los tres principios son: resultados humanos sobre entregables, equipos diversos sobre departamentos aislados, bucle continuo sobre fases que terminan.',
            'El bucle —observar, reflexionar, hacer— no tiene un punto de cierre: cada "hacer" genera información que reabre la observación.',
            'Un plan que nunca se desvía en un proyecto de meses no es señal de buena ejecución: casi siempre es señal de que nadie está observando de verdad.',
            'La métrica de avance correcta es vueltas de bucle completadas y decisiones que cambiaron, no fases cerradas en un cronograma.',
          ],
          recursos: {
            libros: [
              { titulo: 'Change by Design', autor: 'Tim Brown (IDEO)' },
              { titulo: 'Sprint: Resuelve grandes problemas y prueba nuevas ideas en solo cinco días', autor: 'Jake Knapp, John Zeratsky, Braden Kowitz' },
            ],
            videos: [
              { titulo: 'Understand IBM Design Thinking in 10 minutes', canal: 'IBM', url: 'https://www.youtube.com/watch?v=psLjEBUOnVs' },
            ],
          },
          exercise: { mins: 15, text: 'Elige un proyecto reciente de tu organización que haya seguido un plan de fases fijas. Identifica un momento en que apareció información nueva a mitad de camino: ¿el equipo la incorporó, o la ignoró porque "ya se había cerrado esa fase"? Describe qué habría cambiado con un bucle abierto.' },
          quiz: [
            { q: '¿Cuál de los siguientes NO es uno de los tres principios de Enterprise Design Thinking?', opts: ['Resultados humanos sobre entregables', 'Equipos diversos sobre departamentos aislados', 'Documentación exhaustiva antes de cada fase', 'Bucle continuo sobre fases que terminan'], a: 2, why: ['Sí es uno de los tres principios reales.', 'Sí es uno de los tres principios reales.', 'Correcto: este no es un principio de la metodología, es justamente lo que ella busca evitar.', 'Sí es uno de los tres principios reales.'] },
            { q: '¿Por qué un plan de proyecto que nunca se desvía puede ser una mala señal, según la lección?', opts: ['Porque todo plan siempre debe desviarse por definición', 'Porque casi siempre indica que nadie está observando de verdad lo que ocurre durante la ejecución', 'Porque los planes fijos están prohibidos por la metodología', 'Porque desviarse siempre mejora los resultados'], a: 1, why: ['No es una regla universal, es una observación práctica.', 'Correcto: esa es la razón exacta que da la lección.', 'No hay tal prohibición formal.', 'No se afirma que desviarse siempre mejore resultados, solo que la ausencia total de desvío es sospechosa.'] },
            { q: '¿Qué métrica de avance propone el bucle frente al modelo de fases?', opts: ['Documentos entregados por fase', 'Vueltas de bucle completadas y decisiones que cambiaron a partir de ellas', 'Horas facturadas al proyecto', 'Número de reuniones realizadas'], a: 1, why: ['Los documentos por fase son justamente la métrica que el bucle reemplaza.', 'Correcto: esa es la métrica exacta propuesta en la lección.', 'Las horas facturadas no son la métrica discutida.', 'El número de reuniones no es la métrica discutida.'] },
          ],
        },
        {
          title: 'Resultados centrados en el usuario',
          mins: 15,
          body: [
            'El primer principio —resultados humanos sobre entregables— parece obvio hasta que se intenta aplicarlo a un objetivo de proyecto real. La mayoría de objetivos corporativos se escriben como entregables: "lanzar la app de autoservicio", "migrar al nuevo CRM", "implementar el módulo de reportes". Ninguno de esos enunciados dice qué debería cambiar en la vida de la persona que usa el sistema, y esa omisión es precisamente el problema que este principio busca corregir.',
            'Un resultado centrado en el usuario se escribe distinto: no describe lo que el equipo va a construir, describe qué podrá hacer una persona que hoy no puede, o qué dejará de sufrir. "Lanzar la app de autoservicio" se convierte en "un cliente puede resolver una consulta de facturación sin llamar a soporte, en menos de tres minutos". La diferencia no es de redacción: la segunda formulación tiene una forma evidente de fracasar (si toma más de tres minutos, o si el cliente termina llamando igual) que la primera no tiene.',
            'Esto conecta directamente con un problema visto en otras asignaturas de este campus sobre proyectos de IA: un entregable se puede completar y aun así no cambiar nada para nadie. Un sistema de recomendaciones "lanzado" que nadie usa cumplió el entregable y falló el resultado. Enterprise Design Thinking exige nombrar el resultado humano antes de comprometerse con ningún entregable concreto, precisamente para que ese fracaso silencioso —entregable cumplido, resultado ausente— sea visible desde el principio y no se descubra seis meses después en una métrica de adopción.',
            'Escribir un resultado centrado en el usuario obliga además a decidir quién es esa persona con más precisión de la habitual: "los clientes" no es una persona, es una categoría demasiado amplia para diseñar nada concreto. "Un cliente que llama por primera vez con una factura que no reconoce" sí lo es, y sobre esa persona concreta se puede observar, prototipar y medir con sentido.',
          ],
          example: { title: 'De entregable a resultado', text: '"Implementar el nuevo portal de RR. HH." es un entregable. "Un empleado puede solicitar y confirmar sus vacaciones sin escribir un correo ni esperar respuesta de alguien" es un resultado humano. El segundo enunciado, a diferencia del primero, permite saber en cualquier momento si el proyecto está funcionando de verdad, aunque el portal técnicamente ya esté "lanzado".' },
          diagram: {
            title: 'Entregable cumplido, resultado ausente',
            mermaid: 'graph LR\n  E["Entregable: lanzar el portal"] --> C["Se puede cumplir\\nsin cambiar nada real"]\n  R["Resultado humano:\\nun empleado puede X sin Y"] --> V["Tiene forma evidente\\nde fracasar — es verificable"]',
          },
          keys: [
            'Un entregable puede completarse sin cambiar nada para nadie; un resultado humano no puede "cumplirse" sin que algo cambie en la vida de una persona concreta.',
            'Un resultado humano bien escrito tiene una forma evidente de fracasar; un entregable normalmente no la tiene.',
            '"Los clientes" o "los usuarios" no son personas suficientemente concretas para diseñar nada: hace falta nombrar a alguien específico y su situación.',
            'Nombrar el resultado humano antes del entregable saca a la luz el riesgo de "entregable cumplido, resultado ausente" desde el inicio del proyecto, no seis meses después.',
          ],
          exercise: { mins: 15, text: 'Toma el último objetivo de proyecto que se comunicó en tu organización en formato entregable ("lanzar X", "migrar a Y"). Reescríbelo como resultado humano: qué podrá hacer una persona concreta que hoy no puede, y cómo sabrías si fracasó.' },
          quiz: [
            { q: '¿Qué problema tiene un objetivo de proyecto escrito como "lanzar la app de autoservicio"?', opts: ['Ningún problema, es una formulación perfectamente válida', 'No dice qué cambiará en la vida de la persona que la usa, por lo que puede cumplirse sin generar ningún resultado real', 'Es demasiado técnico para un equipo de negocio', 'No menciona la tecnología que se va a usar'], a: 1, why: ['Sí tiene un problema real señalado en la lección.', 'Correcto: esa es la falla exacta de un objetivo formulado como entregable.', 'No es un problema de tecnicismo, es un problema de enfoque.', 'La falta de detalle técnico no es el problema señalado.'] },
            { q: '¿Por qué "los clientes" no es una persona suficientemente concreta para diseñar con sentido?', opts: ['Porque los clientes no existen realmente', 'Porque es una categoría demasiado amplia; hace falta nombrar a alguien específico y su situación concreta', 'Porque solo se puede diseñar para una sola persona en el mundo', 'Porque la palabra "clientes" está prohibida en la metodología'], a: 1, why: ['Los clientes sí existen, el problema es la generalidad de la categoría.', 'Correcto: esa es la razón exacta dada en la lección.', 'No se trata de diseñar para una única persona real, sino para un perfil concreto.', 'No hay tal prohibición de la palabra.'] },
            { q: '¿Qué ventaja tiene un resultado humano bien escrito frente a un entregable, según la lección?', opts: ['Es más corto de escribir', 'Tiene una forma evidente de fracasar, lo que permite detectar a tiempo si el proyecto no está funcionando', 'Elimina la necesidad de cualquier prototipo', 'Garantiza que el proyecto nunca se retrase'], a: 1, why: ['La longitud no es el punto de comparación relevante.', 'Correcto: esa es la ventaja exacta explicada en la lección.', 'No elimina la necesidad de prototipar, la metodología sigue exigiéndolo.', 'No garantiza ausencia de retrasos, es una cuestión de enfoque, no de cronograma.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Cuáles son los tres principios de Enterprise Design Thinking?', opts: ['Presupuesto, cronograma, alcance', 'Resultados humanos, equipos diversos, bucle continuo', 'Velocidad, costo, calidad', 'Planificación, ejecución, cierre'], a: 1, why: ['Esos son criterios de gestión clásica de proyectos, no los principios de esta metodología.', 'Correcto.', 'Esos son criterios genéricos de cualquier proyecto, no específicos de esta metodología.', 'Ese es el modelo de fases que la metodología busca reemplazar.'] },
        { q: '¿Qué distingue al bucle de un modelo de fases tradicional?', opts: ['El bucle no tiene un punto de cierre; cada "hacer" reabre la observación', 'El bucle es más rápido en todos los casos', 'El bucle elimina la necesidad de prototipos', 'El bucle solo aplica a proyectos de software'], a: 0, why: ['Correcto.', 'No se afirma que sea siempre más rápido, sino distinto en su lógica.', 'El bucle depende justamente de prototipar (hacer).', 'Aplica a cualquier tipo de proyecto, no solo software.'] },
        { q: '¿Por qué un plan que nunca se desvía puede ser mala señal?', opts: ['Porque indica que nadie está observando de verdad durante la ejecución', 'Porque los planes siempre deben fallar', 'Porque desviarse es obligatorio por la metodología', 'Porque un plan sin desvíos siempre cuesta más'], a: 0, why: ['Correcto.', 'No se afirma que deban fallar, sino que la ausencia de desvío es sospechosa.', 'No hay tal obligación formal.', 'El costo no es el punto de la observación.'] },
        { q: '¿Qué métrica de avance propone el bucle?', opts: ['Documentos entregados', 'Vueltas de bucle completadas y decisiones que cambiaron', 'Horas facturadas', 'Número de reuniones'], a: 1, why: ['Es la métrica que el bucle reemplaza.', 'Correcto.', 'No es la métrica discutida.', 'No es la métrica discutida.'] },
        { q: '¿Qué problema tiene escribir un objetivo como "migrar al nuevo CRM"?', opts: ['Ninguno, es perfectamente válido', 'No describe qué cambiará para la persona que lo usa, permitiendo que se cumpla sin generar resultado real', 'Es demasiado corto', 'No menciona presupuesto'], a: 1, why: ['Sí tiene el problema señalado en la lección.', 'Correcto.', 'La longitud no es el problema.', 'El presupuesto no es el punto de la crítica.'] },
        { q: '¿Por qué "los usuarios" no es una persona suficientemente concreta para diseñar?', opts: ['Porque los usuarios no existen', 'Porque es una categoría demasiado amplia; hace falta nombrar a alguien específico y su situación', 'Porque solo se diseña para una persona real en el mundo', 'Porque está prohibido mencionarlos'], a: 1, why: ['Sí existen, el problema es la generalidad.', 'Correcto.', 'No se trata de una persona real única, sino de un perfil concreto.', 'No hay tal prohibición.'] },
        { q: '¿Qué ventaja tiene un resultado humano bien escrito?', opts: ['Es más corto', 'Tiene una forma evidente de fracasar, permitiendo detectar a tiempo si algo no funciona', 'Elimina prototipos', 'Garantiza que no habrá retrasos'], a: 1, why: ['La longitud no es la ventaja relevante.', 'Correcto.', 'No elimina prototipos.', 'No garantiza ausencia de retrasos.'] },
        { q: '¿Qué representa el diagrama del bucle (observar-reflexionar-hacer)?', opts: ['Una secuencia lineal de fases que termina en "hacer"', 'Un ciclo continuo sin punto de cierre, donde "hacer" reabre la observación', 'Un organigrama de roles del equipo', 'Un cronograma con fechas fijas'], a: 1, why: ['No es lineal ni termina.', 'Correcto.', 'No es un organigrama.', 'No representa fechas.'] },
        { q: 'Un equipo prototipa un flujo y descubre un problema no anticipado a mitad de proyecto. ¿Qué hace un equipo en modo bucle?', opts: ['Ignora el hallazgo porque la fase de investigación ya se cerró', 'Trata el hallazgo como información valiosa y vuelve a observar', 'Cancela el proyecto de inmediato', 'Documenta el hallazgo para un proyecto futuro, sin actuar ahora'], a: 1, why: ['Esa es la respuesta de un equipo en modo fases, no en modo bucle.', 'Correcto.', 'No implica cancelar el proyecto.', 'El bucle actúa sobre el hallazgo de inmediato, no lo pospone.'] },
        { q: '¿Qué libro se recomienda en esta unidad como referencia sobre validación rápida de ideas de diseño?', opts: ['Sprint, de Jake Knapp, John Zeratsky y Braden Kowitz', 'El origen de las especies, de Charles Darwin', 'Cien años de soledad, de Gabriel García Márquez', 'El arte de la guerra, de Sun Tzu'], a: 0, why: ['Correcto.', 'No relacionado con la metodología.', 'No relacionado con la metodología.', 'No relacionado con la metodología.'] },
      ],
    },
    {
      n: 'Unidad 2',
      title: 'Las claves del método',
      hours: 2,
      lessons: [
        {
          title: 'Colinas: enunciar el resultado, no la funcionalidad',
          mins: 20,
          body: [
            'Una "colina" (hill, en el vocabulario original de IBM) es la forma concreta que toma el principio de "resultado sobre entregable" a nivel de todo un proyecto, no solo de una lección aislada. Una colina se escribe en una sola frase, con una estructura fija: quién es el usuario, qué podrá hacer que hoy no puede, y bajo qué condición. La regla no negociable es que una colina describe un resultado, nunca una funcionalidad ni una tecnología.',
            '"Construir un dashboard de analítica en tiempo real" no es una colina: es una funcionalidad, y una funcionalidad se puede construir perfectamente y no servir para nada. "Un gerente de planta puede detectar una desviación de calidad antes de que afecte a 10 unidades, sin depender de que alguien se lo reporte" sí es una colina: nombra al usuario (el gerente de planta), el resultado (detectar antes de cierto umbral) y la condición (sin depender de un reporte manual). Nótese que esta colina no dice si la solución es un dashboard, una alerta automática o un cambio de proceso —eso se decide después, explorando—.',
            'Esa ambigüedad deliberada sobre el "cómo" es la función central de una colina: mantiene al equipo enfocado en el problema el tiempo suficiente para explorar varias soluciones posibles, en vez de comprometerse con la primera tecnología que alguien propuso en la reunión inicial. Un equipo que empieza el proyecto con "vamos a construir un dashboard" ya cerró esa exploración antes de abrirla; un equipo que empieza con la colina todavía puede descubrir, observando, que la solución correcta no es un dashboard sino una alerta en el mismo sistema que el gerente ya usa.',
            'Las colinas se escriben en plural y se priorizan como conjunto —un proyecto suele tener entre tres y cinco—, no una sola, porque rara vez existe un único resultado que capture todo el valor esperado. Pero el número importa menos que la disciplina de revisarlas: si a mitad de proyecto ninguna decisión se puede trazar de vuelta a una colina, es señal de que el equipo volvió, sin darse cuenta, al modo "lista de funcionalidades".',
          ],
          diagram: {
            title: 'De la intención vaga a la colina accionable',
            mermaid: 'graph TD\n  A["Intención vaga:\\nmejorar la analítica"] --> B["Funcionalidad:\\nconstruir un dashboard"]\n  A --> C["Colina:\\nusuario + resultado + condición"]\n  C --> D["Explorar varias soluciones posibles"]\n  B --> E["Una sola solución, sin explorar alternativas"]',
          },
          example: { title: 'Tres colinas de un mismo proyecto', text: 'Un banco que quiere modernizar la apertura de cuentas podría escribir: (1) "Un cliente nuevo puede abrir una cuenta desde su teléfono en menos de 8 minutos, sin visitar una sucursal." (2) "Un asesor puede ver el estado de una solicitud en curso sin llamar a otro departamento." (3) "Un cliente rechazado entiende por qué, sin tener que preguntar." Ninguna menciona tecnología; las tres son verificables.' },
          keys: [
            'Una colina describe siempre un resultado —usuario, qué podrá hacer, bajo qué condición—, nunca una funcionalidad ni una tecnología.',
            'La ambigüedad deliberada sobre el "cómo" mantiene abierta la exploración de varias soluciones posibles antes de comprometerse con una.',
            'Un proyecto suele tener entre tres y cinco colinas, priorizadas como conjunto, no una única colina que lo explique todo.',
            'Si a mitad de proyecto ninguna decisión se puede trazar de vuelta a una colina, el equipo volvió al modo "lista de funcionalidades" sin notarlo.',
          ],
          recursos: {
            libros: [
              { titulo: 'Inspired: How to Create Products Customers Love', autor: 'Marty Cagan' },
            ],
          },
          exercise: { mins: 20, text: 'Toma un proyecto real o hipotético de tu organización y escribe entre tres y cinco colinas para él, siguiendo la estructura fija: usuario, qué podrá hacer, bajo qué condición. Revisa cada una: ¿describe un resultado, o se te coló una funcionalidad disfrazada de colina?' },
          quiz: [
            { q: '¿Qué es una "colina" en Enterprise Design Thinking?', opts: ['Una funcionalidad técnica priorizada por el equipo', 'Un enunciado de resultado: usuario, qué podrá hacer, bajo qué condición — nunca una funcionalidad', 'Un diagrama de arquitectura del sistema', 'Un cronograma de entregas'], a: 1, why: ['Justo lo que una colina NO debe ser.', 'Correcto.', 'No es un diagrama técnico.', 'No es un cronograma.'] },
            { q: '¿Por qué una colina no debe mencionar la tecnología o solución concreta?', opts: ['Porque la tecnología nunca es relevante', 'Porque mantiene al equipo explorando varias soluciones posibles antes de comprometerse con una', 'Porque está prohibido por regulación', 'Porque las colinas son solo para proyectos sin presupuesto de tecnología'], a: 1, why: ['La tecnología sí es relevante, solo se decide después.', 'Correcto.', 'No existe tal prohibición regulatoria.', 'No hay tal restricción de presupuesto.'] },
            { q: '¿Qué señal indica que un equipo volvió al modo "lista de funcionalidades" sin notarlo?', opts: ['Que el proyecto tiene más de una colina', 'Que a mitad de proyecto ninguna decisión se puede trazar de vuelta a una colina', 'Que el equipo usa un dashboard', 'Que el proyecto tiene más de tres meses de duración'], a: 1, why: ['Tener varias colinas es normal y esperado.', 'Correcto.', 'Usar un dashboard no es en sí la señal.', 'La duración no es la señal descrita.'] },
          ],
        },
        {
          title: 'Playbacks y alineación de equipos',
          mins: 18,
          body: [
            'Un playback es una sesión estructurada en la que el equipo cuenta —no presenta con diapositivas de estado, sino cuenta como una historia— lo que ha aprendido y construido hasta ese momento, ante las personas que necesitan estar alineadas: patrocinadores, otros equipos, usuarios reales. La diferencia entre un playback y una actualización de estado convencional es la dirección de la conversación: un playback busca activamente el desacuerdo y la corrección, no la aprobación.',
            'Existen tres playbacks especialmente reconocidos en el método. El playback de colinas presenta el resultado que el equipo se propone lograr, antes de haber construido nada, para detectar desalineaciones de expectativa cuando todavía cuestan una conversación y no un rediseño. El playback cero presenta la primera dirección de solución completa —normalmente un prototipo navegable, no funcional— para exponerla a la crítica antes de invertir en construirla de verdad. Los playbacks de entrega presentan avances reales del sistema en funcionamiento, a intervalos regulares, mientras se construye.',
            'El error más común al adoptar playbacks es tratarlos como una demo pulida diseñada para impresionar. Un playback bien ejecutado incluye deliberadamente lo que no funcionó, las hipótesis que resultaron falsas y las preguntas todavía abiertas, porque su función es generar retroalimentación honesta, no validación social. Un equipo que solo muestra lo que salió bien en sus playbacks está, sin darse cuenta, entrenando a su audiencia para no darle malas noticias — exactamente lo contrario de lo que necesita un proyecto que todavía está explorando.',
            'La cadencia importa tanto como el contenido: un solo playback al final del proyecto no cumple la función de alineación temprana que el método busca. Los playbacks regulares, aunque muestren avances pequeños o incompletos, permiten corregir el rumbo con el costo de una conversación, no con el costo de meses de trabajo mal orientado.',
          ],
          diagram: {
            title: 'Los tres playbacks reconocidos',
            mermaid: 'graph LR\n  A["Playback de colinas\\n(antes de construir)"] --> B["Playback cero\\n(primer prototipo navegable)"]\n  B --> C["Playbacks de entrega\\n(avances reales, en intervalos)"]',
          },
          example: { title: 'Buscar el desacuerdo, no la aprobación', text: 'En un playback de colinas, un patrocinador dice: "Esto no es lo que yo tenía en mente." Un equipo que busca aprobación lo vive como un fracaso de la sesión. Un equipo que entiende el propósito del playback lo vive como el mejor resultado posible: acaba de evitar meses de trabajo construido sobre un malentendido, al costo de una conversación de veinte minutos.' },
          keys: [
            'Un playback cuenta lo aprendido y construido, buscando activamente el desacuerdo y la corrección, no la aprobación.',
            'Los tres playbacks reconocidos son: de colinas (antes de construir), cero (primer prototipo navegable) y de entrega (avances reales en intervalos regulares).',
            'Un playback bien hecho incluye lo que no funcionó y las preguntas abiertas; ocultarlas entrena a la audiencia a no dar malas noticias.',
            'La cadencia regular de playbacks es lo que permite corregir el rumbo al costo de una conversación, no al costo de meses de trabajo mal orientado.',
          ],
          recursos: {
            videos: [
              { titulo: 'Enterprise Design Thinking at IBM | Eleanor Bartosh, IBM | GIFLondon 2018', canal: 'GIFLondon', url: 'https://www.youtube.com/watch?v=8mcClemz_pM' },
            ],
          },
          exercise: { mins: 15, text: 'Piensa en la última sesión de "actualización de estado" en la que participaste. ¿Buscaba activamente el desacuerdo, o buscaba aprobación? Rediséñala como un playback: ¿qué incluirías que normalmente se omite?' },
          quiz: [
            { q: '¿Qué distingue a un playback de una actualización de estado convencional?', opts: ['El playback usa más diapositivas', 'El playback busca activamente el desacuerdo y la corrección, no la aprobación', 'El playback solo lo hacen los gerentes', 'El playback ocurre solo al final del proyecto'], a: 1, why: ['El formato de diapositivas no es la diferencia relevante.', 'Correcto.', 'No es exclusivo de gerentes.', 'Los playbacks son regulares, no solo al final.'] },
            { q: '¿Cuál es el error más común al adoptar playbacks, según la lección?', opts: ['Hacerlos con demasiada frecuencia', 'Tratarlos como una demo pulida que solo muestra lo que salió bien', 'Invitar a demasiadas personas', 'Hacerlos por escrito en vez de en persona'], a: 1, why: ['La frecuencia regular es justamente lo recomendado.', 'Correcto.', 'El número de invitados no es el error señalado.', 'El formato escrito/presencial no es el punto discutido.'] },
            { q: '¿Por qué la cadencia regular de playbacks es importante?', opts: ['Porque permite corregir el rumbo al costo de una conversación, no de meses de trabajo mal orientado', 'Porque es un requisito legal', 'Porque reduce el número de reuniones totales', 'Porque reemplaza la necesidad de prototipos'], a: 0, why: ['Correcto.', 'No hay tal requisito legal.', 'No necesariamente reduce reuniones totales.', 'No reemplaza los prototipos, los playbacks los presentan.'] },
          ],
        },
        {
          title: 'Usuarios patrocinadores y validación continua',
          mins: 18,
          body: [
            'Un usuario patrocinador es una persona real, con las características del usuario objetivo, que se compromete a participar de forma continua durante todo el proyecto —no una vez, en una entrevista inicial—. Su función no es aprobar decisiones de diseño: es exponer al equipo, con la frecuencia suficiente para que duela ignorarlas, las señales de que algo no está funcionando para las personas reales.',
            'La diferencia entre un usuario patrocinador y la investigación de usuarios convencional es de continuidad. Una ronda de entrevistas al inicio del proyecto genera una fotografía de un momento; un usuario patrocinador genera una serie de fotografías a lo largo de todo el desarrollo, capaz de mostrar si el equipo se está acercando o alejando del resultado buscado a medida que las decisiones se acumulan. Muchos problemas graves de un producto no son visibles en una sola entrevista: solo aparecen cuando alguien intenta usar la versión 8 después de haber usado las siete anteriores.',
            'Conseguir usuarios patrocinadores genuinos —no un panel corporativo entrenado para decir lo que el equipo quiere oír— es, en la práctica, el mayor desafío de este componente del método. La señal de que un usuario patrocinador es genuino es que a veces dice cosas que incomodan al equipo; si nunca lo hace, probablemente esté respondiendo lo que cree que se espera de él, no lo que observa.',
            'La validación continua que ofrecen los usuarios patrocinadores se combina con los playbacks de la lección anterior en un mismo propósito: reducir al mínimo posible el tiempo entre que una decisión se toma y que su efecto real se conoce. Un proyecto sin usuarios patrocinadores ni playbacks regulares puede acumular meses de decisiones sin que nadie sepa, hasta el lanzamiento, si alguna de ellas fue un error.',
          ],
          diagram: {
            title: 'Usuario patrocinador: una serie, no una foto',
            mermaid: 'graph LR\n  E1["Entrevista única\\n(una foto de un momento)"] --> L["Limitada: no ve evolución"]\n  U["Usuario patrocinador\\n(serie continua)"] --> V["Revela si el proyecto\\nse acerca o aleja del objetivo"]',
          },
          keys: [
            'Un usuario patrocinador participa de forma continua durante todo el proyecto, no en una única entrevista inicial.',
            'La continuidad revela problemas que una fotografía única no puede: cómo se siente usar la versión 8 después de las siete anteriores.',
            'Un usuario patrocinador genuino a veces incomoda al equipo; si nunca lo hace, probablemente esté respondiendo lo que cree que se espera de él.',
            'Usuarios patrocinadores y playbacks regulares comparten un mismo propósito: acortar el tiempo entre que se toma una decisión y se conoce su efecto real.',
          ],
          exercise: { mins: 15, text: 'Evalúa si tu organización tiene algo parecido a un "usuario patrocinador" en sus proyectos actuales, o si la investigación de usuarios se limita a una ronda inicial de entrevistas. Si tuvieras que reclutar uno para el próximo proyecto, ¿a quién elegirías y por qué esa persona en particular?' },
          quiz: [
            { q: '¿En qué se diferencia un usuario patrocinador de una entrevista de investigación convencional?', opts: ['No hay ninguna diferencia real', 'El usuario patrocinador participa de forma continua durante todo el proyecto, no en un único momento inicial', 'El usuario patrocinador siempre aprueba las decisiones del equipo', 'El usuario patrocinador es un empleado interno de la empresa'], a: 1, why: ['Sí hay una diferencia real de continuidad.', 'Correcto.', 'Su función no es aprobar, es exponer señales.', 'No necesariamente es un empleado interno; debe representar al usuario real.'] },
            { q: '¿Cuál es la señal de que un usuario patrocinador es genuino y no un panel entrenado para complacer al equipo?', opts: ['Que siempre está de acuerdo con las decisiones del equipo', 'Que a veces dice cosas que incomodan al equipo', 'Que asiste a todas las reuniones sin faltar nunca', 'Que tiene un cargo directivo en su organización'], a: 1, why: ['El acuerdo constante es señal de lo contrario: que responde lo esperado.', 'Correcto.', 'La asistencia perfecta no es la señal descrita.', 'El cargo no es relevante para esta evaluación.'] },
            { q: '¿Qué propósito comparten los usuarios patrocinadores y los playbacks regulares?', opts: ['Reducir el número total de reuniones del proyecto', 'Acortar el tiempo entre que se toma una decisión y se conoce su efecto real', 'Eliminar la necesidad de prototipos', 'Aumentar el presupuesto disponible del proyecto'], a: 1, why: ['No es el propósito compartido descrito.', 'Correcto.', 'No eliminan la necesidad de prototipos.', 'No se relaciona con el presupuesto.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Qué es una "colina" en Enterprise Design Thinking?', opts: ['Una funcionalidad priorizada', 'Un enunciado de resultado: usuario, qué podrá hacer, bajo qué condición', 'Un diagrama de arquitectura', 'Un cronograma de entregas'], a: 1, why: ['Justo lo que NO debe ser.', 'Correcto.', 'No es un diagrama técnico.', 'No es un cronograma.'] },
        { q: '¿Por qué una colina no menciona la solución técnica concreta?', opts: ['La tecnología nunca es relevante', 'Mantiene al equipo explorando varias soluciones antes de comprometerse con una', 'Está prohibido por regulación', 'Solo aplica sin presupuesto'], a: 1, why: ['Sí es relevante, se decide después.', 'Correcto.', 'No hay tal prohibición.', 'No hay tal restricción.'] },
        { q: '¿Cuántas colinas suele tener un proyecto?', opts: ['Exactamente una', 'Entre tres y cinco, priorizadas como conjunto', 'Más de veinte', 'Ninguna, son opcionales'], a: 1, why: ['Rara vez una sola colina captura todo el valor esperado.', 'Correcto.', 'Un número tan alto perdería el foco.', 'No son opcionales en la metodología.'] },
        { q: '¿Qué distingue a un playback de una actualización de estado convencional?', opts: ['Usa más diapositivas', 'Busca activamente el desacuerdo y la corrección, no la aprobación', 'Solo lo hacen gerentes', 'Ocurre solo al final'], a: 1, why: ['No es una diferencia de formato.', 'Correcto.', 'No es exclusivo de gerentes.', 'Los playbacks son regulares.'] },
        { q: '¿Cuáles son los tres playbacks reconocidos en el método?', opts: ['Inicio, medio, fin', 'De colinas, cero, de entrega', 'Diseño, desarrollo, pruebas', 'Kickoff, retro, cierre'], a: 1, why: ['No es la nomenclatura del método.', 'Correcto.', 'Son fases genéricas, no los playbacks del método.', 'No es la nomenclatura del método.'] },
        { q: '¿Qué error se comete al tratar un playback como una demo pulida?', opts: ['Ninguno, es la forma correcta de hacerlo', 'Se omiten los fracasos y preguntas abiertas, entrenando a la audiencia a no dar malas noticias', 'Se vuelve demasiado breve', 'Se necesita más presupuesto'], a: 1, why: ['Sí es un error real señalado en la lección.', 'Correcto.', 'La duración no es el punto.', 'El presupuesto no es el punto.'] },
        { q: '¿Qué es un usuario patrocinador?', opts: ['Un empleado que financia el proyecto', 'Una persona real del perfil objetivo que participa de forma continua durante todo el proyecto', 'Un gerente que aprueba el diseño final', 'Un cliente que paga por la versión beta'], a: 1, why: ['No se refiere a financiamiento.', 'Correcto.', 'Su función no es aprobar.', 'No se refiere a pago por beta.'] },
        { q: '¿Qué señal indica que un usuario patrocinador es genuino?', opts: ['Siempre aprueba las decisiones del equipo', 'A veces dice cosas que incomodan al equipo', 'Asiste sin faltar nunca', 'Tiene cargo directivo'], a: 1, why: ['El acuerdo constante sugiere lo contrario.', 'Correcto.', 'La asistencia perfecta no es la señal.', 'El cargo no es relevante.'] },
        { q: '¿Qué propósito comparten usuarios patrocinadores y playbacks regulares?', opts: ['Reducir reuniones totales', 'Acortar el tiempo entre una decisión y conocer su efecto real', 'Eliminar prototipos', 'Aumentar presupuesto'], a: 1, why: ['No es el propósito compartido.', 'Correcto.', 'No eliminan prototipos.', 'No se relaciona con presupuesto.'] },
        { q: 'Un patrocinador dice en un playback de colinas "esto no es lo que tenía en mente". ¿Cómo lo interpreta un equipo que entiende el método?', opts: ['Como un fracaso de la sesión', 'Como el mejor resultado posible: evitó meses de trabajo mal orientado al costo de una conversación', 'Como una señal de que hay que cancelar el proyecto', 'Como una crítica personal que se debe ignorar'], a: 1, why: ['Es justo lo contrario de un fracaso.', 'Correcto.', 'No implica cancelar el proyecto.', 'No debe ignorarse, es información valiosa.'] },
      ],
    },
  ],
}

// Contenido propio de la aula "Cursos cortos: evaluación de LLMs y sistemas
// de prompts" (recrea el temario público de los short courses relevantes de
// DeepLearning.AI). Ver aula-enterprise-design-thinking.js para el patrón.

module.exports = {
  units: [
    {
      n: 'Bloque 1',
      title: 'Prompting sistemático',
      hours: 2,
      lessons: [
        {
          title: 'Principios de un prompt reproducible',
          mins: 20,
          body: [
            'Un prompt escrito por prueba y error hasta que "funciona" en un par de ejemplos es el equivalente, en sistemas de IA generativa, a un código sin pruebas: puede funcionar hoy y fallar mañana sin que nadie note el cambio hasta que un cliente se queja. Un prompt reproducible se diseña con la misma disciplina que cualquier otro componente de software que va a producción: versión controlada, entradas y salidas bien definidas, y un conjunto de casos que confirman que sigue funcionando después de cualquier cambio.',
            'La estructura de un prompt reproducible separa deliberadamente cuatro elementos que en un prompt improvisado suelen mezclarse en un solo párrafo: el rol o contexto que debe asumir el modelo, la tarea específica a realizar, el formato exacto de la respuesta esperada, y las restricciones o casos límite que debe respetar. Mezclar estos cuatro elementos sin estructura produce prompts que funcionan la mayoría de las veces pero fallan de forma impredecible en los casos límite, precisamente porque esos límites nunca se hicieron explícitos.',
            'La versión de un prompt no es un detalle administrativo: dos versiones de un mismo prompt, aunque difieran en una sola frase, pueden producir distribuciones de respuesta notablemente distintas. Tratar un prompt como código —con su propio control de versiones, su propio historial de cambios y su propia relación con los resultados que produjo cada versión— es lo que permite responder, meses después, a la pregunta "¿por qué cambió el comportamiento del sistema la semana pasada?" en vez de sospechar sin evidencia.',
            'El formato exacto de salida merece atención propia porque es, en la práctica, la fuente más común de fallos silenciosos en sistemas que integran un modelo de lenguaje con otro software: si el prompt no especifica con precisión la estructura esperada de la respuesta —un JSON con campos exactos, una lista con un número fijo de elementos—, el sistema que consume esa respuesta fallará de forma intermitente, y ese fallo se atribuirá erróneamente al modelo cuando el problema real está en un prompt que nunca fijó el contrato de formato con suficiente precisión.',
          ],
          example: { title: 'De prompt improvisado a prompt reproducible', text: '"Resume este documento" es un prompt improvisado: no dice para quién, con qué extensión, ni en qué formato. "Actúa como analista de riesgos. Resume el documento adjunto en máximo 150 palabras, en tres puntos con viñetas, priorizando cifras concretas sobre juicios cualitativos. Si el documento no contiene cifras, indícalo explícitamente en vez de inventarlas" es reproducible: rol, tarea, formato y restricción de caso límite, todos explícitos.' },
          keys: [
            'Un prompt reproducible separa rol/contexto, tarea, formato de salida y restricciones — mezclarlos en un párrafo produce fallos impredecibles en casos límite.',
            'Dos versiones de un mismo prompt, aunque difieran en una sola frase, pueden producir distribuciones de respuesta notablemente distintas.',
            'Versionar prompts como código permite responder con evidencia a "por qué cambió el comportamiento del sistema", en vez de sospechar sin datos.',
            'La fuente más común de fallos silenciosos en sistemas que integran un LLM es un formato de salida no especificado con precisión, no el modelo en sí.',
          ],
          diagram: {
            title: 'Cuatro elementos de un prompt reproducible',
            mermaid: 'graph TD\n  P["Prompt reproducible"] --> R["Rol / contexto"]\n  P --> T["Tarea específica"]\n  P --> F["Formato de salida exacto"]\n  P --> C["Restricciones y casos límite"]',
          },
          recursos: {
            libros: [
              { titulo: 'AI Engineering', autor: 'Chip Huyen' },
            ],
          },
          exercise: { mins: 15, text: 'Toma un prompt que uses regularmente (o uno improvisado de un colega) y reescríbelo separando explícitamente rol, tarea, formato de salida y restricciones de caso límite. Pruébalo con un caso límite deliberado (una entrada vacía, ambigua o inesperada) y compara el comportamiento antes y después.' },
          quiz: [
            { q: '¿Qué cuatro elementos separa un prompt reproducible que un prompt improvisado suele mezclar?', opts: ['Longitud, idioma, tono, velocidad', 'Rol/contexto, tarea, formato de salida, restricciones', 'Modelo, temperatura, tokens, costo', 'Usuario, fecha, versión, autor'], a: 1, why: ['No son los elementos descritos en la lección.', 'Correcto.', 'Son parámetros técnicos, no los elementos estructurales del prompt en sí.', 'No son los elementos descritos en la lección.'] },
            { q: '¿Por qué versionar los prompts como código es una práctica recomendada?', opts: ['Porque los prompts nunca cambian una vez escritos', 'Porque permite responder con evidencia por qué cambió el comportamiento del sistema tras una modificación', 'Porque es un requisito legal en todos los países', 'Porque reduce el costo de las llamadas al modelo'], a: 1, why: ['Sí cambian con frecuencia, por eso se versionan.', 'Correcto.', 'No hay tal requisito legal general.', 'No se relaciona directamente con el costo por llamada.'] },
            { q: '¿Cuál es la fuente más común de fallos silenciosos en sistemas que integran un LLM con otro software?', opts: ['Que el modelo sea demasiado lento', 'Un formato de salida no especificado con precisión en el prompt', 'Que el modelo use demasiados tokens', 'Que el usuario final no sepa usar el sistema'], a: 1, why: ['La velocidad no es la causa más común señalada.', 'Correcto.', 'El uso de tokens no es la causa más común señalada.', 'No es un problema del usuario final, es de diseño del prompt.'] },
          ],
        },
        {
          title: 'Encadenamiento y descomposición de tareas',
          mins: 20,
          body: [
            'Pedirle a un modelo de lenguaje que resuelva una tarea compleja en un único prompt monolítico —"lee este contrato, identifica los riesgos, redacta una respuesta y sugiere una contraoferta"— produce, con frecuencia, un resultado mediocre en las cuatro subtareas a la vez, porque el modelo reparte su capacidad de razonamiento entre pasos que compiten entre sí dentro de una misma generación. Descomponer esa tarea en una cadena de prompts más pequeños, cada uno con una única responsabilidad, suele producir mejores resultados en cada paso individual, aunque el proceso completo tome más llamadas al modelo.',
            'El encadenamiento tiene una ventaja adicional que va más allá de la calidad de cada paso: cada eslabón de la cadena se puede depurar, probar y mejorar por separado. Si el paso de "identificar riesgos" produce resultados pobres, se puede ajustar ese prompt específico sin tocar los otros tres, algo imposible cuando los cuatro pasos están fusionados en una sola generación monolítica donde no hay forma de aislar cuál de las cuatro tareas está fallando.',
            'La descomposición correcta de una tarea compleja exige identificar los puntos donde el resultado de un paso se puede verificar de forma independiente antes de continuar al siguiente. Si el paso de identificación de riesgos produce una lista vacía en un contrato que claramente tiene cláusulas problemáticas, ese es el momento de detener la cadena y señalar el fallo, no de continuar generando una contraoferta basada en una lista de riesgos incompleta que arrastrará el error a los pasos siguientes sin que nadie lo note.',
            'No toda tarea se beneficia de encadenarse: dividir en exceso una tarea simple añade latencia, costo y puntos de fallo sin ninguna mejora real de calidad. La pregunta que decide si conviene encadenar no es "¿se puede dividir esta tarea?" —casi cualquier tarea se puede dividir— sino "¿mejora la calidad de algún paso individual dividirlo, o solo añade pasos?".',
          ],
          diagram: {
            title: 'De un prompt monolítico a una cadena verificable',
            mermaid: 'graph LR\n  A["Prompt monolítico:\\ntodo en una sola llamada"] --> B["Resultado mediocre\\nen varias subtareas a la vez"]\n  C["Paso 1: identificar"] --> D{"¿Resultado\\nverificable?"}\n  D -->|Sí| E["Paso 2: redactar"]\n  D -->|No| F["Detener y señalar fallo"]\n  E --> G["Paso 3: sugerir"]',
          },
          keys: [
            'Un prompt monolítico que pide varias subtareas a la vez reparte la capacidad de razonamiento del modelo entre pasos que compiten, con calidad mediocre en cada uno.',
            'Encadenar prompts permite depurar, probar y mejorar cada paso por separado, algo imposible cuando todo está fusionado en una sola generación.',
            'La descomposición correcta identifica puntos de verificación intermedios: si un paso falla, se detiene la cadena ahí, no se arrastra el error a los pasos siguientes.',
            'No toda tarea se beneficia de encadenarse: la pregunta correcta es si dividir mejora la calidad de algún paso, no si la tarea se puede dividir.',
          ],
          exercise: { mins: 15, text: 'Toma una tarea compleja que hoy resuelves con un único prompt. Divídela en 2-3 pasos encadenados, cada uno con una única responsabilidad. Identifica qué verificarías entre cada paso antes de continuar al siguiente.' },
          quiz: [
            { q: '¿Por qué un prompt monolítico que pide varias subtareas a la vez suele producir resultados mediocres?', opts: ['Porque los modelos de lenguaje no pueden generar texto largo', 'Porque el modelo reparte su capacidad de razonamiento entre pasos que compiten dentro de una misma generación', 'Porque siempre excede el límite de tokens', 'Porque es más lento de ejecutar'], a: 1, why: ['Sí pueden generar texto largo; ese no es el problema.', 'Correcto.', 'No siempre excede el límite de tokens.', 'La velocidad no es la razón de la mediocridad del resultado.'] },
            { q: '¿Qué ventaja tiene encadenar prompts sobre un prompt monolítico, más allá de la calidad de cada paso?', opts: ['Ninguna ventaja adicional', 'Cada eslabón se puede depurar, probar y mejorar por separado', 'Siempre es más barato en total', 'Elimina la necesidad de cualquier verificación'], a: 1, why: ['Sí tiene una ventaja adicional real.', 'Correcto.', 'No siempre es más barato; puede costar más en total.', 'No elimina la verificación, la hace posible paso a paso.'] },
            { q: '¿Qué pregunta decide si conviene encadenar una tarea, según la lección?', opts: ['¿Se puede dividir esta tarea en pasos?', '¿Mejora la calidad de algún paso individual dividirlo, o solo añade pasos sin beneficio?', '¿Cuántos tokens consume la tarea completa?', '¿Cuánto tiempo toma la tarea sin dividir?'], a: 1, why: ['Casi cualquier tarea se puede dividir; esa no es la pregunta útil.', 'Correcto.', 'El consumo de tokens no es el criterio de decisión principal.', 'El tiempo no es el criterio de decisión principal.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Qué cuatro elementos separa un prompt reproducible?', opts: ['Longitud, idioma, tono, velocidad', 'Rol/contexto, tarea, formato de salida, restricciones', 'Modelo, temperatura, tokens, costo', 'Usuario, fecha, versión, autor'], a: 1, why: ['No son los elementos descritos.', 'Correcto.', 'Son parámetros técnicos, no estructurales.', 'No son los elementos descritos.'] },
        { q: '¿Por qué versionar prompts como código?', opts: ['Los prompts nunca cambian', 'Permite responder con evidencia por qué cambió el comportamiento del sistema', 'Es un requisito legal universal', 'Reduce el costo por llamada'], a: 1, why: ['Sí cambian con frecuencia.', 'Correcto.', 'No hay tal requisito legal general.', 'No se relaciona directamente con el costo.'] },
        { q: '¿Cuál es la fuente más común de fallos silenciosos al integrar un LLM con otro software?', opts: ['Que el modelo sea lento', 'Un formato de salida no especificado con precisión', 'Que use demasiados tokens', 'Que el usuario no sepa usarlo'], a: 1, why: ['La velocidad no es la causa más común.', 'Correcto.', 'El uso de tokens no es la causa más común.', 'No es un problema del usuario final.'] },
        { q: '¿Por qué un prompt monolítico con varias subtareas produce resultados mediocres?', opts: ['No puede generar texto largo', 'Reparte la capacidad de razonamiento entre pasos que compiten', 'Siempre excede el límite de tokens', 'Es más lento'], a: 1, why: ['Sí puede generar texto largo.', 'Correcto.', 'No siempre excede el límite.', 'La velocidad no es la razón.'] },
        { q: '¿Qué ventaja tiene encadenar prompts más allá de la calidad de cada paso?', opts: ['Ninguna adicional', 'Cada eslabón se puede depurar y mejorar por separado', 'Siempre es más barato', 'Elimina la verificación'], a: 1, why: ['Sí hay una ventaja adicional real.', 'Correcto.', 'No siempre es más barato.', 'Hace posible la verificación, no la elimina.'] },
        { q: '¿Qué pregunta decide si conviene encadenar una tarea?', opts: ['¿Se puede dividir?', '¿Mejora la calidad de algún paso dividirlo?', '¿Cuántos tokens consume?', '¿Cuánto tiempo toma sin dividir?'], a: 1, why: ['Casi todo se puede dividir; no es la pregunta útil.', 'Correcto.', 'No es el criterio principal.', 'No es el criterio principal.'] },
        { q: '¿Qué debería pasar si un paso intermedio de una cadena produce un resultado claramente incompleto?', opts: ['Continuar de todas formas al siguiente paso', 'Detener la cadena y señalar el fallo en ese punto', 'Ignorarlo y repetir la cadena completa desde cero cada vez', 'Cambiar de modelo automáticamente'], a: 1, why: ['Continuar arrastraría el error a los pasos siguientes.', 'Correcto.', 'No es necesario repetir todo desde cero.', 'Cambiar de modelo no es la respuesta descrita.'] },
        { q: '¿Qué prompt es más reproducible?', opts: ['"Resume este documento"', '"Actúa como analista de riesgos. Resume en máximo 150 palabras, en tres viñetas, priorizando cifras."', 'Cualquiera de los dos es igual de reproducible', 'Ninguno, la reproducibilidad no aplica a prompts'], a: 1, why: ['Carece de rol, formato y restricciones explícitas.', 'Correcto.', 'No son equivalentes en reproducibilidad.', 'Sí aplica, es el tema central de la lección.'] },
        { q: '¿Qué libro se recomienda en esta unidad sobre ingeniería con modelos de lenguaje en producción?', opts: ['AI Engineering, de Chip Huyen', 'Rayuela, de Julio Cortázar', 'Los miserables, de Victor Hugo', 'Meditaciones, de Marco Aurelio'], a: 0, why: ['Correcto.', 'No relacionado con la materia.', 'No relacionado con la materia.', 'No relacionado con la materia.'] },
        { q: '¿Qué ocurre si dos versiones de un mismo prompt difieren en una sola frase?', opts: ['Siempre producen exactamente la misma respuesta', 'Pueden producir distribuciones de respuesta notablemente distintas', 'Es imposible que difieran en el resultado', 'Solo afecta el costo, nunca el contenido'], a: 1, why: ['No siempre son idénticas.', 'Correcto.', 'Sí es posible que difieran.', 'Puede afectar tanto costo como contenido.'] },
      ],
    },
    {
      n: 'Bloque 2',
      title: 'Evaluación de sistemas con LLM',
      hours: 3,
      lessons: [
        {
          title: 'Construir un conjunto de evaluación propio',
          mins: 25,
          body: [
            'Evaluar un sistema basado en modelos de lenguaje "probándolo a mano con algunos ejemplos hasta que se vea bien" es la práctica más extendida y, a la vez, la que con más frecuencia produce sorpresas desagradables en producción. Un conjunto de evaluación propio —una colección fija de casos de entrada con el criterio explícito de qué constituye una respuesta aceptable para cada uno— convierte esa impresión subjetiva en una medición repetible que se puede volver a correr después de cualquier cambio: de modelo, de prompt, o de proveedor.',
            'Construir este conjunto exige, sobre todo, cubrir deliberadamente los casos difíciles, no solo los típicos: entradas ambiguas, entradas fuera del dominio esperado, entradas adversariales que un usuario real eventualmente probará, y casos límite donde la respuesta correcta es "no sé" o "esto está fuera de mi alcance" en vez de una respuesta confiada pero incorrecta. Un conjunto de evaluación compuesto solo por casos fáciles da una falsa sensación de seguridad: cualquier sistema razonable pasa los casos fáciles.',
            'El origen de los casos importa tanto como su dificultad: los mejores conjuntos de evaluación se nutren de interacciones reales de producción —preguntas que usuarios reales hicieron y que el sistema respondió mal, capturadas y curadas con el tiempo— en vez de depender exclusivamente de casos inventados por el propio equipo de desarrollo, que tiende a imaginar problemas más simples y más parecidos entre sí que los que realmente encuentra un usuario real fuera de contexto.',
            'Un conjunto de evaluación no es una inversión que se hace una sola vez: crece con el sistema. Cada fallo real detectado en producción, una vez diagnosticado, se convierte en un nuevo caso del conjunto de evaluación, para que esa clase específica de fallo nunca vuelva a pasar desapercibida en una versión futura sin que al menos una prueba lo señale.',
          ],
          example: { title: 'De impresión subjetiva a medición repetible', text: 'Un equipo cambia el modelo subyacente de su asistente y lo prueba manualmente con cinco preguntas típicas: "se ve bien". Sin un conjunto de evaluación con 50 casos que incluyan ambigüedad, temas fuera de dominio y preguntas que fallaron en el pasado, ese "se ve bien" no dice nada sobre si el cambio mejoró o empeoró el sistema en los casos que realmente importan.' },
          keys: [
            'Un conjunto de evaluación propio convierte una impresión subjetiva en una medición repetible tras cualquier cambio de modelo, prompt o proveedor.',
            'Cubrir deliberadamente casos difíciles —ambiguos, fuera de dominio, adversariales— es más importante que cubrir muchos casos fáciles.',
            'Los mejores casos de evaluación provienen de interacciones reales de producción, no solo de casos inventados por el equipo de desarrollo.',
            'Cada fallo real diagnosticado en producción debería convertirse en un nuevo caso del conjunto de evaluación, para que ese tipo de fallo nunca vuelva a pasar desapercibido.',
          ],
          diagram: {
            title: 'Construir un conjunto de evaluación con casos difíciles',
            mermaid: 'graph LR\n  T["Casos típicos\\n(fáciles)"] --> S["Falsa sensación\\nde seguridad si son los únicos"]\n  A["Casos ambiguos"] --> E["Conjunto de evaluación robusto"]\n  F["Casos fuera de dominio"] --> E\n  L["Casos límite:\\nla respuesta correcta es no sé"] --> E',
          },
          exercise: { mins: 20, text: 'Diseña 5 casos para un conjunto de evaluación de un sistema basado en LLM de tu contexto: al menos uno típico, uno ambiguo, uno fuera de dominio y uno donde la respuesta correcta debería ser "no sé" o "fuera de mi alcance". Para cada uno, escribe el criterio explícito de qué constituye una respuesta aceptable.' },
          quiz: [
            { q: '¿Qué problema tiene evaluar un sistema de LLM "probándolo a mano hasta que se vea bien"?', opts: ['Ningún problema, es suficiente para producción', 'No es repetible ni cubre sistemáticamente los casos difíciles, dando falsa sensación de seguridad', 'Es demasiado costoso de hacer', 'Requiere demasiado tiempo de cómputo'], a: 1, why: ['Sí tiene un problema real señalado en la lección.', 'Correcto.', 'No es un problema de costo económico.', 'No es un problema de cómputo.'] },
            { q: '¿Por qué es más importante cubrir casos difíciles que casos fáciles en un conjunto de evaluación?', opts: ['Los casos fáciles no existen en la práctica', 'Cualquier sistema razonable pasa los casos fáciles; los difíciles son los que revelan problemas reales', 'Los casos fáciles son más costosos de evaluar', 'No hay diferencia real entre ambos tipos'], a: 1, why: ['Sí existen, solo que no son informativos por sí solos.', 'Correcto.', 'No son más costosos, al contrario.', 'Sí hay una diferencia real de valor informativo.'] },
            { q: '¿De dónde deberían provenir preferentemente los mejores casos de un conjunto de evaluación?', opts: ['Exclusivamente de la imaginación del equipo de desarrollo', 'De interacciones reales de producción, curadas con el tiempo', 'De un generador aleatorio de texto', 'De la documentación técnica del modelo'], a: 1, why: ['Los casos inventados por el equipo tienden a ser más simples de lo real.', 'Correcto.', 'No se describe el uso de generación aleatoria.', 'La documentación técnica no es la fuente descrita.'] },
          ],
        },
        {
          title: 'Jueces automáticos y sus sesgos',
          mins: 22,
          body: [
            'Cuando el volumen de casos de evaluación crece más allá de lo que un equipo humano puede revisar caso por caso, se vuelve habitual usar un segundo modelo de lenguaje como "juez" que califica automáticamente las respuestas del sistema evaluado contra el criterio esperado. Esta práctica —conocida como LLM-as-judge— escala la evaluación de forma significativa, pero introduce sesgos propios que hay que conocer explícitamente para no confiar en el resultado más de lo que merece.',
            'El sesgo más documentado es la preferencia por respuestas más largas: un juez automático tiende a calificar mejor una respuesta extensa que una breve e igualmente correcta, simplemente porque el texto adicional se percibe como "más completo", aunque no aporte información relevante nueva. Un segundo sesgo conocido favorece la posición: si al juez se le presentan dos respuestas para comparar, tiende a preferir sistemáticamente la que aparece primero o segunda según el modelo, independientemente de su calidad real — un sesgo que se corrige alternando el orden de presentación entre evaluaciones repetidas.',
            'Un tercer sesgo, más sutil, es la autopreferencia: un modelo usado como juez tiende a calificar mejor las respuestas generadas por un modelo de la misma familia o el mismo proveedor que él mismo, un problema real cuando se evalúa si conviene cambiar de proveedor de modelo, porque el juez puede estar sesgado precisamente hacia la opción que se quiere evaluar objetivamente.',
            'La forma práctica de mitigar estos sesgos no es abandonar el uso de jueces automáticos —serían inviables de reemplazar completamente por revisión humana a gran escala— sino calibrarlos: validar periódicamente el juicio automático contra una muestra pequeña evaluada por humanos, medir el nivel de acuerdo entre ambos, y tratar con escepticismo cualquier resultado de evaluación automática que no se haya validado nunca contra criterio humano en absoluto.',
          ],
          keys: [
            'LLM-as-judge escala la evaluación más allá de lo que un equipo humano puede revisar caso por caso, pero introduce sesgos propios que hay que conocer.',
            'El sesgo de longitud favorece respuestas más extensas aunque no sean más informativas; el sesgo de posición favorece sistemáticamente el primer o segundo elemento presentado.',
            'La autopreferencia hace que un modelo usado como juez tienda a calificar mejor a modelos de su misma familia, un problema real al comparar proveedores.',
            'La mitigación práctica no es abandonar los jueces automáticos, sino calibrarlos periódicamente contra una muestra evaluada por humanos.',
          ],
          diagram: {
            title: 'Sesgos de un juez automático',
            mermaid: 'graph TD\n  J["Juez automático (LLM)"] --> L["Sesgo de longitud\\nprefiere respuestas largas"]\n  J --> P["Sesgo de posición\\nprefiere la 1ª o 2ª opción"]\n  J --> A["Autopreferencia\\nprefiere modelos de su misma familia"]\n  L --> C["Calibrar contra\\ncriterio humano"]\n  P --> C\n  A --> C',
          },
          recursos: {
            libros: [
              { titulo: 'The LLM Engineering Handbook', autor: 'Paul Iusztin, Maxime Labonne' },
            ],
          },
          exercise: { mins: 15, text: 'Si tu equipo usa (o planea usar) un juez automático para evaluar respuestas, diseña un experimento pequeño: toma 10 casos, evalúalos con el juez automático y con criterio humano por separado, y mide en cuántos coinciden. Ese porcentaje de acuerdo es tu primera calibración real.' },
          quiz: [
            { q: '¿Qué es LLM-as-judge?', opts: ['Un modelo que reemplaza por completo la necesidad de escribir prompts', 'Usar un segundo modelo de lenguaje para calificar automáticamente las respuestas de un sistema evaluado', 'Un tribunal legal especializado en regulación de IA', 'Un tipo de arquitectura de red neuronal'], a: 1, why: ['No reemplaza la escritura de prompts.', 'Correcto.', 'No se refiere a un tribunal legal.', 'No es un tipo de arquitectura de red neuronal.'] },
            { q: '¿Qué es el sesgo de longitud en un juez automático?', opts: ['El juez tarda más en evaluar textos largos', 'El juez tiende a calificar mejor respuestas más extensas, aunque no aporten información relevante adicional', 'El juez solo puede procesar textos cortos', 'El juez ignora completamente la longitud del texto'], a: 1, why: ['No se refiere al tiempo de evaluación.', 'Correcto.', 'Puede procesar textos largos, ese no es el problema.', 'Sí la considera, y de forma sesgada.'] },
            { q: '¿Cuál es la forma práctica recomendada para mitigar los sesgos de un juez automático?', opts: ['Abandonar por completo el uso de jueces automáticos', 'Calibrarlos periódicamente contra una muestra pequeña evaluada por criterio humano', 'Usar siempre el modelo más caro disponible como juez', 'Ignorar los sesgos porque no tienen solución práctica'], a: 1, why: ['Serían inviables de reemplazar completamente a esa escala.', 'Correcto.', 'El costo del modelo no es la solución al sesgo.', 'Sí existe una mitigación práctica real.'] },
          ],
        },
        {
          title: 'Medir regresiones entre versiones',
          mins: 20,
          body: [
            'Una regresión, en el contexto de sistemas basados en modelos de lenguaje, es cuando un cambio —de prompt, de modelo, de proveedor, de parámetros— mejora el sistema en promedio pero empeora casos específicos que antes funcionaban bien. Medir solo el promedio agregado de un conjunto de evaluación puede ocultar por completo este problema: un promedio que sube de 82% a 85% puede estar compuesto por una mejora notable en un tipo de caso y un deterioro silencioso en otro, y el promedio agregado nunca lo revela por sí solo.',
            'La práctica que expone las regresiones es comparar resultado por resultado, caso por caso, entre la versión anterior y la nueva, no solo el agregado. Un caso que pasaba de "aceptable" a "no aceptable" entre versiones es una regresión concreta, identificable y diagnosticable, exactamente el tipo de información que un promedio agregado disuelve y hace invisible.',
            'Segmentar el conjunto de evaluación por categoría de caso —por tipo de consulta, por idioma, por longitud de entrada— antes de comparar versiones revela patrones que el agregado global oculta: un cambio de modelo puede mejorar consistentemente las consultas en español y empeorar las consultas en inglés, un patrón invisible en la métrica global pero crítico si la mitad de los usuarios reales consulta en inglés.',
            'Esta disciplina de comparación caso por caso y por segmento conecta directamente con la práctica de control de versiones vista en la primera lección de esta unidad: sin un conjunto de evaluación versionado y estable entre corridas, ninguna comparación de regresión es válida, porque no habría certeza de estar comparando exactamente los mismos casos entre una versión del sistema y la siguiente.',
          ],
          diagram: {
            title: 'El promedio que oculta una regresión',
            mermaid: 'graph TD\n  A["Versión anterior: 82% promedio"] --> C["Comparación caso por caso"]\n  B["Versión nueva: 85% promedio"] --> C\n  C --> D["Categoría A: mejora de 70% a 95%"]\n  C --> E["Categoría B: empeora de 90% a 78%"]\n  D --> F["El promedio global (85%) oculta\\nel deterioro real en Categoría B"]\n  E --> F',
          },
          keys: [
            'Una regresión es cuando un cambio mejora el promedio pero empeora casos específicos que antes funcionaban — el agregado puede ocultarla por completo.',
            'Comparar resultado por resultado entre versión anterior y nueva, no solo el promedio, es lo que expone regresiones concretas y diagnosticables.',
            'Segmentar por categoría (tipo de consulta, idioma, longitud) revela patrones que el agregado global esconde, como una mejora en un idioma y un deterioro en otro.',
            'Sin un conjunto de evaluación versionado y estable entre corridas, ninguna comparación de regresión es válida.',
          ],
          exercise: { mins: 15, text: 'Si tienes acceso a resultados de evaluación de dos versiones de un sistema (o puedes simularlo), compara caso por caso en vez de solo el promedio. ¿Hay algún caso que empeoró aunque el promedio general haya mejorado?' },
          quiz: [
            { q: '¿Qué es una regresión en el contexto de sistemas basados en LLM?', opts: ['Cuando el sistema deja de funcionar por completo', 'Cuando un cambio mejora el promedio pero empeora casos específicos que antes funcionaban bien', 'Cuando se reduce el costo de operación del sistema', 'Cuando se actualiza la documentación del sistema'], a: 1, why: ['No implica dejar de funcionar por completo.', 'Correcto.', 'No se refiere al costo de operación.', 'No se refiere a documentación.'] },
            { q: '¿Por qué medir solo el promedio agregado puede ocultar una regresión?', opts: ['Porque el promedio siempre es inexacto matemáticamente', 'Porque una mejora en un tipo de caso puede compensar un deterioro en otro sin que el promedio lo revele', 'Porque el promedio no se puede calcular en sistemas de LLM', 'Porque las regresiones nunca afectan al promedio'], a: 1, why: ['El promedio es matemáticamente exacto, el problema es su interpretación aislada.', 'Correcto.', 'Sí se puede calcular normalmente.', 'Sí pueden afectar al promedio, solo que de forma compensada.'] },
            { q: '¿Qué revela segmentar el conjunto de evaluación por categoría antes de comparar versiones?', opts: ['Nada adicional al promedio global', 'Patrones como una mejora en un idioma y un deterioro simultáneo en otro, invisibles en el agregado', 'Solo el costo total de la evaluación', 'El tiempo de respuesta del sistema'], a: 1, why: ['Sí revela información adicional relevante.', 'Correcto.', 'No se centra en el costo de evaluación.', 'No se centra en el tiempo de respuesta.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Qué convierte un conjunto de evaluación propio en algo valioso?', opts: ['Que solo contenga casos fáciles', 'Que sea repetible y cubra deliberadamente casos difíciles, no solo típicos', 'Que lo genere automáticamente un modelo sin revisión', 'Que tenga al menos 1000 casos sin importar su calidad'], a: 1, why: ['Los casos fáciles solos dan falsa seguridad.', 'Correcto.', 'La revisión sigue siendo necesaria.', 'La cantidad sin calidad no es el criterio central.'] },
        { q: '¿De dónde deberían provenir los mejores casos de evaluación?', opts: ['Exclusivamente de la imaginación del equipo', 'De interacciones reales de producción, curadas con el tiempo', 'De un generador aleatorio', 'De la documentación del modelo'], a: 1, why: ['Los casos inventados tienden a ser más simples que la realidad.', 'Correcto.', 'No se describe generación aleatoria.', 'No es la fuente descrita.'] },
        { q: '¿Qué es LLM-as-judge?', opts: ['Reemplazo total de la escritura de prompts', 'Usar un segundo modelo para calificar automáticamente respuestas', 'Un tribunal legal de IA', 'Un tipo de arquitectura de red neuronal'], a: 1, why: ['No reemplaza prompts.', 'Correcto.', 'No es un tribunal legal.', 'No es una arquitectura de red.'] },
        { q: '¿Qué es el sesgo de longitud en un juez automático?', opts: ['Tarda más con textos largos', 'Califica mejor respuestas extensas aunque no aporten información relevante adicional', 'Solo procesa textos cortos', 'Ignora la longitud del texto'], a: 1, why: ['No es sobre tiempo de evaluación.', 'Correcto.', 'Sí procesa textos largos.', 'Sí la considera, de forma sesgada.'] },
        { q: '¿Qué es la autopreferencia de un juez automático?', opts: ['Prefiere sus propias respuestas anteriores', 'Tiende a calificar mejor a modelos de su misma familia o proveedor', 'Prefiere respuestas más cortas siempre', 'No tiene ninguna preferencia sistemática'], a: 1, why: ['No se refiere a respuestas anteriores propias del juez.', 'Correcto.', 'El sesgo descrito no es de longitud aquí.', 'Sí tiene sesgos sistemáticos documentados.'] },
        { q: '¿Cómo se mitiga en la práctica el sesgo de un juez automático?', opts: ['Abandonando su uso por completo', 'Calibrándolo periódicamente contra una muestra evaluada por criterio humano', 'Usando siempre el modelo más caro', 'Ignorando el problema'], a: 1, why: ['Serían inviables de reemplazar a esa escala.', 'Correcto.', 'El costo no resuelve el sesgo.', 'Sí existe mitigación práctica.'] },
        { q: '¿Qué es una regresión en sistemas basados en LLM?', opts: ['El sistema deja de funcionar', 'Un cambio mejora el promedio pero empeora casos específicos que antes funcionaban', 'Se reduce el costo de operación', 'Se actualiza la documentación'], a: 1, why: ['No implica dejar de funcionar.', 'Correcto.', 'No se refiere al costo.', 'No se refiere a documentación.'] },
        { q: '¿Por qué el promedio agregado puede ocultar una regresión?', opts: ['El promedio es matemáticamente inexacto', 'Una mejora en un tipo de caso puede compensar un deterioro en otro', 'No se puede calcular en LLM', 'Las regresiones no afectan el promedio'], a: 1, why: ['El promedio es exacto, el problema es la interpretación aislada.', 'Correcto.', 'Sí se puede calcular.', 'Sí lo afectan, de forma compensada.'] },
        { q: '¿Qué revela segmentar la evaluación por categoría?', opts: ['Nada adicional', 'Patrones ocultos como mejora en un idioma y deterioro en otro', 'Solo el costo total', 'El tiempo de respuesta'], a: 1, why: ['Sí revela información adicional.', 'Correcto.', 'No se centra en costo.', 'No se centra en tiempo de respuesta.'] },
        { q: '¿Por qué se necesita un conjunto de evaluación versionado y estable para medir regresiones?', opts: ['No es necesario, cualquier conjunto sirve', 'Sin estabilidad entre corridas, no hay certeza de comparar exactamente los mismos casos', 'Solo por razones de costo', 'Porque lo exige una norma internacional'], a: 1, why: ['Sí es necesario para una comparación válida.', 'Correcto.', 'No es una cuestión de costo.', 'No hay tal norma específica citada.'] },
      ],
    },
    {
      n: 'Bloque 3',
      title: 'RAG y agentes',
      hours: 3,
      lessons: [
        {
          title: 'Recuperación aumentada: arquitectura y fallos',
          mins: 25,
          body: [
            'La generación aumentada por recuperación (RAG) resuelve un problema concreto: un modelo de lenguaje no conoce los documentos privados de una organización, y reentrenarlo cada vez que esos documentos cambian es inviable. RAG evita ese reentrenamiento buscando, en tiempo real, los fragmentos de documentos más relevantes para una consulta y entregándoselos al modelo como contexto adicional dentro del prompt, para que genere su respuesta basándose en información concreta y actualizada, no solo en lo que aprendió durante su entrenamiento original.',
            'La arquitectura tiene tres componentes que fallan de formas distintas y hay que diagnosticar por separado: la indexación (cómo se dividen y almacenan los documentos), la recuperación (qué fragmentos se seleccionan para una consulta dada) y la generación (cómo el modelo usa esos fragmentos para responder). Un sistema RAG que responde mal puede estar fallando en cualquiera de los tres, y tratar el fallo como "un problema del modelo" sin diagnosticar cuál de los tres componentes falló específicamente lleva, con mucha frecuencia, a intentar arreglar la parte equivocada.',
            'El fallo de recuperación es el más común y el menos visible: el sistema recupera fragmentos que son superficialmente similares a la consulta pero no contienen la respuesta real, y el modelo genera una respuesta razonable a partir de contexto irrelevante, produciendo un error que parece un problema de razonamiento del modelo cuando en realidad es un problema de qué información se le entregó. Diagnosticar esto exige inspeccionar directamente los fragmentos recuperados para cada caso de fallo, no solo la respuesta final generada.',
            'La forma en que se dividen los documentos en fragmentos —demasiado pequeños, y se pierde contexto necesario; demasiado grandes, y se diluye la relevancia de la información específica dentro de cada fragmento— es una decisión de diseño con impacto directo en la calidad del sistema completo, y suele requerir ajuste específico por tipo de documento: un contrato legal y un manual técnico no se dividen de la misma forma óptima.',
          ],
          diagram: {
            title: 'Arquitectura de un sistema RAG',
            mermaid: 'graph LR\n  A["Documentos"] --> B["Indexación\\n(dividir en fragmentos)"]\n  Q["Consulta del usuario"] --> C["Recuperación\\n(buscar fragmentos relevantes)"]\n  B --> C\n  C --> D["Generación\\n(el modelo responde con\\nlos fragmentos como contexto)"]\n  D --> R["Respuesta"]',
          },
          example: { title: 'Diagnosticar el componente correcto', text: 'Un asistente de soporte responde incorrectamente sobre una política de devoluciones. Antes de "arreglar el prompt", el equipo inspecciona qué fragmentos recuperó el sistema: descubre que recuperó la política de devoluciones de hace dos años, no la vigente, porque el documento actualizado nunca se reindexó. El problema era de indexación, no de generación ni de prompt.' },
          keys: [
            'RAG evita reentrenar el modelo entregándole, en tiempo real, fragmentos de documentos relevantes como contexto dentro del prompt.',
            'Los tres componentes —indexación, recuperación, generación— fallan de formas distintas; diagnosticar cuál falló evita arreglar la parte equivocada.',
            'El fallo de recuperación es el más común: fragmentos superficialmente similares pero sin la respuesta real, generando un error que parece de razonamiento pero es de contexto entregado.',
            'El tamaño de los fragmentos es una decisión de diseño con impacto directo: demasiado pequeños pierden contexto, demasiado grandes diluyen la relevancia.',
          ],
          recursos: {
            libros: [
              { titulo: 'AI Engineering', autor: 'Chip Huyen' },
            ],
            videos: [{ titulo: 'What is Retrieval-Augmented Generation (RAG)?', canal: 'IBM Technology', url: 'https://www.youtube.com/watch?v=T-D1OfcDW1M' }],
          },
          exercise: { mins: 20, text: 'Para un caso de fallo real o hipotético de un sistema RAG, diseña un proceso de diagnóstico: ¿qué inspeccionarías primero (fragmentos recuperados, tamaño de fragmentación, o generación) y en qué orden, para aislar cuál de los tres componentes está fallando?' },
          quiz: [
            { q: '¿Qué problema resuelve RAG?', opts: ['Que el modelo genere texto más rápido', 'Que un modelo no conozca documentos privados o actualizados sin necesidad de reentrenarlo', 'Que el modelo consuma menos memoria', 'Que el modelo pueda procesar imágenes'], a: 1, why: ['No se relaciona con velocidad de generación.', 'Correcto.', 'No se relaciona con consumo de memoria.', 'No se relaciona con procesamiento de imágenes.'] },
            { q: '¿Cuáles son los tres componentes de la arquitectura RAG que fallan de formas distintas?', opts: ['Entrada, proceso, salida', 'Indexación, recuperación, generación', 'Modelo, prompt, usuario', 'Costo, velocidad, precisión'], a: 1, why: ['Son etapas genéricas, no los componentes específicos de RAG.', 'Correcto.', 'No son los tres componentes descritos.', 'Son métricas, no componentes de arquitectura.'] },
            { q: '¿Por qué el fallo de recuperación es el más común y menos visible?', opts: ['Porque nunca ocurre en la práctica', 'Porque el sistema recupera fragmentos superficialmente similares sin la respuesta real, y el error parece de razonamiento del modelo', 'Porque siempre produce un error evidente y fácil de detectar', 'Porque solo afecta a sistemas muy pequeños'], a: 1, why: ['Sí ocurre con frecuencia.', 'Correcto.', 'Es precisamente difícil de detectar, no evidente.', 'Puede afectar sistemas de cualquier tamaño.'] },
          ],
        },
        {
          title: 'Cuándo un flujo simple gana a un agente',
          mins: 20,
          body: [
            'Un agente —un sistema que decide autónomamente qué pasos ejecutar y en qué orden, en vez de seguir una secuencia fija programada de antemano— es más flexible que un flujo simple, pero esa flexibilidad tiene un costo real: mayor latencia, mayor costo por consulta, mayor dificultad para depurar cuando algo sale mal, y comportamiento menos predecible ante la misma entrada repetida dos veces. Ninguna de estas desventajas es hipotética: son observaciones consistentes en sistemas de producción, no una advertencia teórica.',
            'La pregunta que decide si conviene un agente no es "¿es posible resolver esto con un agente?" —casi cualquier tarea se puede plantear como problema de agente— sino "¿la tarea realmente requiere que el sistema decida dinámicamente sus propios pasos, o la secuencia de pasos es, en la práctica, siempre la misma?". Si la secuencia de pasos es predecible de antemano, un flujo simple y encadenado —como el visto en la primera unidad de esta aula— resuelve el problema con menor costo, mayor velocidad y comportamiento más predecible, sin ninguna de las desventajas de un agente.',
            'Los casos donde un agente sí aporta valor genuino comparten una característica: la secuencia de acciones necesaria depende de información que solo se conoce durante la ejecución, no de antemano. Un asistente que debe decidir, según lo que encuentra en cada paso, si necesita consultar una fuente adicional, pedir una aclaración al usuario, o intentar un enfoque distinto, está resolviendo un problema genuinamente dinámico donde un flujo fijo no alcanza.',
            'La recomendación práctica más citada en este debate no es "evitar agentes" ni "usar agentes siempre", sino empezar por el flujo más simple que resuelva el problema, y solo añadir la complejidad de un agente cuando el flujo simple demuestre, con evidencia concreta —no con la suposición de que "un agente sería mejor"—, que no puede manejar la variabilidad real de los casos que el sistema enfrenta en producción.',
          ],
          example: { title: 'Flujo simple disfrazado de necesidad de agente', text: 'Un equipo construye un agente para "responder preguntas de facturación": el agente decide en cada consulta si buscar en la base de datos de facturas, consultar políticas o escalar a un humano. Al revisar el uso real, más del 90% de las consultas siguen exactamente la misma secuencia: buscar la factura, verificar el estado, responder. Un flujo simple con esos tres pasos fijos habría resuelto el 90% de los casos con menor costo y latencia, reservando el agente solo para el 10% genuinamente variable.' },
          keys: [
            'Un agente es más flexible que un flujo simple, pero cuesta más en latencia, costo por consulta, dificultad de depuración y predictibilidad — desventajas reales, no hipotéticas.',
            'La pregunta correcta no es si se puede resolver con un agente, sino si la secuencia de pasos realmente varía según lo que se descubre durante la ejecución, o es siempre la misma.',
            'Los agentes aportan valor genuino cuando la secuencia depende de información que solo se conoce en tiempo de ejecución, no de antemano.',
            'La recomendación práctica es empezar con el flujo más simple y añadir la complejidad de un agente solo con evidencia concreta de que el flujo simple no alcanza.',
          ],
          diagram: {
            title: 'Flujo simple frente a agente',
            mermaid: 'graph LR\n  Q{"¿La secuencia de pasos\\nes siempre la misma?"}\n  Q -->|Sí| S["Flujo simple encadenado\\nmenor costo y latencia"]\n  Q -->|No, depende de\\nlo que se descubre| A["Agente\\ndecide dinámicamente los pasos"]',
          },
          exercise: { mins: 15, text: 'Para un sistema basado en agente de tu contexto (real o considerado), revisa el uso real: ¿qué porcentaje de casos sigue realmente la misma secuencia de pasos? Si es alto, diseña el flujo simple equivalente y compara mentalmente su costo y latencia esperados contra el agente actual.' },
          quiz: [
            { q: '¿Qué desventajas reales tiene un agente frente a un flujo simple, según la lección?', opts: ['Ninguna, los agentes son siempre superiores', 'Mayor latencia, mayor costo por consulta, mayor dificultad de depuración y comportamiento menos predecible', 'Solo son más lentos, sin ninguna otra desventaja', 'Solo cuestan más dinero, sin afectar la calidad del sistema'], a: 1, why: ['Sí tienen desventajas reales documentadas.', 'Correcto.', 'Tienen más de una desventaja, no solo velocidad.', 'Afectan más que solo el costo económico.'] },
            { q: '¿Cuál es la pregunta correcta para decidir si conviene un agente, según la lección?', opts: ['¿Es posible resolver esto con un agente?', '¿La secuencia de pasos realmente varía según lo que se descubre en tiempo de ejecución, o es siempre la misma?', '¿Cuánto presupuesto de marketing tiene el proyecto?', '¿Qué tan de moda está la palabra "agente" actualmente?'], a: 1, why: ['Casi cualquier tarea se puede plantear como agente; no es la pregunta útil.', 'Correcto.', 'El presupuesto de marketing no es relevante para esta decisión técnica.', 'La moda no es un criterio técnico válido.'] },
            { q: '¿Cuál es la recomendación práctica final de la lección sobre cuándo usar agentes?', opts: ['Evitar agentes en cualquier circunstancia', 'Empezar con el flujo más simple y añadir la complejidad de un agente solo con evidencia concreta de que no alcanza', 'Usar siempre agentes porque son la tecnología más reciente', 'Usar agentes únicamente si el presupuesto del proyecto es ilimitado'], a: 1, why: ['No se recomienda evitarlos siempre, solo empezar simple.', 'Correcto.', 'La novedad no es el criterio de decisión.', 'El presupuesto ilimitado no es el criterio descrito.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Qué problema resuelve RAG?', opts: ['Generación de texto más rápida', 'Que un modelo no conozca documentos privados o actualizados sin reentrenarlo', 'Menor consumo de memoria', 'Procesamiento de imágenes'], a: 1, why: ['No se relaciona con velocidad.', 'Correcto.', 'No se relaciona con memoria.', 'No se relaciona con imágenes.'] },
        { q: '¿Cuáles son los tres componentes de RAG que fallan distinto?', opts: ['Entrada, proceso, salida', 'Indexación, recuperación, generación', 'Modelo, prompt, usuario', 'Costo, velocidad, precisión'], a: 1, why: ['Son etapas genéricas.', 'Correcto.', 'No son los tres componentes de RAG.', 'Son métricas, no componentes.'] },
        { q: '¿Por qué el fallo de recuperación es difícil de detectar?', opts: ['Nunca ocurre', 'El sistema recupera fragmentos similares sin la respuesta real, pareciendo un fallo de razonamiento', 'Siempre es evidente', 'Solo afecta sistemas pequeños'], a: 1, why: ['Sí ocurre con frecuencia.', 'Correcto.', 'Es difícil de detectar, no evidente.', 'Afecta sistemas de cualquier tamaño.'] },
        { q: '¿Qué impacto tiene el tamaño de los fragmentos en RAG?', opts: ['Ninguno, es indiferente', 'Fragmentos muy pequeños pierden contexto; muy grandes diluyen la relevancia', 'Solo afecta el costo de almacenamiento', 'Solo afecta la velocidad de indexación'], a: 1, why: ['Sí tiene impacto directo en calidad.', 'Correcto.', 'No es solo un problema de almacenamiento.', 'No es solo un problema de velocidad de indexación.'] },
        { q: '¿Qué es un agente en el contexto de sistemas de IA?', opts: ['Un empleado humano que supervisa el sistema', 'Un sistema que decide autónomamente qué pasos ejecutar y en qué orden', 'Un tipo de base de datos', 'Un formato de archivo de configuración'], a: 1, why: ['No se refiere a un humano.', 'Correcto.', 'No es un tipo de base de datos.', 'No es un formato de archivo.'] },
        { q: '¿Qué desventajas reales tiene un agente frente a un flujo simple?', opts: ['Ninguna, siempre es superior', 'Mayor latencia, costo, dificultad de depuración y menor predictibilidad', 'Solo es más lento', 'Solo cuesta más dinero'], a: 1, why: ['Sí tiene desventajas documentadas.', 'Correcto.', 'Tiene más de una desventaja.', 'Afecta más que el costo.'] },
        { q: '¿Cuál es la pregunta correcta para decidir si conviene un agente?', opts: ['¿Es posible resolver con un agente?', '¿La secuencia de pasos varía según lo descubierto en ejecución, o es siempre la misma?', '¿Cuánto presupuesto de marketing hay?', '¿Qué tan de moda está la palabra "agente"?'], a: 1, why: ['Casi todo se puede plantear como agente.', 'Correcto.', 'No es relevante para esta decisión.', 'No es un criterio técnico.'] },
        { q: '¿Cuándo aportan valor genuino los agentes?', opts: ['Siempre, en cualquier tarea', 'Cuando la secuencia de acciones depende de información que solo se conoce en tiempo de ejecución', 'Solo en tareas de bajo volumen', 'Solo cuando el presupuesto es ilimitado'], a: 1, why: ['No siempre aportan valor genuino.', 'Correcto.', 'El volumen no es el criterio descrito.', 'El presupuesto no es el criterio descrito.'] },
        { q: '¿Cuál es la recomendación práctica sobre cuándo usar agentes?', opts: ['Evitarlos siempre', 'Empezar con el flujo más simple y añadir complejidad de agente solo con evidencia de que no alcanza', 'Usarlos siempre por ser más recientes', 'Usarlos solo con presupuesto ilimitado'], a: 1, why: ['No se recomienda evitarlos siempre.', 'Correcto.', 'La novedad no es el criterio.', 'El presupuesto ilimitado no es el criterio.'] },
        { q: 'Un agente para "responder preguntas de facturación" resulta seguir siempre la misma secuencia de 3 pasos en el 90% de los casos. ¿Qué sugiere la lección?', opts: ['Mantener el agente sin cambios porque siempre es mejor', 'Un flujo simple con esos pasos fijos resolvería la mayoría de los casos con menor costo y latencia', 'Añadir más pasos al agente para mayor flexibilidad', 'Eliminar el sistema por completo'], a: 1, why: ['No siempre es mejor mantenerlo sin evaluar.', 'Correcto.', 'Añadir más pasos no resuelve el problema de costo/latencia.', 'No se recomienda eliminar el sistema.'] },
      ],
    },
  ],
}

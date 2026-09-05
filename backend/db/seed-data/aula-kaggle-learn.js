// Contenido propio de la aula "Kaggle Learn: Intro to ML, Intermediate ML,
// Feature Engineering". Ver aula-enterprise-design-thinking.js para el patrón.

module.exports = {
  units: [
    {
      n: 'Micro-curso 1',
      title: 'Introducción al machine learning',
      hours: 3,
      lessons: [
        {
          title: 'Cómo funcionan los modelos y exploración de datos',
          mins: 15,
          body: [
            'Antes de entrenar cualquier modelo, la primera pregunta práctica no es "qué algoritmo uso" sino "qué tiene realmente este conjunto de datos". La exploración inicial —cuántas filas y columnas, qué tipo de dato tiene cada columna, cuántos valores faltan, cuál es el rango de las variables numéricas— parece un paso trivial, y es precisamente el paso que, saltado por prisa, produce los errores más costosos de diagnosticar más adelante.',
            'Un modelo, en su forma más simple, es una función que aprende un patrón entre variables de entrada (características) y una variable de salida (el objetivo) a partir de ejemplos históricos donde ambas son conocidas. Un árbol de decisión —el modelo más simple e interpretable para empezar— aprende ese patrón dividiendo repetidamente los datos según el valor de una característica: "si el número de habitaciones es mayor a 3, ir por esta rama; si no, por esta otra", hasta llegar a grupos suficientemente homogéneos como para hacer una predicción confiable.',
            'La exploración de datos revela, casi siempre, algo que cambia el plan inicial: una columna con 40% de valores faltantes, una variable numérica con un valor claramente erróneo (una edad de 300 años), una columna categórica con cientos de valores únicos que en realidad son variantes de escritura del mismo valor. Ninguno de estos hallazgos se resuelve eligiendo un algoritmo distinto: se resuelven limpiando y entendiendo los datos antes de modelar, un paso que consume, en cualquier proyecto real, más tiempo que el entrenamiento del modelo mismo.',
          ],
          diagram: {
            title: 'De datos crudos a modelo confiable',
            mermaid: 'graph LR\n  D["Datos crudos"] --> E["Exploración\\n(detectar errores, outliers)"]\n  E --> L["Datos limpios"]\n  L --> M["Entrenar modelo"]',
          },
          example: { title: 'Lo que revela una exploración de cinco minutos', text: 'Un conjunto de datos de precios de vivienda tiene una columna "año_construccion" con valores desde 1900 hasta 2024, pero también algunos valores en "0" y "9999" — claramente errores de captura, no años reales. Sin revisar esta distribución antes de modelar, esos valores extremos distorsionarían cualquier modelo que use esa columna, y el error se atribuiría erróneamente al algoritmo elegido.' },
          keys: [
            'Un modelo aprende un patrón entre características de entrada y un objetivo, a partir de ejemplos históricos donde ambos son conocidos.',
            'Un árbol de decisión divide repetidamente los datos según el valor de una característica, hasta llegar a grupos homogéneos para predecir.',
            'La exploración inicial revela valores faltantes, errores de captura y categorías inconsistentes — problemas que ningún algoritmo resuelve por sí solo.',
            'Limpiar y entender los datos consume, en cualquier proyecto real, más tiempo que el entrenamiento del modelo mismo.',
          ],
          exercise: { mins: 15, text: 'Toma un conjunto de datos que conozcas (o uno público) y responde sin modelar nada todavía: ¿cuántos valores faltan por columna? ¿hay algún valor numérico claramente fuera de rango? ¿alguna columna categórica tiene variantes de escritura del mismo valor?' },
          quiz: [
            { q: '¿Por qué es importante explorar los datos antes de entrenar cualquier modelo?', opts: ['No es importante, se puede saltar sin consecuencias', 'Revela valores faltantes, errores de captura y categorías inconsistentes que ningún algoritmo resuelve por sí solo', 'Solo sirve para cumplir un trámite formal', 'Únicamente afecta la velocidad de entrenamiento'], a: 1, why: ['Sí es importante, como muestra la lección.', 'Correcto.', 'No es un trámite formal, tiene consecuencias técnicas reales.', 'Afecta mucho más que la velocidad.'] },
            { q: '¿Cómo aprende un árbol de decisión el patrón entre datos?', opts: ['Memorizando cada ejemplo individual sin generalizar', 'Dividiendo repetidamente los datos según el valor de una característica, hasta llegar a grupos homogéneos', 'Promediando directamente todas las columnas numéricas', 'Ignorando las variables categóricas por completo'], a: 1, why: ['No memoriza sin generalizar; construye reglas de división.', 'Correcto.', 'No promedia directamente las columnas.', 'Sí puede usar variables categóricas.'] },
            { q: '¿Qué consume, en cualquier proyecto real, más tiempo que el entrenamiento del modelo mismo?', opts: ['Elegir el nombre del proyecto', 'Limpiar y entender los datos', 'Instalar las bibliotecas necesarias', 'Escribir la documentación final'], a: 1, why: ['El nombre del proyecto no consume tiempo técnico relevante.', 'Correcto.', 'La instalación de bibliotecas no suele ser el cuello de botella.', 'La documentación final no es lo más costoso en tiempo.'] },
          ],
        },
        {
          title: 'Primer modelo de árbol de decisión',
          mins: 18,
          body: [
            'Entrenar un primer árbol de decisión exige una decisión que parece técnica pero es, en el fondo, conceptual: cuántos niveles de profundidad permitirle al árbol. Un árbol muy poco profundo —dos o tres niveles— captura solo los patrones más obvios y comete errores sistemáticos incluso en los datos de entrenamiento: esto se llama subajuste (underfitting), y significa que el modelo es demasiado simple para el problema.',
            'En el extremo opuesto, un árbol sin límite de profundidad puede crecer hasta que cada hoja contiene un único ejemplo de entrenamiento, memorizando el conjunto de entrenamiento a la perfección —precisión casi del 100%— pero fallando notablemente con datos nuevos que nunca vio. Esto se llama sobreajuste (overfitting): el árbol aprendió el ruido y las particularidades del conjunto de entrenamiento específico, no el patrón general subyacente que se quiere capturar.',
            'La forma correcta de detectar cuál de los dos problemas está ocurriendo es comparar el desempeño del modelo en los datos de entrenamiento contra su desempeño en datos que nunca vio durante el entrenamiento: si el modelo rinde bien en ambos, está bien calibrado; si rinde mucho mejor en entrenamiento que en datos nuevos, está sobreajustado; si rinde mal en ambos por igual, está subajustado. Este contraste —no la precisión de entrenamiento aislada— es la señal que realmente importa.',
            'Encontrar la profundidad óptima no es una ciencia exacta desde el primer intento: la práctica habitual es entrenar varios árboles con distintas profundidades máximas, medir el desempeño de cada uno en datos que el árbol no vio durante su entrenamiento, y elegir la profundidad donde ese desempeño deja de mejorar de forma significativa, antes de empezar a empeorar por sobreajuste.',
          ],
          diagram: {
            title: 'Subajuste, ajuste correcto y sobreajuste según profundidad',
            mermaid: 'graph LR\n  A["Árbol muy poco profundo"] --> B["Subajuste:\\nmal en entrenamiento y en datos nuevos"]\n  C["Profundidad óptima"] --> D["Buen desempeño en\\nambos conjuntos"]\n  E["Árbol sin límite de profundidad"] --> F["Sobreajuste:\\nperfecto en entrenamiento,\\nmalo en datos nuevos"]',
          },
          keys: [
            'Un árbol muy poco profundo subajusta: es demasiado simple y comete errores incluso en los datos de entrenamiento.',
            'Un árbol sin límite de profundidad sobreajusta: memoriza el ruido del conjunto de entrenamiento y falla con datos nuevos.',
            'La señal correcta para diagnosticar el problema es comparar desempeño en entrenamiento contra desempeño en datos nunca vistos, no la precisión de entrenamiento aislada.',
            'La profundidad óptima se encuentra probando varias opciones y eligiendo donde el desempeño en datos nuevos deja de mejorar, antes de empezar a empeorar.',
          ],
          recursos: {
            libros: [
              { titulo: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow', autor: 'Aurélien Géron' },
            ],
          },
          exercise: { mins: 15, text: 'Si tienes acceso a un cuaderno de Kaggle o similar, entrena tres árboles de decisión con profundidades máximas de 2, 10 y sin límite sobre el mismo conjunto de datos. Compara el desempeño de cada uno en entrenamiento y en un conjunto separado de validación.' },
          quiz: [
            { q: '¿Qué es el subajuste (underfitting)?', opts: ['Cuando el modelo memoriza perfectamente los datos de entrenamiento', 'Cuando el modelo es demasiado simple y comete errores incluso en los datos de entrenamiento', 'Cuando el modelo tarda demasiado en entrenar', 'Cuando faltan valores en el conjunto de datos'], a: 1, why: ['Eso describe el sobreajuste, no el subajuste.', 'Correcto.', 'No se refiere al tiempo de entrenamiento.', 'No se refiere a valores faltantes.'] },
            { q: '¿Cómo se detecta si un modelo está sobreajustado?', opts: ['Midiendo solo la precisión en el conjunto de entrenamiento', 'Comparando el desempeño en entrenamiento contra el desempeño en datos que el modelo nunca vio', 'Contando cuántas líneas de código tiene el modelo', 'Verificando cuánto tiempo tardó en entrenar'], a: 1, why: ['Medir solo el entrenamiento no revela sobreajuste.', 'Correcto.', 'Las líneas de código no son un indicador relevante.', 'El tiempo de entrenamiento no revela sobreajuste.'] },
            { q: '¿Cómo se encuentra la profundidad óptima de un árbol de decisión?', opts: ['Siempre usando la profundidad máxima posible', 'Probando varias profundidades y eligiendo donde el desempeño en datos nuevos deja de mejorar', 'Usando siempre profundidad 1 por simplicidad', 'Eligiendo al azar sin comparación'], a: 1, why: ['La profundidad máxima suele producir sobreajuste.', 'Correcto.', 'Profundidad 1 suele ser demasiado simple.', 'La elección al azar no es el método recomendado.'] },
          ],
        },
        {
          title: 'Validación del modelo y bosque aleatorio',
          mins: 20,
          body: [
            'Medir el desempeño de un modelo sobre los mismos datos con los que se entrenó es, casi siempre, una medida optimista y engañosa: el modelo ya "vio" esos ejemplos, así que su buen desempeño ahí no garantiza nada sobre cómo se comportará con datos nuevos. La validación separa una porción de los datos disponibles —que el modelo nunca ve durante el entrenamiento— específicamente para medir su desempeño de forma honesta, antes de exponerlo a datos reales.',
            'Un error frecuente al empezar es medir el error con una única métrica sin entender qué mide realmente: el error absoluto medio, por ejemplo, indica en promedio cuánto se equivoca el modelo en las mismas unidades del problema original (dólares, unidades, días), lo que lo hace más interpretable para explicar resultados a alguien sin formación técnica que una métrica abstracta sin unidades directamente comprensibles.',
            'Un bosque aleatorio (random forest) mejora sobre un único árbol de decisión mediante una idea simple pero poderosa: entrenar muchos árboles distintos —cada uno sobre una muestra ligeramente distinta de los datos y considerando un subconjunto distinto de características en cada división— y promediar sus predicciones. Los errores individuales de árboles distintos, al ser generalmente distintos entre sí, tienden a cancelarse parcialmente al promediar, produciendo una predicción más estable que la de cualquier árbol individual.',
            'Esta idea —combinar varios modelos imperfectos para obtener una predicción más confiable que cualquiera de ellos por separado— es el principio general detrás de los métodos de conjunto (ensemble methods), de los cuales el bosque aleatorio es el ejemplo más accesible para empezar, y uno que en la práctica supera consistentemente a un árbol de decisión individual sin apenas ajuste adicional de configuración.',
          ],
          diagram: {
            title: 'Bosque aleatorio: promediar muchos árboles',
            mermaid: 'graph LR\n  D["Mismos datos,\\nmuestras distintas"] --> A1["Árbol 1"]\n  D --> A2["Árbol 2"]\n  D --> A3["Árbol 3..."]\n  A1 --> P["Promedio de predicciones\\n(más estable)"]\n  A2 --> P\n  A3 --> P',
          },
          example: { title: 'Por qué promediar árboles ayuda', text: 'Un árbol de decisión individual, entrenado con una muestra ligeramente distinta de los mismos datos, podría predecir el precio de una casa en $250,000 en un caso y $310,000 en otro para la misma propiedad, dependiendo de qué divisiones específicas aprendió. Un bosque de 100 árboles distintos, al promediar sus 100 predicciones individuales, converge hacia una estimación más estable, porque los errores específicos de cada árbol individual tienden a no repetirse en la misma dirección en todos los demás.' },
          keys: [
            'Medir el desempeño sobre los mismos datos de entrenamiento es optimista y engañoso; la validación usa datos que el modelo nunca vio.',
            'El error absoluto medio, en las mismas unidades del problema original, suele ser más interpretable que una métrica abstracta al explicar resultados.',
            'Un bosque aleatorio entrena muchos árboles distintos y promedia sus predicciones, cancelando parcialmente los errores individuales de cada uno.',
            'Combinar varios modelos imperfectos para obtener una predicción más confiable que cualquiera por separado es el principio general de los métodos de conjunto.',
          ],
          recursos: {
            videos: [
              { titulo: 'Intro to Machine Learning | Kaggle | Lesson: Random Forests', canal: 'Kaggle', url: 'https://www.youtube.com/watch?v=EE2QmzFI5XM' },
            ],
          },
          exercise: { mins: 15, text: 'Compara mentalmente (o en código si tienes acceso) el desempeño de un único árbol de decisión bien ajustado contra un bosque aleatorio de 100 árboles sobre el mismo conjunto de datos y la misma partición de validación. ¿Qué diferencia observas?' },
          quiz: [
            { q: '¿Por qué medir el desempeño sobre los mismos datos de entrenamiento es engañoso?', opts: ['No es engañoso, es la forma correcta de medir', 'El modelo ya vio esos ejemplos, así que su buen desempeño ahí no garantiza nada sobre datos nuevos', 'Porque siempre da resultados peores de lo real', 'Porque tarda más tiempo en calcularse'], a: 1, why: ['Sí es engañoso, como explica la lección.', 'Correcto.', 'Da resultados mejores de lo real, no peores.', 'No es un problema de tiempo de cálculo.'] },
            { q: '¿Qué hace un bosque aleatorio para mejorar sobre un único árbol de decisión?', opts: ['Usa un árbol más profundo que cualquier árbol individual', 'Entrena muchos árboles distintos y promedia sus predicciones', 'Elimina la necesidad de datos de entrenamiento', 'Usa solo la mitad de las características disponibles siempre'], a: 1, why: ['No se trata de un único árbol más profundo.', 'Correcto.', 'Sigue necesitando datos de entrenamiento.', 'No usa siempre exactamente la mitad de las características.'] },
            { q: '¿Cuál es el principio general detrás de los métodos de conjunto (ensemble)?', opts: ['Usar siempre el modelo individual más complejo posible', 'Combinar varios modelos imperfectos para obtener una predicción más confiable que cualquiera por separado', 'Entrenar un solo modelo con más datos', 'Reducir el número de características al mínimo posible'], a: 1, why: ['Es lo contrario: se combinan varios modelos, no uno complejo.', 'Correcto.', 'No se trata de un solo modelo con más datos.', 'No es específicamente sobre reducir características.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Por qué explorar los datos antes de modelar?', opts: ['No es importante', 'Revela valores faltantes, errores y categorías inconsistentes que ningún algoritmo resuelve solo', 'Solo es un trámite formal', 'Solo afecta la velocidad'], a: 1, why: ['Sí es importante.', 'Correcto.', 'No es solo un trámite.', 'Afecta más que la velocidad.'] },
        { q: '¿Cómo aprende un árbol de decisión?', opts: ['Memorizando cada ejemplo sin generalizar', 'Dividiendo repetidamente los datos según una característica hasta grupos homogéneos', 'Promediando directamente las columnas numéricas', 'Ignorando variables categóricas'], a: 1, why: ['No memoriza sin generalizar.', 'Correcto.', 'No promedia directamente.', 'Sí puede usar categóricas.'] },
        { q: '¿Qué es el subajuste?', opts: ['Memorización perfecta del entrenamiento', 'Modelo demasiado simple, con errores incluso en entrenamiento', 'Tiempo de entrenamiento largo', 'Valores faltantes en los datos'], a: 1, why: ['Eso es sobreajuste.', 'Correcto.', 'No es sobre tiempo.', 'No es sobre valores faltantes.'] },
        { q: '¿Cómo se detecta el sobreajuste?', opts: ['Midiendo solo en entrenamiento', 'Comparando desempeño en entrenamiento contra datos nunca vistos', 'Contando líneas de código', 'Midiendo el tiempo de entrenamiento'], a: 1, why: ['No basta medir solo en entrenamiento.', 'Correcto.', 'No es relevante.', 'No es relevante.'] },
        { q: '¿Cómo se encuentra la profundidad óptima de un árbol?', opts: ['Usando siempre la máxima posible', 'Probando varias y eligiendo donde el desempeño en datos nuevos deja de mejorar', 'Usando siempre profundidad 1', 'Al azar'], a: 1, why: ['La máxima suele sobreajustar.', 'Correcto.', 'Suele ser demasiado simple.', 'No es el método recomendado.'] },
        { q: '¿Por qué es engañoso medir sobre los mismos datos de entrenamiento?', opts: ['No es engañoso', 'El modelo ya vio esos ejemplos, no garantiza nada sobre datos nuevos', 'Da resultados peores de lo real', 'Tarda más en calcularse'], a: 1, why: ['Sí es engañoso.', 'Correcto.', 'Da resultados mejores de lo real.', 'No es problema de tiempo.'] },
        { q: '¿Qué hace un bosque aleatorio?', opts: ['Usa un único árbol más profundo', 'Entrena muchos árboles distintos y promedia sus predicciones', 'Elimina la necesidad de datos', 'Usa siempre la mitad de las características'], a: 1, why: ['No es un único árbol más profundo.', 'Correcto.', 'Sigue necesitando datos.', 'No siempre exactamente la mitad.'] },
        { q: '¿Cuál es el principio de los métodos de conjunto?', opts: ['Usar el modelo individual más complejo', 'Combinar varios modelos imperfectos para una predicción más confiable', 'Entrenar un solo modelo con más datos', 'Reducir características al mínimo'], a: 1, why: ['Es lo contrario.', 'Correcto.', 'No es sobre un solo modelo.', 'No es específicamente sobre esto.'] },
        { q: '¿Por qué el error absoluto medio suele ser más interpretable?', opts: ['Porque es siempre el valor más bajo posible', 'Porque está en las mismas unidades del problema original, facilitando explicar resultados', 'Porque no requiere ningún cálculo', 'Porque ignora los valores atípicos automáticamente'], a: 1, why: ['No es sobre ser el valor más bajo.', 'Correcto.', 'Sí requiere cálculo.', 'No ignora automáticamente atípicos.'] },
        { q: '¿Qué libro se recomienda sobre machine learning práctico con Python?', opts: ['Hands-On Machine Learning, de Aurélien Géron', 'La Odisea, de Homero', 'Crimen y castigo, de Dostoievski', 'El gran Gatsby, de F. Scott Fitzgerald'], a: 0, why: ['Correcto.', 'No relacionado.', 'No relacionado.', 'No relacionado.'] },
      ],
    },
    {
      n: 'Micro-curso 2',
      title: 'Machine learning intermedio',
      hours: 4,
      lessons: [
        {
          title: 'Valores faltantes y variables categóricas',
          mins: 20,
          body: [
            'La mayoría de conjuntos de datos reales tienen valores faltantes, y la respuesta más simple —eliminar cualquier fila con al menos un valor faltante— rara vez es la mejor: en un conjunto de datos con muchas columnas, esa regla puede eliminar la mayoría de las filas disponibles, aunque cada fila individual solo le falte un valor en una sola columna de las muchas que tiene.',
            'Una alternativa más práctica es la imputación: rellenar los valores faltantes con una estimación razonable —el promedio o la mediana de la columna, en el caso numérico más simple— en vez de descartar toda la fila. La imputación no es una solución perfecta, introduce cierta incertidumbre artificial, pero conserva información valiosa del resto de columnas de esa fila que de otro modo se perdería por completo.',
            'Las variables categóricas —texto que representa categorías, como "ciudad" o "tipo de producto"— exigen su propio tratamiento porque la mayoría de algoritmos de machine learning solo trabajan con números. La codificación ordinal asigna un número distinto a cada categoría, apropiada cuando existe un orden natural entre ellas (bajo, medio, alto); la codificación one-hot crea una columna binaria separada por cada categoría posible, apropiada cuando no existe ningún orden natural (rojo, verde, azul), evitando que el modelo interprete erróneamente una relación de orden donde no la hay.',
            'Elegir el tipo de codificación incorrecto para una variable categórica es un error sutil que no produce un fallo evidente: el modelo sigue entrenando y prediciendo con normalidad, solo que aprende una relación de orden inexistente entre categorías que no la tienen, degradando su calidad de forma silenciosa e indetectable sin revisar explícitamente esta decisión.',
          ],
          diagram: {
            title: 'Codificación ordinal frente a one-hot',
            mermaid: 'graph TD\n  A["Variable categórica"] --> B{"¿Existe orden\\nnatural entre categorías?"}\n  B -->|Sí: bajo/medio/alto| C["Codificación ordinal:\\nun número por categoría"]\n  B -->|No: rojo/verde/azul| D["Codificación one-hot:\\nuna columna binaria por categoría"]',
          },
          keys: [
            'Eliminar filas con valores faltantes rara vez es la mejor opción; puede descartar la mayoría de los datos disponibles.',
            'La imputación rellena valores faltantes con una estimación razonable, conservando el resto de información de esa fila.',
            'La codificación ordinal asigna números cuando existe un orden natural entre categorías; la one-hot crea columnas binarias cuando no existe orden.',
            'Elegir la codificación incorrecta no produce un fallo evidente: el modelo sigue funcionando pero aprende una relación de orden inexistente, degradando la calidad silenciosamente.',
          ],
          exercise: { mins: 15, text: 'Identifica en un conjunto de datos de tu contexto dos variables categóricas: una con orden natural y otra sin él. Confirma que usarías codificación ordinal para la primera y one-hot para la segunda, y explica qué error introduciría intercambiarlas.' },
          quiz: [
            { q: '¿Por qué eliminar filas con valores faltantes rara vez es la mejor opción?', opts: ['Porque nunca hay valores faltantes en la práctica', 'Porque puede eliminar la mayoría de los datos disponibles si hay muchas columnas', 'Porque es ilegal en cualquier análisis de datos', 'Porque siempre mejora la precisión del modelo'], a: 1, why: ['Sí suele haber valores faltantes en datos reales.', 'Correcto.', 'No hay tal ilegalidad.', 'No siempre mejora la precisión, puede empeorarla al perder datos.'] },
            { q: '¿Cuándo conviene usar codificación ordinal en vez de one-hot?', opts: ['Siempre, sin excepción', 'Cuando existe un orden natural entre las categorías, como bajo/medio/alto', 'Solo cuando hay más de 100 categorías', 'Nunca, one-hot siempre es superior'], a: 1, why: ['No siempre, depende de si hay orden natural.', 'Correcto.', 'El número de categorías no es el criterio decisivo.', 'La ordinal es preferible cuando sí hay orden.'] },
            { q: '¿Qué ocurre si se elige el tipo de codificación incorrecto para una variable categórica?', opts: ['El modelo falla de forma evidente e inmediata', 'El modelo sigue funcionando pero aprende una relación de orden inexistente, degradando su calidad silenciosamente', 'El código no compila', 'Los datos se corrompen permanentemente'], a: 1, why: ['No falla de forma evidente, ese es justo el problema.', 'Correcto.', 'El código sigue compilando normalmente.', 'No corrompe los datos originales.'] },
          ],
        },
        {
          title: 'Pipelines y validación cruzada',
          mins: 22,
          body: [
            'Un pipeline encadena en un único objeto todos los pasos de transformación de datos —imputación, codificación, escalado— junto con el modelo final, de modo que todo el flujo se ejecuta como una sola unidad, en el mismo orden, tanto durante el entrenamiento como al predecir sobre datos nuevos. Sin un pipeline, es fácil aplicar una transformación durante el entrenamiento y olvidarla —o aplicarla de forma ligeramente distinta— al predecir sobre datos nuevos, produciendo un desajuste silencioso entre cómo se entrenó el modelo y cómo se usa después.',
            'Un pipeline resuelve además un riesgo más sutil: calcular estadísticas de transformación (como el promedio para imputar valores faltantes) usando el conjunto de datos completo, incluyendo lo que debería ser el conjunto de prueba, filtra información del conjunto de prueba hacia el proceso de entrenamiento —una forma de fuga de datos—. Un pipeline bien construido calcula esas estadísticas únicamente sobre el conjunto de entrenamiento, y aplica esa misma transformación, ya fijada, al conjunto de prueba sin volver a calcularla.',
            'La validación cruzada extiende la idea de separar entrenamiento y validación: en vez de una única partición fija, divide los datos en varios bloques (comúnmente cinco), entrena y valida el modelo varias veces usando cada bloque como validación una vez y el resto como entrenamiento, y promedia los resultados. Esto produce una estimación del desempeño más confiable que una única partición, especialmente quand el conjunto de datos disponible es pequeño y una sola partición podría no ser representativa por azar.',
            'El costo de la validación cruzada es computacional: entrenar el modelo varias veces —una por cada bloque— toma más tiempo que entrenar una sola vez. Ese costo se justifica especialmente en las etapas de comparación de configuraciones distintas, donde una estimación de desempeño poco confiable podría llevar a elegir la configuración equivocada; una vez elegida la configuración final, entrenar el modelo definitivo una sola vez sobre todos los datos disponibles es la práctica habitual.',
          ],
          diagram: {
            title: 'Un pipeline evita la fuga de datos',
            mermaid: 'graph LR\n  T["Entrenamiento"] --> S["Calcular estadísticas\\n(solo con datos de entrenamiento)"]\n  S --> A1["Aplicar transformación\\na entrenamiento"]\n  S --> A2["Aplicar la MISMA transformación\\na prueba (sin recalcular)"]',
          },
          keys: [
            'Un pipeline encadena transformación de datos y modelo en una sola unidad, evitando desajustes entre cómo se entrena y cómo se predice después.',
            'Calcular estadísticas de transformación sobre todo el conjunto de datos, incluyendo prueba, es una forma de fuga de datos; un pipeline bien construido las calcula solo sobre entrenamiento.',
            'La validación cruzada divide los datos en varios bloques y promedia el desempeño de varias particiones, más confiable que una única partición fija.',
            'El costo computacional de la validación cruzada se justifica al comparar configuraciones distintas; el modelo final suele entrenarse una sola vez sobre todos los datos.',
          ],
          recursos: {
            libros: [
              { titulo: 'Feature Engineering for Machine Learning', autor: 'Alice Zheng, Amanda Casari' },
            ],
          },
          exercise: { mins: 15, text: 'Revisa un flujo de trabajo de modelado que uses o hayas visto: ¿las transformaciones de datos (imputación, escalado) se calculan sobre todo el conjunto o solo sobre el conjunto de entrenamiento? Si es sobre todo el conjunto, identifica el riesgo de fuga de datos concreto.' },
          quiz: [
            { q: '¿Qué problema resuelve encadenar transformaciones y modelo en un pipeline?', opts: ['Ningún problema real, es solo una preferencia estética', 'Evita desajustes silenciosos entre cómo se aplican las transformaciones en entrenamiento y en predicción sobre datos nuevos', 'Hace que el modelo sea automáticamente más preciso', 'Elimina la necesidad de cualquier dato de entrenamiento'], a: 1, why: ['Sí resuelve un problema técnico real.', 'Correcto.', 'No garantiza mayor precisión automáticamente.', 'Sigue necesitando datos de entrenamiento.'] },
            { q: '¿Qué es la fuga de datos descrita en el contexto de pipelines?', opts: ['Perder datos por un error de almacenamiento', 'Calcular estadísticas de transformación usando información del conjunto de prueba, filtrándola hacia el entrenamiento', 'Compartir datos con un proveedor externo', 'Un error de sintaxis en el código'], a: 1, why: ['No se refiere a pérdida de datos por almacenamiento.', 'Correcto.', 'No se refiere a compartir con terceros.', 'No es un error de sintaxis.'] },
            { q: '¿Qué hace la validación cruzada?', opts: ['Usa una única partición fija de los datos', 'Divide los datos en varios bloques, valida con cada uno por turno y promedia los resultados', 'Elimina la necesidad de cualquier validación', 'Entrena el modelo una sola vez sin comparar configuraciones'], a: 1, why: ['Es lo contrario a una única partición fija.', 'Correcto.', 'No elimina la validación, la hace más robusta.', 'Se usa justamente para comparar configuraciones.'] },
          ],
        },
        {
          title: 'XGBoost y fuga de datos',
          mins: 22,
          body: [
            'XGBoost pertenece a una familia de métodos de conjunto distinta a la del bosque aleatorio: en vez de entrenar muchos árboles independientes y promediarlos, entrena árboles de forma secuencial, donde cada árbol nuevo se enfoca específicamente en corregir los errores que cometieron los árboles anteriores. Esta estrategia —conocida como potenciación de gradiente (gradient boosting)— suele superar al bosque aleatorio en precisión sobre datos tabulares, a cambio de ser más sensible a la configuración de sus parámetros y más propensa al sobreajuste si no se controla con cuidado.',
            'El parámetro más influyente de XGBoost es la tasa de aprendizaje: cuánto contribuye cada árbol nuevo a la corrección total. Una tasa alta aprende rápido pero con riesgo de sobrepasar la corrección óptima; una tasa baja aprende con más cautela pero necesita más árboles —y por tanto más tiempo de entrenamiento— para alcanzar el mismo nivel de ajuste. Encontrar el equilibrio entre ambos, igual que la profundidad de un árbol individual, exige comparación empírica, no una regla fija universal.',
            'La fuga de datos —mencionada de forma general en la lección de pipelines— merece una categoría propia porque adopta formas particularmente difíciles de detectar en la práctica: una variable que, sin que el equipo lo note, contiene información del futuro respecto al momento de la predicción (como el ejemplo de "contactó a soporte" visto en otra asignatura de este campus), o una división de datos en entrenamiento y prueba que mezcla registros de la misma entidad —el mismo cliente, el mismo paciente— entre ambos conjuntos, permitiendo que el modelo memorice patrones específicos de esa entidad en vez de aprender un patrón que generalice a entidades nuevas.',
            'Detectar fuga de datos exige, con frecuencia, sospechar activamente de un resultado demasiado bueno: si un modelo alcanza una precisión sorprendentemente alta para lo difícil que parece el problema, la primera hipótesis a descartar —antes de celebrar— no es "el modelo es excelente", es "hay una fuga de datos en algún lugar del proceso que no se ha detectado todavía".',
          ],
          diagram: {
            title: 'Gradient boosting: corregir errores secuencialmente',
            mermaid: 'graph LR\n  A1["Árbol 1"] --> E1["Errores residuales"]\n  E1 --> A2["Árbol 2\\ncorrige esos errores"]\n  A2 --> E2["Errores restantes"]\n  E2 --> A3["Árbol 3..."]',
          },
          example: { title: 'La fuga por mezcla de entidades', text: 'Un modelo predice si un paciente desarrollará una complicación, entrenado con registros donde varias visitas del mismo paciente aparecen distribuidas al azar entre entrenamiento y prueba. El modelo alcanza 97% de precisión, sorprendentemente alto. La causa: al haber visto otras visitas del mismo paciente durante el entrenamiento, el modelo memorizó patrones específicos de pacientes individuales, no un patrón médico generalizable a pacientes nuevos.' },
          keys: [
            'XGBoost entrena árboles secuencialmente, cada uno corrigiendo los errores de los anteriores — distinto a promediar árboles independientes como el bosque aleatorio.',
            'La tasa de aprendizaje controla cuánto contribuye cada árbol nuevo: alta aprende rápido con riesgo de sobrepasar, baja necesita más árboles pero con más cautela.',
            'La fuga de datos por mezcla de entidades ocurre cuando registros de la misma entidad aparecen en entrenamiento y prueba, permitiendo memorización en vez de generalización.',
            'Un resultado sorprendentemente bueno debería hacer sospechar primero de una fuga de datos no detectada, no celebrarse de inmediato como éxito del modelo.',
          ],
          exercise: { mins: 15, text: 'Revisa cómo se dividió en entrenamiento y prueba el último conjunto de datos que usaste (o uno que conozcas): ¿podría haber registros de la misma entidad (cliente, paciente, dispositivo) distribuidos entre ambos conjuntos? Si es así, describe cómo rediseñarías la división para evitarlo.' },
          quiz: [
            { q: '¿En qué se diferencia XGBoost de un bosque aleatorio?', opts: ['XGBoost entrena árboles secuencialmente, cada uno corrigiendo errores de los anteriores; el bosque aleatorio promedia árboles independientes', 'No hay ninguna diferencia real entre ambos', 'XGBoost no usa árboles de decisión en absoluto', 'El bosque aleatorio siempre es más preciso que XGBoost'], a: 0, why: ['Correcto.', 'Sí hay una diferencia estructural real.', 'Sí usa árboles, es su unidad base.', 'No siempre es así; XGBoost suele superarlo en datos tabulares.'] },
            { q: '¿Qué controla la tasa de aprendizaje en XGBoost?', opts: ['El número total de columnas del conjunto de datos', 'Cuánto contribuye cada árbol nuevo a la corrección total del modelo', 'El idioma en que se generan los reportes', 'La cantidad de memoria RAM disponible'], a: 1, why: ['No se relaciona con el número de columnas.', 'Correcto.', 'No se relaciona con idioma.', 'No se relaciona con memoria RAM directamente.'] },
            { q: '¿Qué debería hacer un equipo ante un resultado de modelo sorprendentemente bueno?', opts: ['Celebrar de inmediato y desplegar el modelo', 'Sospechar primero de una fuga de datos no detectada antes de aceptar el resultado', 'Ignorar el resultado por completo', 'Aumentar automáticamente la complejidad del modelo'], a: 1, why: ['No se recomienda celebrar sin verificar primero.', 'Correcto.', 'No se recomienda ignorarlo, hay que investigarlo.', 'Aumentar la complejidad no aborda una posible fuga de datos.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Por qué eliminar filas con valores faltantes rara vez es la mejor opción?', opts: ['No hay valores faltantes en la práctica', 'Puede eliminar la mayoría de los datos si hay muchas columnas', 'Es ilegal', 'Siempre mejora la precisión'], a: 1, why: ['Sí suelen existir.', 'Correcto.', 'No hay tal ilegalidad.', 'Puede empeorar la precisión al perder datos.'] },
        { q: '¿Cuándo conviene la codificación ordinal?', opts: ['Siempre', 'Cuando existe un orden natural entre categorías', 'Solo con más de 100 categorías', 'Nunca'], a: 1, why: ['No siempre.', 'Correcto.', 'El número no es el criterio.', 'Sí conviene cuando hay orden.'] },
        { q: '¿Qué ocurre con una codificación incorrecta?', opts: ['Falla de forma evidente', 'El modelo sigue funcionando pero degrada su calidad silenciosamente', 'El código no compila', 'Corrompe los datos'], a: 1, why: ['No falla evidentemente, ese es el problema.', 'Correcto.', 'Sigue compilando.', 'No corrompe los datos.'] },
        { q: '¿Qué evita un pipeline?', opts: ['Nada relevante', 'Desajustes entre transformaciones en entrenamiento y predicción sobre datos nuevos', 'Mejora automática de precisión', 'Necesidad de datos de entrenamiento'], a: 1, why: ['Sí evita un problema real.', 'Correcto.', 'No garantiza mejora automática.', 'Sigue necesitando datos.'] },
        { q: '¿Qué es la fuga de datos en el contexto de pipelines?', opts: ['Perder datos por almacenamiento', 'Calcular estadísticas usando información del conjunto de prueba', 'Compartir datos con terceros', 'Un error de sintaxis'], a: 1, why: ['No es pérdida por almacenamiento.', 'Correcto.', 'No es sobre terceros.', 'No es de sintaxis.'] },
        { q: '¿Qué hace la validación cruzada?', opts: ['Usa una partición fija única', 'Divide en varios bloques, valida con cada uno y promedia', 'Elimina la validación', 'Entrena una sola vez sin comparar'], a: 1, why: ['Es lo contrario.', 'Correcto.', 'No la elimina.', 'Se usa para comparar configuraciones.'] },
        { q: '¿En qué se diferencia XGBoost de un bosque aleatorio?', opts: ['Entrena árboles secuencialmente corrigiendo errores previos, en vez de promediar independientes', 'No hay diferencia', 'No usa árboles', 'El bosque siempre es más preciso'], a: 0, why: ['Correcto.', 'Sí hay diferencia.', 'Sí usa árboles.', 'No siempre es más preciso.'] },
        { q: '¿Qué controla la tasa de aprendizaje en XGBoost?', opts: ['El número de columnas', 'Cuánto contribuye cada árbol nuevo a la corrección', 'El idioma de reportes', 'La memoria RAM'], a: 1, why: ['No relacionado.', 'Correcto.', 'No relacionado.', 'No relacionado directamente.'] },
        { q: '¿Qué es la fuga por mezcla de entidades?', opts: ['Registros de la misma entidad en entrenamiento y prueba, permitiendo memorización', 'Perder registros durante el procesamiento', 'Usar demasiadas columnas', 'Un error de tipeo en los datos'], a: 0, why: ['Correcto.', 'No es pérdida de registros.', 'No es sobre cantidad de columnas.', 'No es un error tipográfico.'] },
        { q: '¿Qué debería hacer un equipo ante un resultado sorprendentemente bueno?', opts: ['Celebrar y desplegar de inmediato', 'Sospechar primero de una fuga de datos no detectada', 'Ignorarlo', 'Aumentar la complejidad automáticamente'], a: 1, why: ['No celebrar sin verificar.', 'Correcto.', 'No ignorarlo.', 'No resuelve una posible fuga.'] },
      ],
    },
    {
      n: 'Micro-curso 3',
      title: 'Ingeniería de características',
      hours: 4,
      lessons: [
        {
          title: 'Información mutua y creación de características',
          mins: 20,
          body: [
            'La ingeniería de características —crear nuevas variables a partir de las existentes para ayudar al modelo a capturar patrones que las variables originales, por sí solas, no expresan con claridad— es, en la práctica de Kaggle y de proyectos reales por igual, con frecuencia más determinante para el resultado final que la elección del algoritmo. Un modelo simple con características bien diseñadas suele superar a un modelo sofisticado con características mediocres.',
            'La información mutua mide cuánto reduce la incertidumbre sobre el objetivo el conocer el valor de una característica, capturando tanto relaciones lineales como no lineales —a diferencia de la correlación simple, que solo detecta relaciones lineales—. Una característica con información mutua alta respecto al objetivo es, casi por definición, una buena candidata a incluir en el modelo; una con información mutua cercana a cero probablemente no aporta señal útil, sin importar cuán intuitivamente relevante parezca a simple vista.',
            'Crear nuevas características no es un proceso puramente automático: exige conocimiento del dominio del problema. Combinar "ingresos" y "número de dependientes" en "ingreso por dependiente" puede capturar un patrón de capacidad económica que ninguna de las dos variables originales expresa por separado; extraer "día de la semana" de una marca de tiempo puede revelar un patrón de comportamiento que la fecha completa, tratada como un valor continuo, no expone directamente al modelo.',
            'Un error común al empezar con ingeniería de características es crear docenas de combinaciones posibles sin criterio, esperando que el modelo "descubra" cuáles son útiles. Esto rara vez funciona bien: cada característica adicional, si no aporta señal real, añade ruido y aumenta el riesgo de sobreajuste. La disciplina correcta combina la intuición del dominio del problema con la medición explícita —como la información mutua— para decidir qué características crear y cuáles descartar, no la generación indiscriminada de combinaciones.',
          ],
          diagram: {
            title: 'Información mutua: decidir qué característica crear',
            mermaid: 'graph LR\n  C["Característica candidata"] --> IM{"¿Información mutua\\nalta con el objetivo?"}\n  IM -->|Sí| U["Buena candidata\\npara el modelo"]\n  IM -->|No, cercana a cero| D["Probablemente no aporta señal"]',
          },
          keys: [
            'La ingeniería de características suele ser más determinante para el resultado final que la elección del algoritmo.',
            'La información mutua mide cuánto reduce la incertidumbre sobre el objetivo conocer una característica, capturando relaciones lineales y no lineales, a diferencia de la correlación simple.',
            'Crear características exige conocimiento del dominio, no solo cálculo automático: combinar variables existentes puede revelar patrones que ninguna expresa por separado.',
            'Generar docenas de combinaciones sin criterio añade ruido y riesgo de sobreajuste; la disciplina correcta combina intuición de dominio con medición explícita.',
          ],
          exercise: { mins: 15, text: 'Para un conjunto de datos de tu contexto, propone dos nuevas características derivadas de las existentes que capturen un patrón que ninguna variable original expresa por separado. Justifica cada una con conocimiento del dominio, no solo con la posibilidad técnica de calcularla.' },
          quiz: [
            { q: '¿Qué mide la información mutua entre una característica y el objetivo?', opts: ['Solo relaciones lineales entre ambas', 'Cuánto reduce la incertidumbre sobre el objetivo conocer el valor de la característica, incluyendo relaciones no lineales', 'El costo computacional de calcular esa característica', 'El número de valores únicos que tiene la característica'], a: 1, why: ['Captura más que solo relaciones lineales, a diferencia de la correlación simple.', 'Correcto.', 'No mide costo computacional.', 'No mide número de valores únicos.'] },
            { q: '¿Por qué la ingeniería de características exige conocimiento del dominio, no solo cálculo automático?', opts: ['Porque no es cierto, es un proceso puramente automático', 'Porque combinar variables con criterio revela patrones que ninguna expresa por separado, mientras que la generación indiscriminada añade ruido', 'Porque está prohibido automatizar cualquier parte del proceso', 'Porque el dominio del problema nunca es relevante para el modelo'], a: 1, why: ['No es puramente automático, requiere criterio.', 'Correcto.', 'No hay tal prohibición de automatización parcial.', 'El dominio sí es altamente relevante.'] },
            { q: '¿Qué problema tiene crear docenas de combinaciones de características sin criterio?', opts: ['Ningún problema, más características siempre ayudan', 'Cada característica sin señal real añade ruido y aumenta el riesgo de sobreajuste', 'Hace que el modelo entrene instantáneamente', 'Elimina automáticamente la necesidad de validación'], a: 1, why: ['Más características sin criterio no siempre ayudan.', 'Correcto.', 'No acelera instantáneamente el entrenamiento.', 'No elimina la necesidad de validación.'] },
          ],
        },
        {
          title: 'Agrupamiento y componentes principales como características',
          mins: 22,
          body: [
            'Las técnicas de aprendizaje no supervisado, presentadas en otras asignaturas de este campus como una categoría separada de problema, tienen aquí un uso distinto: no como el objetivo final del análisis, sino como una forma de generar nuevas características para un problema de aprendizaje supervisado. El agrupamiento (clustering) puede asignar a cada ejemplo un identificador de grupo —a qué segmento de clientes pertenece, según un algoritmo de agrupamiento— y ese identificador, tratado como una nueva característica categórica, a veces captura un patrón que las variables originales no expresaban directamente.',
            'El análisis de componentes principales (PCA) reduce un conjunto grande de características correlacionadas entre sí a un número menor de nuevas variables —los componentes principales— que capturan la mayor parte de la variación presente en los datos originales, sin la redundancia de las variables correlacionadas. Estas componentes, usadas como nuevas características, resuelven un problema práctico: cuando muchas variables originales están altamente correlacionadas entre sí, algunos modelos se vuelven inestables o difíciles de interpretar, y reducir esa redundancia sin perder la información esencial mejora tanto la estabilidad como, en ocasiones, el desempeño.',
            'Ninguna de estas dos técnicas garantiza una mejora automática: agregar el identificador de grupo o los componentes principales como características nuevas exige, igual que cualquier otra característica creada, verificar si realmente aporta señal al problema específico que se está resolviendo, no asumir que una técnica sofisticada produce por definición un resultado mejor que las variables originales sin transformar.',
            'La decisión práctica de cuándo probar estas técnicas suele surgir de una señal concreta: si el modelo con las variables originales muestra un desempeño estancado, y una exploración de los datos revela grupos naturales visualmente distinguibles o alta correlación entre muchas variables, esas son las señales que justifican probar agrupamiento o componentes principales como características adicionales, no una regla que se aplique por defecto a cualquier proyecto.',
          ],
          diagram: {
            title: 'Aprendizaje no supervisado como generador de características',
            mermaid: 'graph LR\n  A["Variables originales"] --> B["Agrupamiento\\n(clustering)"]\n  A --> C["Componentes principales\\n(PCA)"]\n  B --> D["Nueva característica:\\nidentificador de grupo"]\n  C --> E["Nuevas características:\\ncomponentes principales"]\n  D --> F["Modelo supervisado"]\n  E --> F',
          },
          keys: [
            'El agrupamiento y el PCA, vistos como categorías de aprendizaje no supervisado en otras asignaturas, aquí se usan como generadores de características para un problema supervisado.',
            'El identificador de grupo de un agrupamiento, tratado como característica categórica, puede capturar patrones que las variables originales no expresan directamente.',
            'PCA reduce variables correlacionadas a componentes que capturan la mayor parte de la variación, mejorando estabilidad e interpretabilidad de algunos modelos.',
            'Ninguna de las dos técnicas garantiza mejora automática: hay que verificar si realmente aportan señal al problema específico, no asumirlo por su sofisticación.',
          ],
          exercise: { mins: 20, text: 'Para un conjunto de datos con varias variables numéricas correlacionadas entre sí, describe cómo aplicarías PCA para generar dos o tres características nuevas, y qué señal (desempeño estancado, alta correlación observada) justificaría probar esta técnica en ese caso concreto.' },
          quiz: [
            { q: '¿Cómo se usa el agrupamiento (clustering) en esta lección, a diferencia de su uso como categoría de problema no supervisado?', opts: ['Exactamente de la misma forma, no hay diferencia', 'Como generador de una nueva característica (el identificador de grupo) para un problema de aprendizaje supervisado', 'Solo para visualizar datos, sin ningún uso posterior', 'Como reemplazo completo del modelo supervisado final'], a: 1, why: ['Sí hay una diferencia de propósito real.', 'Correcto.', 'Tiene un uso posterior concreto, no solo visualización.', 'No reemplaza al modelo final, lo complementa.'] },
            { q: '¿Qué hace el análisis de componentes principales (PCA)?', opts: ['Elimina filas con valores faltantes', 'Reduce variables correlacionadas a un número menor de nuevas variables que capturan la mayor parte de la variación', 'Entrena directamente un modelo de clasificación', 'Codifica variables categóricas en formato numérico'], a: 1, why: ['No se relaciona con valores faltantes.', 'Correcto.', 'No entrena un modelo de clasificación por sí mismo.', 'No es una técnica de codificación categórica.'] },
            { q: '¿Garantizan el agrupamiento y PCA una mejora automática al usarse como características?', opts: ['Sí, siempre mejoran el modelo sin excepción', 'No: hay que verificar si realmente aportan señal al problema específico', 'Solo mejoran si el conjunto de datos es muy grande', 'Solo mejoran si se usan ambas técnicas simultáneamente'], a: 1, why: ['No siempre mejoran automáticamente.', 'Correcto.', 'El tamaño del conjunto no es el factor decisivo aquí.', 'No es necesario usarlas simultáneamente.'] },
          ],
        },
        {
          title: 'Codificación por objetivo',
          mins: 18,
          body: [
            'La codificación por objetivo (target encoding) reemplaza cada categoría de una variable categórica por un valor derivado del objetivo que se quiere predecir —por ejemplo, la tasa promedio de conversión histórica de cada categoría—, en vez de un número arbitrario como en la codificación ordinal o una columna binaria como en one-hot. Esta técnica es particularmente útil con variables categóricas de muchísimas categorías distintas, donde one-hot produciría cientos de columnas nuevas, la mayoría con muy poca información individual.',
            'El riesgo central de la codificación por objetivo es, precisamente, el mismo problema de fuga de datos visto en una lección anterior: si el valor usado para codificar una categoría se calcula incluyendo el propio ejemplo que se está codificando, el modelo tiene acceso indirecto a información sobre su propio objetivo durante el entrenamiento, y el desempeño en entrenamiento parecerá excelente mientras el desempeño real en producción será mucho peor.',
            'La forma correcta de calcular la codificación por objetivo evita este riesgo calculando el valor para cada ejemplo usando únicamente otros ejemplos —nunca el propio—, típicamente mediante una variante de validación cruzada aplicada específicamente a este cálculo: se divide el conjunto en bloques, y el valor de codificación para los ejemplos de un bloque se calcula solo con los datos de los demás bloques, nunca con datos del mismo bloque que se está codificando.',
            'Categorías con muy pocos ejemplos históricos merecen un tratamiento adicional: calcular su tasa promedio directamente, con pocos datos, produce una estimación con mucho ruido y poco confiable. Suavizar esa estimación hacia el promedio general del conjunto completo —ponderando más el promedio general cuando hay pocos ejemplos de esa categoría específica, y más la tasa propia de la categoría cuando hay muchos ejemplos— es la práctica recomendada para evitar que categorías raras introduzcan ruido desproporcionado en el modelo final.',
          ],
          diagram: {
            title: 'Codificación por objetivo sin fuga',
            mermaid: 'graph LR\n  X["✗ Incorrecto: calcular con\\nel propio ejemplo incluido"] --> F["Fuga de datos"]\n  Y["✓ Correcto: calcular solo\\ncon OTROS ejemplos"] --> C["Codificación válida"]',
          },
          example: { title: 'La fuga sutil de la codificación por objetivo', text: 'Se codifica la categoría "ciudad" con la tasa de conversión promedio de cada ciudad, calculada usando todos los ejemplos, incluyendo el ejemplo actual que se está codificando. Para una ciudad con solo tres ejemplos en el conjunto de datos, esa tasa promedio incluye directamente el resultado del ejemplo que se quiere predecir, dándole al modelo, indirectamente, la respuesta que se supone debe aprender a predecir.' },
          keys: [
            'La codificación por objetivo reemplaza cada categoría por un valor derivado del objetivo, útil especialmente con muchísimas categorías donde one-hot sería impráctico.',
            'Calcular el valor de codificación incluyendo el propio ejemplo es una forma de fuga de datos: el modelo accede indirectamente a información sobre lo que debe predecir.',
            'La forma correcta calcula el valor para cada ejemplo usando solo otros ejemplos, típicamente con una variante de validación cruzada aplicada a este cálculo específico.',
            'Categorías con pocos ejemplos deben suavizarse hacia el promedio general, para no introducir ruido desproporcionado por estimaciones basadas en muestras muy pequeñas.',
          ],
          recursos: {
            libros: [
              { titulo: 'Feature Engineering for Machine Learning', autor: 'Alice Zheng, Amanda Casari' },
            ],
          },
          exercise: { mins: 15, text: 'Para una variable categórica de muchas categorías en tu contexto, describe cómo aplicarías codificación por objetivo evitando la fuga de datos, y cómo suavizarías la estimación para las categorías con pocos ejemplos históricos.' },
          quiz: [
            { q: '¿Cuándo es particularmente útil la codificación por objetivo frente a one-hot?', opts: ['Solo cuando hay exactamente dos categorías', 'Con variables categóricas de muchísimas categorías distintas, donde one-hot produciría demasiadas columnas', 'Nunca, one-hot siempre es superior', 'Solo con variables numéricas, no categóricas'], a: 1, why: ['No es específicamente para dos categorías.', 'Correcto.', 'No siempre es superior one-hot.', 'Se aplica a variables categóricas, no numéricas.'] },
            { q: '¿Cuál es el riesgo central de la codificación por objetivo?', opts: ['Que tarda demasiado tiempo en calcularse', 'Fuga de datos: si se calcula incluyendo el propio ejemplo, el modelo accede indirectamente a información sobre su objetivo', 'Que solo funciona con variables numéricas', 'Que requiere eliminar todas las demás variables del modelo'], a: 1, why: ['No es un problema de tiempo de cálculo.', 'Correcto.', 'Aplica a variables categóricas, no numéricas.', 'No requiere eliminar otras variables.'] },
            { q: '¿Cómo se tratan las categorías con muy pocos ejemplos al aplicar codificación por objetivo?', opts: ['Se eliminan automáticamente del conjunto de datos', 'Se suaviza su estimación hacia el promedio general, para no introducir ruido desproporcionado', 'Se les asigna siempre el valor cero', 'Se ignoran completamente durante el entrenamiento'], a: 1, why: ['No se eliminan automáticamente.', 'Correcto.', 'No se les asigna cero por defecto.', 'No se ignoran, se tratan con cuidado especial.'] },
          ],
        },
      ],
      exam: [
        { q: '¿Qué suele ser más determinante para el resultado final: el algoritmo o la ingeniería de características?', opts: ['Siempre el algoritmo', 'Con frecuencia la ingeniería de características', 'Ninguno de los dos importa', 'Solo importa la cantidad de datos'], a: 1, why: ['No siempre es el algoritmo.', 'Correcto.', 'Ambos importan, pero se destaca la ingeniería de características.', 'La cantidad de datos no es lo único relevante.'] },
        { q: '¿Qué mide la información mutua?', opts: ['Solo relaciones lineales', 'Cuánto reduce la incertidumbre sobre el objetivo conocer una característica, incluyendo relaciones no lineales', 'El costo computacional', 'El número de valores únicos'], a: 1, why: ['Captura más que relaciones lineales.', 'Correcto.', 'No mide costo computacional.', 'No mide valores únicos.'] },
        { q: '¿Por qué la ingeniería de características exige conocimiento del dominio?', opts: ['No es cierto, es automática', 'Combinar variables con criterio revela patrones que ninguna expresa por separado', 'Está prohibido automatizarla', 'El dominio nunca es relevante'], a: 1, why: ['No es puramente automática.', 'Correcto.', 'No hay tal prohibición total.', 'Sí es relevante.'] },
        { q: '¿Cómo se usa el agrupamiento en esta unidad?', opts: ['Igual que como categoría de problema no supervisado', 'Como generador de una nueva característica para un problema supervisado', 'Solo para visualización', 'Como reemplazo del modelo final'], a: 1, why: ['Hay una diferencia de propósito.', 'Correcto.', 'Tiene uso posterior concreto.', 'No reemplaza el modelo final.'] },
        { q: '¿Qué hace PCA?', opts: ['Elimina valores faltantes', 'Reduce variables correlacionadas a componentes que capturan la mayor variación', 'Entrena un clasificador directamente', 'Codifica variables categóricas'], a: 1, why: ['No trata valores faltantes.', 'Correcto.', 'No entrena un clasificador por sí solo.', 'No es codificación categórica.'] },
        { q: '¿Garantizan agrupamiento y PCA una mejora automática?', opts: ['Sí, siempre', 'No, hay que verificar si aportan señal real', 'Solo con conjuntos muy grandes', 'Solo usándolas juntas'], a: 1, why: ['No siempre mejoran.', 'Correcto.', 'El tamaño no es el factor decisivo.', 'No es necesario combinarlas.'] },
        { q: '¿Cuándo es útil la codificación por objetivo?', opts: ['Solo con dos categorías', 'Con muchísimas categorías, donde one-hot sería impráctico', 'Nunca', 'Solo con variables numéricas'], a: 1, why: ['No es solo para dos categorías.', 'Correcto.', 'No siempre es superior one-hot; depende del caso.', 'Aplica a categóricas.'] },
        { q: '¿Cuál es el riesgo central de la codificación por objetivo?', opts: ['Tiempo de cálculo', 'Fuga de datos al incluir el propio ejemplo en el cálculo', 'Solo funciona con numéricas', 'Requiere eliminar otras variables'], a: 1, why: ['No es problema de tiempo.', 'Correcto.', 'Aplica a categóricas.', 'No requiere eliminar otras variables.'] },
        { q: '¿Cómo se calcula correctamente la codificación por objetivo?', opts: ['Incluyendo siempre el propio ejemplo', 'Usando únicamente otros ejemplos, típicamente con una variante de validación cruzada', 'Con un valor fijo para todas las categorías', 'Sin ningún criterio de división de datos'], a: 1, why: ['Incluir el propio ejemplo causa fuga.', 'Correcto.', 'No usa un valor fijo único.', 'Sí requiere un criterio de división.'] },
        { q: '¿Cómo se tratan las categorías con pocos ejemplos?', opts: ['Se eliminan automáticamente', 'Se suaviza su estimación hacia el promedio general', 'Se les asigna cero', 'Se ignoran'], a: 1, why: ['No se eliminan automáticamente.', 'Correcto.', 'No se asigna cero por defecto.', 'No se ignoran.'] },
      ],
    },
  ],
}

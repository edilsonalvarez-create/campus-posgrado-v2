// Lectura guiada — Asignatura VI: Machine Learning (lección densa: Interpretabilidad).
const F = {
  molnar: { titulo: 'Interpretable Machine Learning — Christoph Molnar', url: 'https://christophm.github.io/interpretable-ml-book/' },
  shap: { titulo: 'SHAP — documentación', url: 'https://shap.readthedocs.io/' },
  geron: { titulo: 'Hands-On Machine Learning 3e — Aurélien Géron', url: 'https://github.com/ageron/handson-ml3' },
};

module.exports = {
  'Interpretabilidad de Modelos': {
    objetivo: 'Distinguir interpretabilidad por diseño de post-hoc y usar la explicación para detectar problemas, no solo para tranquilizar.',
    terminos: [
      {
        n: 1,
        termino: 'Interpretabilidad por diseño',
        definicionTextual: 'El modelo es inherentemente legible: una regresión lineal, un árbol poco profundo o un conjunto de reglas cuyo razonamiento se puede seguir directamente.',
        fuente: F.molnar.titulo,
        idea: ['Cuando la explicabilidad es un requisito duro (auditoría, apelación, sector regulado), se empieza por un modelo interpretable por diseño y solo se cambia si el rendimiento es claramente insuficiente.'],
        ejemplo: 'Un árbol de decisión de 4 niveles para aprobar o revisar una solicitud: cada decisión se lee como una regla.',
        errorComun: 'Elegir un modelo opaco por un 1% más de exactitud cuando el caso exige explicar cada decisión.',
        fraseClave: 'Si tienes que explicar cada decisión, empieza por un modelo legible.',
      },
      {
        n: 2,
        termino: 'Interpretabilidad post-hoc',
        definicionTextual: 'Técnicas externas (importancia de variables, LIME, SHAP) que aproximan una explicación de un modelo opaco después de entrenarlo.',
        fuente: F.shap.titulo,
        idea: ['Son aproximaciones, no la lógica real del modelo: útiles para diagnosticar, pero no equivalen a la transparencia de un modelo interpretable por diseño.'],
        ejemplo: 'Aplicar SHAP a un gradient boosting para ver qué variables empujaron una predicción concreta.',
        errorComun: 'Presentar una explicación SHAP como "así funciona el modelo" en vez de "así aproximamos por qué dio esta salida".',
        fraseClave: 'Post-hoc explica una salida, no la mente del modelo.',
      },
      {
        n: 3,
        termino: 'Importancia de variables y explicación local (SHAP)',
        definicionTextual: 'Importancia global: qué variables pesan más en el modelo en conjunto. Explicación local (SHAP): cuánto empujó cada variable la predicción de un caso concreto.',
        fuente: F.shap.titulo,
        idea: ['La explicación local es la que sirve para responder a una persona afectada ("tu solicitud se marcó sobre todo por X e Y").'],
        ejemplo: 'SHAP muestra que, para este cliente, "meses de antigüedad" bajó el score y "número de productos" lo subió.',
        errorComun: 'Usar solo la importancia global y no poder explicar decisiones individuales.',
        fraseClave: 'Global para entender el modelo; local para responder a una persona.',
      },
      {
        n: 4,
        termino: 'La interpretabilidad como herramienta de diagnóstico',
        definicionTextual: 'Usar la explicación no para justificar el modelo, sino para detectar que se apoya en algo que no debería: un proxy, una fuga de datos, una correlación espuria.',
        fuente: F.geron.titulo,
        idea: ['Si la variable más influyente es una que solo se rellena cuando ya existe el resultado que quieres predecir, tienes fuga de datos, y SHAP acaba de decírtelo.'],
        ejemplo: 'La variable "días desde el último contacto con reclamaciones" domina el modelo de riesgo de reclamación: señal de fuga temporal.',
        errorComun: 'Ver una variable con importancia altísima y celebrarlo en vez de sospechar.',
        fraseClave: 'Una importancia sospechosamente alta suele ser un problema, no un mérito.',
      },
    ],
    casoCompleto: {
      escenario: 'Aplicas SHAP a un modelo de scoring y descubres que la variable dominante es "número de reclamaciones en los últimos 12 meses", pero la etiqueta es "reclamará en los próximos 30 días".',
      pasos: [
        { titulo: 'Sospecha', texto: 'Una importancia tan alta de una variable tan cercana a la etiqueta es señal de alarma.' },
        { titulo: 'Revisar el tiempo', texto: 'Comprueba si los 12 meses terminan antes de la fecha de predicción; si incluyen información posterior, hay fuga.' },
        { titulo: 'Corregir', texto: 'Recalcula la variable con corte temporal correcto y reentrena.' },
        { titulo: 'Requisito', texto: 'Si el uso exige explicar cada decisión, valora un modelo interpretable por diseño en vez de post-hoc.' },
      ],
    },
    preguntas: [
      {
        q: 'SHAP muestra que la variable más influyente de tu modelo de riesgo es una que solo se rellena cuando el problema ya ocurrió. ¿Qué implica?',
        opts: [
          'Que el modelo es excelente: encontró la variable clave.',
          'Probablemente hay fuga de datos: esa variable codifica información del resultado; revisa cuándo se rellena respecto al momento de predecir.',
          'Que hay que eliminar SHAP.',
          'Que la variable debe multiplicarse por dos.',
        ],
        a: 1,
        why: 'La interpretabilidad sirve para detectar que el modelo se apoya en algo que no estará disponible al predecir, o que filtra la respuesta.',
      },
      {
        q: 'El caso exige explicar por escrito cada decisión a un auditor. Entre un árbol poco profundo y un gradient boosting con SHAP, ¿qué priorizas de partida?',
        opts: [
          'El gradient boosting siempre.',
          'El modelo interpretable por diseño (árbol poco profundo): la explicación es la lógica real, no una aproximación; se cambia solo si el rendimiento es claramente insuficiente.',
          'El que tenga más variables.',
          'Da igual, son equivalentes.',
        ],
        a: 1,
        why: 'Con explicabilidad como requisito duro se empieza por transparencia intrínseca, no por explicación post-hoc aproximada.',
      },
    ],
    fuentes: [F.molnar, F.shap, F.geron],
  },
};

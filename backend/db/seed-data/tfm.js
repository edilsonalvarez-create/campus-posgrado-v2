// Proyecto Fin de Programa (TFM) — proceso de 4 hitos con rúbrica y director.
// Cierra P-05 / G-4: el capstone deja de ser un textarea sin proceso.
module.exports = {
  milestones: [
    {
      slug: 'tfm-propuesta',
      orderIndex: 1,
      title: 'Hito 1 — Propuesta',
      weight: 10,
      requiresVideo: false,
      templateUrl: null,
      description:
        'Documento de 2–4 páginas: problema real y por qué importa (con una cifra que lo dimensione), pregunta concreta que resolverás, alcance (qué SÍ y qué NO), datos que necesitas y su disponibilidad, y un plan de 8 semanas con hitos. Elige una de las tres líneas: (a) detección de anomalías para el SGSI integrada con ISO 27001/42001; (b) agente multimodal de pruebas con suite de evaluación contra línea base; (c) asistente RAG de trazabilidad documental con controles de datos personales y análisis de coste.',
      rubricSlug: 'rubric-tfm-propuesta',
    },
    {
      slug: 'tfm-estado-arte',
      orderIndex: 2,
      title: 'Hito 2 — Estado del arte',
      weight: 20,
      requiresVideo: false,
      templateUrl: null,
      description:
        'Revisión de 4–8 fuentes relevantes (papers, informes técnicos, sistemas comparables) en una matriz: qué resuelve cada una, con qué método, qué métricas reporta y qué limitación tiene. Cierra con el vacío concreto que tu TFM cubre y por qué tu enfoque frente a las alternativas. Citas en formato APA 7.',
      rubricSlug: 'rubric-tfm-estado-arte',
    },
    {
      slug: 'tfm-revision-intermedia',
      orderIndex: 3,
      title: 'Hito 3 — Revisión intermedia',
      weight: 30,
      requiresVideo: false,
      templateUrl: null,
      description:
        'Avance funcional: repositorio con el sistema a medio construir que ya produce un primer resultado medible, la metodología de evaluación definida (conjunto de prueba honesto, línea base, métricas), y un registro de riesgos del proyecto con lo que ha cambiado respecto al plan y por qué. El director da retroalimentación estructurada antes del hito final.',
      rubricSlug: 'rubric-tfm-revision-intermedia',
    },
    {
      slug: 'tfm-final',
      orderIndex: 4,
      title: 'Hito 4 — Memoria final y defensa',
      weight: 40,
      requiresVideo: true,
      templateUrl: null,
      description:
        'Memoria de 40–60 páginas (problema → estado del arte → método → implementación → evaluación cuantitativa → riesgos y ética → coste → conclusiones), repositorio público, y un vídeo de defensa de 10 minutos. Los dos apartados que casi todo el mundo omite —evaluación con números y coste real a 12 meses— son los que separan un trabajo de posgrado de una demostración.',
      rubricSlug: 'rubric-tfm-final',
    },
  ],
};

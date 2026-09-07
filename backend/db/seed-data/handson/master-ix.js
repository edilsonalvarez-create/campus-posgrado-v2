// Track hands-on — Asignatura IX: IA generativa aplicada.
module.exports = {
  scopeSlug: 'master-ix',
  title: 'Práctica computacional: RAG con panel de métricas',
  rubricSlug: 'rubric-handson-master-ix',
  notebookTemplateUrl: null,
  referencePractice:
    'Ruta oficial IX: "Un sistema RAG sobre documentación propia con métricas de recuperación separadas de las de generación. Entregable: servicio RAG funcional con panel de métricas: precisión de recuperación, tasa de alucinación medida sobre casos conocidos y coste por consulta." Opcional: un modelo de vida útil restante sobre C-MAPSS.',
  deliverable:
    'Repositorio público con un sistema RAG funcional sobre un corpus propio (los procedimientos de tu organización o un corpus público) que incluya: (1) un conjunto de ≥15 preguntas con respuesta esperada; (2) métricas de RECUPERACIÓN (¿trae los fragmentos correctos?) separadas de las de GENERACIÓN (¿usa bien esos fragmentos?); (3) tasa de alucinación medida sobre los casos conocidos; (4) coste por consulta estimado; (5) un caso donde el sistema falla y tu diagnóstico de en qué etapa falló (recuperación, contexto o generación) antes de tocar el prompt.',
  requiredArtifacts: [
    { label: 'Repositorio del RAG', type: 'repo', hint: 'Con el corpus (o instrucciones para obtenerlo) y el script de evaluación.' },
    { label: 'Panel / informe de métricas', type: 'link', hint: 'Recuperación, generación, alucinación y coste por consulta.' },
    { label: 'Diagnóstico de un fallo', type: 'pdf', hint: 'Un caso incorrecto, la etapa donde falló y la evidencia.' },
  ],
};

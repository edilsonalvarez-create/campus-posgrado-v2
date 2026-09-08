// Track hands-on — Asignatura VII: Prompts Multimodales y Adaptación a Contextos Complejos.
// Alinea el entregable con la práctica obligatoria de la ruta oficial
// (campus-posgrado-ia/docs/ruta-ia-industria-40.html, módulo VII).
module.exports = {
  scopeSlug: 'master-vii',
  title: 'Práctica computacional: biblioteca de prompts con suite de evaluación',
  rubricSlug: 'rubric-handson-master-vii',
  // El profesorado publica la plantilla (repo/Colab con la batería de casos y el runner).
  notebookTemplateUrl: null,
  referencePractice:
    'Ruta oficial VII: "Construye una batería de evaluación: 20 casos con respuesta esperada, y mide tres versiones distintas del mismo prompt contra ella. Repite el ejercicio con entrada multimodal —captura de pantalla más instrucción— y compara tasas de acierto. Entregable: una biblioteca de prompts versionada en git, con su suite de evaluación ejecutable y un registro de qué cambio subió qué métrica."',
  deliverable:
    'Repositorio git público con: (1) una batería de ≥20 casos con respuesta esperada para una tarea real de tu trabajo (interpretar una captura y derivar pasos, clasificar un documento, extraer campos de una imagen…); (2) un runner ejecutable que puntúa un prompt contra la batería y devuelve una métrica agregada; (3) ≥3 versiones del mismo prompt, cada una en su commit, con un CHANGELOG que dice qué cambió y qué delta de métrica produjo; (4) el mismo ejercicio con entrada multimodal (captura + instrucción) y la comparación de tasa de acierto texto vs multimodal; (5) un caso donde tu conclusión es que el fallo NO está en el prompt sino en el modelo o en el contexto que le das, con la evidencia que lo demuestra.',
  requiredArtifacts: [
    { label: 'Repositorio de la biblioteca de prompts', type: 'repo', hint: 'Con la batería de casos, el runner y el historial de versiones (git log legible).' },
    { label: 'Registro de deltas de métrica', type: 'link', hint: 'CHANGELOG o tabla: versión de prompt → cambio → delta de la métrica.' },
    { label: 'Comparación multimodal + caso "no es el prompt"', type: 'pdf', hint: 'Tasas de acierto texto vs captura+instrucción, y el fallo atribuido al modelo/contexto con evidencia.' },
  ],
};

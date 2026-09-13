// Track hands-on — Asignatura XI: Principios de IA aplicada a entornos seguros.
// Alinea el entregable con la práctica obligatoria de la ruta oficial
// (campus-posgrado-ia/docs/ruta-ia-industria-40.html, módulo XI).
module.exports = {
  scopeSlug: 'master-xi',
  title: 'Práctica computacional: red team de un sistema de IA propio',
  rubricSlug: 'rubric-handson-master-xi',
  notebookTemplateUrl: null,
  referencePractice:
    'Ruta oficial XI: "Dos ejercicios simétricos. Defensa: un detector de anomalías sobre registros reales de tu infraestructura, con umbral calibrado contra la tasa de falsos positivos que tu equipo puede absorber. Ataque: rompe tu propio RAG del módulo IX mediante inyección de prompt y extracción de contexto. Entregable: informe de red team de un sistema de IA con formato de pentesting —hallazgos, criticidad, evidencia, mitigación— y los controles resultantes mapeados a ISO 27001 y 42001."',
  deliverable:
    'Informe de red team (formato pentesting) de un sistema de IA propio —preferiblemente el RAG que construiste en la Asignatura IX; si no, un modelo/servicio de IA de tu organización— con: (1) un ejercicio OFENSIVO real: inyección de prompt y extracción de contexto/datos, con los payloads usados y la evidencia reproducible de cada hallazgo; (2) cada hallazgo con criticidad (p. ej. CVSS-like o alto/medio/bajo justificado), impacto y mitigación concreta; (3) una tabla que mapea cada hallazgo y su mitigación a un control específico de ISO/IEC 27001 (Anexo A) y de ISO/IEC 42001; (4) un ejercicio DEFENSIVO: un detector de anomalías sobre logs reales (o sintéticos representativos) con el umbral calibrado explícitamente contra la tasa de falsos positivos que el equipo puede absorber, y la matriz de confusión resultante; (5) una conclusión sobre qué romperías primero si tuvieras una hora y por qué.',
  requiredArtifacts: [
    { label: 'Informe de red team (pentesting)', type: 'pdf', hint: 'Hallazgos, criticidad, evidencia, mitigación + tabla de mapeo a ISO 27001/42001.' },
    { label: 'Repositorio / notebook del detector defensivo', type: 'repo', hint: 'Detector de anomalías, calibración del umbral y matriz de confusión.' },
    { label: 'Evidencia reproducible del ataque', type: 'link', hint: 'Payloads de inyección/extracción y el resultado obtenido (capturas o logs).' },
  ],
};

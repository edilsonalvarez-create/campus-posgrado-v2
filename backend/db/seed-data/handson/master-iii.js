// Track hands-on — Asignatura III: motores de datos y escalabilidad.
// Alinea el entregable con la práctica obligatoria de la ruta oficial
// (campus-posgrado-ia/docs/ruta-ia-industria-40.html, módulo III).
module.exports = {
  scopeSlug: 'master-iii',
  title: 'Práctica computacional: benchmark de motores de datos',
  rubricSlug: 'rubric-handson-master-iii',
  // El profesorado publica la plantilla (Colab/Kaggle/GitHub) y pega el enlace aquí.
  notebookTemplateUrl: null,
  referencePractice:
    'Ruta oficial III: "Toma un dataset público de entre 5 y 50 millones de filas y resuelve la misma agregación con pandas, con Polars y con DuckDB. Mide tiempo y memoria de cada uno. Después repítelo con Spark en local y observa cuánto pierdes en sobrecarga."',
  deliverable:
    'Repositorio público (o notebook reproducible) con: (1) la misma agregación resuelta en pandas, Polars, DuckDB y Spark local sobre un dataset de 5–50 M de filas; (2) una tabla de resultados con tiempo y memoria pico de cada motor; (3) un informe de una página que responde: para este volumen, qué motor elegirías y por qué, en qué punto exacto Spark deja de compensar, y qué se sacrificaría si el volumen se multiplicara por diez. La conclusión debe apoyarse en TUS mediciones, no en una regla aprendida.',
  requiredArtifacts: [
    { label: 'Repositorio o notebook reproducible', type: 'repo', hint: 'GitHub, GitLab, Colab o Kaggle. Debe ejecutarse de principio a fin.' },
    { label: 'Tabla de benchmark (tiempo + memoria por motor)', type: 'link', hint: 'Puede estar dentro del notebook o como CSV/imagen enlazada.' },
    { label: 'Informe de arquitectura (1 pág.)', type: 'pdf', hint: 'PDF o enlace a documento. Con los números encima de la mesa.' },
  ],
};

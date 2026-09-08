// Track hands-on — Asignatura VI: Machine Learning (módulo técnico central).
module.exports = {
  scopeSlug: 'master-vi',
  title: 'Práctica computacional: tres problemas de ML + model card',
  rubricSlug: 'rubric-handson-master-vi',
  notebookTemplateUrl: null,
  referencePractice:
    'Ruta oficial VI: "Tres problemas completos, de datos crudos a conclusión: una clasificación, una regresión y un no supervisado. Además, una competencia de Kaggle llevada hasta el 50% superior de la tabla. Entregable: un modelo con su model card (métricas, población de entrenamiento, limitaciones, y explicación SHAP de las cinco variables más influyentes)."',
  deliverable:
    'Repositorio público con: (1) tres notebooks, uno por paradigma (clasificación, regresión, no supervisado), de datos crudos a conclusión, cada uno con la métrica de evaluación justificada ANTES de entrenar; (2) captura o enlace a tu posición en una competencia de Kaggle (Kaggle Learn sirve) o justificación equivalente; (3) una model card de uno de los modelos: métricas en test honesto, población de entrenamiento, limitaciones conocidas y explicación SHAP de las 5 variables más influyentes; (4) para uno de los pipelines, señala explícitamente dónde podría haber fuga de datos y cómo lo evitaste.',
  requiredArtifacts: [
    { label: 'Repositorio con los 3 notebooks', type: 'repo', hint: 'Cada notebook reproducible de principio a fin.' },
    { label: 'Model card', type: 'pdf', hint: 'PDF o Markdown enlazado. Incluye la explicación SHAP.' },
    { label: 'Evidencia de Kaggle', type: 'link', hint: 'Enlace al perfil/competencia o captura de la posición.' },
  ],
};

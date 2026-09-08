// Track hands-on — Asignatura X: AI Platforms (despliegue y operación).
module.exports = {
  scopeSlug: 'master-x',
  title: 'Práctica computacional: desplegar y operar un modelo',
  rubricSlug: 'rubric-handson-master-x',
  notebookTemplateUrl: null,
  referencePractice:
    'Ruta oficial X: "Despliega el modelo del módulo VI como API en contenedor, con registro de versiones en MLflow, monitoreo de deriva de datos y despliegue automático desde el repositorio. Entregable: un modelo realmente en funcionamiento —aunque sea de uso interno— con panel de latencia, uso y coste mensual real."',
  deliverable:
    'Repositorio público + demo (URL en vivo, aunque sea free tier, o vídeo de 3 min ejecutándola) de un modelo simple desplegado como API en contenedor, con: (1) Dockerfile y despliegue reproducible; (2) registro de versiones del modelo (MLflow u equivalente); (3) monitoreo de deriva de datos configurado; (4) un análisis del coste mensual real (o proyectado con supuestos explícitos) que identifique la palanca que bajarías primero para reducirlo a la mitad. La decisión de proveedor debe justificarse por un factor que no sea el precio de lista.',
  requiredArtifacts: [
    { label: 'Repositorio (Dockerfile + despliegue)', type: 'repo', hint: 'Debe poder reconstruirse y desplegarse siguiendo el README.' },
    { label: 'Demo en vivo o vídeo', type: 'link', hint: 'URL del endpoint funcionando o vídeo corto de la API respondiendo.' },
    { label: 'Análisis de coste y operación', type: 'pdf', hint: 'Coste mensual, palanca principal, y la config de monitoreo de deriva.' },
  ],
};

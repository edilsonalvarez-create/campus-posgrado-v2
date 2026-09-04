// Proyecto práctico por asignatura del Máster — retroalimentación real de una
// alumna: "el plan de estudio debe estructurarse mucho más práctico que
// teórico". Cada entrada sigue la misma forma que ya usa el TFM
// (deliverable/practice/mastery, ver template.json + seed.js), reutilizando
// sin cambios el mecanismo de entrega/calificación de FASE 6 (SubmissionForm,
// GradingPanel, ProjectDelivery, PUT /api/submissions/:id/grade).
//
// No sustituye a las lecciones ni a su "actividad" corta: es un entregable
// aplicado adicional, evaluado por el instructor, que cuenta para el 100% de
// la asignatura igual que el examen.

module.exports = {
  'master-i': {
    deliverable: 'Memo de evaluación de 2 a 3 páginas sobre una propuesta de IA real (o realista) de tu propia organización: nombra la entrada y la salida exactas, clasifica si es IA estrecha o una intención mal formulada, identifica el nivel de automatización de la decisión (asistencia, recomendación o automatización plena) y señala al menos un riesgo ético concreto del caso.',
    practice: 'Opción 1 (recomendada): una propuesta de IA que ya circula en tu organización (un proveedor la ofreció, o un área la pidió). Opción 2: una propuesta de un titular de prensa reciente sobre IA en tu sector, evaluada como si fuera tuya. Opción 3, si ninguna de las anteriores aplica: diseña tú una propuesta de IA para un problema real de tu área y evalúala con el mismo rigor que exigirías a la de un tercero.',
    mastery: 'El apartado que casi todo el mundo se salta es nombrar la entrada y la salida en una frase cada una, sin rodeos: si no puedes hacerlo, la propuesta evaluada todavía no es un proyecto, es una intención — y esa es, en sí misma, una conclusión válida del memo, no una excusa para no entregarlo.',
  },
  'master-ii': {
    deliverable: 'Ficha de evaluación de una tecnología disruptiva concreta (Big Data, IoT, Cloud o Blockchain) aplicada a un caso de uso real de tu organización o sector: qué problema resolvería exactamente, en qué fase de madurez/expectativa está hoy, qué otras tecnologías necesita para funcionar, y cuál es la barrera de adopción real más allá de "probarla en un piloto".',
    practice: 'Opción 1 (recomendada): una tecnología que tu organización ya evalúa o menciona en reuniones, para dar una lectura crítica basada en el criterio de la asignatura en vez de en el entusiasmo del proveedor. Opción 2: compara dos tecnologías candidatas para un mismo problema (p. ej. IoT frente a un proceso manual mejorado) y justifica cuál recomendarías.',
    mastery: 'El apartado que casi todo el mundo omite es la barrera de adopción real —la organizacional, no la técnica—: cualquiera puede describir qué hace la tecnología; el criterio que se evalúa aquí es si identificas qué impediría de verdad que tu organización la adoptara mañana.',
  },
  'master-iii': {
    deliverable: 'Diagrama (puede ser a mano, fotografiado, o en cualquier herramienta) de una arquitectura de Big Data para un escenario dado, con una página de justificación: qué patrón de procesamiento eliges (batch o streaming) y por qué, dónde entra un árbol de decisión o una regresión simple en el flujo, y qué se sacrificaría si el volumen de datos se multiplicara por diez.',
    practice: 'Opción 1 (recomendada): un escenario de tu propia organización con datos que hoy se procesan de forma manual o poco estructurada. Opción 2: el escenario de referencia — una cadena de tiendas que necesita predecir quiebres de inventario por sucursal a partir de historial de ventas, clima y eventos locales.',
    mastery: 'El apartado que casi todo el mundo omite es justificar batch frente a streaming con el costo real de cada opción, no solo con la palabra de moda: si tu diagrama usaría streaming "porque suena más avanzado" sin que el problema exija tiempo real, esa es precisamente la confusión que esta asignatura pide poder detectar.',
  },
  'master-iv': {
    deliverable: 'Plan de un sprint de dos semanas para un proyecto real o hipotético: 5 a 8 historias de usuario con criterios de aceptación, un backlog de sprint priorizado, y una retrospectiva escrita como si el sprint ya hubiera terminado (qué funcionó, qué no, qué cambiarían para el siguiente).',
    practice: 'Opción 1 (recomendada): un proyecto real de tu equipo, aunque hoy no use Scrum — planifícalo como si lo usara. Opción 2: el proyecto de referencia — migrar un proceso de aprobación interno en papel a un flujo digital simple, en un equipo de cuatro personas.',
    mastery: 'El apartado que casi todo el mundo omite es escribir una retrospectiva honesta, con al menos un fallo real reconocido, en vez de una lista genérica de "todo salió bien": una retrospectiva sin nada que mejorar no es una retrospectiva, es una felicitación.',
  },
  'master-v': {
    deliverable: 'Evaluación de riesgo y cumplimiento de un sistema de IA real o hipotético: nivel de riesgo asignado con justificación, punto exacto donde se exige supervisión humana significativa, y una brecha de gobernanza concreta que el sistema tiene hoy frente al modelo de gobernanza visto en la asignatura.',
    practice: 'Opción 1 (recomendada): un sistema de IA que ya opera en tu organización (aunque sea informal, como un modelo de scoring o un chatbot de soporte). Opción 2: un caso público conocido de un sistema de IA que haya generado controversia regulatoria o ética, evaluado con el marco de la asignatura en vez de con la cobertura de prensa.',
    mastery: 'El apartado que casi todo el mundo omite es señalar el punto exacto del flujo donde debería intervenir un humano, no solo afirmar que "debe haber supervisión humana" en abstracto: sin ese punto exacto, la recomendación no es accionable.',
  },
  'master-vi': {
    deliverable: 'Documento de flujo de trabajo de Machine Learning aplicado a un dataset real o provisto (puede ser de Kaggle, de tu organización, o cualquier fuente pública): encuadre del problema como entrada→salida, elección justificada de la métrica de evaluación, y un diagnóstico honesto de sesgo o varianza esperado antes de entrenar nada.',
    practice: 'Opción 1 (recomendada): un dataset relevante para tu organización, aunque el modelo final no llegue a producción. Opción 2: un dataset público de referencia (por ejemplo, uno de los micro-cursos de Kaggle Learn enlazados en los recursos de esta asignatura) usado como caso de estudio completo.',
    mastery: 'El apartado que casi todo el mundo omite es justificar la métrica de evaluación antes de ver resultados: elegir "precisión" porque suena bien, sin preguntar si el problema tiene clases desbalanceadas, es exactamente el error que esta asignatura enseña a evitar.',
  },
  'master-vii': {
    deliverable: 'Conjunto de 5 a 8 prompts diseñados para un caso de uso multimodal real (texto+imagen, texto+audio, o similar), con al menos dos iteraciones documentadas por prompt: la versión inicial, qué falló al probarla, y la versión corregida — más un criterio de evaluación explícito para saber si un prompt "funciona".',
    practice: 'Opción 1 (recomendada): un caso de uso real de tu organización que hoy se resuelve manualmente y podría beneficiarse de una interfaz multimodal. Opción 2: diseñar prompts para adaptar un mismo contenido a tres audiencias distintas, documentando qué cambia en cada versión y por qué.',
    mastery: 'El apartado que casi todo el mundo omite es documentar el fallo de la primera versión del prompt, no solo la versión final pulida: sin ese registro, no hay forma de distinguir si mejoraste por método o por azar.',
  },
  'master-viii': {
    deliverable: 'Recorrido documentado del proceso de Design Thinking sobre un problema real de tu organización: notas de al menos una entrevista o conversación de empatía, la redefinición del problema tras esa investigación, tres ideas generadas sin filtrar prematuramente, y un prototipo de baja fidelidad (dibujo, maqueta en papel, o similar) de la idea elegida.',
    practice: 'Opción 1 (recomendada): un problema real que tu equipo enfrenta hoy, por pequeño que parezca. Opción 2: el problema de referencia — mejorar el proceso de incorporación de un nuevo empleado en su primera semana.',
    mastery: 'El apartado que casi todo el mundo omite es mostrar que el problema cambió después de la fase de empatía: si tu problema final es idéntico al que escribiste antes de investigar, probablemente no investigaste de verdad, saltaste directo a idear.',
  },
  'master-ix': {
    deliverable: 'Especificación de una aplicación de IA generativa para un caso industrial concreto (datos sintéticos para entrenamiento, mantenimiento predictivo, o documentación técnica multimedia): qué arquitectura generativa usarías (GAN, VAE o difusión) y por qué, qué datos de entrada necesita, y en qué punto del proceso interviene revisión humana antes de usar el resultado.',
    practice: 'Opción 1 (recomendada): un proceso industrial o técnico real de tu organización donde la escasez de datos o el tiempo de documentación sea un problema conocido. Opción 2: el escenario de referencia — generar variantes sintéticas de defectos de calidad para entrenar un modelo de inspección visual.',
    mastery: 'El apartado que casi todo el mundo omite es justificar la elección de arquitectura por el criterio correcto —estabilidad de entrenamiento frente a costo de inferencia, visto en la asignatura— y no por cuál suena más nueva o más de moda.',
  },
  'master-x': {
    deliverable: 'Diagrama de arquitectura cloud (ingesta, entrenamiento gestionado, registro de modelos, despliegue, monitoreo) para llevar un modelo a producción en un escenario dado, con una tabla comparativa de AWS, Azure y Google Cloud para ese caso concreto, y una recomendación final justificada por al menos un factor que no sea el precio de lista.',
    practice: 'Opción 1 (recomendada): un caso real o cercano a tu organización, incluso si hoy no usa ningún proveedor de nube. Opción 2: el escenario de referencia — desplegar un modelo de detección de anomalías que debe responder en menos de un segundo, para una organización que ya usa Microsoft 365 extensamente.',
    mastery: 'El apartado que casi todo el mundo omite es justificar la elección final con un factor concreto —integración existente, cumplimiento, fortaleza específica del proveedor— y no con la marca: "elegimos AWS porque es el más grande" no es una justificación válida en este proyecto.',
  },
  'master-xi': {
    deliverable: 'Modelo de amenazas y evaluación de riesgo de un sistema o proceso real (o realista) desde dos ángulos: cómo la IA podría defenderlo (detección de anomalías o clasificación de amenazas) y cómo la IA generativa podría usarse para atacarlo (phishing dirigido, deepfake, o malware polimórfico) — con al menos una mitigación concreta propuesta para el riesgo ofensivo identificado.',
    practice: 'Opción 1 (recomendada): un sistema o proceso real de tu organización con relevancia de seguridad (acceso, pagos, datos sensibles). Opción 2: el escenario de referencia — el proceso de autorización de transferencias de una empresa mediana, evaluado como objetivo de un ataque de ingeniería social asistido por IA generativa.',
    mastery: 'El apartado que casi todo el mundo omite es la mitigación del riesgo ofensivo: identificar que un ataque es posible es la mitad del ejercicio; la asignatura evalúa si además propones algo concreto que lo dificulte, no solo que lo describes.',
  },
}

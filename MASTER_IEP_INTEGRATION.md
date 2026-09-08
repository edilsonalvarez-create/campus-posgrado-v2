# 🎓 Master de IEP - Integración en Plataforma

> **Nota de veracidad (transformación Fase 0/1, 2026-09).** Este documento se
> corrigió para describir lo que la plataforma **hace de verdad**. Versiones
> anteriores anunciaban una "calificación automática con IA", "rúbricas
> automáticas" y "repetición espaciada" que no existían en el backend en
> ejecución (`backend/simple-server.js`). Estado real abajo.

## Sistema LMS para el Máster IEP en IA

### ✨ Estado real

**Campus Posgrado v2 incluye hoy:**
- ✅ Plataforma web (React 18 + TypeScript + Vite) desplegada en Vercel
- ⚠️ App móvil (Expo) — solo Login + Dashboard; el consumo de curso es web
- ✅ Backend `simple-server.js` (Node http nativo + PostgreSQL) en Railway
- ✅ 11 asignaturas oficiales + TFM como cursos propios, agrupados por `meta.programSlug='master-iep'`
- ✅ 66 lecciones propias con quiz formativo, diagrama y actividad
- ✅ Calificación de proyectos **por rúbrica**, realizada por un instructor
  (con *asistencia* opcional de un LLM que propone, sin decidir — humano en el bucle)
- ✅ Certificado de asignatura que exige **lecciones + proyecto + examen**
  (no basta aprobar un examen de opción múltiple)
- ❌ NO hay calificación autónoma por IA. `backend/ai-grader.js` es código muerto
  (heurística de conteo de palabras, nunca importado) y será eliminado.

---

## 📚 Master de IEP - Estructura

### Visión General

El Master de IEP "Inteligencia Artificial y Tecnologías Disruptivas para la Innovación en la Industria 4.0" está diseñado como un programa integral de 52 semanas que cubre:

- Fundamentos de IA y Machine Learning
- Deep Learning y Redes Neuronales
- Big Data e IoT
- Cloud Computing
- Ética y Seguridad en IA

### Asignaturas Principales

#### **Asignatura 1: Fundamentos de IA y Tecnologías Disruptivas**
- **Créditos:** 6
- **Duración:** 8 semanas
- **Nivel:** Introductorio

**Módulos:**
1. **Introducción a la IA**
   - Historia y evolución (MIT OpenCourseWare)
   - Tipos de IA (Débil/Fuerte, Narrow/General)
   - Aplicaciones en la industria

2. **Machine Learning - Fundamentos**
   - Tipos de aprendizaje (supervisado, no supervisado, refuerzo)
   - Google ML Crash Course
   - TensorFlow Playground (interactivo)
   - Libro: "Machine Learning for Absolute Beginners"

3. **Deep Learning y Redes Neuronales**
   - Perceptrón y Backpropagation
   - Andrew Ng Deep Learning Specialization
   - Libro: "Deep Learning" (Goodfellow, Bengio, Courville)
   - Proyecto: CNN para clasificación de imágenes

4. **Big Data e IoT**
   - Los 4 V del Big Data
   - Sensores inteligentes
   - Industria 4.0 en manufactura

5. **Cloud Computing**
   - IaaS, PaaS, SaaS
   - AWS, Google Cloud, Azure
   - Labs prácticos

6. **Ética y Seguridad en IA**
   - Sesgos y Fairness
   - "Weapons of Math Destruction" (O'Neil)
   - Privacidad en la era digital

#### **Asignatura 2: Machine Learning Avanzado**
*(En desarrollo)*
- Feature Engineering
- Ensemble Methods
- Hyperparameter Tuning
- AutoML y MLOps

#### **Asignatura 3: Deep Learning Especializado**
*(En desarrollo)*
- Transfer Learning
- GANs (Generative Adversarial Networks)
- NLP con Transformers
- Vision Transformers

---

## 🎯 Recursos Integrados

### Tipos de Recursos

1. **Lecturas** (PDF descargables en español)
   - Capítulos de libros recomendados
   - Artículos académicos
   - Papers de investigación

2. **Videos** (links a cursos externos)
   - MIT OpenCourseWare
   - Google ML Crash Course
   - Andrew Ng Specializations
   - YouTube educativo

3. **Ejercicios Prácticos**
   - Problemas de análisis
   - Implementación de algoritmos
   - Proyectos de integración

4. **Labs Interactivos**
   - TensorFlow Playground
   - Google Colab
   - Jupyter Notebooks

5. **Casos de Estudio**
   - Industria 4.0
   - Transformación digital
   - Aplicaciones reales

---

## 📝 Sistema de Evaluación

### Componentes de Calificación

1. **Quizzes** (10%)
   - 20 preguntas por módulo
   - Retroalimentación inmediata
   - Refuerzo de conceptos

2. **Proyectos** (30%)
   - Propuestas de solución
   - Análisis crítico
   - Implementación

3. **Prácticas Hands-On** (30%)
   - Laboratorios en Python/TensorFlow
   - Proyectos de código
   - Implementación de algoritmos

4. **Examen Final** (30%)
   - Evaluación integral
   - 120 minutos
   - Preguntas de análisis y aplicación

### Rúbricas de Evaluación

#### Comprensión Conceptual (25%)
- Excelente (95): Profunda comprensión de todos los conceptos
- Bueno (80): Comprensión clara de conceptos principales
- Aceptable (65): Comprensión parcial
- Deficiente (40): Comprensión limitada

#### Análisis Crítico (25%)
- Excelente (95): Análisis profundo y perspicaz
- Bueno (80): Análisis adecuado
- Aceptable (65): Análisis básico
- Deficiente (40): Poco análisis

#### Calidad de Solución (30%)
- Excelente (95): Innovadora, completa y bien fundamentada
- Bueno (80): Sólida y bien implementada
- Aceptable (65): Adecuada pero con limitaciones
- Deficiente (40): Incompleta o mal implementada

#### Presentación (20%)
- Excelente (95): Clara, organizada y profesional
- Bueno (80): Clara y bien estructurada
- Aceptable (65): Aceptable con algunos problemas
- Deficiente (40): Desorganizada

---

## Calificación de proyectos (real)

1. **Por rúbrica.** Cada asignatura + TFM tiene una rúbrica publicada (tablas
   `rubrics` / `rubric_criteria` / `rubric_levels`, sembradas desde
   `backend/db/seed-data/rubrics.js`). El estudiante la ve **antes** de entregar.
2. **La califica un instructor.** `PUT /api/submissions/:id/grade` recibe el
   nivel elegido por criterio; el servidor calcula la nota y guarda el snapshot
   en `grades.rubric`. La nota final la fija siempre una persona.
3. **Asistencia opcional de IA (humano en el bucle).** `POST
   /api/submissions/:id/grade-suggestion` (solo con `LLM_PROVIDER=anthropic`)
   devuelve una **propuesta** por criterio que se escribe en
   `grades.llm_suggestion` y nunca en `grades.score`. El instructor confirma o
   corrige antes de enviar. Sin API key, el botón no aparece.
4. **Certificado desacoplado.** `evaluateCourseCompletion` exige lecciones
   completas + proyecto ≥ 70 + examen aprobado. Ver `certificates.kind`
   (`asignatura` | `tramo` | `programa`) y `certificates.requirements`.

---

## 💻 Implementación Técnica

### Backend (Node.js)

- `backend/simple-server.js` — API completa (http nativo + `pg`). Único servicio desplegado.
- `backend/db/seed.js` — siembra **no destructiva** por clave estable (`stable_key`).
- `backend/db/seed-data/*` — contenido: `master-{i..xi}-lecciones.js`, `proyectos-practicos.js`,
  `template.json`, `books.json`, `rubrics.js`, `item-banks/`.
- `backend/lib/llm.js` — único punto de integración con el LLM (tutor, asistencia de nota).
- El árbol `backend/src/**` (NestJS) y `backend/ai-grader.js` son código muerto.

**Endpoints reales de evaluación:**
- `GET /api/quizzes/:id` — enunciados y opciones, **sin** respuesta correcta
- `POST /api/quiz-responses` — calificación de examen 100% en servidor (Fase 1: motor de intentos)
- `GET /api/rubrics/:slug` — rúbrica completa (criterios × niveles)
- `PUT /api/submissions/:id/grade` — nota por rúbrica (instructor)
- `POST /api/submissions/:id/grade-suggestion` — propuesta de IA (opcional; 501 si `LLM_PROVIDER=none`)

### Mobile (React Native / Expo)

Estado real: **solo Login + Dashboard**. Las pantallas de curso/recurso/entrega
aún no existen; el consumo del Máster es por web (responsive).

---

## 📊 Estado de la transformación (auditoría → 5/5)

Basado en `Auditoria_Master_IEP_Comite_Multidisciplinario.docx` (2,7/5 — requiere transformación).

**Fase 0 (hecha):** fin de la fuga de respuestas del examen; seed no destructivo;
certificado desacoplado de un solo examen; docs corregidas; examen suspenso ya no
acredita progreso.

**Fase 1 (en curso):** motor de intentos de examen con límite + cooldown + banco
de ítems aleatorizado; 12 rúbricas publicadas; recursos reales en las 66 lecciones;
quiz formativo persistente; completado real de lección. **Nota (auditoría 2026-09-08):** el
IEP no publica clave de catálogo por asignatura — el campo antes llamado `officialCode`
(valores `2702799…`) era ruido de conversión del `.docx`; ahora las 12 asignaturas llevan
`internalCode = IEP-<numeral>-INTERNO` y se expone además `ects` (6 por asignatura, 8 el TFM;
dato oficial de iep.edu.es). Identificador oficial verificable a nivel programa: RVOE SEP
México nº 20250986.

**Fases 2–4 (planificadas):** tracks hands-on (III/VI/IX/X), TFM con hitos y
director, foro y revisión por pares, analítica de dificultad, navegación móvil,
tutor socrático y asistencia de nota por LLM.

---

## 🚀 Cómo Usar

### Para Estudiantes

1. **Registrarse** y seleccionar "Master de IEP"
2. **Navegar** por módulos y recursos
3. **Completar** lecturas, videos y ejercicios
4. **Enviar** entregas y proyectos
5. **Recibir** calificación automática y feedback

### Para Instructores

1. **Crear** preguntas de quiz
2. **Configurar** rúbricas personalizadas
3. **Revisar** análisis automático de entregas
4. **Proporcionar** feedback adicional si es necesario
5. **Trackear** progreso de estudiantes

---

## 📈 Datos

| Métrica | Valor |
|---------|-------|
| Total de cursos | 3+ (Master completo) |
| Módulos por asignatura | 6 |
| Recursos integrados | 20+ por módulo |
| Componentes web | 25+ |
| Endpoints API | 25+ |
| Líneas de código | 7,000+ |

---

## 🎓 Certificación

Al completar el Master, los estudiantes reciben:
- ✅ Certificado digital de la plataforma
- ✅ Transcripción académica
- ✅ Badge de competencia
- ✅ Portafolio de proyectos

---

## 📱 Disponibilidad

- **Web:** https://campus-posgrado-v2.vercel.app
- **Backend API:** https://campus-posgrado-v2-api.railway.app/api
- **Mobile:** Disponible en Expo Go (iOS/Android)

---

**Proyecto completado: Campus Posgrado v2.0 + Master de IEP Integrado**  
**Estado: Production Ready**  
**Última actualización: Septiembre 2026**

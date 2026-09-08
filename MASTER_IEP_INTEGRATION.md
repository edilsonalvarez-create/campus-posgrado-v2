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

## 📚 Máster IEP — Estructura real

Fuente: documento oficial del IEP + `iep.edu.es`. 11 asignaturas + TFM = **74 ECTS**
(11 × 6 + TFM 8), en 3 certificados por tramo. Cada asignatura = un curso propio
(`meta.programSlug = 'master-iep'`), con 6 lecciones (una por "Contenido oficial")
+ examen + proyecto. Gate lineal: cada asignatura se desbloquea al completar la anterior.

### PRO-essentials — Certificado en Innovación y Tecnologías Disruptivas
| # | Asignatura | slug |
|---|---|---|
| I | Artificial Intelligence | `master-i` |
| II | Innovación tecnológica: Principales Tecnologías Disruptivas | `master-ii` |
| III | Big Data Dentro de la informática | `master-iii` |

### PROadvance — Certificado en Tecnologías Disruptivas e IA Avanzada
| # | Asignatura | slug |
|---|---|---|
| IV | Metodologías Ágiles para gestión de proyectos | `master-iv` |
| V | Ética y regulaciones en el Uso de la IA | `master-v` |
| VI | Machine Learning | `master-vi` |
| VII | Prompts Multimodales y Adaptación a Contextos Complejos | `master-vii` |
| VIII | Metodologías para el desarrollo de productos tecnológicos innovadores | `master-viii` |
| IX | Uso e Implementación de Modelos de IA Generativa en la Industria 4.0 | `master-ix` |

### PROexpertify — Certificado en Cloud Computing e IA para entornos seguros
| # | Asignatura | slug |
|---|---|---|
| X | AI Platforms | `master-x` |
| XI | Principios de IA aplicada a entornos seguros | `master-xi` |

### TFM
| — | Proyecto Fin de Programa / Trabajo Fin de Máster (8 ECTS) | `master-tfm` |

> El "Módulo puente MLOps" (`modulo-puente-mlops`) es una adición propia del
> legado, **no** forma parte del pensum oficial; se sirve como curso bonus aparte.

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

### Componentes de calificación (real)

Por asignatura (I–XI):

1. **Quiz formativo de lección** — 3 preguntas por lección, se guardan y cuentan
   para el completado de la lección. No puntúa la nota final.
2. **Examen de asignatura** — motor de intentos: banco de ítems de aplicación,
   sorteo de ~15 por intento, 3 intentos + cooldown de 24 h, umbral 70 %,
   calificación 100 % en servidor.
3. **Proyecto práctico** — calificado por rúbrica (ver abajo), umbral 70 %.
   III/VI/IX/X entregan además una práctica computacional (repo/notebook).

**Certificado de asignatura** = lecciones completas **+** proyecto ≥ 70 **+**
examen aprobado (`evaluateCourseCompletion`).

**TFM** — 4 hitos (10/20/30/40 %), rúbrica por hito, subida de artefactos +
vídeo de defensa, flujo de director (`director_tfm`).

### Rúbricas de evaluación

20 rúbricas publicadas en `backend/db/seed-data/rubrics.js`, sembradas en
`rubrics` / `rubric_criteria` / `rubric_levels`:

- 12 de asignatura (`rubric-master-{i..xi,tfm}`) — 4 criterios × 4 niveles
  (`Insuficiente` / `En desarrollo` / `Competente` / `Ejemplar`), umbral 70.
- 4 hands-on (`rubric-handson-master-{iii,vi,ix,x}`).
- 4 de hito de TFM (`rubric-tfm-{propuesta,estado-arte,revision-intermedia,final}`).

El estudiante ve la rúbrica **antes** de entregar (`GET /api/rubrics/:slug`).
La nota la fija siempre un instructor por criterio; el LLM solo **propone**
(`/grade-suggestion`, opcional, humano en el bucle).

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

**Fases 0–4: implementadas y en `main`** (commit `860cd00`). Migraciones 002–015,
seed no destructivo. Cubierto por `backend/scripts/smoke.mjs` (15 comprobaciones).

- **Fase 0:** fin de la fuga de respuestas del examen; seed no destructivo;
  certificado desacoplado de un solo examen; examen suspenso ya no acredita progreso.
- **Fase 1:** motor de intentos de examen (límite + cooldown + banco aleatorizado,
  330 ítems); 20 rúbricas publicadas; recursos en las 66 lecciones; quiz formativo
  persistente; completado real de lección.
- **Fase 2:** tracks hands-on III/VI/IX/X; TFM con 4 hitos + director; entregable
  de la Asig. V como anexo SGSI ISO 27001; lectura guiada.
- **Fase 3:** foro + revisión por pares; analítica de dificultad; navegación móvil;
  renderer Markdown/diagramas/vídeo.
- **Fase 4:** tutor socrático por lección (con guardarraíl anti-examen) + asistencia
  de nota por LLM (propone, no decide).

> **Pendiente de despliegue:** al 2026-09-08 producción aún corre el build
> pre-transformación (ver auditoría de seguimiento). El cierre requiere desplegar
> `main` a Railway + `AUTO_SEED=sync` + configurar el LLM + re-verificar en vivo.

**Nota sobre identificadores (auditoría 2026-09-08):** el IEP no publica clave de
catálogo por asignatura. El campo antes llamado `officialCode` (valores `2702799…`)
era ruido de conversión del `.docx` (coordenadas de líneas decorativas). Ahora las
12 asignaturas llevan `internalCode = IEP-<numeral>-INTERNO` (override por entorno
`OFFICIAL_CODE_<numeral>`) y se expone `ects` (6 por asignatura, 8 el TFM; dato
oficial de iep.edu.es). Identificador oficial a nivel programa: RVOE SEP México nº 20250986.

---

## 🚀 Cómo Usar

### Para Estudiantes

1. **Registrarse** y abrir "Máster en IA y Tecnologías Disruptivas".
2. Recorrer cada lección: contenido → quiz formativo (se guarda) → actividad.
3. Completar la lección = actividad entregada **+** quiz formativo aprobado.
4. Hacer el **examen de asignatura** (3 intentos, cooldown 24 h) y entregar el
   **proyecto** (se ve la rúbrica antes).
5. El **certificado de asignatura** se emite al cumplir lecciones + proyecto ≥ 70
   + examen aprobado. La nota del proyecto la pone un instructor por rúbrica.

### Para Instructores

1. Revisar entregas y calificar el **proyecto por rúbrica** (nivel por criterio;
   comentario obligatorio por debajo del nivel máximo).
2. Opcional: pedir una **propuesta de nota al LLM** (`/grade-suggestion`) y
   confirmarla o corregirla — el LLM nunca fija la nota.
3. Ver el **panel de analítica** (dificultad por recurso, dominio por concepto).
4. Moderar el **foro** por asignatura y la **revisión por pares**.
5. Aprobar los **hitos del TFM** (rol `director_tfm` / instructor).

---

## 📈 Datos (aprox.)

| Métrica | Valor |
|---------|-------|
| Asignaturas del Máster | 11 + TFM (74 ECTS: 11 × 6 + 8) |
| Lecciones propias | 66 (6 por asignatura) |
| Ítems de examen | 330 (banco de 30 por asignatura) |
| Rúbricas | 20 (12 asignatura + 4 hands-on + 4 hitos TFM) |
| Migraciones | 15 (`001`–`015`, aditivas) |
| Servicio backend | `backend/simple-server.js` (http nativo + `pg`) |

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
- **Backend API:** https://campus-posgrado-v2-production.up.railway.app/api
- **Mobile:** app Expo con **solo Login + Dashboard** (el consumo del Máster es web)

---

**Campus Posgrado v2 + Máster IEP** — transformación Fases 0–4 en `main`,
pendiente de despliegue a producción (2026-09-08).

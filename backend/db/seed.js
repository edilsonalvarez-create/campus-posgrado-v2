// Seed del catálogo completo desde backend/db/seed-data/*.json
// (generado por scripts/extract-legacy-content.mjs a partir del artefacto legado
//  campus-posgrado.html + native-curriculum.js).
//
// Las 11 asignaturas oficiales del Máster + TFM se siembran como cursos propios
// (kind='program', meta.programSlug='master-iep'), con título y agrupación por
// tramo tomados del documento oficial del programa (fuente de verdad); el
// contenido/recursos curados de cada una vienen del artefacto legado (TEMPLATE).
//
// Idempotente y NO destructivo: hace upsert del catálogo por clave estable
//   courses   -> slug
//   modules   -> (course_id, stable_key)   [stable_key = 'm' + posición]
//   resources -> (module_id, stable_key)   [stable_key = 'r' + posición]
// Nunca borra filas: los UUID de courses/resources se conservan, así que el
// progreso, las entregas, las notas y los certificados de los estudiantes
// siguen siendo válidos tras cada sincronización. Los datos de demostración
// (matrículas y progreso del usuario de prueba) solo se siembran con
// SEED_DEMO_DATA=true.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('./pool');

const DATA = path.join(__dirname, 'seed-data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// Proyecto práctico por asignatura (retroalimentación de una alumna: el plan
// debe ser más práctico que teórico). Misma forma {deliverable,practice,mastery}
// que ya usa el TFM, reutilizando sin cambios su mecanismo de entrega/calificación.
const PROYECTOS_PRACTICOS = require(path.join(DATA, 'proyectos-practicos.js'));

// Rúbricas (Fase 1). Array de { slug, title, scope, passThreshold, totalPoints?, criteria: [...] }.
function tryRequire(rel) {
  try {
    return require(path.join(DATA, rel));
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') console.warn(`[seed] ${rel}:`, err.message);
    return null;
  }
}
const RUBRICS = tryRequire('rubrics.js') || [];
// Bancos de ítems por asignatura: item-banks/master-{i..xi}.js -> { slug, title, scopeSlug, questions:[...] }
function loadItemBanks() {
  const banks = [];
  for (const n of ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi']) {
    const b = tryRequire(`item-banks/master-${n}.js`);
    if (b && Array.isArray(b.questions) && b.questions.length) banks.push(b);
  }
  return banks;
}
const ITEM_BANKS = loadItemBanks();
const REVISIONS = tryRequire('revisions.json') || {};

// Tracks hands-on (Fase 2): sustituyen el entregable de las asignaturas técnicas
// por una práctica computacional real. handson/master-{iii,vi,ix,x}.js
const HANDSON = {};
for (const n of ['iii', 'vi', 'ix', 'x']) {
  const h = tryRequire(`handson/master-${n}.js`);
  if (h) HANDSON[h.scopeSlug] = h;
}
const TFM_SPEC = tryRequire('tfm.js');

// Lectura guiada por asignatura (WS-7): lectura-guiada/master-<slug>.js exporta
// un objeto { <contenidoOficial>: LecturaGuiadaData }. Se inyecta en la lección
// correspondiente si esta no trae ya su propio `lecturaGuiada`.
function loadLecturaGuiada(slug) {
  return tryRequire(`lectura-guiada/${slug}.js`) || null;
}

// Config de examen por asignatura: apunta al banco de ítems y fija intentos/cooldown.
function examConfigFor(slug) {
  const bank = ITEM_BANKS.find((b) => b.scopeSlug === slug);
  if (!bank) return null;
  const drawSize = Math.min(15, Math.max(10, Math.floor(bank.questions.length / 2)));
  return {
    maxAttempts: 3,
    cooldownHours: Number(process.env.EXAM_COOLDOWN_HOURS) || 24,
    drawSize,
    durationMinutes: 40,
    passThreshold: 70,
    bankSlug: bank.slug,
  };
}
// Rúbrica del proyecto por asignatura (convención de slug).
function projectRubricSlug(slug) {
  const want = `rubric-${slug}`;
  return RUBRICS.some((r) => r.slug === want) ? want : null;
}

// Lecciones propias por asignatura (FASE 3 en adelante): un módulo .js opcional por
// slug, con { lecciones: [...], examen: [...] } siguiendo el modelo estándar de
// lección del plan. Si no existe el archivo, la asignatura sigue solo con su lista
// de recursos curados (comportamiento anterior a la Fase 3).
function tryRequireLecciones(slug) {
  try {
    return require(path.join(DATA, `${slug}-lecciones.js`));
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') console.warn(`[seed] ${slug}-lecciones.js:`, err.message);
    return null;
  }
}
// Tipos de recurso curado (template.json) que se muestran como "video" en la lección;
// el resto (libro, curso, lectura, docs, norma, tool, dataset, cert) como "libro".
function curatedToRecurso(r) {
  const entry = { titulo: r.n, autor: r.s || undefined, canal: r.s || undefined, url: r.u || undefined };
  return r.t === 'video' ? { kind: 'videos', item: { titulo: entry.titulo, canal: entry.canal, url: entry.url } }
                         : { kind: 'libros', item: { titulo: entry.titulo, autor: entry.autor, url: entry.url } };
}

// WS-1: garantiza >=2 recursos reales por lección, repartiendo los recursos
// curados de la asignatura (template.json) entre sus 6 lecciones y respetando
// los `recursos` que la lección ya trae. Fuente de datos: ya existente.
function weaveLessonResources(lecciones, curated) {
  const pool = (curated || []).filter((r) => r.u).map(curatedToRecurso);
  if (!pool.length) return lecciones;
  return lecciones.map((l, idx) => {
    const have = l.recursos || {};
    const libros = [...(have.libros || [])];
    const videos = [...(have.videos || [])];
    const urls = new Set([...libros, ...videos].map((x) => x.url).filter(Boolean));
    // asignación principal round-robin + relleno cíclico hasta >=2
    let k = idx;
    let guard = 0;
    while (libros.length + videos.length < 2 && guard < pool.length * 3) {
      const pick = pool[k % pool.length];
      k += 1;
      guard += 1;
      if (pick.item.url && urls.has(pick.item.url)) continue;
      if (pick.item.url) urls.add(pick.item.url);
      (pick.kind === 'videos' ? videos : libros).push(pick.item);
    }
    // además: reparto directo del recurso idx-ésimo del pool a esta lección
    const direct = pool[idx % pool.length];
    if (direct.item.url && !urls.has(direct.item.url)) {
      urls.add(direct.item.url);
      (direct.kind === 'videos' ? videos : libros).push(direct.item);
    }
    return { ...l, recursos: { libros, videos } };
  });
}

function leccionAResource(l) {
  return {
    title: l.title,
    type: 'lesson',
    content: (l.contenido || []).join('\n\n'),
    content_json: {
      contenidoOficial: l.contenidoOficial,
      objetivo: l.objetivo,
      introduccion: l.introduccion,
      conceptosClave: l.conceptosClave || [],
      body: l.contenido || [],
      example: l.ejemplo ? { title: l.ejemplo.titulo, text: l.ejemplo.texto } : null,
      exercise: l.actividad ? { mins: l.actividad.minutos, text: l.actividad.texto } : null,
      preguntaReflexion: l.preguntaReflexion || null,
      keys: l.resumen || [],
      quiz: l.quiz || [],
      criterioFinalizacion: l.criterioFinalizacion || null,
      diagram: l.diagram || null,
      recursos: l.recursos || null,
      lecturaGuiada: l.lecturaGuiada || null,
    },
  };
}

// Aulas cuyo esqueleto en aulas.json (solo título + duración por lección) se
// reemplaza en tiempo de siembra por un archivo con contenido propio completo,
// siguiendo el mismo patrón que <slug>-lecciones.js para las asignaturas del
// Máster. Cuando se completa una nueva aula, se añade aquí su entrada.
const AULA_CONTENT_FILES = {
  'Ruta de Mando en Seguridad y QA': 'aula-ruta-mando-seguridad-qa.js',
  'Enterprise Design Thinking — Practitioner': 'aula-enterprise-design-thinking.js',
  'Made With ML': 'aula-made-with-ml.js',
  'Cursos cortos: evaluación de LLMs y sistemas de prompts': 'aula-cursos-cortos-llm.js',
  'Kaggle Learn: Intro to ML, Intermediate ML, Feature Engineering': 'aula-kaggle-learn.js',
  'Practical Deep Learning for Coders': 'aula-fastai-practical-dl.js',
  'LLM Course': 'aula-llm-course.js',
  'Machine Learning Specialization': 'aula-machine-learning-specialization.js',
};
function tryRequireAulaContent(name) {
  const file = AULA_CONTENT_FILES[name];
  if (!file) return null;
  try {
    return require(path.join(DATA, file));
  } catch (err) {
    console.warn(`[seed] ${file}:`, err.message);
    return null;
  }
}
// AULAS con los overrides ya aplicados: fuente única usada tanto para sembrar
// las aulas (sección 2) como para decidir a qué recursos curados del Máster se
// les puede enlazar la versión interna (sección 1, aulaHasContent()).
function loadAulasWithOverrides() {
  const raw = read('aulas.json');
  for (const [name, override] of Object.entries(AULA_CONTENT_FILES)) {
    const content = tryRequireAulaContent(name);
    if (content && raw[name]) raw[name] = { ...raw[name], units: content.units };
  }
  return raw;
}

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);

// Algunas aulas en aulas.json solo tienen el esqueleto (título + duración estimada
// por lección, sin body/example/quiz) mientras se termina de escribir su contenido.
// Enlazar un recurso curado a una aula así sería peor que el enlace externo que
// reemplaza: prometería "disponible sin salir de la plataforma" y entregaría
// "Contenido en preparación." en cada lección. Solo se enlaza si al menos una
// lección tiene cuerpo real.
const aulaHasContent = (aula) =>
  (aula.units || []).some((u) => (u.lessons || []).some((l) => Array.isArray(l.body) && l.body.length > 0));

const TYPE_MAP = {
  curso: 'lecture', course: 'lecture', lecture: 'lecture',
  video: 'video',
  libro: 'book', book: 'book',
  lectura: 'reading', reading: 'reading',
  docs: 'docs', doc: 'docs',
  norma: 'norma',
  dataset: 'dataset',
  tool: 'tool',
  cert: 'cert',
  exercise: 'exercise', practice: 'exercise',
  assignment: 'assignment', project: 'assignment',
  quiz: 'exam', exam: 'exam',
};
const mapType = (t) => TYPE_MAP[String(t || '').toLowerCase()] || 'lecture';

function bookMarkdown(b) {
  const parts = [];
  if (b.tesis) parts.push('**Tesis.** ' + b.tesis);
  if (Array.isArray(b.claves) && b.claves.length) {
    parts.push('**Ideas clave**\n' + b.claves.map((k) => '- ' + k).join('\n'));
  }
  if (b.aplicar) parts.push('**Qué aplicar.** ' + b.aplicar);
  if (b.limites) parts.push('**Límites.** ' + b.limites);
  if (b.leer) parts.push('**Cómo leerlo.** ' + b.leer);
  if (b.esNota) parts.push('_' + b.esNota + '_');
  return parts.join('\n\n');
}

const SEED_DEMO_DATA = process.env.SEED_DEMO_DATA === 'true';

async function main() {
  const client = await pool.connect();
  let orphanModules = 0;
  let orphanResources = 0;
  try {
    await client.query('BEGIN');

    // ---- usuarios de servicio (no se resetea la contraseña si ya existen) ----
    const users = [
      ['test@example.com', 'Test User', sha256('Password123'), 'student'],
      ['instructor@example.com', 'Instructor Demo', sha256('Password123'), 'instructor'],
    ];
    for (const [email, name, hash, role] of users) {
      await client.query(
        `INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [email, name, hash, role],
      );
    }
    const instructorId = (
      await client.query(
        `SELECT id FROM users WHERE role IN ('instructor','admin') ORDER BY created_at LIMIT 1`,
      )
    ).rows[0].id;
    const testRow = await client.query(`SELECT id FROM users WHERE email = 'test@example.com'`);
    const testId = testRow.rows[0] ? testRow.rows[0].id : null;

    // ---- catálogo: upsert NO destructivo por clave estable ----
    let courseOrder = 0;
    const bySlug = {};

    async function upsertCourse(c) {
      courseOrder += 1;
      const meta = c.meta || {};
      const { rows } = await client.query(
        `INSERT INTO courses (slug, kind, title, description, image_url, instructor_id, published, source, url, note, meta, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (slug) DO UPDATE SET
           kind = EXCLUDED.kind, title = EXCLUDED.title, description = EXCLUDED.description,
           image_url = EXCLUDED.image_url, instructor_id = EXCLUDED.instructor_id,
           published = EXCLUDED.published, source = EXCLUDED.source, url = EXCLUDED.url,
           note = EXCLUDED.note, meta = EXCLUDED.meta, order_index = EXCLUDED.order_index,
           updated_at = now()
         RETURNING id`,
        [
          c.slug, c.kind, c.title, c.description || '', c.image_url || null,
          instructorId, c.published === false ? false : true, c.source || null,
          c.url || null, c.note || null, JSON.stringify(meta), courseOrder,
        ],
      );
      const id = rows[0].id;
      bySlug[c.slug] = id;
      const seenModules = [];
      let mi = 0;
      for (const m of c.modules || []) {
        mi += 1;
        const mKey = m.stableKey || 'm' + mi;
        seenModules.push(mKey);
        const mres = await client.query(
          `INSERT INTO modules (course_id, title, numeral, subtitle, meta, order_index, stable_key)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (course_id, stable_key) WHERE stable_key IS NOT NULL DO UPDATE SET
             title = EXCLUDED.title, numeral = EXCLUDED.numeral, subtitle = EXCLUDED.subtitle,
             meta = EXCLUDED.meta, order_index = EXCLUDED.order_index
           RETURNING id`,
          [id, m.title, m.numeral || null, m.subtitle || null, JSON.stringify(m.meta || {}), mi, mKey],
        );
        const moduleId = mres.rows[0].id;
        const seenRes = [];
        let ri = 0;
        for (const r of m.resources || []) {
          ri += 1;
          const rKey = r.stableKey || 'r' + ri;
          seenRes.push(rKey);
          await client.query(
            `INSERT INTO resources (module_id, title, type, url, source, note, content, content_json, order_index, stable_key)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (module_id, stable_key) WHERE stable_key IS NOT NULL DO UPDATE SET
               title = EXCLUDED.title, type = EXCLUDED.type, url = EXCLUDED.url,
               source = EXCLUDED.source, note = EXCLUDED.note, content = EXCLUDED.content,
               content_json = EXCLUDED.content_json, order_index = EXCLUDED.order_index`,
            [
              moduleId, r.title, r.type || 'lecture', r.url || null, r.source || null,
              r.note || null, r.content || null,
              r.content_json ? JSON.stringify(r.content_json) : null, ri, rKey,
            ],
          );
        }
        const orphR = await client.query(
          `SELECT count(*)::int AS c FROM resources WHERE module_id = $1 AND NOT (stable_key = ANY($2))`,
          [moduleId, seenRes.length ? seenRes : ['__none__']],
        );
        orphanResources += orphR.rows[0].c;
      }
      const orphM = await client.query(
        `SELECT count(*)::int AS c FROM modules WHERE course_id = $1 AND NOT (stable_key = ANY($2))`,
        [id, seenModules.length ? seenModules : ['__none__']],
      );
      orphanModules += orphM.rows[0].c;
      return id;
    }
    const insertCourse = upsertCourse; // alias retro-compatible dentro de este archivo

    // ---- 1. Máster IEP: 11 asignaturas oficiales + TFM (cada una = un curso propio) ----
    // Fuente de verdad de títulos/tramos: el documento oficial del programa
    // (IEP_Master_Online_..._Industria_4_0_LAT.docx / folleto IEP / iep.edu.es). La
    // estructura (módulos/recursos curados) viene del artefacto legado (TEMPLATE), que ya
    // coincide casi palabra por palabra con el documento; aquí se corrige el título a la
    // forma exacta del documento y se añade la agrupación por tramo/certificado.
    //
    // NOTA sobre identificadores (auditoría 2026-09-08): el documento oficial del IEP NO
    // publica una clave de catálogo por asignatura. Lo único oficial es el RVOE del
    // programa (acuerdo SEP México nº 20250986) y los ECTS por asignatura (6 c/u; TFM 8).
    // Los "officialCode" 2702799xxxxxx que se sembraron antes eran un error: coordenadas
    // de posición (EMU) de las líneas decorativas del .docx, mal extraídas como números.
    // Por eso ahora TODAS las asignaturas llevan una referencia interna consistente
    // `IEP-<numeral>-INTERNO`. Si el IEP facilita las claves reales, se pueden inyectar
    // por entorno (OFFICIAL_CODE_<numeral>) o sustituir aquí.
    const TEMPLATE = read('template.json');
    const byNumeral = Object.fromEntries((TEMPLATE.modules || []).map((m) => [m.numeral, m]));
    // Calculado aquí (antes de sembrar las aulas en la sección 2) para poder enlazar cada
    // recurso curado tipo 'curso' con la aula que ya lo recrea completo en la plataforma.
    // Ya incluye los overrides de contenido propio (AULA_CONTENT_FILES), así que una aula
    // que se completa hoy queda enlazable sin más cambios en esta sección.
    const AULAS_FOR_LINKING = loadAulasWithOverrides();

    // `ects`: dato oficial verificable (iep.edu.es, plan de estudios — 74 ECTS: 11 x 6 + TFM 8).
    // `internalCode` se deriva más abajo como `IEP-<numeral>-INTERNO` (con override opcional
    // por entorno OFFICIAL_CODE_<numeral> si el IEP facilita la clave real de catálogo).
    const MASTER_ASIGNATURAS = [
      { numeral: 'I', slug: 'master-i', title: 'I. Artificial Intelligence', track: 'PRO-essentials', ects: 6,
        contenidos: ['IA y Toma de Decisiones Automatizadas', 'Machine Learning', 'Generative AI', 'Ethics in AI', 'Casos de Uso en Diferentes Sectores', 'Plataformas de Software'] },
      { numeral: 'II', slug: 'master-ii', title: 'II. Innovación tecnológica: Principales Tecnologías Disruptivas', track: 'PRO-essentials', ects: 6,
        contenidos: ['Conceptos fundamentales del Big Data', 'Conceptos fundamentales de la Inteligencia Artificial', 'Conceptos fundamentales del IoT', 'Computación en la nube y su rol en el IoT', 'Conceptos fundamentales de Blockchain', 'El futuro de las tecnologías emergentes'] },
      { numeral: 'III', slug: 'master-iii', title: 'III. Big Data Dentro de la informática', track: 'PRO-essentials', ects: 6,
        contenidos: ['Arquitecturas y Soluciones de Big Data: Análisis, Procesamiento y Escalabilidad', 'Entornos de trabajo para arquitecturas Deep Learning', 'Aprendizaje Automático', 'Regresiones y series temporales autorregresivas', 'Árboles de decisión y Algoritmos', 'Redes neuronales Artificiales'] },
      { numeral: 'IV', slug: 'master-iv', title: 'IV. Metodologías Ágiles para gestión de proyectos', track: 'PROadvance', ects: 6,
        contenidos: ['Principios y fundamentos de la agilidad', 'Comparativa de marcos ágiles (Scrum, Kanban, Lean)', 'Roles y eventos en Scrum', 'Prácticas de planificación y seguimiento en Scrum', 'Ciclos iterativos para la mejora de productos y procesos', 'Evaluación y ajuste continuo en proyectos ágiles'] },
      { numeral: 'V', slug: 'master-v', title: 'V. Ética y regulaciones en el Uso de la IA', track: 'PROadvance', ects: 6,
        contenidos: ['Introducción a la Inteligencia Artificial', 'Regulación jurídica de la IA', 'Consideraciones éticas en el uso de la IA', 'Principales Retos y desafíos en el uso de IA', 'Inteligencia Artificial aplicada para la detección y prevención de riesgos', 'Modelo de Gobernanza de la IA. Big Data, Blockchain y otras tecnologías disruptivas'] },
      { numeral: 'VI', slug: 'master-vi', title: 'VI. Machine Learning', track: 'PROadvance', ects: 6,
        contenidos: ['Introducción a Machine Learning', 'Aprendizaje Supervisado', 'Aprendizaje supervisado de regresión', 'Aprendizaje no supervisado', 'Aprendizaje semi-supervisado y por Refuerzo', 'Interpretabilidad de Modelos'] },
      { numeral: 'VII', slug: 'master-vii', title: 'VII. Prompts Multimodales y Adaptación a Contextos Complejos', track: 'PROadvance', ects: 6,
        contenidos: ['Integración de texto, imagen y sonido', 'Aplicaciones en arte digital y transmedia', 'Desafíos en entornos multimodales', 'Adaptación de Prompts a Diferentes audiencias', 'Creación de Prompts para interfaces inteligentes', 'Evaluación de la usabilidad'] },
      { numeral: 'VIII', slug: 'master-viii', title: 'VIII. Metodologías para el desarrollo de productos tecnológicos innovadores', track: 'PROadvance', ects: 6,
        contenidos: ['Fundamentos de Design Thinking', 'Fases de empatía y definición de problemas', 'Técnicas de ideación para soluciones innovadoras', 'Prototipado rápido y validación inicial', 'Iteración y mejoras continuas del prototipo', 'Pruebas con usuarios y retroalimentación'] },
      { numeral: 'IX', slug: 'master-ix', title: 'IX. Uso e Implementación de Modelos de Inteligencia Artificial Generativa en la Industria 4.0', track: 'PROadvance', ects: 6,
        contenidos: ['Conceptos básicos de IA Generativa', 'Paradigmas de ML en la IA Generativa', 'Redes Neuronales Generativas', 'Modelos Generativos', 'IA Generativa para contenido Multimedia y multimodal', 'Tendencias y dirección futura de la IA Generativa'] },
      { numeral: 'X', slug: 'master-x', title: 'X. AI Platforms', track: 'PROexpertify', ects: 6,
        contenidos: ['Computación en la nube', 'Arquitectura de referencia', 'Principales servicios', 'Amazon Web Services', 'Microsoft Azure', 'Google Cloud'] },
      { numeral: 'XI', slug: 'master-xi', title: 'XI. Principios de Inteligencia Artificial aplicada a entornos seguros', track: 'PROexpertify', ects: 6,
        contenidos: ['Introducción a la Inteligencia Artificial y aprendizaje automático', 'Principios y aplicaciones Big Data en la ciberseguridad', 'Manejo y procesamiento de datos', 'Modelos predictivos en ciberseguridad', 'Introducción a los modelos generativos en Inteligencia Artificial', 'Retos y oportunidades de la Inteligencia Artificial en el contexto de la ciberseguridad'] },
      { numeral: 'TFM', slug: 'master-tfm', title: 'Proyecto Fin de Programa (TFM)', track: 'TFM', ects: 8,
        contenidos: ['Trabajo académico de cierre que aplica competencias generales del programa'] },
    ].map((a) => ({
      ...a,
      // Referencia interna consistente; override opcional con la clave real del IEP vía entorno.
      internalCode: process.env[`OFFICIAL_CODE_${a.numeral}`] || `IEP-${a.numeral}-INTERNO`,
    }));

    let prevSlug = null;
    for (const [i, asig] of MASTER_ASIGNATURAS.entries()) {
      const tm = byNumeral[asig.numeral] || {};
      const propias = tryRequireLecciones(asig.slug);
      const modules = [];
      if (propias && Array.isArray(propias.lecciones) && propias.lecciones.length) {
        let woven = weaveLessonResources(propias.lecciones, tm.resources);
        const lg = loadLecturaGuiada(asig.slug);
        if (lg) {
          woven = woven.map((l) => (l.lecturaGuiada || !lg[l.contenidoOficial] ? l : { ...l, lecturaGuiada: lg[l.contenidoOficial] }));
        }
        const resources = woven.map(leccionAResource);
        const examCfg = examConfigFor(asig.slug);
        if (examCfg || (Array.isArray(propias.examen) && propias.examen.length)) {
          resources.push({
            title: 'Examen de la asignatura',
            type: 'exam',
            content_json: {
              // Las preguntas legadas se conservan como respaldo, pero el motor de
              // intentos usa el banco de ítems si hay examConfig.bankSlug.
              questions: Array.isArray(propias.examen) ? propias.examen : [],
              examConfig: examCfg || undefined,
            },
          });
        }
        modules.push({
          title: 'Lecciones',
          subtitle: 'Una lección por cada Contenido oficial de la asignatura',
          resources,
        });
      }
      const proyecto = asig.slug === 'master-tfm' ? tm : PROYECTOS_PRACTICOS[asig.slug];
      if (proyecto) {
        const hs = HANDSON[asig.slug]; // track hands-on (III/VI/IX/X)
        modules.push({
          title: asig.slug === 'master-tfm' ? 'Entrega del TFM' : hs ? 'Práctica computacional' : 'Proyecto práctico',
          subtitle: hs
            ? 'Práctica hands-on alineada a la ruta oficial. Entrega repositorio/notebook + artefactos.'
            : 'Sube tu entrega para evaluación del instructor',
          resources: [{
            title:
              asig.slug === 'master-tfm'
                ? 'Entrega: Proyecto Fin de Programa'
                : hs
                  ? `Entrega: ${hs.title}`
                  : 'Entrega: proyecto práctico de la asignatura',
            type: 'project',
            content_json: {
              contenidos: asig.contenidos,
              deliverable: (hs && hs.deliverable) || proyecto.deliverable || null,
              practice: proyecto.practice || null,
              mastery: proyecto.mastery || null,
              rubricSlug: hs ? hs.rubricSlug : projectRubricSlug(asig.slug),
              track: hs ? 'handson' : undefined,
              handson: hs
                ? {
                    referencePractice: hs.referencePractice,
                    requiredArtifacts: hs.requiredArtifacts || [],
                    notebookTemplateUrl: hs.notebookTemplateUrl || null,
                  }
                : undefined,
            },
          }],
        });
      }
      modules.push({
        title: 'Recursos de la asignatura',
        subtitle: 'Lecturas, cursos y videos curados para esta asignatura',
        resources: (tm.resources || []).map((r) => {
          // Si el recurso es un curso externo y ese mismo curso ya está recreado
          // completo como aula (mismo nombre exacto), se enlaza a la versión interna
          // en vez de mandar al estudiante fuera de la plataforma.
          const aula = r.t === 'curso' ? AULAS_FOR_LINKING[r.n] : null;
          const isAula = aula && aulaHasContent(aula);
          return {
            title: r.n,
            type: mapType(r.t),
            url: r.u || null,
            source: r.s || null,
            note: r.m || null,
            content: r.r || null,
            content_json: isAula ? { internalCourseSlug: 'aula-' + slugify(r.n) } : null,
          };
        }),
      });
      await insertCourse({
        slug: asig.slug,
        kind: 'program',
        title: asig.title,
        description: tm.objective || '',
        meta: {
          programSlug: 'master-iep',
          track: asig.track,
          programOrder: i + 1,
          prerequisiteSlug: prevSlug,
          // Referencia interna (el IEP no publica clave de catálogo por asignatura).
          // `officialCode` se mantiene por compatibilidad y ahora es igual a `internalCode`.
          internalCode: asig.internalCode,
          officialCode: asig.internalCode,
          ects: asig.ects,
          contenidos: asig.contenidos,
          legacyTitle: tm.title || null,
          practice: tm.practice || null, deliverable: tm.deliverable || null, mastery: tm.mastery || null,
          hours: tm.hours || null, weeks: tm.weeks || null,
        },
        modules,
      });
      prevSlug = asig.slug;
    }

    // ---- 1b. Módulo puente (adición propia del legado, NO parte del programa oficial) ----
    const puente = byNumeral['+'];
    if (puente) {
      await insertCourse({
        slug: 'modulo-puente-mlops',
        kind: 'program',
        title: puente.title,
        description: (puente.objective || '') + ' — Adición propia del campus, no forma parte del pensum oficial del Máster.',
        meta: { legacyTitle: puente.title, bonus: true },
        modules: [
          {
            title: 'Recursos',
            resources: (puente.resources || []).map((r) => ({
              title: r.n, type: mapType(r.t), url: r.u || null, source: r.s || null, note: r.m || null, content: r.r || null,
            })),
          },
        ],
      });
    }

    // ---- 2. Aulas (AULAS) ----
    // Reusa AULAS_FOR_LINKING (misma fuente, overrides de contenido ya aplicados) en
    // vez de releer aulas.json, para que siembra y enlazado nunca puedan divergir.
    const AULAS = AULAS_FOR_LINKING;
    for (const [name, aula] of Object.entries(AULAS)) {
      await insertCourse({
        slug: 'aula-' + slugify(name),
        kind: 'aula',
        title: name,
        description: aula.note || aula.source || '',
        source: aula.source || null,
        url: aula.url || null,
        note: aula.note || null,
        modules: (aula.units || []).map((u) => {
          const lessons = (u.lessons || []).map((l) => ({
            title: l.title,
            type: 'lesson',
            content: (l.body || []).join('\n\n') || null,
            content_json: {
              mins: l.mins, body: l.body || [], example: l.example || null,
              keys: l.keys || [], exercise: l.exercise || null, quiz: l.quiz || [],
              diagram: l.diagram || null, recursos: l.recursos || null,
              lecturaGuiada: l.lecturaGuiada || null,
            },
          }));
          if (Array.isArray(u.exam) && u.exam.length) {
            lessons.push({
              title: 'Examen de unidad',
              type: 'exam',
              content_json: { questions: u.exam },
            });
          }
          return {
            title: u.title ? `${u.n} · ${u.title}` : u.n,
            subtitle: u.title || null,
            meta: { hours: u.hours || null, hasExam: Array.isArray(u.exam) && u.exam.length > 0 },
            resources: lessons,
          };
        }),
      });
    }

    // ---- 3. Biblioteca (BOOKS) ----
    const BOOKS = read('books.json');
    await insertCourse({
      slug: 'biblioteca-master',
      kind: 'library',
      title: 'Biblioteca del Máster',
      description: 'Fichas de lectura en español: tesis, ideas clave, qué aplicar, límites y cómo leer cada obra.',
      modules: [
        {
          title: 'Fichas de lectura',
          resources: Object.entries(BOOKS).map(([title, b]) => ({
            title,
            type: 'reading',
            url: b.libre || null,
            content: bookMarkdown(b),
            content_json: b,
          })),
        },
      ],
    });

    // ---- 4. Cursos nativos (native-curriculum.js) ----
    const NATIVE = read('native-curriculum.json');
    for (const nc of Object.values(NATIVE)) {
      await insertCourse({
        slug: nc.id,
        kind: 'native',
        title: nc.title,
        description: `Curso nativo de excelencia académica. Equivalente a ${nc.equivalentTo}.`,
        meta: {
          equivalentTo: nc.equivalentTo, credits: nc.credits,
          duration: nc.duration, level: nc.level,
          learningOutcomes: nc.learningOutcomes || [],
        },
        modules: (nc.modules || []).map((mod) => {
          const subs = mod.subtopics || [];
          const resources = subs.length
            ? subs.map((st) => ({
                title: st.name,
                type: 'lesson',
                content: st.content || null,
                content_json: {
                  concepts: st.concepts || [], duration: st.duration || null,
                  exercises: st.exercises || [], assessments: st.assessments || [],
                  practicalProject: st.practicalProject || null,
                },
              }))
            : mod.content
              ? [{ title: mod.title, type: 'lesson', content: mod.content, content_json: {} }]
              : [];
          return {
            title: `Semana ${mod.week}: ${mod.title}`,
            subtitle: mod.title,
            resources,
          };
        }),
      });
    }

    // ---- 5. Rúbricas (upsert por slug) ----
    for (const rub of RUBRICS) {
      const totalPoints =
        rub.totalPoints ||
        (rub.criteria || []).reduce(
          (n, c) => n + Math.max(0, ...(c.levels || []).map((l) => l.points)),
          0,
        ) ||
        100;
      const rr = await client.query(
        `INSERT INTO rubrics (slug, title, scope, pass_threshold, total_points, meta)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, scope = EXCLUDED.scope,
           pass_threshold = EXCLUDED.pass_threshold, total_points = EXCLUDED.total_points,
           meta = EXCLUDED.meta, updated_at = now()
         RETURNING id`,
        [rub.slug, rub.title, rub.scope || 'asignatura', rub.passThreshold || 70, totalPoints, JSON.stringify(rub.meta || {})],
      );
      const rubId = rr.rows[0].id;
      let ci = 0;
      for (const c of rub.criteria || []) {
        ci += 1;
        const cr = await client.query(
          `INSERT INTO rubric_criteria (rubric_id, order_index, key, title, description, weight)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (rubric_id, key) DO UPDATE SET order_index = EXCLUDED.order_index,
             title = EXCLUDED.title, description = EXCLUDED.description, weight = EXCLUDED.weight
           RETURNING id`,
          [rubId, ci, c.key, c.title, c.description || '', Math.max(0, ...(c.levels || []).map((l) => l.points))],
        );
        const critId = cr.rows[0].id;
        await client.query('DELETE FROM rubric_levels WHERE criterion_id = $1', [critId]);
        let li = 0;
        for (const l of c.levels || []) {
          li += 1;
          await client.query(
            `INSERT INTO rubric_levels (criterion_id, order_index, label, points, descriptor)
             VALUES ($1, $2, $3, $4, $5)`,
            [critId, li, l.label, l.points, l.descriptor || ''],
          );
        }
      }
    }

    // ---- 6. Bancos de ítems (upsert por slug + ext_key) ----
    for (const bank of ITEM_BANKS) {
      const br = await client.query(
        `INSERT INTO item_banks (slug, title, scope_slug) VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, scope_slug = EXCLUDED.scope_slug, updated_at = now()
         RETURNING id`,
        [bank.slug, bank.title, bank.scopeSlug],
      );
      const bankId = br.rows[0].id;
      for (const q of bank.questions || []) {
        await client.query(
          `INSERT INTO item_bank_questions
             (bank_id, ext_key, stem, options, correct_index, explanations, difficulty, skill_tag, cognitive, source, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
           ON CONFLICT (bank_id, ext_key) DO UPDATE SET
             stem = EXCLUDED.stem, options = EXCLUDED.options, correct_index = EXCLUDED.correct_index,
             explanations = EXCLUDED.explanations, difficulty = EXCLUDED.difficulty, skill_tag = EXCLUDED.skill_tag,
             cognitive = EXCLUDED.cognitive, source = EXCLUDED.source, active = true`,
          [
            bankId, q.extKey, q.stem, JSON.stringify(q.options), q.correctIndex,
            JSON.stringify(q.explanations || []), q.difficulty || 'media', q.skillTag || null,
            q.cognitive || 'aplicacion', q.source || 'authored',
          ],
        );
      }
    }

    // ---- 6b. Hitos del TFM (Fase 2) ----
    if (TFM_SPEC && Array.isArray(TFM_SPEC.milestones)) {
      for (const ms of TFM_SPEC.milestones) {
        await client.query(
          `INSERT INTO tfm_milestones (slug, order_index, title, description, rubric_slug, weight, requires_video, template_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (slug) DO UPDATE SET
             order_index = EXCLUDED.order_index, title = EXCLUDED.title, description = EXCLUDED.description,
             rubric_slug = EXCLUDED.rubric_slug, weight = EXCLUDED.weight,
             requires_video = EXCLUDED.requires_video, template_url = EXCLUDED.template_url`,
          [ms.slug, ms.orderIndex, ms.title, ms.description || '', ms.rubricSlug, ms.weight, !!ms.requiresVideo, ms.templateUrl || null],
        );
      }
    }

    // ---- 7. Fechas de revisión de contenido ----
    for (const [slug, entries] of Object.entries(REVISIONS)) {
      const cid = bySlug[slug];
      if (!cid) continue;
      for (const e of entries) {
        await client.query(
          `UPDATE resources SET revised_at = $3, revision_note = $4
             FROM modules m
            WHERE resources.module_id = m.id AND m.course_id = $1
              AND resources.content_json->>'contenidoOficial' = $2`,
          [cid, e.contenidoOficial, e.revisedAt, e.note || null],
        );
      }
    }

    // ---- datos de demostración (solo con SEED_DEMO_DATA=true) ----
    // Matrícula automática + progreso inicial del usuario de prueba. En producción
    // los estudiantes reales se matriculan por su cuenta (POST /api/enrollments);
    // no se auto-matricula ninguna cuenta demo ni se toca el progreso de nadie.
    if (SEED_DEMO_DATA && testId) {
      const enrollSlugs = [
        ...MASTER_ASIGNATURAS.map((a) => a.slug),
        'biblioteca-master',
        'aula-ai-for-everyone',
        'aula-elements-of-ai',
        'native-ai-101',
      ];
      for (const slug of enrollSlugs) {
        const courseId = bySlug[slug];
        if (!courseId) continue;
        await client.query(
          `INSERT INTO enrollments (user_id, course_id, role) VALUES ($1, $2, 'student')
           ON CONFLICT (user_id, course_id) DO NOTHING`,
          [testId, courseId],
        );
        await client.query(
          `INSERT INTO enrollments (user_id, course_id, role) VALUES ($1, $2, 'instructor')
           ON CONFLICT (user_id, course_id) DO NOTHING`,
          [instructorId, courseId],
        );
      }

      const aiForEveryone = bySlug['aula-ai-for-everyone'];
      if (aiForEveryone) {
        const { rows } = await client.query(
          `SELECT r.id FROM resources r
           JOIN modules m ON m.id = r.module_id
           WHERE m.course_id = $1 AND r.type = 'lesson'
           ORDER BY m.order_index, r.order_index
           LIMIT 3`,
          [aiForEveryone],
        );
        for (const r of rows) {
          await client.query(
            `INSERT INTO progress (user_id, resource_id, completed) VALUES ($1, $2, true)
             ON CONFLICT (user_id, resource_id) DO NOTHING`,
            [testId, r.id],
          );
        }
      }

      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         SELECT $1, 'course', 'Bienvenido al Campus', 'Tu catálogo está listo: programa, aulas, biblioteca, Máster IEP y cursos nativos.'
         WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = $1 AND title = 'Bienvenido al Campus')`,
        [testId],
      );
    }

    // ---- 8. Hilos ancla del foro (Fase 3): el foro no arranca vacío ----
    const instructorForAnchor = instructorId;
    for (const asig of MASTER_ASIGNATURAS) {
      const cid = bySlug[asig.slug];
      if (!cid) continue;
      const anchors = [
        {
          title: 'Errores más comunes en el proyecto de esta asignatura',
          body:
            'Hilo de referencia. El fallo que más se repite en las entregas de esta asignatura es no cubrir el "apartado que casi todo el mundo se salta" descrito en el criterio de dominio del proyecto. Antes de entregar, revisa que tu trabajo lo aborde de forma explícita. Comenta aquí tus dudas sobre ese punto.',
        },
        {
          title: 'Dudas frecuentes y elección del caso de práctica',
          body:
            'Usa este hilo para preguntar sobre el enunciado del proyecto, la elección entre las opciones de práctica, o cómo adaptar el caso de referencia a tu contexto. La opción 1 (un caso real de tu organización) suele dar el mejor aprendizaje.',
        },
      ];
      for (const a of anchors) {
        await client.query(
          `INSERT INTO forum_threads (course_id, author_id, title, body, pinned, anchor)
           SELECT $1, $2, $3, $4, true, true
           WHERE NOT EXISTS (SELECT 1 FROM forum_threads WHERE course_id = $1 AND title = $3)`,
          [cid, instructorForAnchor, a.title, a.body],
        );
      }
    }

    if (orphanModules || orphanResources) {
      console.warn(
        `[seed] AVISO: ${orphanModules} módulo(s) y ${orphanResources} recurso(s) en la BD ya no están en seed-data ` +
          `(contenido retirado o reordenado). No se eliminan; revísalos manualmente si procede.`,
      );
    }

    await client.query('COMMIT');

    const counts = await client.query(`
      SELECT
        (SELECT count(*) FROM courses) AS courses,
        (SELECT count(*) FROM modules) AS modules,
        (SELECT count(*) FROM resources) AS resources,
        (SELECT count(*) FROM resources WHERE type = 'lesson') AS lessons,
        (SELECT count(*) FROM resources WHERE type = 'exam') AS exams,
        (SELECT count(*) FROM enrollments) AS enrollments
    `);
    console.log('[seed] listo:', counts.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  main()
    .then(() => pool.end())
    .catch((err) => {
      console.error('[seed] error:', err);
      process.exit(1);
    });
}

module.exports = main;

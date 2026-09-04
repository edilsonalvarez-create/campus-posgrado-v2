// Seed del catálogo completo desde backend/db/seed-data/*.json
// (generado por scripts/extract-legacy-content.mjs a partir del artefacto legado
//  campus-posgrado.html + native-curriculum.js).
//
// Las 11 asignaturas oficiales del Máster + TFM se siembran como cursos propios
// (kind='program', meta.programSlug='master-iep'), con título y agrupación por
// tramo tomados del documento oficial del programa (fuente de verdad); el
// contenido/recursos curados de cada una vienen del artefacto legado (TEMPLATE).
//
// Idempotente: TRUNCATE del catálogo y re-inserción. Los usuarios se conservan
// (upsert). El progreso del usuario se re-siembra en un estado inicial realista.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('./pool');

const DATA = path.join(__dirname, 'seed-data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

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
    },
  };
}

// Aulas cuyo esqueleto en aulas.json (solo título + duración por lección) se
// reemplaza en tiempo de siembra por un archivo con contenido propio completo,
// siguiendo el mismo patrón que <slug>-lecciones.js para las asignaturas del
// Máster. Cuando se completa una nueva aula, se añade aquí su entrada.
const AULA_CONTENT_FILES = {
  'Enterprise Design Thinking — Practitioner': 'aula-enterprise-design-thinking.js',
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

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ---- usuarios (upsert) ----
    const users = [
      ['test@example.com', 'Test User', sha256('Password123'), 'student'],
      ['instructor@example.com', 'Instructor Demo', sha256('Password123'), 'instructor'],
    ];
    for (const [email, name, hash, role] of users) {
      await client.query(
        `INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
        [email, name, hash, role],
      );
    }
    const instructorId = (
      await client.query(`SELECT id FROM users WHERE email = 'instructor@example.com'`)
    ).rows[0].id;
    const testId = (
      await client.query(`SELECT id FROM users WHERE email = 'test@example.com'`)
    ).rows[0].id;

    // ---- limpiar catálogo ----
    await client.query('TRUNCATE courses RESTART IDENTITY CASCADE');

    let courseOrder = 0;
    const bySlug = {};

    async function insertCourse(c) {
      courseOrder += 1;
      const meta = c.meta || {};
      const { rows } = await client.query(
        `INSERT INTO courses (slug, kind, title, description, image_url, instructor_id, published, source, url, note, meta, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8, $9, $10, $11) RETURNING id`,
        [
          c.slug, c.kind, c.title, c.description || '', c.image_url || null,
          instructorId, c.source || null, c.url || null, c.note || null,
          JSON.stringify(meta), courseOrder,
        ],
      );
      const id = rows[0].id;
      bySlug[c.slug] = id;
      let mi = 0;
      for (const m of c.modules || []) {
        mi += 1;
        const mres = await client.query(
          `INSERT INTO modules (course_id, title, numeral, subtitle, meta, order_index)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [id, m.title, m.numeral || null, m.subtitle || null, JSON.stringify(m.meta || {}), mi],
        );
        const moduleId = mres.rows[0].id;
        let ri = 0;
        for (const r of m.resources || []) {
          ri += 1;
          await client.query(
            `INSERT INTO resources (module_id, title, type, url, source, note, content, content_json, order_index)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              moduleId, r.title, r.type || 'lecture', r.url || null, r.source || null,
              r.note || null, r.content || null,
              r.content_json ? JSON.stringify(r.content_json) : null, ri,
            ],
          );
        }
      }
      return id;
    }

    // ---- 1. Máster IEP: 11 asignaturas oficiales + TFM (cada una = un curso propio) ----
    // Fuente de verdad de títulos/tramos: el documento oficial del programa
    // (IEP_Master_Online_..._Industria_4_0_LAT.docx). La estructura (módulos/recursos
    // curados) viene del artefacto legado (TEMPLATE), que ya coincide casi palabra por
    // palabra con el documento; aquí se corrige el título a la forma exacta del documento
    // y se añade la agrupación por tramo/certificado que el documento sí declara.
    const TEMPLATE = read('template.json');
    const byNumeral = Object.fromEntries((TEMPLATE.modules || []).map((m) => [m.numeral, m]));
    // Calculado aquí (antes de sembrar las aulas en la sección 2) para poder enlazar cada
    // recurso curado tipo 'curso' con la aula que ya lo recrea completo en la plataforma.
    // Ya incluye los overrides de contenido propio (AULA_CONTENT_FILES), así que una aula
    // que se completa hoy queda enlazable sin más cambios en esta sección.
    const AULAS_FOR_LINKING = loadAulasWithOverrides();

    const MASTER_ASIGNATURAS = [
      { numeral: 'I', slug: 'master-i', title: 'I. Artificial Intelligence', track: 'PRO-essentials',
        officialCode: '2702799205636',
        contenidos: ['IA y Toma de Decisiones Automatizadas', 'Machine Learning', 'Generative AI', 'Ethics in AI', 'Casos de Uso en Diferentes Sectores', 'Plataformas de Software'] },
      { numeral: 'II', slug: 'master-ii', title: 'II. Innovación tecnológica: Principales Tecnologías Disruptivas', track: 'PRO-essentials',
        officialCode: '2702799205366',
        contenidos: ['Conceptos fundamentales del Big Data', 'Conceptos fundamentales de la Inteligencia Artificial', 'Conceptos fundamentales del IoT', 'Computación en la nube y su rol en el IoT', 'Conceptos fundamentales de Blockchain', 'El futuro de las tecnologías emergentes'] },
      { numeral: 'III', slug: 'master-iii', title: 'III. Big Data Dentro de la informática', track: 'PRO-essentials',
        officialCode: '2702799209255',
        contenidos: ['Arquitecturas y Soluciones de Big Data: Análisis, Procesamiento y Escalabilidad', 'Entornos de trabajo para arquitecturas Deep Learning', 'Aprendizaje Automático', 'Regresiones y series temporales autorregresivas', 'Árboles de decisión y Algoritmos', 'Redes neuronales Artificiales'] },
      { numeral: 'IV', slug: 'master-iv', title: 'IV. Metodologías Ágiles para gestión de proyectos', track: 'PROadvance',
        officialCode: '2702799205392',
        contenidos: ['Principios y fundamentos de la agilidad', 'Comparativa de marcos ágiles (Scrum, Kanban, Lean)', 'Roles y eventos en Scrum', 'Prácticas de planificación y seguimiento en Scrum', 'Ciclos iterativos para la mejora de productos y procesos', 'Evaluación y ajuste continuo en proyectos ágiles'] },
      { numeral: 'V', slug: 'master-v', title: 'V. Ética y regulaciones en el Uso de la IA', track: 'PROadvance',
        officialCode: null,
        contenidos: ['Introducción a la Inteligencia Artificial', 'Regulación jurídica de la IA', 'Consideraciones éticas en el uso de la IA', 'Principales Retos y desafíos en el uso de IA', 'Inteligencia Artificial aplicada para la detección y prevención de riesgos', 'Modelo de Gobernanza de la IA. Big Data, Blockchain y otras tecnologías disruptivas'] },
      { numeral: 'VI', slug: 'master-vi', title: 'VI. Machine Learning', track: 'PROadvance',
        officialCode: '2702799208864',
        contenidos: ['Introducción a Machine Learning', 'Aprendizaje Supervisado', 'Aprendizaje supervisado de regresión', 'Aprendizaje no supervisado', 'Aprendizaje semi-supervisado y por Refuerzo', 'Interpretabilidad de Modelos'] },
      { numeral: 'VII', slug: 'master-vii', title: 'VII. Prompts Multimodales y Adaptación a Contextos Complejos', track: 'PROadvance',
        officialCode: '2702799209304',
        contenidos: ['Integración de texto, imagen y sonido', 'Aplicaciones en arte digital y transmedia', 'Desafíos en entornos multimodales', 'Adaptación de Prompts a Diferentes audiencias', 'Creación de Prompts para interfaces inteligentes', 'Evaluación de la usabilidad'] },
      { numeral: 'VIII', slug: 'master-viii', title: 'VIII. Metodologías para el desarrollo de productos tecnológicos innovadores', track: 'PROadvance',
        officialCode: null,
        contenidos: ['Fundamentos de Design Thinking', 'Fases de empatía y definición de problemas', 'Técnicas de ideación para soluciones innovadoras', 'Prototipado rápido y validación inicial', 'Iteración y mejoras continuas del prototipo', 'Pruebas con usuarios y retroalimentación'] },
      { numeral: 'IX', slug: 'master-ix', title: 'IX. Uso e Implementación de Modelos de Inteligencia Artificial Generativa en la Industria 4.0', track: 'PROadvance',
        officialCode: '2702799209220',
        contenidos: ['Conceptos básicos de IA Generativa', 'Paradigmas de ML en la IA Generativa', 'Redes Neuronales Generativas', 'Modelos Generativos', 'IA Generativa para contenido Multimedia y multimodal', 'Tendencias y dirección futura de la IA Generativa'] },
      { numeral: 'X', slug: 'master-x', title: 'X. AI Platforms', track: 'PROexpertify',
        officialCode: '2702799211500',
        contenidos: ['Computación en la nube', 'Arquitectura de referencia', 'Principales servicios', 'Amazon Web Services', 'Microsoft Azure', 'Google Cloud'] },
      { numeral: 'XI', slug: 'master-xi', title: 'XI. Principios de Inteligencia Artificial aplicada a entornos seguros', track: 'PROexpertify',
        officialCode: '2702799179257',
        contenidos: ['Introducción a la Inteligencia Artificial y aprendizaje automático', 'Principios y aplicaciones Big Data en la ciberseguridad', 'Manejo y procesamiento de datos', 'Modelos predictivos en ciberseguridad', 'Introducción a los modelos generativos en Inteligencia Artificial', 'Retos y oportunidades de la Inteligencia Artificial en el contexto de la ciberseguridad'] },
      { numeral: 'TFM', slug: 'master-tfm', title: 'Proyecto Fin de Programa (TFM)', track: 'TFM',
        officialCode: null,
        contenidos: ['Trabajo académico de cierre que aplica competencias generales del programa'] },
    ];

    let prevSlug = null;
    for (const [i, asig] of MASTER_ASIGNATURAS.entries()) {
      const tm = byNumeral[asig.numeral] || {};
      const propias = tryRequireLecciones(asig.slug);
      const modules = [];
      if (propias && Array.isArray(propias.lecciones) && propias.lecciones.length) {
        const resources = propias.lecciones.map(leccionAResource);
        if (Array.isArray(propias.examen) && propias.examen.length) {
          resources.push({
            title: 'Examen de la asignatura',
            type: 'exam',
            content_json: { questions: propias.examen },
          });
        }
        modules.push({
          title: 'Lecciones',
          subtitle: 'Una lección por cada Contenido oficial de la asignatura',
          resources,
        });
      }
      if (asig.slug === 'master-tfm') {
        modules.push({
          title: 'Entrega del TFM',
          subtitle: 'Sube tu memoria para evaluación del instructor',
          resources: [{
            title: 'Entrega: Proyecto Fin de Programa',
            type: 'project',
            content_json: {
              contenidos: asig.contenidos,
              deliverable: tm.deliverable || null,
              practice: tm.practice || null,
              mastery: tm.mastery || null,
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
          officialCode: asig.officialCode,
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

    // ---- matrículas + progreso inicial del usuario de prueba ----
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

    // marcar como completadas las 3 primeras lecciones de "AI for Everyone"
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

    // ---- notificación de bienvenida ----
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message)
       SELECT $1, 'course', 'Bienvenido al Campus', 'Tu catálogo está listo: programa, aulas, biblioteca, Máster IEP y cursos nativos.'
       WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = $1 AND title = 'Bienvenido al Campus')`,
      [testId],
    );

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

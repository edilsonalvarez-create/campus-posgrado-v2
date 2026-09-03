// Seed del catálogo completo desde backend/db/seed-data/*.json
// (generado por scripts/extract-legacy-content.mjs a partir del artefacto legado
//  campus-posgrado.html + native-curriculum.js + master-iep-data.js).
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

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);

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

    // ---- 1. Programa IA-40 (TEMPLATE) ----
    const TEMPLATE = read('template.json');
    await insertCourse({
      slug: 'programa-ia-industria-40',
      kind: 'program',
      title: TEMPLATE.title,
      description: TEMPLATE.subtitle || '',
      meta: {
        code: TEMPLATE.code, area: TEMPLATE.area, level: TEMPLATE.level,
        hoursWeek: TEMPLATE.hoursWeek, weeks: TEMPLATE.weeks,
      },
      modules: (TEMPLATE.modules || []).map((m) => ({
        title: `${m.numeral}. ${m.title}`,
        numeral: m.numeral,
        subtitle: m.weeks || null,
        meta: {
          objective: m.objective, practice: m.practice,
          deliverable: m.deliverable, mastery: m.mastery,
          hours: m.hours, weeks: m.weeks,
        },
        resources: (m.resources || []).map((r) => ({
          title: r.n,
          type: mapType(r.t),
          url: r.u || null,
          source: r.s || null,
          note: r.m || null,
          content: r.r || null,
        })),
      })),
    });

    // ---- 2. Aulas (AULAS) ----
    const AULAS = read('aulas.json');
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

    // ---- 4. Máster IEP (master-iep-data.js) ----
    const MASTER = read('master-iep.json');
    await insertCourse({
      slug: 'master-iep',
      kind: 'master',
      title: 'Máster IEP — Inteligencia Artificial y Tecnologías Disruptivas',
      description: 'Programa completo del Instituto Europeo de Posgrado, con sus asignaturas, módulos y recursos integrados.',
      meta: { asignaturas: Object.keys(MASTER).length },
      modules: Object.values(MASTER).map((asig) => ({
        title: asig.title,
        subtitle: asig.description || null,
        meta: { credits: asig.credits, weeks: asig.weeks, level: asig.level },
        resources: (asig.modules || []).flatMap((mod) =>
          (mod.topics || []).flatMap((t) =>
            (t.resources || []).map((r) => ({
              title: `${t.title} — ${r.title}`,
              type: mapType(r.type),
              content: r.content || r.description || null,
              content_json: r,
            })),
          ),
        ),
      })),
    });

    // ---- 5. Cursos nativos (native-curriculum.js) ----
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
      'programa-ia-industria-40',
      'biblioteca-master',
      'master-iep',
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

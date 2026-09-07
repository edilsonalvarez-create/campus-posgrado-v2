// Campus Posgrado v2 — API (Node http nativo + PostgreSQL)
// Contrato de rutas y formas de respuesta compatible con el frontend existente.
const http = require('http');
const url = require('url');
const crypto = require('crypto');
const pool = require('./db/pool');
const runMigrations = require('./db/migrate');
const llm = require('./lib/llm');

const PORT = Number(process.env.PORT) || 3001;
let dbReady = false;
const TOKEN_TTL_MS = 3600 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 3600 * 1000;

// ---------- utilidades ----------
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 300;

function checkRateLimit(ip) {
  const now = Date.now();
  const limit = rateLimits.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  if (now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (limit.count >= RATE_LIMIT_MAX) return false;
  limit.count += 1;
  rateLimits.set(ip, limit);
  return true;
}

// Hash legado (SHA-256 sin sal). Se mantiene solo para verificar contraseñas
// antiguas; en el primer login exitoso se re-hashea a scrypt (ver verifyPassword).
const legacyHash = (p) => crypto.createHash('sha256').update(String(p)).digest('hex');
const hashPassword = legacyHash; // compat: usado por el seed de usuarios de servicio

function scryptHash(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}
function newPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { algo: 'scrypt', salt, hash: scryptHash(password, salt) };
}
// Verifica contra el algoritmo almacenado. Devuelve { ok, needsUpgrade }.
function verifyPassword(user, password) {
  if (user.password_algo === 'scrypt' && user.password_salt) {
    const expected = Buffer.from(user.password_hash, 'hex');
    const actual = Buffer.from(scryptHash(password, user.password_salt), 'hex');
    const ok = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
    return { ok, needsUpgrade: false };
  }
  return { ok: user.password_hash === legacyHash(password), needsUpgrade: true };
}

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '') && e.length <= 254;
const isValidPassword = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 128;
const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s || '');

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => {
      body += c;
      if (body.length > 2_000_000) reject(new Error('payload too large'));
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('invalid json'));
      }
    });
    req.on('error', reject);
  });
}

async function newSession(userId, kind, ttl) {
  const token = crypto.randomBytes(32).toString('hex');
  await pool.query(
    `INSERT INTO sessions (token, user_id, kind, expires_at) VALUES ($1, $2, $3, now() + ($4::int * interval '1 millisecond'))`,
    [token, userId, kind, ttl],
  );
  return token;
}

async function getAuthUser(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  const token = h.slice(7);
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.name, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = $1 AND s.expires_at > now() AND s.kind = 'access'`,
    [token],
  );
  return rows[0] || null;
}

// ---------- serializadores ----------
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

function courseSummary(row) {
  const total = Number(row.total || 0);
  const completed = Number(row.completed || 0);
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url || undefined,
    instructorId: row.instructor_id || undefined,
    published: row.published,
    source: row.source || undefined,
    url: row.url || undefined,
    note: row.note || undefined,
    meta: row.meta || {},
    createdAt: row.created_at,
    progress: {
      completed,
      total,
      percentage: total ? Math.round((completed / total) * 100) : 0,
    },
  };
}

// Quita las claves de calificación del contenido antes de que llegue a un
// estudiante. Instructores/dirección/admin reciben el objeto completo.
//   - lección: el quiz formativo conserva enunciado y opciones, pierde `a` y `why`
//   - examen:  las preguntas NO se sirven nunca desde content_json (van por el
//              motor de intentos con banco de ítems). Se elimina el array entero.
function sanitizeResourceContent(type, cj, role) {
  if (!cj) return cj;
  if (role && role !== 'student') return cj;
  let clone;
  try {
    clone = JSON.parse(JSON.stringify(cj));
  } catch {
    return cj;
  }
  if (Array.isArray(clone.quiz)) {
    clone.quiz = clone.quiz.map((q) => ({ q: q.q, opts: q.opts || [] }));
  }
  if (type === 'exam') {
    delete clone.questions;
    delete clone.quiz;
  }
  return clone;
}

async function loadCourseDetail(courseRow, userId, role) {
  const summary = courseSummary(courseRow);
  const mods = (
    await pool.query(
      `SELECT id, title, numeral, subtitle, meta, order_index FROM modules WHERE course_id = $1 ORDER BY order_index`,
      [courseRow.id],
    )
  ).rows;
  const resByModule = {};
  if (mods.length) {
    const resRows = (
      await pool.query(
        `SELECT r.id, r.module_id, r.title, r.type, r.url, r.source, r.note, r.content, r.content_json, r.order_index,
                r.revised_at, r.revision_note,
                (p.resource_id IS NOT NULL) AS completed
           FROM resources r
           JOIN modules m ON m.id = r.module_id
           LEFT JOIN progress p ON p.resource_id = r.id AND p.user_id = $2 AND p.completed
          WHERE m.course_id = $1
          ORDER BY r.order_index`,
        [courseRow.id, userId || null],
      )
    ).rows;
    for (const r of resRows) {
      (resByModule[r.module_id] = resByModule[r.module_id] || []).push({
        id: r.id,
        title: r.title,
        type: r.type,
        url: r.url || undefined,
        source: r.source || undefined,
        note: r.note || undefined,
        content: r.content || undefined,
        contentJson: sanitizeResourceContent(r.type, r.content_json, role) || undefined,
        completed: r.completed,
        revisedAt: r.revised_at || undefined,
        revisionNote: r.revision_note || undefined,
        order: r.order_index,
      });
    }
  }
  summary.modules = mods.map((m) => ({
    id: m.id,
    title: m.title,
    numeral: m.numeral || undefined,
    subtitle: m.subtitle || undefined,
    description: m.subtitle || undefined,
    meta: m.meta || {},
    order: m.order_index,
    resources: resByModule[m.id] || [],
  }));
  return summary;
}

async function coursesForUser(userId, whereKind) {
  const params = [userId || null];
  let kindClause = '';
  if (whereKind) {
    params.push(whereKind);
    kindClause = ` AND c.kind = ANY($2)`;
  }
  const { rows } = await pool.query(
    `SELECT c.*,
       (SELECT count(*) FROM resources r JOIN modules m ON m.id = r.module_id WHERE m.course_id = c.id) AS total,
       (SELECT count(*) FROM progress p
          JOIN resources r ON r.id = p.resource_id
          JOIN modules m ON m.id = r.module_id
         WHERE m.course_id = c.id AND p.user_id = $1 AND p.completed) AS completed
     FROM courses c
     WHERE c.published${kindClause}
     ORDER BY c.order_index, c.title`,
    params,
  );
  return rows.map(courseSummary);
}

async function findCourseRow(idOrSlug) {
  const q = isUuid(idOrSlug)
    ? await pool.query('SELECT * FROM courses WHERE id = $1', [idOrSlug])
    : await pool.query('SELECT * FROM courses WHERE slug = $1', [idOrSlug]);
  return q.rows[0] || null;
}

function submissionRow(r) {
  return {
    id: r.id,
    resourceId: r.resource_id,
    courseId: r.course_id,
    studentId: r.user_id,
    studentName: r.student_name,
    content: r.content,
    kind: r.kind || 'text',
    repoUrl: r.repo_url || undefined,
    files: Array.isArray(r.files) ? r.files : [],
    status: r.status,
    submittedAt: r.submitted_at,
    grade: r.score != null ? Number(r.score) : undefined,
    feedback: r.feedback || undefined,
    rubric: r.rubric || undefined,
    rubricSlug: r.rubric_slug || r.resource_rubric_slug || undefined,
    llmSuggestion: r.llm_suggestion || undefined,
    gradedAt: r.graded_at || undefined,
    gradedBy: r.graded_by || undefined,
  };
}

const URL_RE = /^https?:\/\/[^\s]+$/i;
function cleanFiles(files) {
  return (Array.isArray(files) ? files : [])
    .filter((f) => f && typeof f.url === 'string' && URL_RE.test(f.url.trim()))
    .slice(0, 12)
    .map((f) => ({
      label: String(f.label || 'Archivo').slice(0, 120),
      file_type: String(f.type || f.file_type || 'link').slice(0, 20),
      url: f.url.trim().slice(0, 2000),
    }));
}

// ---------- lógica de certificación ----------
// Un certificado de asignatura se emite SOLO cuando se cumplen, a la vez:
//   - todas las lecciones completadas (si la asignatura tiene lecciones)
//   - proyecto calificado >= 70 (si la asignatura tiene proyecto)
//   - examen aprobado (si la asignatura tiene examen)
//   - y existe al menos un proyecto o un examen
// Ya no basta con aprobar un único examen de opción múltiple.
async function evaluateCourseCompletion(userId, courseId) {
  if (!userId || !courseId) return;
  const c = (await pool.query('SELECT id, slug, title, meta FROM courses WHERE id = $1', [courseId])).rows[0];
  if (!c) return;

  // El TFM tiene su propio proceso de 4 hitos con rúbrica (no un examen ni un
  // proyecto de textarea): su compleción la decide evaluateTfmCompletion.
  if (c.slug === 'master-tfm') return evaluateTfmCompletion(userId, c);

  const totalLessons = (
    await pool.query(
      `SELECT count(*)::int AS n FROM resources r JOIN modules m ON m.id = r.module_id
        WHERE m.course_id = $1 AND r.type = 'lesson'`,
      [courseId],
    )
  ).rows[0].n;
  const doneLessons = (
    await pool.query(
      `SELECT count(*)::int AS n FROM progress p
         JOIN resources r ON r.id = p.resource_id
         JOIN modules m ON m.id = r.module_id
        WHERE m.course_id = $1 AND p.user_id = $2 AND p.completed AND r.type = 'lesson'`,
      [courseId, userId],
    )
  ).rows[0].n;
  const lessonsOk = totalLessons === 0 || doneLessons === totalLessons;

  const hasProject =
    (
      await pool.query(
        `SELECT 1 FROM resources r JOIN modules m ON m.id = r.module_id
          WHERE m.course_id = $1 AND r.type IN ('project', 'assignment') LIMIT 1`,
        [courseId],
      )
    ).rowCount > 0;
  const projRow = (
    await pool.query(
      `SELECT g.score FROM submissions s JOIN grades g ON g.submission_id = s.id
         JOIN resources r ON r.id = s.resource_id JOIN modules m ON m.id = r.module_id
        WHERE s.user_id = $1 AND m.course_id = $2 AND r.type IN ('project', 'assignment')
        ORDER BY g.graded_at DESC LIMIT 1`,
      [userId, courseId],
    )
  ).rows[0];
  const projectOk = !!(projRow && Number(projRow.score) >= 70);

  const hasExam =
    (
      await pool.query(
        `SELECT 1 FROM resources r JOIN modules m ON m.id = r.module_id
          WHERE m.course_id = $1 AND r.type = 'exam' LIMIT 1`,
        [courseId],
      )
    ).rowCount > 0;
  let examOk = false;
  if (hasExam) {
    // Aprobado por el motor de intentos (Fase 1) O por el registro legado.
    const passed = (
      await pool.query(
        `SELECT
           bool_or(ea.passed) FILTER (WHERE ea.id IS NOT NULL)
           OR bool_or(qr.passed) FILTER (WHERE qr.id IS NOT NULL) AS ok
         FROM resources r
         JOIN modules m ON m.id = r.module_id
         LEFT JOIN exam_attempts ea ON ea.resource_id = r.id AND ea.user_id = $1 AND ea.status = 'submitted'
         LEFT JOIN quiz_responses qr ON qr.resource_id = r.id AND qr.user_id = $1
        WHERE m.course_id = $2 AND r.type = 'exam'`,
        [userId, courseId],
      )
    ).rows[0];
    examOk = !!(passed && passed.ok);
  }

  const ok = lessonsOk && (!hasProject || projectOk) && (!hasExam || examOk) && (hasProject || hasExam);
  if (!ok) return;

  const requirements = {
    lessons: `${doneLessons}/${totalLessons}`,
    project: projRow ? Number(projRow.score) : null,
    exam: hasExam ? examOk : null,
  };
  const ins = await pool.query(
    `INSERT INTO certificates (user_id, course_id, course_name, kind, requirements)
     VALUES ($1, $2, $3, 'asignatura', $4)
     ON CONFLICT (user_id, course_id, kind) DO NOTHING RETURNING id`,
    [userId, courseId, c.title, JSON.stringify(requirements)],
  );
  if (ins.rowCount) {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'certificate', 'Nuevo certificado', $2)`,
      [userId, `Completaste la asignatura ${c.title} (lecciones, proyecto y examen).`],
    );
    const meta = c.meta || {};
    await evaluateTrackAndProgramme(userId, meta.programSlug, meta.track).catch((e) =>
      console.error('[cert] tramo/programa:', e.message),
    );
  }
}

async function evaluateTrackAndProgramme(userId, programSlug, track) {
  if (!userId || !programSlug) return;
  const container = (await pool.query('SELECT id FROM courses WHERE slug = $1', [programSlug])).rows[0];
  if (!container) return;
  const asigs = (
    await pool.query(
      `SELECT id, title, meta->>'track' AS track FROM courses WHERE meta->>'programSlug' = $1`,
      [programSlug],
    )
  ).rows;
  if (!asigs.length) return;
  const certd = new Set(
    (
      await pool.query(
        `SELECT course_id FROM certificates WHERE user_id = $1 AND kind = 'asignatura'`,
        [userId],
      )
    ).rows.map((r) => r.course_id),
  );

  if (track) {
    const inTrack = asigs.filter((a) => a.track === track);
    if (inTrack.length && inTrack.every((a) => certd.has(a.id))) {
      const r = await pool.query(
        `INSERT INTO certificates (user_id, course_id, course_name, kind, requirements)
         VALUES ($1, $2, $3, 'tramo', $4)
         ON CONFLICT (user_id, course_id, kind) DO NOTHING RETURNING id`,
        [userId, container.id, `Certificado de tramo — ${track}`, JSON.stringify({ track, asignaturas: inTrack.map((a) => a.title) })],
      );
      if (r.rowCount) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES ($1, 'certificate', 'Certificado de tramo', $2)`,
          [userId, `Completaste el tramo ${track} del Máster.`],
        );
      }
    }
  }

  if (asigs.every((a) => certd.has(a.id))) {
    const r = await pool.query(
      `INSERT INTO certificates (user_id, course_id, course_name, kind, requirements)
       VALUES ($1, $2, $3, 'programa', $4)
       ON CONFLICT (user_id, course_id, kind) DO NOTHING RETURNING id`,
      [userId, container.id, 'Máster IEP — Programa completo', JSON.stringify({ asignaturas: asigs.length })],
    );
    if (r.rowCount) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'certificate', '¡Máster completado!', $2)`,
        [userId, 'Has completado las 11 asignaturas y el TFM del Máster IEP.'],
      );
    }
  }
}

// Nota ponderada del TFM a partir de los 4 hitos aprobados y calificados.
async function tfmWeightedScore(tfmId) {
  const rows = (
    await pool.query(
      `SELECT tms.milestone_slug, tms.status, m.weight, g.score
         FROM tfm_milestone_submissions tms
         JOIN tfm_milestones m ON m.slug = tms.milestone_slug
         LEFT JOIN grades g ON g.submission_id = tms.submission_id
        WHERE tms.tfm_id = $1`,
      [tfmId],
    )
  ).rows;
  const total = (await pool.query('SELECT count(*)::int n, sum(weight) w FROM tfm_milestones')).rows[0];
  const approved = rows.filter((r) => r.status === 'approved' && r.score != null);
  const allApproved = approved.length === total.n;
  const weighted = approved.reduce((acc, r) => acc + (Number(r.score) * Number(r.weight)) / Number(total.w), 0);
  return { allApproved, weighted: Math.round(weighted), milestones: rows.length };
}

async function evaluateTfmCompletion(userId, tfmCourse) {
  const tfm = (await pool.query('SELECT id FROM tfm_enrollments WHERE user_id = $1', [userId])).rows[0];
  if (!tfm) return;
  const { allApproved, weighted } = await tfmWeightedScore(tfm.id);
  if (!allApproved || weighted < 70) return;
  await pool.query(
    `UPDATE tfm_enrollments SET status = 'passed', updated_at = now() WHERE id = $1 AND status <> 'passed'`,
    [tfm.id],
  );
  const ins = await pool.query(
    `INSERT INTO certificates (user_id, course_id, course_name, kind, requirements)
     VALUES ($1, $2, $3, 'asignatura', $4)
     ON CONFLICT (user_id, course_id, kind) DO NOTHING RETURNING id`,
    [userId, tfmCourse.id, tfmCourse.title, JSON.stringify({ tfm: `${weighted}/100`, hitos: '4/4 aprobados' })],
  );
  if (ins.rowCount) {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'certificate', 'TFM aprobado', $2)`,
      [userId, `Aprobaste el Proyecto Fin de Programa con ${weighted}/100.`],
    );
    const meta = tfmCourse.meta || {};
    await evaluateTrackAndProgramme(userId, meta.programSlug, meta.track).catch(() => {});
  }
}

// ---------- evaluación: quiz formativo, actividad, motor de exámenes ----------
const EXAM_DEFAULTS = {
  maxAttempts: 3,
  cooldownHours: 24,
  drawSize: 15,
  durationMinutes: 40,
  passThreshold: 70,
};
function getExamConfig(cj) {
  return { ...EXAM_DEFAULTS, ...((cj && cj.examConfig) || {}) };
}

// Completado real de lección: actividad entregada AND quiz formativo aprobado.
async function recomputeLessonProgress(userId, resourceId) {
  const r = (
    await pool.query(`SELECT content_json FROM resources WHERE id = $1 AND type = 'lesson'`, [resourceId])
  ).rows[0];
  if (!r) return;
  const cj = r.content_json || {};
  const hasQuiz = Array.isArray(cj.quiz) && cj.quiz.length > 0;
  const threshold = typeof cj.formativeThreshold === 'number' ? cj.formativeThreshold : 0.6;
  const act = await pool.query(
    `SELECT 1 FROM activity_submissions WHERE user_id = $1 AND resource_id = $2`,
    [userId, resourceId],
  );
  const hasActivity = !!(cj.exercise && cj.exercise.text);
  const fr = (
    await pool.query(
      `SELECT score, max_score FROM formative_responses WHERE user_id = $1 AND resource_id = $2`,
      [userId, resourceId],
    )
  ).rows[0];
  const activityOk = !hasActivity || act.rowCount > 0;
  const quizOk = !hasQuiz || (fr && fr.max_score > 0 && fr.score / fr.max_score >= threshold);
  if (activityOk && quizOk) {
    await pool.query(
      `INSERT INTO progress (user_id, resource_id, completed) VALUES ($1, $2, true)
       ON CONFLICT (user_id, resource_id) DO UPDATE SET completed = true, completed_at = now()`,
      [userId, resourceId],
    );
    const cid = (
      await pool.query(`SELECT m.course_id FROM resources r JOIN modules m ON m.id = r.module_id WHERE r.id = $1`, [resourceId])
    ).rows[0];
    if (cid) await evaluateCourseCompletion(userId, cid.course_id).catch(() => {});
  } else {
    await pool.query(`DELETE FROM progress WHERE user_id = $1 AND resource_id = $2`, [userId, resourceId]);
  }
}

// Sorteo de preguntas para un intento de examen: round-robin por skill_tag para
// cubrir todos los contenidos oficiales, con relleno aleatorio hasta drawSize.
async function drawExamQuestions(bankId, drawSize) {
  const all = (
    await pool.query(
      `SELECT id, skill_tag FROM item_bank_questions WHERE bank_id = $1 AND active ORDER BY random()`,
      [bankId],
    )
  ).rows;
  if (!all.length) return [];
  const byTag = new Map();
  for (const q of all) {
    const t = q.skill_tag || '_';
    if (!byTag.has(t)) byTag.set(t, []);
    byTag.get(t).push(q.id);
  }
  const picked = [];
  const tags = [...byTag.keys()];
  let i = 0;
  while (picked.length < Math.min(drawSize, all.length)) {
    const bucket = byTag.get(tags[i % tags.length]);
    if (bucket && bucket.length) picked.push(bucket.shift());
    i += 1;
    if (i > drawSize * tags.length + all.length) break;
  }
  return picked.slice(0, drawSize);
}

async function rubricBySlug(slug) {
  const rub = (await pool.query('SELECT * FROM rubrics WHERE slug = $1', [slug])).rows[0];
  if (!rub) return null;
  const crit = (
    await pool.query('SELECT * FROM rubric_criteria WHERE rubric_id = $1 ORDER BY order_index', [rub.id])
  ).rows;
  const levels = crit.length
    ? (
        await pool.query(
          `SELECT * FROM rubric_levels WHERE criterion_id = ANY($1) ORDER BY order_index`,
          [crit.map((c) => c.id)],
        )
      ).rows
    : [];
  return {
    slug: rub.slug,
    version: rub.version,
    title: rub.title,
    scope: rub.scope,
    passThreshold: Number(rub.pass_threshold),
    totalPoints: Number(rub.total_points),
    criteria: crit.map((c) => ({
      key: c.key,
      title: c.title,
      description: c.description,
      weight: Number(c.weight),
      levels: levels
        .filter((l) => l.criterion_id === c.id)
        .map((l) => ({ label: l.label, points: Number(l.points), descriptor: l.descriptor })),
    })),
  };
}

// ---------- rutas ----------
// Cada ruta: { method, pattern (RegExp con grupos nombrados), handler(ctx) }
const routes = [];
const route = (method, path, handler) => {
  const pattern = new RegExp(
    '^' + path.replace(/:[a-zA-Z]+/g, (m) => `(?<${m.slice(1)}>[^/]+)`) + '/?$',
  );
  routes.push({ method, pattern, handler });
};

route('GET', '/api/health', async ({ res }) => sendJSON(res, 200, { status: 'ok' }));
route('GET', '/health', async ({ res }) => sendJSON(res, 200, { status: 'ok' }));

// --- auth ---
route('POST', '/api/auth/register', async ({ res, body }) => {
  const { email, name, password } = body;
  if (!isValidEmail(email) || !name || !isValidPassword(password)) {
    return sendJSON(res, 400, { message: 'Datos inválidos (email, nombre y contraseña de 8+ caracteres)' });
  }
  const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (exists.rowCount) return sendJSON(res, 409, { message: 'El email ya está registrado' });
  const pw = newPasswordHash(password);
  const { rows } = await pool.query(
    `INSERT INTO users (email, name, password_hash, password_salt, password_algo, role)
     VALUES ($1, $2, $3, $4, $5, 'student')
     RETURNING id, email, name, role`,
    [email, name, pw.hash, pw.salt, pw.algo],
  );
  const user = rows[0];
  const accessToken = await newSession(user.id, 'access', TOKEN_TTL_MS);
  const refreshToken = await newSession(user.id, 'refresh', REFRESH_TTL_MS);
  sendJSON(res, 201, { accessToken, refreshToken, user: publicUser(user) });
});

route('POST', '/api/auth/login', async ({ res, body }) => {
  const { email, password } = body;
  const { rows } = await pool.query(
    'SELECT id, email, name, role, password_hash, password_salt, password_algo FROM users WHERE email = $1',
    [email || ''],
  );
  const user = rows[0];
  const check = user ? verifyPassword(user, password) : { ok: false };
  if (!user || !check.ok) {
    return sendJSON(res, 401, { message: 'Credenciales inválidas' });
  }
  if (check.needsUpgrade) {
    const pw = newPasswordHash(password);
    await pool
      .query(
        `UPDATE users SET password_hash = $2, password_salt = $3, password_algo = $4 WHERE id = $1`,
        [user.id, pw.hash, pw.salt, pw.algo],
      )
      .catch((e) => console.error('[login] fallo re-hash:', e.message));
  }
  const accessToken = await newSession(user.id, 'access', TOKEN_TTL_MS);
  const refreshToken = await newSession(user.id, 'refresh', REFRESH_TTL_MS);
  sendJSON(res, 200, { accessToken, refreshToken, user: publicUser(user) });
});

route('POST', '/api/auth/refresh', async ({ res, body }) => {
  const token = body.refreshToken || '';
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.name, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = $1 AND s.kind = 'refresh' AND s.expires_at > now()`,
    [token],
  );
  if (!rows[0]) return sendJSON(res, 401, { message: 'Refresh token inválido' });
  const accessToken = await newSession(rows[0].id, 'access', TOKEN_TTL_MS);
  sendJSON(res, 200, { accessToken, user: publicUser(rows[0]) });
});

route('GET', '/api/auth/me', async ({ res, user }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  sendJSON(res, 200, publicUser(user));
});

route('POST', '/api/auth/logout', async ({ res, req }) => {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) await pool.query('DELETE FROM sessions WHERE token = $1', [h.slice(7)]);
  sendJSON(res, 200, { ok: true });
});

// --- courses ---
route('GET', '/api/courses', async ({ res, user }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  sendJSON(res, 200, await coursesForUser(user.id));
});

route('POST', '/api/courses', async ({ res, user, body }) => {
  if (!user || user.role === 'student') return sendJSON(res, 403, { message: 'Forbidden' });
  const { title, description } = body;
  if (!title) return sendJSON(res, 400, { message: 'El título es obligatorio' });
  const slug =
    title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) +
    '-' + crypto.randomBytes(3).toString('hex');
  const { rows } = await pool.query(
    `INSERT INTO courses (slug, kind, title, description, instructor_id, published)
     VALUES ($1, 'course', $2, $3, $4, true) RETURNING *`,
    [slug, title, description || '', user.id],
  );
  sendJSON(res, 201, courseSummary({ ...rows[0], total: 0, completed: 0 }));
});

route('GET', '/api/courses/:id/analytics', async ({ res, user, params }) => {
  if (!user || user.role === 'student') return sendJSON(res, 403, { message: 'Forbidden' });
  const course = await findCourseRow(params.id);
  if (!course) return sendJSON(res, 404, { message: 'Course not found' });
  const totalRes = Number(
    (await pool.query(
      `SELECT count(*) FROM resources r JOIN modules m ON m.id = r.module_id WHERE m.course_id = $1`,
      [course.id],
    )).rows[0].count,
  );
  const students = (
    await pool.query(
      `SELECT u.id, u.name,
         (SELECT count(*) FROM progress p JOIN resources r ON r.id = p.resource_id JOIN modules m ON m.id = r.module_id
            WHERE m.course_id = $1 AND p.user_id = u.id AND p.completed) AS done,
         (SELECT count(*) FROM submissions s WHERE s.course_id = $1 AND s.user_id = u.id) AS subs
       FROM enrollments e JOIN users u ON u.id = e.user_id
       WHERE e.course_id = $1 AND e.role = 'student'`,
      [course.id],
    )
  ).rows;
  const subs = (
    await pool.query(
      `SELECT s.status, g.score FROM submissions s LEFT JOIN grades g ON g.submission_id = s.id WHERE s.course_id = $1`,
      [course.id],
    )
  ).rows;
  const graded = subs.filter((s) => s.score != null);
  sendJSON(res, 200, {
    courseId: course.id,
    totalStudents: students.length,
    totalSubmissions: subs.length,
    gradedSubmissions: graded.length,
    pendingSubmissions: subs.filter((s) => s.status === 'submitted').length,
    averageGrade: graded.length ? Math.round((graded.reduce((n, s) => n + Number(s.score), 0) / graded.length) * 10) / 10 : 0,
    completionRate:
      students.length && totalRes
        ? Math.round((students.reduce((n, s) => n + Number(s.done) / totalRes, 0) / students.length) * 100)
        : 0,
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      progress: totalRes ? Math.round((Number(s.done) / totalRes) * 100) : 0,
      submissions: Number(s.subs),
    })),
  });
});

route('GET', '/api/courses/:id/submissions', async ({ res, user, params }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const course = await findCourseRow(params.id);
  if (!course) return sendJSON(res, 404, { message: 'Course not found' });
  const ownOnly = user.role === 'student';
  const { rows } = await pool.query(
    `SELECT s.*, u.name AS student_name, g.score, g.feedback, g.rubric, g.rubric_slug, g.llm_suggestion, g.graded_at, g.graded_by,
              rr.content_json->>'rubricSlug' AS resource_rubric_slug,
              (SELECT coalesce(json_agg(json_build_object('label',sf.label,'type',sf.file_type,'url',sf.url) ORDER BY sf.created_at), '[]'::json) FROM submission_files sf WHERE sf.submission_id = s.id) AS files
       FROM submissions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN grades g ON g.submission_id = s.id
       LEFT JOIN resources rr ON rr.id = s.resource_id
      WHERE s.course_id = $1 ${ownOnly ? 'AND s.user_id = $2' : ''}
      ORDER BY s.submitted_at DESC`,
    ownOnly ? [course.id, user.id] : [course.id],
  );
  sendJSON(res, 200, rows.map(submissionRow));
});

route('GET', '/api/courses/:id', async ({ res, user, params }) => {
  const course = await findCourseRow(params.id);
  if (!course || !course.published) return sendJSON(res, 404, { message: 'Course not found' });
  const total = Number(
    (await pool.query(
      `SELECT count(*) FROM resources r JOIN modules m ON m.id = r.module_id WHERE m.course_id = $1`,
      [course.id],
    )).rows[0].count,
  );
  const completed = user
    ? Number(
        (await pool.query(
          `SELECT count(*) FROM progress p JOIN resources r ON r.id = p.resource_id JOIN modules m ON m.id = r.module_id
            WHERE m.course_id = $1 AND p.user_id = $2 AND p.completed`,
          [course.id, user.id],
        )).rows[0].count,
      )
    : 0;
  sendJSON(res, 200, await loadCourseDetail({ ...course, total, completed }, user && user.id, user && user.role));
});

route('PUT', '/api/courses/:id', async ({ res, user, params, body }) => {
  if (!user || user.role === 'student') return sendJSON(res, 403, { message: 'Forbidden' });
  const course = await findCourseRow(params.id);
  if (!course) return sendJSON(res, 404, { message: 'Course not found' });
  const { rows } = await pool.query(
    `UPDATE courses SET title = COALESCE($2, title), description = COALESCE($3, description),
       published = COALESCE($4, published), updated_at = now() WHERE id = $1 RETURNING *`,
    [course.id, body.title ?? null, body.description ?? null, body.published ?? null],
  );
  sendJSON(res, 200, courseSummary({ ...rows[0], total: 0, completed: 0 }));
});

// --- master / native (catálogo especializado) ---
route('GET', '/api/master-courses', async ({ res, user }) => {
  const row = await findCourseRow('master-iep');
  if (!row) return sendJSON(res, 200, []);
  const detail = await loadCourseDetail({ ...row, total: 0, completed: 0 }, user && user.id, user && user.role);
  sendJSON(res, 200, detail);
});

route('GET', '/api/native-courses/:id', async ({ res, user, params }) => {
  const row = await findCourseRow(params.id);
  if (!row || row.kind !== 'native') return sendJSON(res, 404, { message: 'Not found' });
  sendJSON(res, 200, await loadCourseDetail({ ...row, total: 0, completed: 0 }, user && user.id, user && user.role));
});

route('GET', '/api/native-courses', async ({ res, user }) => {
  sendJSON(res, 200, await coursesForUser(user && user.id, ['native']));
});

// --- programs (agrupa asignaturas-curso por meta.programSlug, ej. el Máster) ---
const PROGRAM_TITLES = {
  'master-iep': 'Máster en Inteligencia Artificial y Tecnologías Disruptivas para la Innovación en la Industria 4.0',
};
const TRACK_ORDER = ['PRO-essentials', 'PROadvance', 'PROexpertify', 'TFM'];
const TRACK_LABEL = {
  'PRO-essentials': 'Certificado en Innovación y Tecnologías Disruptivas para la Transformación de la Industria 4.0',
  PROadvance: 'Certificado en Tecnologías Disruptivas e Inteligencia Artificial Avanzada',
  PROexpertify: 'Certificado en Cloud Computing e IA para entornos Seguros',
  TFM: 'Proyecto Fin de Programa',
};

route('GET', '/api/programs/:slug', async ({ res, user, params }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const { rows } = await pool.query(
    `SELECT c.*,
       (SELECT count(*) FROM resources r JOIN modules m ON m.id = r.module_id WHERE m.course_id = c.id) AS total,
       (SELECT count(*) FROM progress p JOIN resources r ON r.id = p.resource_id JOIN modules m ON m.id = r.module_id
          WHERE m.course_id = c.id AND p.user_id = $2 AND p.completed) AS completed
     FROM courses c
     WHERE c.meta->>'programSlug' = $1
     ORDER BY (c.meta->>'programOrder')::int`,
    [params.slug, user.id],
  );
  if (!rows.length) return sendJSON(res, 404, { message: 'Programa no encontrado' });

  const progressBySlug = {};
  const asignaturas = rows.map((r) => {
    const total = Number(r.total);
    const completed = Number(r.completed);
    const percentage = total ? Math.round((completed / total) * 100) : 0;
    progressBySlug[r.slug] = percentage;
    const meta = r.meta || {};
    return {
      id: r.id, slug: r.slug, title: r.title, description: r.description,
      track: meta.track, programOrder: meta.programOrder,
      prerequisiteSlug: meta.prerequisiteSlug || null,
      officialCode: meta.officialCode || null,
      contenidos: meta.contenidos || [],
      progress: { completed, total, percentage },
    };
  });
  for (const a of asignaturas) {
    a.locked = !!(a.prerequisiteSlug && (progressBySlug[a.prerequisiteSlug] || 0) < 100);
  }

  const tracks = TRACK_ORDER.map((key) => {
    const items = asignaturas.filter((a) => a.track === key);
    if (!items.length) return null;
    const total = items.reduce((n, a) => n + a.progress.total, 0);
    const completed = items.reduce((n, a) => n + a.progress.completed, 0);
    return {
      key, label: TRACK_LABEL[key], asignaturas: items,
      progress: { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0 },
      completed: items.every((a) => a.progress.percentage === 100),
    };
  }).filter(Boolean);

  const total = asignaturas.reduce((n, a) => n + a.progress.total, 0);
  const completed = asignaturas.reduce((n, a) => n + a.progress.completed, 0);

  sendJSON(res, 200, {
    slug: params.slug,
    title: PROGRAM_TITLES[params.slug] || params.slug,
    tracks,
    progress: { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0 },
  });
});

// --- progress ---
route('GET', '/api/progress', async ({ res, user }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const rows = (
    await pool.query(
      `SELECT c.id AS course_id,
         (SELECT count(*) FROM resources r JOIN modules m ON m.id = r.module_id WHERE m.course_id = c.id) AS total,
         (SELECT count(*) FROM progress p JOIN resources r ON r.id = p.resource_id JOIN modules m ON m.id = r.module_id
            WHERE m.course_id = c.id AND p.user_id = $1 AND p.completed) AS completed
       FROM courses c
       JOIN enrollments e ON e.course_id = c.id AND e.user_id = $1`,
      [user.id],
    )
  ).rows;
  const courses = {};
  let sum = 0;
  for (const r of rows) {
    const total = Number(r.total);
    const completed = Number(r.completed);
    const percentage = total ? Math.round((completed / total) * 100) : 0;
    courses[r.course_id] = { courseId: r.course_id, completed, total, percentage };
    sum += percentage;
  }
  sendJSON(res, 200, {
    userId: user.id,
    totalCourses: rows.length,
    averageProgress: rows.length ? Math.round(sum / rows.length) : 0,
    courses,
  });
});

// Tipos de recurso que el estudiante SÍ puede marcar/desmarcar a mano.
// Las lecciones se completan entregando la actividad y aprobando el quiz
// (recomputeLessonProgress); los exámenes y proyectos, al aprobarlos.
const MANUAL_PROGRESS_TYPES = new Set(['reading', 'video', 'book', 'docs', 'norma', 'dataset', 'tool', 'cert', 'lecture', 'exercise']);

route('POST', '/api/progress', async ({ res, user, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const { resourceId, completed = true } = body;
  if (!isUuid(resourceId)) return sendJSON(res, 400, { message: 'resourceId inválido' });
  const rr = (
    await pool.query(
      `SELECT r.type, r.content_json, m.course_id, c.meta FROM resources r
         JOIN modules m ON m.id = r.module_id
         JOIN courses c ON c.id = m.course_id
        WHERE r.id = $1`,
      [resourceId],
    )
  ).rows[0];
  if (!rr) return sendJSON(res, 404, { message: 'Recurso no encontrado' });
  const cjr = rr.content_json || {};
  const lessonHasFormative =
    rr.type === 'lesson' && ((Array.isArray(cjr.quiz) && cjr.quiz.length > 0) || (cjr.exercise && cjr.exercise.text));
  if (!MANUAL_PROGRESS_TYPES.has(rr.type) && !(rr.type === 'lesson' && !lessonHasFormative)) {
    return sendJSON(res, 409, {
      message:
        rr.type === 'lesson'
          ? 'La lección se completa entregando la actividad y aprobando el quiz de comprensión.'
          : 'Este recurso se completa al aprobarlo, no manualmente.',
    });
  }
  // Gate de prerrequisito: si el curso tiene asignatura previa sin terminar, no se avanza.
  const prereq = rr.meta && rr.meta.prerequisiteSlug;
  if (prereq) {
    const pct = (
      await pool.query(
        `SELECT
           (SELECT count(*) FROM resources r JOIN modules m ON m.id = r.module_id WHERE m.course_id = c.id) AS total,
           (SELECT count(*) FROM progress p JOIN resources r ON r.id = p.resource_id JOIN modules m ON m.id = r.module_id
              WHERE m.course_id = c.id AND p.user_id = $2 AND p.completed) AS done
         FROM courses c WHERE c.slug = $1`,
        [prereq, user.id],
      )
    ).rows[0];
    if (pct && Number(pct.total) > 0 && Number(pct.done) < Number(pct.total)) {
      return sendJSON(res, 403, { message: `Completa "${prereq}" para avanzar en esta asignatura.` });
    }
  }
  if (completed) {
    await pool.query(
      `INSERT INTO progress (user_id, resource_id, completed) VALUES ($1, $2, true)
       ON CONFLICT (user_id, resource_id) DO UPDATE SET completed = true, completed_at = now()`,
      [user.id, resourceId],
    );
    await evaluateCourseCompletion(user.id, rr.course_id).catch(() => {});
  } else {
    await pool.query('DELETE FROM progress WHERE user_id = $1 AND resource_id = $2', [user.id, resourceId]);
  }
  sendJSON(res, 200, { ok: true });
});

// --- quiz formativo (por lección) + entrega de actividad ---
route('GET', '/api/formative/:resourceId', async ({ res, user, params }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  if (!isUuid(params.resourceId)) return sendJSON(res, 400, { message: 'id inválido' });
  const fr = (
    await pool.query(
      `SELECT answers, score, max_score, passed, attempts FROM formative_responses
        WHERE user_id = $1 AND resource_id = $2`,
      [user.id, params.resourceId],
    )
  ).rows[0];
  const act = (
    await pool.query(
      `SELECT content, updated_at FROM activity_submissions WHERE user_id = $1 AND resource_id = $2`,
      [user.id, params.resourceId],
    )
  ).rows[0];
  sendJSON(res, 200, {
    formative: fr
      ? {
          answers: fr.answers,
          score: Number(fr.score),
          maxScore: Number(fr.max_score),
          passed: fr.passed,
          attempts: fr.attempts,
        }
      : null,
    activity: act ? { content: act.content, updatedAt: act.updated_at } : null,
  });
});

route('POST', '/api/formative/:resourceId', async ({ res, user, params, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  if (!isUuid(params.resourceId)) return sendJSON(res, 400, { message: 'id inválido' });
  const r = (
    await pool.query(`SELECT content_json FROM resources WHERE id = $1 AND type = 'lesson'`, [params.resourceId])
  ).rows[0];
  if (!r) return sendJSON(res, 404, { message: 'Lección no encontrada' });
  const quiz = Array.isArray((r.content_json || {}).quiz) ? r.content_json.quiz : [];
  if (!quiz.length) return sendJSON(res, 400, { message: 'La lección no tiene quiz' });
  const answers = Array.isArray(body.answers) ? body.answers : [];
  let correct = 0;
  const detail = quiz.map((q, i) => {
    const given = answers.find((a) => String(a.i) === String(i));
    const choice = given ? Number(given.choice) : null;
    const ok = choice === Number(q.a);
    if (ok) correct += 1;
    return { i, choice, correct: ok, correctIndex: Number(q.a), why: Array.isArray(q.why) ? q.why : [] };
  });
  const maxScore = quiz.length;
  const threshold =
    typeof (r.content_json || {}).formativeThreshold === 'number' ? r.content_json.formativeThreshold : 0.6;
  const passed = maxScore > 0 && correct / maxScore >= threshold;
  await pool.query(
    `INSERT INTO formative_responses (user_id, resource_id, answers, score, max_score, passed, attempts)
     VALUES ($1, $2, $3, $4, $5, $6, 1)
     ON CONFLICT (user_id, resource_id) DO UPDATE SET
       answers = EXCLUDED.answers, score = EXCLUDED.score, max_score = EXCLUDED.max_score,
       passed = EXCLUDED.passed, attempts = formative_responses.attempts + 1, updated_at = now()`,
    [user.id, params.resourceId, JSON.stringify(answers), correct, maxScore, passed],
  );
  await recomputeLessonProgress(user.id, params.resourceId);
  sendJSON(res, 200, { score: correct, maxScore, passed, detail });
});

route('POST', '/api/activity/:resourceId', async ({ res, user, params, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  if (!isUuid(params.resourceId)) return sendJSON(res, 400, { message: 'id inválido' });
  const content = String(body.content || '').trim();
  if (content.length < 20) return sendJSON(res, 400, { message: 'Escribe tu respuesta a la actividad (mín. 20 caracteres).' });
  const r = await pool.query(`SELECT 1 FROM resources WHERE id = $1 AND type = 'lesson'`, [params.resourceId]);
  if (!r.rowCount) return sendJSON(res, 404, { message: 'Lección no encontrada' });
  await pool.query(
    `INSERT INTO activity_submissions (user_id, resource_id, content) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, resource_id) DO UPDATE SET content = EXCLUDED.content, updated_at = now()`,
    [user.id, params.resourceId, content],
  );
  await recomputeLessonProgress(user.id, params.resourceId);
  sendJSON(res, 200, { ok: true });
});

// --- motor de exámenes (banco de ítems, intentos limitados, cooldown) ---
route('GET', '/api/exams/:resourceId/status', async ({ res, user, params }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  if (!isUuid(params.resourceId)) return sendJSON(res, 400, { message: 'id inválido' });
  const r = (
    await pool.query(
      `SELECT r.content_json, m.course_id FROM resources r JOIN modules m ON m.id = r.module_id
        WHERE r.id = $1 AND r.type = 'exam'`,
      [params.resourceId],
    )
  ).rows[0];
  if (!r) return sendJSON(res, 404, { message: 'Examen no encontrado' });
  const cfg = getExamConfig(r.content_json);
  const attempts = (
    await pool.query(
      `SELECT attempt_no, score, passed, status, submitted_at, expires_at
         FROM exam_attempts WHERE user_id = $1 AND resource_id = $2 ORDER BY attempt_no`,
      [user.id, params.resourceId],
    )
  ).rows;
  const submitted = attempts.filter((a) => a.status === 'submitted');
  const inProgress = attempts.find((a) => a.status === 'in_progress' && new Date(a.expires_at) > new Date());
  const last = submitted[submitted.length - 1];
  let cooldownUntil = null;
  if (last && !submitted.some((a) => a.passed)) {
    const until = new Date(new Date(last.submitted_at).getTime() + cfg.cooldownHours * 3600 * 1000);
    if (until > new Date()) cooldownUntil = until.toISOString();
  }
  const passed = submitted.some((a) => a.passed);
  let reviewItems = [];
  if (last && !passed) reviewItems = await weakSkillLessons(user.id, r.course_id, params.resourceId);
  sendJSON(res, 200, {
    hasBank: !!(r.content_json && r.content_json.examConfig && r.content_json.examConfig.bankSlug),
    attemptsUsed: submitted.length,
    maxAttempts: cfg.maxAttempts,
    passThreshold: cfg.passThreshold,
    drawSize: cfg.drawSize,
    durationMinutes: cfg.durationMinutes,
    lastScore: last ? Number(last.score) : null,
    passed,
    cooldownUntil,
    inProgressAttemptId: inProgress ? undefined : undefined, // no exponemos id; se reanuda en POST
    canStart: !passed && submitted.length < cfg.maxAttempts && !cooldownUntil,
    reviewItems,
  });
});

async function weakSkillLessons(userId, courseId, examResourceId) {
  const rows = (
    await pool.query(
      `SELECT skill_tag, correct, total FROM skill_mastery
        WHERE user_id = $1 AND course_id = $2 AND total > 0
        ORDER BY (correct::float / total) ASC LIMIT 3`,
      [userId, courseId],
    )
  ).rows;
  if (!rows.length) return [];
  const tags = rows.map((x) => x.skill_tag);
  const lessons = (
    await pool.query(
      `SELECT r.id, r.title, r.content_json->>'contenidoOficial' AS skill
         FROM resources r JOIN modules m ON m.id = r.module_id
        WHERE m.course_id = $1 AND r.type = 'lesson' AND r.content_json->>'contenidoOficial' = ANY($2)`,
      [courseId, tags],
    )
  ).rows;
  return lessons.map((l) => ({ resourceId: l.id, title: l.title, skillTag: l.skill }));
}

route('POST', '/api/exams/:resourceId/attempts', async ({ res, user, params }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  if (!isUuid(params.resourceId)) return sendJSON(res, 400, { message: 'id inválido' });
  const r = (
    await pool.query(
      `SELECT r.content_json, r.title, m.course_id FROM resources r JOIN modules m ON m.id = r.module_id
        WHERE r.id = $1 AND r.type = 'exam'`,
      [params.resourceId],
    )
  ).rows[0];
  if (!r) return sendJSON(res, 404, { message: 'Examen no encontrado' });
  const cfg = getExamConfig(r.content_json);
  const bankSlug = r.content_json && r.content_json.examConfig && r.content_json.examConfig.bankSlug;
  if (!bankSlug) return sendJSON(res, 409, { code: 'NO_BANK', message: 'Este examen aún no tiene banco de ítems configurado.' });
  const bank = (await pool.query('SELECT id FROM item_banks WHERE slug = $1', [bankSlug])).rows[0];
  if (!bank) return sendJSON(res, 409, { code: 'NO_BANK', message: 'Banco de ítems no encontrado.' });

  const attempts = (
    await pool.query(
      `SELECT * FROM exam_attempts WHERE user_id = $1 AND resource_id = $2 ORDER BY attempt_no`,
      [user.id, params.resourceId],
    )
  ).rows;
  const inProgress = attempts.find((a) => a.status === 'in_progress');
  if (inProgress) {
    if (new Date(inProgress.expires_at) > new Date()) {
      const qs = await loadAttemptQuestions(inProgress.question_ids);
      return sendJSON(res, 200, {
        attemptId: inProgress.id,
        attemptNo: inProgress.attempt_no,
        expiresAt: inProgress.expires_at,
        durationMinutes: cfg.durationMinutes,
        questions: qs,
        resumed: true,
      });
    }
    await pool.query(`UPDATE exam_attempts SET status = 'expired' WHERE id = $1`, [inProgress.id]);
  }
  const submitted = attempts.filter((a) => a.status === 'submitted');
  if (submitted.some((a) => a.passed)) return sendJSON(res, 409, { code: 'ALREADY_PASSED', message: 'Ya aprobaste este examen.' });
  if (submitted.length >= cfg.maxAttempts) return sendJSON(res, 403, { code: 'MAX_ATTEMPTS', message: 'Agotaste los intentos.' });
  const last = submitted[submitted.length - 1];
  if (last) {
    const until = new Date(new Date(last.submitted_at).getTime() + cfg.cooldownHours * 3600 * 1000);
    if (until > new Date()) {
      return sendJSON(res, 429, { code: 'COOLDOWN', cooldownUntil: until.toISOString(), message: 'Debes esperar antes de reintentar.' });
    }
  }
  const qids = await drawExamQuestions(bank.id, cfg.drawSize);
  if (!qids.length) return sendJSON(res, 409, { code: 'EMPTY_BANK', message: 'El banco de ítems está vacío.' });
  const attemptNo = (attempts.length ? Math.max(...attempts.map((a) => a.attempt_no)) : 0) + 1;
  const expiresAt = new Date(Date.now() + cfg.durationMinutes * 60 * 1000).toISOString();
  const ins = await pool.query(
    `INSERT INTO exam_attempts (user_id, resource_id, attempt_no, question_ids, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [user.id, params.resourceId, attemptNo, JSON.stringify(qids), expiresAt],
  );
  await pool.query(
    `INSERT INTO learning_events (user_id, course_id, resource_id, event_type, payload)
     VALUES ($1, $2, $3, 'exam_start', $4)`,
    [user.id, r.course_id, params.resourceId, JSON.stringify({ attemptNo })],
  ).catch(() => {});
  sendJSON(res, 200, {
    attemptId: ins.rows[0].id,
    attemptNo,
    expiresAt,
    durationMinutes: cfg.durationMinutes,
    questions: await loadAttemptQuestions(qids),
    resumed: false,
  });
});

async function loadAttemptQuestions(qids) {
  const ids = Array.isArray(qids) ? qids : [];
  if (!ids.length) return [];
  const rows = (
    await pool.query(
      `SELECT id, stem, options FROM item_bank_questions WHERE id = ANY($1)`,
      [ids],
    )
  ).rows;
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.filter((id) => byId.has(id)).map((id) => {
    const q = byId.get(id);
    return { id: q.id, stem: q.stem, options: q.options };
  });
}

route('POST', '/api/exams/attempts/:attemptId', async ({ res, user, params, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  if (!isUuid(params.attemptId)) return sendJSON(res, 400, { message: 'id inválido' });
  const at = (
    await pool.query(`SELECT * FROM exam_attempts WHERE id = $1 AND user_id = $2`, [params.attemptId, user.id])
  ).rows[0];
  if (!at) return sendJSON(res, 404, { message: 'Intento no encontrado' });
  if (at.status !== 'in_progress') return sendJSON(res, 409, { code: 'NOT_IN_PROGRESS', message: 'Este intento ya se cerró.' });
  const expired = new Date(at.expires_at) <= new Date();

  const rmeta = (
    await pool.query(
      `SELECT r.content_json, m.course_id FROM resources r JOIN modules m ON m.id = r.module_id WHERE r.id = $1`,
      [at.resource_id],
    )
  ).rows[0];
  const cfg = getExamConfig(rmeta && rmeta.content_json);
  const qids = Array.isArray(at.question_ids) ? at.question_ids : [];
  const qrows = (
    await pool.query(
      `SELECT id, correct_index, skill_tag FROM item_bank_questions WHERE id = ANY($1)`,
      [qids.length ? qids : ['00000000-0000-0000-0000-000000000000']],
    )
  ).rows;
  const keyById = new Map(qrows.map((q) => [q.id, q]));
  const answers = Array.isArray(body.answers) ? body.answers : [];
  let correct = 0;
  const perSkill = new Map();
  for (const qid of qids) {
    const k = keyById.get(qid);
    if (!k) continue;
    const given = answers.find((a) => String(a.questionId) === String(qid));
    const choice = given ? Number(given.choice) : null;
    const ok = !expired && choice === Number(k.correct_index);
    if (ok) correct += 1;
    const tag = k.skill_tag || '_';
    const s = perSkill.get(tag) || { correct: 0, total: 0 };
    s.total += 1;
    if (ok) s.correct += 1;
    perSkill.set(tag, s);
  }
  const score = qids.length ? Math.round((correct / qids.length) * 100) : 0;
  const passed = !expired && score >= cfg.passThreshold;
  await pool.query(
    `UPDATE exam_attempts SET answers = $2, score = $3, passed = $4,
       status = $5, submitted_at = now() WHERE id = $1`,
    [at.id, JSON.stringify(answers), score, passed, expired ? 'expired' : 'submitted'],
  );
  for (const [tag, s] of perSkill) {
    if (tag === '_') continue;
    await pool.query(
      `INSERT INTO skill_mastery (user_id, course_id, skill_tag, correct, total)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, course_id, skill_tag) DO UPDATE SET
         correct = skill_mastery.correct + EXCLUDED.correct,
         total = skill_mastery.total + EXCLUDED.total, last_seen = now()`,
      [user.id, rmeta.course_id, tag, s.correct, s.total],
    );
  }
  await pool.query(
    `INSERT INTO learning_events (user_id, course_id, resource_id, event_type, payload)
     VALUES ($1, $2, $3, $4, $5)`,
    [user.id, rmeta.course_id, at.resource_id, passed ? 'exam_submit' : 'exam_fail', JSON.stringify({ score })],
  ).catch(() => {});
  if (passed) {
    await pool.query(
      `INSERT INTO progress (user_id, resource_id, completed) VALUES ($1, $2, true)
       ON CONFLICT (user_id, resource_id) DO UPDATE SET completed = true, completed_at = now()`,
      [user.id, at.resource_id],
    );
    await evaluateCourseCompletion(user.id, rmeta.course_id).catch(() => {});
  }
  const reviewItems = passed ? [] : await weakSkillLessons(user.id, rmeta.course_id, at.resource_id);
  sendJSON(res, 200, { score, passed, correct, total: qids.length, expired, reviewItems });
});

// --- rúbricas ---
route('GET', '/api/rubrics/:slug', async ({ res, user, params }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const rub = await rubricBySlug(params.slug);
  if (!rub) return sendJSON(res, 404, { message: 'Rúbrica no encontrada' });
  sendJSON(res, 200, rub);
});

// --- TFM: proceso de 4 hitos con director ---
function tfmRole(user) {
  return user && (user.role === 'director_tfm' || user.role === 'instructor' || user.role === 'admin');
}

route('GET', '/api/tfm', async ({ res, user, query }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const targetUserId = query.userId && tfmRole(user) && isUuid(query.userId) ? query.userId : user.id;
  const milestones = (await pool.query('SELECT * FROM tfm_milestones ORDER BY order_index')).rows;
  const enr = (
    await pool.query(
      `SELECT te.*, d.name AS director_name FROM tfm_enrollments te
         LEFT JOIN users d ON d.id = te.director_id WHERE te.user_id = $1`,
      [targetUserId],
    )
  ).rows[0];
  let subs = [];
  if (enr) {
    subs = (
      await pool.query(
        `SELECT tms.*, s.content, s.repo_url, s.status AS sub_status, g.score, g.feedback, g.rubric,
                (SELECT coalesce(json_agg(json_build_object('label',sf.label,'type',sf.file_type,'url',sf.url)), '[]'::json)
                   FROM submission_files sf WHERE sf.submission_id = s.id) AS files
           FROM tfm_milestone_submissions tms
           JOIN submissions s ON s.id = tms.submission_id
           LEFT JOIN grades g ON g.submission_id = s.id
          WHERE tms.tfm_id = $1`,
        [enr.id],
      )
    ).rows;
  }
  const bySlug = Object.fromEntries(subs.map((s) => [s.milestone_slug, s]));
  const score = enr ? await tfmWeightedScore(enr.id) : { allApproved: false, weighted: 0 };
  sendJSON(res, 200, {
    enrollment: enr
      ? { id: enr.id, title: enr.title, status: enr.status, directorName: enr.director_name || null, directorId: enr.director_id }
      : null,
    weightedScore: score.weighted,
    milestones: milestones.map((m) => {
      const s = bySlug[m.slug];
      return {
        slug: m.slug,
        title: m.title,
        description: m.description,
        weight: Number(m.weight),
        requiresVideo: m.requires_video,
        templateUrl: m.template_url,
        rubricSlug: m.rubric_slug,
        submission: s
          ? {
              id: s.submission_id,
              reviewId: s.id,
              content: s.content,
              repoUrl: s.repo_url || null,
              files: s.files || [],
              defenseVideoUrl: s.defense_video_url || null,
              status: s.status,
              directorNote: s.director_note || null,
              grade: s.score != null ? Number(s.score) : null,
              feedback: s.feedback || null,
              rubric: s.rubric || null,
            }
          : null,
      };
    }),
  });
});

route('POST', '/api/tfm/enroll', async ({ res, user }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  await pool.query(
    `INSERT INTO tfm_enrollments (user_id, status) VALUES ($1, 'in_progress')
     ON CONFLICT (user_id) DO UPDATE SET status = 'in_progress', updated_at = now()`,
    [user.id],
  );
  sendJSON(res, 200, { ok: true });
});

route('POST', '/api/tfm/milestones/:slug', async ({ res, user, params, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const ms = (await pool.query('SELECT * FROM tfm_milestones WHERE slug = $1', [params.slug])).rows[0];
  if (!ms) return sendJSON(res, 404, { message: 'Hito no encontrado' });
  const enr = (
    await pool.query(
      `INSERT INTO tfm_enrollments (user_id, status) VALUES ($1, 'in_progress')
       ON CONFLICT (user_id) DO UPDATE SET updated_at = now() RETURNING *`,
      [user.id],
    )
  ).rows[0];
  const content = String(body.content || '').trim();
  const files = cleanFiles(body.files);
  const repoUrl = body.repoUrl && URL_RE.test(String(body.repoUrl).trim()) ? String(body.repoUrl).trim() : null;
  const videoUrl = body.defenseVideoUrl && URL_RE.test(String(body.defenseVideoUrl).trim()) ? String(body.defenseVideoUrl).trim() : null;
  if (content.length < 30 && !files.length && !repoUrl) {
    return sendJSON(res, 400, { message: 'Aporta el documento del hito (texto y/o enlaces).' });
  }
  if (ms.requires_video && !videoUrl) return sendJSON(res, 400, { message: 'Este hito requiere el enlace al vídeo de defensa.' });

  const tfmCourse = await findCourseRow('master-tfm');
  const sub = (
    await pool.query(
      `INSERT INTO submissions (user_id, resource_id, course_id, content, kind, repo_url, status)
       VALUES ($1, NULL, $2, $3, 'tfm', $4, 'submitted') RETURNING id`,
      [user.id, tfmCourse ? tfmCourse.id : null, content, repoUrl],
    )
  ).rows[0];
  for (const f of files) {
    await pool.query(`INSERT INTO submission_files (submission_id, label, file_type, url) VALUES ($1,$2,$3,$4)`, [
      sub.id, f.label, f.file_type, f.url,
    ]);
  }
  await pool.query(
    `INSERT INTO tfm_milestone_submissions (tfm_id, milestone_slug, submission_id, defense_video_url, status)
     VALUES ($1, $2, $3, $4, 'submitted')
     ON CONFLICT (tfm_id, milestone_slug) DO UPDATE SET
       submission_id = EXCLUDED.submission_id, defense_video_url = EXCLUDED.defense_video_url,
       status = 'submitted', updated_at = now()`,
    [enr.id, ms.slug, sub.id, videoUrl],
  );
  // Notifica al director si hay uno asignado.
  if (enr.director_id) {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, 'grade', 'Hito de TFM para revisar', $2)`,
      [enr.director_id, `${user.name} entregó "${ms.title}".`],
    );
  }
  sendJSON(res, 200, { ok: true });
});

route('PUT', '/api/tfm/:tfmId/director', async ({ res, user, params, body }) => {
  if (!user || user.role !== 'admin') return sendJSON(res, 403, { message: 'Forbidden' });
  if (!isUuid(params.tfmId) || !isUuid(body.directorId)) return sendJSON(res, 400, { message: 'Datos inválidos' });
  const d = (await pool.query(`SELECT role FROM users WHERE id = $1`, [body.directorId])).rows[0];
  if (!d || !['director_tfm', 'instructor', 'admin'].includes(d.role)) {
    return sendJSON(res, 400, { message: 'El director debe tener rol director_tfm o instructor.' });
  }
  await pool.query(`UPDATE tfm_enrollments SET director_id = $2, updated_at = now() WHERE id = $1`, [params.tfmId, body.directorId]);
  sendJSON(res, 200, { ok: true });
});

route('PUT', '/api/tfm/milestones/:subId/review', async ({ res, user, params, body }) => {
  if (!tfmRole(user)) return sendJSON(res, 403, { message: 'Forbidden' });
  if (!isUuid(params.subId)) return sendJSON(res, 400, { message: 'id inválido' });
  const row = (
    await pool.query(
      `SELECT tms.*, m.rubric_slug, te.user_id AS student_id
         FROM tfm_milestone_submissions tms
         JOIN tfm_milestones m ON m.slug = tms.milestone_slug
         JOIN tfm_enrollments te ON te.id = tms.tfm_id
        WHERE tms.id = $1`,
      [params.subId],
    )
  ).rows[0];
  if (!row) return sendJSON(res, 404, { message: 'Entrega de hito no encontrada' });
  const decision = body.decision === 'approve' ? 'approved' : body.decision === 'changes' ? 'changes_requested' : null;
  if (!decision) return sendJSON(res, 400, { message: 'decision debe ser "approve" o "changes"' });

  if (decision === 'approved') {
    const rub = await rubricBySlug(row.rubric_slug);
    if (!rub || !Array.isArray(body.criteria)) return sendJSON(res, 400, { message: 'Aprobar exige calificar por rúbrica.' });
    const byKey = new Map(rub.criteria.map((c) => [c.key, c]));
    let sum = 0;
    const snap = [];
    for (const c of body.criteria) {
      const def = byKey.get(c.key);
      if (!def) return sendJSON(res, 400, { message: `Criterio desconocido: ${c.key}` });
      const pts = Number(c.levelPoints);
      const maxPts = Math.max(...def.levels.map((l) => l.points));
      if (Number.isNaN(pts) || pts < 0 || pts > maxPts) return sendJSON(res, 400, { message: `Puntos fuera de rango: ${c.key}` });
      const lvl = def.levels.find((l) => l.points === pts);
      sum += pts;
      snap.push({ key: c.key, levelPoints: pts, levelLabel: lvl ? lvl.label : null, comment: c.comment || '' });
    }
    const score = Math.round((sum / rub.totalPoints) * 100);
    await pool.query(
      `INSERT INTO grades (submission_id, graded_by, score, feedback, rubric, rubric_slug)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (submission_id) DO UPDATE SET score = EXCLUDED.score, feedback = EXCLUDED.feedback,
         graded_by = EXCLUDED.graded_by, rubric = EXCLUDED.rubric, rubric_slug = EXCLUDED.rubric_slug, graded_at = now()`,
      [row.submission_id, user.id, score, body.feedback || '', JSON.stringify({ rubricSlug: row.rubric_slug, criteria: snap, computedScore: score }), row.rubric_slug],
    );
    await pool.query(`UPDATE submissions SET status = 'graded' WHERE id = $1`, [row.submission_id]);
  }
  await pool.query(
    `UPDATE tfm_milestone_submissions SET status = $2, director_note = $3, updated_at = now() WHERE id = $1`,
    [params.subId, decision, body.note || null],
  );
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, 'grade', 'Revisión de hito de TFM', $2)`,
    [row.student_id, decision === 'approved' ? 'Un hito de tu TFM fue aprobado.' : 'Un hito de tu TFM necesita cambios.'],
  );
  const tfmCourse = await findCourseRow('master-tfm');
  if (tfmCourse) await evaluateTfmCompletion(row.student_id, tfmCourse).catch(() => {});
  sendJSON(res, 200, { ok: true });
});

// --- reanudar donde quedó ---
route('GET', '/api/courses/:id/resume', async ({ res, user, params }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const course = await findCourseRow(params.id);
  if (!course) return sendJSON(res, 404, { message: 'Course not found' });
  const rp = (
    await pool.query(
      `SELECT resource_id FROM resume_positions WHERE user_id = $1 AND course_id = $2`,
      [user.id, course.id],
    )
  ).rows[0];
  sendJSON(res, 200, { resourceId: rp ? rp.resource_id : null });
});

route('PUT', '/api/courses/:id/resume', async ({ res, user, params, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const course = await findCourseRow(params.id);
  if (!course || !isUuid(body.resourceId)) return sendJSON(res, 400, { message: 'Datos inválidos' });
  await pool.query(
    `INSERT INTO resume_positions (user_id, course_id, resource_id) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, course_id) DO UPDATE SET resource_id = EXCLUDED.resource_id, updated_at = now()`,
    [user.id, course.id, body.resourceId],
  );
  sendJSON(res, 200, { ok: true });
});

// --- eventos de aprendizaje (fire-and-forget; base de la analítica de Fase 3) ---
route('POST', '/api/events', async ({ res, user, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const type = String(body.eventType || '').slice(0, 40);
  if (!type) return sendJSON(res, 400, { message: 'eventType requerido' });
  await pool
    .query(
      `INSERT INTO learning_events (user_id, resource_id, event_type, payload)
       VALUES ($1, $2, $3, $4)`,
      [user.id, isUuid(body.resourceId) ? body.resourceId : null, type, JSON.stringify(body.payload || {})],
    )
    .catch(() => {});
  sendJSON(res, 200, { ok: true });
});

// --- enrollments ---
route('GET', '/api/enrollments', async ({ res, user }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const { rows } = await pool.query(
    `SELECT e.course_id, e.role, c.title FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = $1`,
    [user.id],
  );
  sendJSON(res, 200, rows.map((r) => ({ courseId: r.course_id, role: r.role, courseTitle: r.title })));
});

route('POST', '/api/enrollments', async ({ res, user, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const course = await findCourseRow(body.courseId || '');
  if (!course) return sendJSON(res, 404, { message: 'Course not found' });
  await pool.query(
    `INSERT INTO enrollments (user_id, course_id, role) VALUES ($1, $2, 'student')
     ON CONFLICT (user_id, course_id) DO NOTHING`,
    [user.id, course.id],
  );
  sendJSON(res, 201, { ok: true, courseId: course.id });
});

// --- submissions / grades ---
route('POST', '/api/submissions', async ({ res, user, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const { resourceId, courseId, content, repoUrl } = body;
  const kind = ['text', 'handson', 'tfm'].includes(body.kind) ? body.kind : 'text';
  const files = cleanFiles(body.files);
  if ((!content || !content.trim()) && kind === 'text') {
    return sendJSON(res, 400, { message: 'El contenido es obligatorio' });
  }
  if (kind === 'handson' && !files.length && !(repoUrl && URL_RE.test(String(repoUrl).trim()))) {
    return sendJSON(res, 400, { message: 'Adjunta al menos un enlace (repositorio o artefacto).' });
  }
  const course = courseId ? await findCourseRow(courseId) : null;
  const { rows } = await pool.query(
    `INSERT INTO submissions (user_id, resource_id, course_id, content, kind, repo_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'submitted') RETURNING *`,
    [
      user.id,
      isUuid(resourceId) ? resourceId : null,
      course ? course.id : null,
      (content || '').trim(),
      kind,
      repoUrl && URL_RE.test(String(repoUrl).trim()) ? String(repoUrl).trim().slice(0, 2000) : null,
    ],
  );
  const sub = rows[0];
  for (const f of files) {
    await pool.query(
      `INSERT INTO submission_files (submission_id, label, file_type, url) VALUES ($1, $2, $3, $4)`,
      [sub.id, f.label, f.file_type, f.url],
    );
  }
  sendJSON(res, 201, submissionRow({ ...sub, student_name: user.name, files }));
});

route('GET', '/api/submissions', async ({ res, user, query }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const clauses = [];
  const params = [];
  if (user.role === 'student') {
    params.push(user.id);
    clauses.push(`s.user_id = $${params.length}`);
  }
  if (query.status) {
    params.push(query.status);
    clauses.push(`s.status = $${params.length}`);
  }
  if (query.courseId && isUuid(query.courseId)) {
    params.push(query.courseId);
    clauses.push(`s.course_id = $${params.length}`);
  }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const { rows } = await pool.query(
    `SELECT s.*, u.name AS student_name, g.score, g.feedback, g.rubric, g.rubric_slug, g.llm_suggestion, g.graded_at, g.graded_by,
            rr.content_json->>'rubricSlug' AS resource_rubric_slug,
            (SELECT coalesce(json_agg(json_build_object('label',sf.label,'type',sf.file_type,'url',sf.url) ORDER BY sf.created_at), '[]'::json) FROM submission_files sf WHERE sf.submission_id = s.id) AS files
       FROM submissions s JOIN users u ON u.id = s.user_id
       LEFT JOIN grades g ON g.submission_id = s.id
       LEFT JOIN resources rr ON rr.id = s.resource_id
       ${where}
       ORDER BY s.submitted_at DESC`,
    params,
  );
  sendJSON(res, 200, rows.map(submissionRow));
});

route('PUT', '/api/submissions/:id/grade', async ({ res, user, params, body }) => {
  if (!user || user.role === 'student') return sendJSON(res, 403, { message: 'Forbidden' });
  if (!isUuid(params.id)) return sendJSON(res, 400, { message: 'id inválido' });
  const sub = await pool.query('SELECT * FROM submissions WHERE id = $1', [params.id]);
  if (!sub.rowCount) return sendJSON(res, 404, { message: 'Entrega no encontrada' });

  // Nueva vía: calificación por rúbrica { rubricSlug, criteria:[{key, levelPoints, comment}], feedback }
  // Vía retro-compatible: { grade: 0-100, feedback } (se conserva una release).
  let grade;
  let rubricSnapshot = null;
  let rubricSlug = body.rubricSlug || null;
  if (rubricSlug && Array.isArray(body.criteria)) {
    const rub = await rubricBySlug(rubricSlug);
    if (!rub) return sendJSON(res, 400, { message: 'Rúbrica no encontrada' });
    const byKey = new Map(rub.criteria.map((c) => [c.key, c]));
    let sum = 0;
    const snap = [];
    for (const c of body.criteria) {
      const def = byKey.get(c.key);
      if (!def) return sendJSON(res, 400, { message: `Criterio desconocido: ${c.key}` });
      const pts = Number(c.levelPoints);
      const maxPts = Math.max(...def.levels.map((l) => l.points));
      if (Number.isNaN(pts) || pts < 0 || pts > maxPts) {
        return sendJSON(res, 400, { message: `Puntos fuera de rango en ${c.key}` });
      }
      if (pts < maxPts && !(c.comment && c.comment.trim())) {
        return sendJSON(res, 400, { message: `Comenta el criterio "${def.title}" si no está en el nivel máximo.` });
      }
      const lvl = def.levels.find((l) => l.points === pts);
      sum += pts;
      snap.push({ key: c.key, levelPoints: pts, levelLabel: lvl ? lvl.label : null, comment: c.comment || '' });
    }
    grade = Math.round((sum / rub.totalPoints) * 100);
    rubricSnapshot = { rubricSlug, rubricVersion: rub.version, criteria: snap, computedScore: grade, gradedBy: user.id };
  } else {
    grade = Number(body.grade);
    if (Number.isNaN(grade) || grade < 0 || grade > 100) {
      return sendJSON(res, 400, { message: 'La calificación debe estar entre 0 y 100' });
    }
  }

  await pool.query(
    `INSERT INTO grades (submission_id, graded_by, score, feedback, rubric, rubric_slug)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (submission_id) DO UPDATE SET score = EXCLUDED.score, feedback = EXCLUDED.feedback,
       graded_by = EXCLUDED.graded_by, rubric = EXCLUDED.rubric, rubric_slug = EXCLUDED.rubric_slug, graded_at = now()`,
    [params.id, user.id, grade, body.feedback || '', rubricSnapshot ? JSON.stringify(rubricSnapshot) : null, rubricSlug],
  );
  await pool.query(`UPDATE submissions SET status = 'graded', updated_at = now() WHERE id = $1`, [params.id]);
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES ($1, 'grade', 'Entrega calificada', $2)`,
    [sub.rows[0].user_id, `Tu entrega recibió ${grade}/100`],
  );
  // Una entrega de tipo "project" calificada >= 70 marca ese recurso como
  // completado. La emisión del certificado ya NO ocurre aquí: la decide
  // evaluateCourseCompletion, que exige lecciones + proyecto + examen.
  if (grade >= 70 && sub.rows[0].resource_id) {
    const resRow = (
      await pool.query(
        `SELECT r.id, m.course_id FROM resources r
           JOIN modules m ON m.id = r.module_id
          WHERE r.id = $1 AND r.type IN ('project', 'assignment')`,
        [sub.rows[0].resource_id],
      )
    ).rows[0];
    if (resRow) {
      await pool.query(
        `INSERT INTO progress (user_id, resource_id, completed) VALUES ($1, $2, true)
         ON CONFLICT (user_id, resource_id) DO UPDATE SET completed = true, completed_at = now()`,
        [sub.rows[0].user_id, resRow.id],
      );
      await evaluateCourseCompletion(sub.rows[0].user_id, resRow.course_id);
    }
  }
  sendJSON(res, 200, { ok: true });
});

// Asistencia de calificación por LLM: PROPONE, nunca decide. La propuesta se
// guarda en grades.llm_suggestion; el instructor la revisa y envía la nota real
// por PUT /grade. Sin ANTHROPIC_API_KEY devuelve 501.
route('POST', '/api/submissions/:id/grade-suggestion', async ({ res, user, params, body }) => {
  if (!user || user.role === 'student') return sendJSON(res, 403, { message: 'Forbidden' });
  if (!isUuid(params.id)) return sendJSON(res, 400, { message: 'id inválido' });
  if (!llm.enabled()) return sendJSON(res, 501, { code: 'LLM_DISABLED', message: 'Asistencia de IA no configurada.' });
  const sub = (await pool.query('SELECT content FROM submissions WHERE id = $1', [params.id])).rows[0];
  if (!sub) return sendJSON(res, 404, { message: 'Entrega no encontrada' });
  const rub = await rubricBySlug(body.rubricSlug || '');
  if (!rub) return sendJSON(res, 400, { message: 'rubricSlug requerido y válido' });
  let suggestion = null;
  try {
    suggestion = await llm.gradeSuggestion({ rubric: rub, submissionText: sub.content });
  } catch (e) {
    return sendJSON(res, 502, { message: 'El modelo no respondió: ' + e.message });
  }
  // Solo se persiste si ya existe una fila de calificación (no se crea una fila
  // fantasma con nota 0). Si no existe, el frontend guarda la propuesta en
  // estado y la muestra al calificar.
  await pool
    .query(`UPDATE grades SET llm_suggestion = $2 WHERE submission_id = $1`, [params.id, JSON.stringify(suggestion)])
    .catch(() => {});
  sendJSON(res, 200, { suggestion });
});

// --- quizzes ---
// El payload NUNCA incluye la respuesta correcta. La calificación es solo de
// servidor (POST /api/quiz-responses en Fase 0; motor de intentos en Fase 1).
route('GET', '/api/quizzes/:id', async ({ res, user, params }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  if (!isUuid(params.id)) return sendJSON(res, 404, { message: 'Quiz no encontrado' });
  const { rows } = await pool.query(
    `SELECT r.id, r.title, r.content_json, m.course_id
       FROM resources r JOIN modules m ON m.id = r.module_id
      WHERE r.id = $1 AND r.type IN ('exam', 'lesson')`,
    [params.id],
  );
  if (!rows[0]) return sendJSON(res, 404, { message: 'Quiz no encontrado' });
  const cj = rows[0].content_json || {};
  const raw = Array.isArray(cj.questions) ? cj.questions : Array.isArray(cj.quiz) ? cj.quiz : [];
  const questions = raw.map((q, i) => ({
    id: String(i),
    text: q.q,
    type: 'multiple-choice',
    options: (q.opts || []).map((o, j) => ({ id: String(j), text: o })),
  }));
  sendJSON(res, 200, {
    id: rows[0].id,
    resourceId: rows[0].id,
    courseId: rows[0].course_id,
    title: rows[0].title,
    questions,
  });
});

route('POST', '/api/quiz-responses', async ({ res, user, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const { quizId, answers = [] } = body;
  if (!isUuid(quizId)) return sendJSON(res, 400, { message: 'quizId inválido' });
  const { rows } = await pool.query(
    `SELECT r.content_json, m.course_id FROM resources r JOIN modules m ON m.id = r.module_id WHERE r.id = $1`,
    [quizId],
  );
  if (!rows[0]) return sendJSON(res, 404, { message: 'Quiz no encontrado' });
  const cj = rows[0].content_json || {};
  const raw = Array.isArray(cj.questions) ? cj.questions : Array.isArray(cj.quiz) ? cj.quiz : [];
  let correct = 0;
  raw.forEach((q, i) => {
    const given = (answers.find((a) => String(a.questionId) === String(i)) || {}).answer;
    if (given != null && String(given) === String(q.a)) correct += 1;
  });
  const score = raw.length ? Math.round((correct / raw.length) * 100) : 0;
  const passed = score >= 70;
  await pool.query(
    `INSERT INTO quiz_responses (user_id, resource_id, answers, score, passed) VALUES ($1, $2, $3, $4, $5)`,
    [user.id, quizId, JSON.stringify(answers), score, passed],
  );
  // El progreso del recurso solo se acredita si se APRUEBA (un examen suspenso
  // ya no infla el porcentaje del curso ni abre el gate de la siguiente asignatura).
  if (passed) {
    await pool.query(
      `INSERT INTO progress (user_id, resource_id, completed) VALUES ($1, $2, true)
       ON CONFLICT (user_id, resource_id) DO NOTHING`,
      [user.id, quizId],
    );
    // La certificación la decide evaluateCourseCompletion (lecciones + proyecto + examen).
    await evaluateCourseCompletion(user.id, rows[0].course_id);
  }
  sendJSON(res, 200, { score, passed, correct, total: raw.length });
});

// --- certificates ---
route('GET', '/api/certificates', async ({ res, user }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const { rows } = await pool.query(
    `SELECT id, user_id, course_id, course_name, kind, requirements, issued_at
       FROM certificates WHERE user_id = $1 ORDER BY issued_at DESC`,
    [user.id],
  );
  sendJSON(
    res,
    200,
    rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      courseId: r.course_id,
      courseName: r.course_name,
      kind: r.kind || 'asignatura',
      requirements: r.requirements || {},
      issuedAt: r.issued_at,
      expiresAt: null,
    })),
  );
});

// --- notifications ---
route('GET', '/api/notifications', async ({ res, user }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const { rows } = await pool.query(
    `SELECT id, type, title, message, read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [user.id],
  );
  sendJSON(
    res,
    200,
    rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      message: r.message,
      read: r.read,
      createdAt: r.created_at,
    })),
  );
});

route('PUT', '/api/notifications/:id/read', async ({ res, user, params }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  if (!isUuid(params.id)) return sendJSON(res, 400, { message: 'id inválido' });
  await pool.query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [params.id, user.id]);
  sendJSON(res, 200, { ok: true });
});

// --- admin: sincronizar el catálogo bajo demanda (upsert NO destructivo) ---
// Solo admin. El seed ya no hace TRUNCATE: hace upsert por clave estable, así
// que ninguna entrega, nota, progreso ni certificado de estudiante se pierde.
route('POST', '/api/admin/reseed', async ({ res, user }) => {
  if (!user || user.role !== 'admin') return sendJSON(res, 403, { message: 'Forbidden' });
  console.log(`[admin] sync de catálogo disparado por ${user.email}`);
  await require('./db/seed')();
  sendJSON(res, 200, { ok: true, message: 'Catálogo sincronizado (upsert no destructivo).' });
});

// ---------- servidor ----------
const server = http.createServer(async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (!checkRateLimit(ip)) return sendJSON(res, 429, { message: 'Demasiadas peticiones. Intenta más tarde.' });

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }

  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname.replace(/\/+$/, '') || '/';

  const match = routes.find((r) => r.method === req.method && r.pattern.test(pathname));
  if (!match) return sendJSON(res, 404, { message: 'Not found' });

  const isHealth = pathname === '/api/health' || pathname === '/health';
  if (!dbReady && !isHealth) {
    return sendJSON(res, 503, { message: 'Servicio inicializándose, reintenta en unos segundos.' });
  }

  try {
    const params = match.pattern.exec(pathname).groups || {};
    const needsBody = ['POST', 'PUT', 'PATCH'].includes(req.method);
    const body = needsBody ? await readBody(req) : {};
    const user = await getAuthUser(req);
    await match.handler({ req, res, params, query: parsed.query, body, user });
  } catch (err) {
    console.error(`[${req.method} ${pathname}]`, err.message);
    if (!res.headersSent) sendJSON(res, 500, { message: 'Error interno del servidor' });
  }
});

async function prepareDatabase() {
  await runMigrations();
  // AUTO_SEED:
  //   'false' -> nunca sembrar
  //   'sync'  -> sincronizar el catálogo en cada arranque (upsert idempotente)
  //   (resto) -> solo sembrar si el catálogo está "vacío" (<=1: solo el contenedor)
  const mode = process.env.AUTO_SEED || 'auto';
  if (mode !== 'false') {
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM courses WHERE COALESCE(meta->>'isProgramContainer','') <> 'true'`,
    );
    if (mode === 'sync' || rows[0].n === 0) {
      console.log(`[start] seed (${mode === 'sync' ? 'sync' : 'catálogo vacío'})...`);
      await require('./db/seed')();
    }
  }
  dbReady = true;
  console.log('[start] base de datos lista.');
}

async function start() {
  // Escuchar primero: /api/health no depende de la BD, así el healthcheck de
  // Railway pasa mientras corren migraciones y seed inicial.
  server.listen(PORT, () => {
    console.log(`✅ Campus Posgrado API en http://localhost:${PORT}/api  (PostgreSQL)`);
  });

  setInterval(() => {
    pool.query('DELETE FROM sessions WHERE expires_at < now()').catch(() => {});
  }, 3600 * 1000).unref();

  try {
    await prepareDatabase();
  } catch (err) {
    console.error('[start] fallo preparando la BD:', err.message);
    // No matamos el proceso: /api/health sigue respondiendo y Railway no
    // entra en crash-loop. Los endpoints con BD devolverán 503 hasta que se
    // resuelva (p. ej. falta DATABASE_URL).
  }
}

start();

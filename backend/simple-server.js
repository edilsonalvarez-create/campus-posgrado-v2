// Campus Posgrado v2 — API (Node http nativo + PostgreSQL)
// Contrato de rutas y formas de respuesta compatible con el frontend existente.
const http = require('http');
const url = require('url');
const crypto = require('crypto');
const pool = require('./db/pool');
const runMigrations = require('./db/migrate');

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
    status: r.status,
    submittedAt: r.submitted_at,
    grade: r.score != null ? Number(r.score) : undefined,
    feedback: r.feedback || undefined,
    gradedAt: r.graded_at || undefined,
    gradedBy: r.graded_by || undefined,
  };
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
    // Fase 0: se comprueba contra quiz_responses. Fase 1 lo reemplaza por exam_attempts.
    const passed = (
      await pool.query(
        `SELECT bool_or(qr.passed) AS ok FROM quiz_responses qr
           JOIN resources r ON r.id = qr.resource_id JOIN modules m ON m.id = r.module_id
          WHERE qr.user_id = $1 AND m.course_id = $2 AND r.type = 'exam'`,
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
    `SELECT s.*, u.name AS student_name, g.score, g.feedback, g.graded_at, g.graded_by
       FROM submissions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN grades g ON g.submission_id = s.id
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

route('POST', '/api/progress', async ({ res, user, body }) => {
  if (!user) return sendJSON(res, 401, { message: 'Unauthorized' });
  const { resourceId, completed = true } = body;
  if (!isUuid(resourceId)) return sendJSON(res, 400, { message: 'resourceId inválido' });
  if (completed) {
    await pool.query(
      `INSERT INTO progress (user_id, resource_id, completed) VALUES ($1, $2, true)
       ON CONFLICT (user_id, resource_id) DO UPDATE SET completed = true, completed_at = now()`,
      [user.id, resourceId],
    );
  } else {
    await pool.query('DELETE FROM progress WHERE user_id = $1 AND resource_id = $2', [user.id, resourceId]);
  }
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
  const { resourceId, courseId, content } = body;
  if (!content || !content.trim()) return sendJSON(res, 400, { message: 'El contenido es obligatorio' });
  const course = courseId ? await findCourseRow(courseId) : null;
  const { rows } = await pool.query(
    `INSERT INTO submissions (user_id, resource_id, course_id, content, status)
     VALUES ($1, $2, $3, $4, 'submitted') RETURNING *`,
    [user.id, isUuid(resourceId) ? resourceId : null, course ? course.id : null, content],
  );
  sendJSON(res, 201, submissionRow({ ...rows[0], student_name: user.name }));
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
    `SELECT s.*, u.name AS student_name, g.score, g.feedback, g.graded_at, g.graded_by
       FROM submissions s JOIN users u ON u.id = s.user_id
       LEFT JOIN grades g ON g.submission_id = s.id
       ${where}
       ORDER BY s.submitted_at DESC`,
    params,
  );
  sendJSON(res, 200, rows.map(submissionRow));
});

route('PUT', '/api/submissions/:id/grade', async ({ res, user, params, body }) => {
  if (!user || user.role === 'student') return sendJSON(res, 403, { message: 'Forbidden' });
  if (!isUuid(params.id)) return sendJSON(res, 400, { message: 'id inválido' });
  const grade = Number(body.grade);
  if (Number.isNaN(grade) || grade < 0 || grade > 100) {
    return sendJSON(res, 400, { message: 'La calificación debe estar entre 0 y 100' });
  }
  const sub = await pool.query('SELECT * FROM submissions WHERE id = $1', [params.id]);
  if (!sub.rowCount) return sendJSON(res, 404, { message: 'Entrega no encontrada' });
  await pool.query(
    `INSERT INTO grades (submission_id, graded_by, score, feedback) VALUES ($1, $2, $3, $4)
     ON CONFLICT (submission_id) DO UPDATE SET score = EXCLUDED.score, feedback = EXCLUDED.feedback, graded_by = EXCLUDED.graded_by, graded_at = now()`,
    [params.id, user.id, grade, body.feedback || ''],
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

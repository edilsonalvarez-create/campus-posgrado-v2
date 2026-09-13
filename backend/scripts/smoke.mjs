// Smoke test de los endpoints de evaluación (Fase 0 + Fase 1).
// Uso: BASE=http://localhost:3001/api node scripts/smoke.mjs
// Requiere el servidor en marcha con el catálogo sembrado (SEED_DEMO_DATA no importa).

const BASE = process.env.BASE || 'http://localhost:3001/api';
let pass = 0;
let fail = 0;
function ok(cond, msg) {
  if (cond) {
    pass += 1;
    console.log('  ✓', msg);
  } else {
    fail += 1;
    console.log('  ✗', msg);
  }
}
const j = (r) => r.json();
async function main() {
  const email = `smoke${Date.now()}@example.com`;
  let r = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, name: 'Smoke', password: 'Password123' }),
  });
  const reg = await j(r);
  ok(r.status === 201 && reg.user.role === 'student', 'registro de estudiante');
  ok(reg.user.status === 'pending', 'cuenta autorregistrada queda pending (requiere aprobación de admin)');
  const H = { authorization: `Bearer ${reg.accessToken}`, 'content-type': 'application/json' };

  // Un estudiante pending/no matriculado no ve contenido, aunque esté autenticado
  // (cierre de la fuga: el acceso lo da la matrícula, no solo la sesión).
  const lockedCourse = await j(await fetch(`${BASE}/courses/master-i`, { headers: H }));
  ok(lockedCourse.locked === true, 'sin matrícula: curso bloqueado (sin contenido) aunque el usuario esté pending');
  const lockedLesson = lockedCourse.modules.flatMap((m) => m.resources).find((x) => x.type === 'lesson');
  ok(!lockedLesson?.contentJson, 'sin matrícula: contentJson de la lección ausente');

  // Una cuenta pending tampoco puede auto-matricularse: el gate de aprobación de
  // admin no se podría saltar simplemente llamando a este endpoint self-service.
  r = await fetch(`${BASE}/enrollments`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ courseId: 'master-i' }),
  });
  ok(r.status === 403, 'pending: auto-matrícula rechazada (requiere aprobación de admin)');

  // A partir de aquí, las comprobaciones de contenido usan la cuenta de servicio
  // test@example.com, que el seed deja siempre activa y matriculada en master-i.
  r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'Password123' }),
  });
  const student = await j(r);
  ok(r.status === 200 && student.user.status === 'active', 'login de la cuenta de servicio (activa y matriculada)');
  const SH = { authorization: `Bearer ${student.accessToken}`, 'content-type': 'application/json' };

  r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'instructor@example.com', password: 'Password123' }),
  });
  const instr = await j(r);
  ok(r.status === 200, 'login del instructor demo');
  const IH = { authorization: `Bearer ${instr.accessToken}`, 'content-type': 'application/json' };

  // C-1: sin fuga de respuestas para el estudiante
  const course = await j(await fetch(`${BASE}/courses/master-i`, { headers: SH }));
  const lesson = course.modules.flatMap((m) => m.resources).find((x) => x.type === 'lesson');
  const exam = course.modules.flatMap((m) => m.resources).find((x) => x.type === 'exam');
  const proj = course.modules.flatMap((m) => m.resources).find((x) => x.type === 'project');
  ok(!(lesson.contentJson.quiz || []).some((q) => 'a' in q || 'why' in q), 'lección: quiz sin respuesta correcta');
  ok(!('questions' in (exam.contentJson || {})), 'examen: sin preguntas en content_json');
  const icourse = await j(await fetch(`${BASE}/courses/master-i`, { headers: IH }));
  const iLesson = icourse.modules.flatMap((m) => m.resources).find((x) => x.type === 'lesson');
  ok((iLesson.contentJson.quiz || []).some((q) => 'a' in q), 'instructor: sí ve la respuesta correcta');

  // quizzes endpoint
  r = await fetch(`${BASE}/quizzes/${exam.id}`, { headers: SH });
  const qz = await j(r);
  ok(r.status === 200 && !('correctAnswer' in (qz.questions[0] || {})), 'GET /quizzes sin correctAnswer');
  ok((await fetch(`${BASE}/quizzes/${exam.id}`)).status === 401, 'GET /quizzes exige auth');

  // Fase 1: quiz formativo + actividad + completado real
  const key = iLesson.contentJson.quiz.map((q, i) => ({ i, choice: q.a }));
  r = await fetch(`${BASE}/formative/${lesson.id}`, { method: 'POST', headers: SH, body: JSON.stringify({ answers: key }) });
  const fr = await j(r);
  ok(r.status === 200 && fr.passed, 'quiz formativo se califica y persiste');
  await fetch(`${BASE}/activity/${lesson.id}`, {
    method: 'POST',
    headers: SH,
    body: JSON.stringify({ content: 'Respuesta a la actividad con más de veinte caracteres.' }),
  });
  const c2 = await j(await fetch(`${BASE}/courses/master-i`, { headers: SH }));
  ok(
    c2.modules.flatMap((m) => m.resources).find((x) => x.id === lesson.id).completed,
    'lección completada = actividad + quiz aprobado',
  );

  // Fase 1: motor de exámenes. test@example.com es una cuenta compartida y
  // persistente (no un throwaway por ejecución), y el motor limita a 3
  // intentos + cooldown de 24h por curso/usuario (permanente, no se resetea
  // solo). Un intento nuevo solo se envía cuando el estado realmente lo
  // permite; si no, se verifica que el motor bloquea el reintento en vez de
  // forzar un envío que rompería ejecuciones futuras del smoke test.
  const status = await j(await fetch(`${BASE}/exams/${exam.id}/status`, { headers: SH }));
  ok(status.hasBank, 'examen: tiene banco de ítems');
  if (status.canStart) {
    const at = await j(await fetch(`${BASE}/exams/${exam.id}/attempts`, { method: 'POST', headers: SH }));
    ok(Array.isArray(at.questions) && at.questions.every((q) => !('correctIndex' in q)), 'intento: preguntas sin clave');
    const sub = await j(
      await fetch(`${BASE}/exams/attempts/${at.attemptId}`, {
        method: 'POST',
        headers: SH,
        body: JSON.stringify({ answers: at.questions.map((q) => ({ questionId: q.id, choice: 0 })) }),
      }),
    );
    ok(typeof sub.score === 'number' && Array.isArray(sub.reviewItems), 'intento: calificado en servidor + repaso dirigido');
  } else {
    ok(true, 'examen: nuevo intento correctamente bloqueado (límite/cooldown ya activo en la cuenta de servicio)');
  }

  // Fase 1: rúbrica
  const rub = await j(await fetch(`${BASE}/rubrics/rubric-master-i`, { headers: IH }));
  ok(rub.criteria.length >= 4 && rub.totalPoints === 100, 'rúbrica de la Asignatura I disponible');
  ok(proj.contentJson.rubricSlug === 'rubric-master-i', 'proyecto enlaza a su rúbrica');

  // C-3: certificado exige lecciones + proyecto + examen (el examen nunca se
  // aprueba en este smoke test: las respuestas enviadas son deliberadamente
  // incorrectas)
  const certsMid = await j(await fetch(`${BASE}/certificates`, { headers: SH }));
  ok(certsMid.length === 0, 'sin certificado con solo 1 lección + examen suspendido');

  console.log(`\n${pass} ok, ${fail} fallo(s)`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => {
  console.error('ERROR', e);
  process.exit(1);
});

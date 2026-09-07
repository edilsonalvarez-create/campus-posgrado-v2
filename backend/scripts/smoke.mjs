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
  const H = { authorization: `Bearer ${reg.accessToken}`, 'content-type': 'application/json' };

  r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'instructor@example.com', password: 'Password123' }),
  });
  const instr = await j(r);
  ok(r.status === 200, 'login del instructor demo');
  const IH = { authorization: `Bearer ${instr.accessToken}`, 'content-type': 'application/json' };

  // C-1: sin fuga de respuestas para el estudiante
  const course = await j(await fetch(`${BASE}/courses/master-i`, { headers: H }));
  const lesson = course.modules.flatMap((m) => m.resources).find((x) => x.type === 'lesson');
  const exam = course.modules.flatMap((m) => m.resources).find((x) => x.type === 'exam');
  const proj = course.modules.flatMap((m) => m.resources).find((x) => x.type === 'project');
  ok(!(lesson.contentJson.quiz || []).some((q) => 'a' in q || 'why' in q), 'lección: quiz sin respuesta correcta');
  ok(!('questions' in (exam.contentJson || {})), 'examen: sin preguntas en content_json');
  const icourse = await j(await fetch(`${BASE}/courses/master-i`, { headers: IH }));
  const iLesson = icourse.modules.flatMap((m) => m.resources).find((x) => x.type === 'lesson');
  ok((iLesson.contentJson.quiz || []).some((q) => 'a' in q), 'instructor: sí ve la respuesta correcta');

  // quizzes endpoint
  r = await fetch(`${BASE}/quizzes/${exam.id}`, { headers: H });
  const qz = await j(r);
  ok(r.status === 200 && !('correctAnswer' in (qz.questions[0] || {})), 'GET /quizzes sin correctAnswer');
  ok((await fetch(`${BASE}/quizzes/${exam.id}`)).status === 401, 'GET /quizzes exige auth');

  // Fase 1: quiz formativo + actividad + completado real
  const key = iLesson.contentJson.quiz.map((q, i) => ({ i, choice: q.a }));
  r = await fetch(`${BASE}/formative/${lesson.id}`, { method: 'POST', headers: H, body: JSON.stringify({ answers: key }) });
  const fr = await j(r);
  ok(r.status === 200 && fr.passed, 'quiz formativo se califica y persiste');
  await fetch(`${BASE}/activity/${lesson.id}`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ content: 'Respuesta a la actividad con más de veinte caracteres.' }),
  });
  const c2 = await j(await fetch(`${BASE}/courses/master-i`, { headers: H }));
  ok(
    c2.modules.flatMap((m) => m.resources).find((x) => x.id === lesson.id).completed,
    'lección completada = actividad + quiz aprobado',
  );

  // Fase 1: motor de exámenes
  const status = await j(await fetch(`${BASE}/exams/${exam.id}/status`, { headers: H }));
  ok(status.hasBank && status.canStart, 'examen: tiene banco y se puede iniciar');
  const at = await j(await fetch(`${BASE}/exams/${exam.id}/attempts`, { method: 'POST', headers: H }));
  ok(Array.isArray(at.questions) && at.questions.every((q) => !('correctIndex' in q)), 'intento: preguntas sin clave');
  const sub = await j(
    await fetch(`${BASE}/exams/attempts/${at.attemptId}`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({ answers: at.questions.map((q) => ({ questionId: q.id, choice: 0 })) }),
    }),
  );
  ok(typeof sub.score === 'number' && Array.isArray(sub.reviewItems), 'intento: calificado en servidor + repaso dirigido');

  // Fase 1: rúbrica
  const rub = await j(await fetch(`${BASE}/rubrics/rubric-master-i`, { headers: IH }));
  ok(rub.criteria.length >= 4 && rub.totalPoints === 100, 'rúbrica de la Asignatura I disponible');
  ok(proj.contentJson.rubricSlug === 'rubric-master-i', 'proyecto enlaza a su rúbrica');

  // C-3: certificado exige lecciones + proyecto + examen
  const certsMid = await j(await fetch(`${BASE}/certificates`, { headers: H }));
  ok(certsMid.length === 0, 'sin certificado con solo 1 lección + examen suspendido');

  console.log(`\n${pass} ok, ${fail} fallo(s)`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => {
  console.error('ERROR', e);
  process.exit(1);
});

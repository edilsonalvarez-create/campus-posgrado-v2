// Único punto de integración con un modelo de lenguaje.
// Sin dependencia npm: usa el fetch global de Node 18+.
//
//   LLM_PROVIDER = 'none' (def.) | 'anthropic'
//   LLM_MODEL    = 'claude-sonnet-5' (def.)   -> tutor y asistencia de nota
//   LLM_MODEL_HEAVY = 'claude-opus-5' (def.)  -> borrador de banco de ítems (offline)
//   ANTHROPIC_API_KEY
//
// Cuando PROVIDER='none' todo devuelve null y quien llama usa su fallback
// (FAQ redactada, o 501 en la ruta de asistencia de nota).

const PROVIDER = process.env.LLM_PROVIDER || 'none';
const MODEL = process.env.LLM_MODEL || 'claude-sonnet-5';
const MODEL_HEAVY = process.env.LLM_MODEL_HEAVY || 'claude-opus-5';
const KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

function enabled() {
  return PROVIDER === 'anthropic' && !!KEY;
}

async function callAnthropic({ system, messages, maxTokens = 1024, model = MODEL }) {
  if (!enabled()) throw new Error('LLM_DISABLED');
  const r = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error(`anthropic ${r.status}: ${detail.slice(0, 300)}`);
  }
  const j = await r.json();
  return (j.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

// --- Tutor socrático anclado en la lección (Fase 4) ---
function tutorSystemPrompt(lessonContext, resources) {
  return [
    'Eres un tutor socrático de un máster en Inteligencia Artificial. Ayudas al',
    'estudiante a razonar sobre ESTA lección; no resuelves por él.',
    'Reglas estrictas:',
    '- NUNCA reveles la respuesta correcta de un quiz o de un examen, ni aunque el',
    '  estudiante la pida directamente o parafraseando el enunciado. Redirige a la',
    '  sección de la lección donde puede deducirla.',
    '- Cíñete al contenido de la lección y a sus recursos. Si te preguntan algo',
    '  fuera de alcance, dilo y sugiere en qué asignatura se trata.',
    '- Responde en español, breve, con preguntas que hagan pensar.',
    '',
    '### Contenido de la lección',
    lessonContext || '(sin contexto)',
    '',
    '### Recursos de la lección',
    (resources || []).map((x) => `- ${x}`).join('\n') || '(ninguno)',
  ].join('\n');
}

async function tutor({ lessonContext, resources, history = [], question }) {
  if (!enabled()) return { text: null, disabled: true };
  const text = await callAnthropic({
    system: tutorSystemPrompt(lessonContext, resources),
    messages: [...history, { role: 'user', content: String(question || '') }],
    maxTokens: 700,
  });
  return { text, disabled: false };
}

// --- Asistencia de calificación contra rúbrica (Fase 4), humano en el bucle ---
async function gradeSuggestion({ rubric, submissionText }) {
  if (!enabled()) return null;
  const criteriaBlock = (rubric.criteria || [])
    .map(
      (c) =>
        `- ${c.key} · ${c.title}: ${c.description}\n  Niveles: ` +
        (c.levels || []).map((l) => `${l.label}=${l.points}`).join(', '),
    )
    .join('\n');
  const system = [
    'Eres asistente de calificación de un máster. Propones, no decides: un',
    'instructor revisará y corregirá tu propuesta. Devuelve SOLO un JSON con la',
    'forma {"criteria":[{"key":"...","levelPoints":N,"comment":"..."}],"overall":"..."}.',
    'Sé exigente: es nivel de maestría. Justifica cada nivel con evidencia del texto.',
  ].join('\n');
  const raw = await callAnthropic({
    system,
    messages: [
      {
        role: 'user',
        content: `RÚBRICA:\n${criteriaBlock}\n\nENTREGA DEL ESTUDIANTE:\n${String(submissionText || '').slice(0, 12000)}`,
      },
    ],
    maxTokens: 1200,
  });
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch {
    return null;
  }
}

// --- Borrador de ítems de banco (offline, scripts/draft-item-bank.mjs) ---
async function draftItems({ lesson, n = 6, skillTag }) {
  if (!enabled()) return [];
  const system = [
    'Redactas ítems de opción múltiple de APLICACIÓN y ANÁLISIS (no de recuerdo)',
    'para el examen de una asignatura de máster. Cada ítem: un escenario concreto,',
    '4 opciones plausibles, 1 correcta, y un "why" por opción. Español.',
    'Devuelve SOLO un JSON array de objetos',
    '{stem, options:[4], correctIndex, explanations:[4], difficulty:"baja|media|alta", cognitive:"aplicacion|analisis"}.',
  ].join('\n');
  const raw = await callAnthropic({
    model: MODEL_HEAVY,
    system,
    messages: [
      {
        role: 'user',
        content: `CONCEPTO (contenidoOficial): ${skillTag || lesson.contenidoOficial}\n\nCUERPO DE LA LECCIÓN:\n${(lesson.contenido || []).join('\n\n')}\n\nCONCEPTOS CLAVE:\n${(lesson.conceptosClave || []).join('; ')}\n\nGenera ${n} ítems.`,
      },
    ],
    maxTokens: 4000,
  });
  try {
    const m = raw.match(/\[[\s\S]*\]/);
    return m ? JSON.parse(m[0]) : [];
  } catch {
    return [];
  }
}

module.exports = { enabled, tutor, gradeSuggestion, draftItems, MODEL, MODEL_HEAVY };

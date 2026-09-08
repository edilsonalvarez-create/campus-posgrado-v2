import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useExamStatus,
  useStartAttempt,
  useSubmitAttempt,
  logEvent,
  type ExamAttempt,
  type ExamResult,
} from '../hooks/useEvaluation';

function useCountdown(expiresAt?: string) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setLeft(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return left;
}

function ReviewItems({ items }: { items: Array<{ resourceId: string; title: string; skillTag: string }> }) {
  const navigate = useNavigate();
  if (!items.length) return null;
  return (
    <div className="mt-4 text-left bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-4">
      <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-2">
        Repaso dirigido antes de reintentar
      </p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.resourceId}>
            <button
              onClick={() => navigate(`/courses/${window.location.pathname.split('/')[2]}/${it.resourceId}`)}
              className="text-sm text-amber-800 dark:text-amber-300 hover:underline"
            >
              ↻ {it.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExamRunner({ resourceId }: { resourceId: string }) {
  const { data: status, isLoading } = useExamStatus(resourceId);
  const startMut = useStartAttempt();
  const submitMut = useSubmitAttempt();
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const submittedRef = useRef(false);

  const left = useCountdown(attempt?.expiresAt);
  const timeStr = useMemo(() => {
    const m = Math.floor(left / 60);
    const s = left % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [left]);

  // Auto-envío al agotarse el tiempo.
  useEffect(() => {
    if (attempt && left === 0 && !submittedRef.current) {
      submittedRef.current = true;
      doSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, attempt]);

  if (isLoading) return <p className="text-gray-500">Cargando examen…</p>;
  if (!status) return <p className="text-gray-500">No se pudo cargar el examen.</p>;

  if (!status.hasBank) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        El banco de ítems de este examen todavía se está preparando.
      </p>
    );
  }

  async function start() {
    setResult(null);
    setAnswers({});
    setIdx(0);
    submittedRef.current = false;
    const a = await startMut.mutateAsync(resourceId);
    setAttempt(a);
    logEvent('exam_start', { attemptNo: a.attemptNo }, resourceId);
  }

  async function doSubmit() {
    if (!attempt) return;
    const payload = attempt.questions.map((q) => ({ questionId: q.id, choice: answers[q.id] ?? -1 }));
    const r = await submitMut.mutateAsync({ attemptId: attempt.attemptId, answers: payload });
    setResult(r);
    setAttempt(null);
  }

  // --- Resultado ---
  if (result) {
    const pass = result.passed;
    return (
      <div
        className={`rounded-lg p-8 text-center ${
          pass ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'
        }`}
      >
        <p className={`text-3xl font-bold ${pass ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
          {pass ? '✅ Aprobado' : result.expired ? '⏱️ Tiempo agotado' : '✗ No aprobado'}
        </p>
        <p className={`text-5xl font-bold my-3 ${pass ? 'text-emerald-600' : 'text-rose-600'}`}>{result.score}%</p>
        <p className={`text-sm ${pass ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
          {result.correct} de {result.total} correctas · umbral {status.passThreshold}%
        </p>
        {pass ? (
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            El certificado de la asignatura se emite al completar además todas las lecciones y el proyecto.
          </p>
        ) : (
          <>
            <ReviewItems items={result.reviewItems} />
            <RetryLine resourceId={resourceId} />
          </>
        )}
      </div>
    );
  }

  // --- Intento en curso ---
  if (attempt) {
    const q = attempt.questions[idx];
    const answered = Object.keys(answers).length;
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <span>
            Pregunta {idx + 1} de {attempt.questions.length} · respondidas {answered}
          </span>
          <span className={left < 120 ? 'text-rose-600 font-semibold' : ''}>⏱️ {timeStr}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-5">
          <div
            className="bg-primary-600 h-1.5 rounded-full transition-all"
            style={{ width: `${((idx + 1) / attempt.questions.length) * 100}%` }}
          />
        </div>
        <p className="font-medium text-gray-900 dark:text-white mb-4">{q.stem}</p>
        <div className="space-y-2 mb-6">
          {q.options.map((opt, j) => (
            <label
              key={j}
              className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer text-sm ${
                answers[q.id] === j
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === j}
                onChange={() => setAnswers((a) => ({ ...a, [q.id]: j }))}
                className="mt-0.5"
              />
              <span className="text-gray-900 dark:text-white">{opt}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-40"
          >
            ← Anterior
          </button>
          {idx < attempt.questions.length - 1 ? (
            <button
              onClick={() => setIdx((i) => i + 1)}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={() => {
                submittedRef.current = true;
                doSubmit();
              }}
              disabled={submitMut.isPending}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {submitMut.isPending ? 'Enviando…' : 'Entregar examen'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Estado inicial ---
  const cooldown = status.cooldownUntil ? new Date(status.cooldownUntil) : null;
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
        Examen de aplicación: {status.drawSize} preguntas sorteadas de un banco, {status.durationMinutes} min,{' '}
        {status.maxAttempts} intentos (con espera de 24 h entre intentos). Aprueba con {status.passThreshold}%.
      </p>
      <p className="text-xs text-gray-500 mb-4">
        Intentos usados: {status.attemptsUsed}/{status.maxAttempts}
        {status.lastScore != null ? ` · última nota: ${status.lastScore}%` : ''}
      </p>

      {status.passed ? (
        <p className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">✅ Ya aprobaste este examen.</p>
      ) : cooldown && cooldown > new Date() ? (
        <div>
          <p className="text-amber-700 dark:text-amber-400 text-sm">
            Puedes reintentar a partir de {cooldown.toLocaleString('es-CO')}.
          </p>
          <ReviewItems items={status.reviewItems} />
        </div>
      ) : status.attemptsUsed >= status.maxAttempts ? (
        <p className="text-rose-700 dark:text-rose-400 text-sm">Agotaste los intentos. Contacta con el instructor.</p>
      ) : (
        <button
          onClick={start}
          disabled={startMut.isPending}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50"
        >
          {startMut.isPending ? 'Preparando…' : status.attemptsUsed ? 'Reintentar examen' : 'Comenzar examen'}
        </button>
      )}
    </div>
  );
}

function RetryLine({ resourceId }: { resourceId: string }) {
  const { data: status } = useExamStatus(resourceId);
  if (!status) return null;
  if (status.passed) return null;
  return (
    <p className="mt-4 text-xs text-gray-500">
      {status.cooldownUntil
        ? `Podrás reintentar a partir de ${new Date(status.cooldownUntil).toLocaleString('es-CO')}.`
        : status.attemptsUsed >= status.maxAttempts
          ? 'Sin intentos restantes.'
          : 'Vuelve a esta pantalla para reintentar.'}
    </p>
  );
}

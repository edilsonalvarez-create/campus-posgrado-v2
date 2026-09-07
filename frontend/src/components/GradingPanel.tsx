import { useMemo, useState } from 'react';
import { useGradeSubmission } from '../hooks/useSubmissions';
import type { Submission } from '../hooks/useSubmissions';
import { useRubric, useGradeSuggestion } from '../hooks/useEvaluation';

interface GradingPanelProps {
  submission: Submission;
  onSuccess?: () => void;
}

export function GradingPanel({ submission, onSuccess }: GradingPanelProps) {
  const isGraded = typeof submission.grade === 'number';
  const [editing, setEditing] = useState(!isGraded);

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Entrega de {submission.studentName}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(submission.submittedAt).toLocaleDateString('es-CO')}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 mb-4 max-h-48 overflow-y-auto">
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{submission.content}</p>
      </div>

      {!editing && isGraded ? (
        <div className="space-y-3">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Calificación: <span className="text-emerald-600 dark:text-emerald-400">{submission.grade}/100</span>
            </p>
            {submission.rubric?.criteria?.length ? (
              <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {submission.rubric.criteria.map((c) => (
                  <li key={c.key}>
                    · {c.key}: {c.levelLabel} ({c.levelPoints}) {c.comment ? `— ${c.comment}` : ''}
                  </li>
                ))}
              </ul>
            ) : null}
            {submission.feedback && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{submission.feedback}</p>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="w-full text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline py-2"
          >
            Editar calificación
          </button>
        </div>
      ) : submission.rubricSlug ? (
        <RubricGrader
          submission={submission}
          rubricSlug={submission.rubricSlug}
          onDone={() => {
            setEditing(false);
            onSuccess?.();
          }}
          onCancel={isGraded ? () => setEditing(false) : undefined}
        />
      ) : (
        <PlainGrader
          submission={submission}
          onDone={() => {
            setEditing(false);
            onSuccess?.();
          }}
          onCancel={isGraded ? () => setEditing(false) : undefined}
        />
      )}
    </div>
  );
}

function PlainGrader({
  submission,
  onDone,
  onCancel,
}: {
  submission: Submission;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [grade, setGrade] = useState<number>(submission.grade ?? 0);
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const { mutate, isPending } = useGradeSubmission();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate({ submissionId: submission.id, grade, feedback }, { onSuccess: onDone });
      }}
      className="space-y-3"
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Calificación (0-100)</label>
      <input
        type="number"
        min={0}
        max={100}
        value={grade}
        onChange={(e) => setGrade(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
        placeholder="Retroalimentación…"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg"
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function RubricGrader({
  submission,
  rubricSlug,
  onDone,
  onCancel,
}: {
  submission: Submission;
  rubricSlug: string;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const { data: rubric, isLoading } = useRubric(rubricSlug);
  const { mutate, isPending } = useGradeSubmission();
  const suggest = useGradeSuggestion();
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [picks, setPicks] = useState<Record<string, { levelPoints: number; comment: string }>>(() => {
    const init: Record<string, { levelPoints: number; comment: string }> = {};
    for (const c of submission.rubric?.criteria || []) init[c.key] = { levelPoints: c.levelPoints, comment: c.comment || '' };
    return init;
  });

  const total = useMemo(() => {
    if (!rubric) return 0;
    const sum = rubric.criteria.reduce((n, c) => n + (picks[c.key]?.levelPoints ?? 0), 0);
    return Math.round((sum / rubric.totalPoints) * 100);
  }, [rubric, picks]);

  if (isLoading || !rubric) return <p className="text-sm text-gray-500">Cargando rúbrica…</p>;

  const complete = rubric.criteria.every((c) => picks[c.key]?.levelPoints != null);
  const needsComment = rubric.criteria.filter((c) => {
    const max = Math.max(...c.levels.map((l) => l.points));
    const p = picks[c.key];
    return p && p.levelPoints < max && !p.comment.trim();
  });

  function applySuggestion(s: any) {
    if (!s?.criteria) return;
    setPicks((prev) => {
      const next = { ...prev };
      for (const c of s.criteria) {
        if (next[c.key] !== undefined || rubric!.criteria.some((rc) => rc.key === c.key)) {
          next[c.key] = { levelPoints: Number(c.levelPoints) || 0, comment: c.comment || next[c.key]?.comment || '' };
        }
      }
      return next;
    });
    if (s.overall) setFeedback((f) => f || s.overall);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          Nota calculada: {total}/100 {total >= rubric.passThreshold ? '✅' : ''}
        </span>
        <button
          type="button"
          onClick={() =>
            suggest.mutate(
              { submissionId: submission.id, rubricSlug },
              { onSuccess: (d) => applySuggestion(d.suggestion) },
            )
          }
          disabled={suggest.isPending}
          className="text-xs px-3 py-1.5 rounded border border-primary-300 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50"
        >
          {suggest.isPending ? 'Consultando…' : '🤖 Sugerir con IA'}
        </button>
      </div>
      {suggest.isError && (
        <p className="text-xs text-amber-600">La asistencia de IA no está disponible (revisa ANTHROPIC_API_KEY).</p>
      )}

      {rubric.criteria.map((c) => {
        const p = picks[c.key];
        const max = Math.max(...c.levels.map((l) => l.points));
        return (
          <div key={c.key} className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{c.title}</p>
            <p className="text-xs text-gray-500 mb-2">{c.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
              {c.levels.map((l) => (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => setPicks((s) => ({ ...s, [c.key]: { levelPoints: l.points, comment: s[c.key]?.comment || '' } }))}
                  className={`text-xs rounded border p-2 text-left ${
                    p?.levelPoints === l.points
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <span className="font-semibold">{l.label} · {l.points}</span>
                  <br />
                  <span className="text-gray-500">{l.descriptor}</span>
                </button>
              ))}
            </div>
            {p && p.levelPoints < max && (
              <input
                value={p.comment}
                onChange={(e) => setPicks((s) => ({ ...s, [c.key]: { ...s[c.key], comment: e.target.value } }))}
                placeholder="Comentario obligatorio si no es el nivel máximo…"
                className="mt-2 w-full text-sm px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            )}
          </div>
        );
      })}

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
        placeholder="Retroalimentación general…"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
      />

      {needsComment.length > 0 && (
        <p className="text-xs text-amber-600">
          Comenta: {needsComment.map((c) => c.title).join(', ')}
        </p>
      )}

      <div className="flex gap-2">
        <button
          disabled={!complete || needsComment.length > 0 || isPending}
          onClick={() =>
            mutate(
              {
                submissionId: submission.id,
                rubricSlug,
                feedback,
                criteria: rubric.criteria.map((c) => ({
                  key: c.key,
                  levelPoints: picks[c.key].levelPoints,
                  comment: picks[c.key].comment,
                })),
              },
              { onSuccess: onDone },
            )
          }
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg"
        >
          {isPending ? 'Guardando…' : `Guardar (${total}/100)`}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useFormative, useSubmitFormative, useSubmitActivity, type FormativeResult } from '../hooks/useEvaluation';

// Quiz formativo persistido + entrega de la actividad. Una lección se marca
// "completada" cuando ambos están hechos (actividad entregada + quiz aprobado).
export function LessonFormative({
  resourceId,
  quiz,
  exercise,
}: {
  resourceId: string;
  quiz: Array<{ q: string; opts: string[] }>;
  exercise?: { mins?: number; text: string } | null;
}) {
  const { data: state } = useFormative(resourceId);
  const submitFormative = useSubmitFormative();
  const submitActivity = useSubmitActivity();

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<FormativeResult | null>(null);
  const [activityText, setActivityText] = useState('');
  const [savedActivity, setSavedActivity] = useState(false);

  useEffect(() => {
    if (state?.activity) {
      setActivityText(state.activity.content);
      setSavedActivity(true);
    }
  }, [state?.activity]);

  const priorPassed = state?.formative?.passed;
  const allAnswered = quiz.length > 0 && Object.keys(answers).length === quiz.length;

  return (
    <div className="mt-8 space-y-8">
      {exercise?.text && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Actividad {exercise.mins ? `(${exercise.mins} min)` : ''}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{exercise.text}</p>
          <textarea
            value={activityText}
            onChange={(e) => {
              setActivityText(e.target.value);
              setSavedActivity(false);
            }}
            rows={4}
            placeholder="Escribe aquí tu respuesta a la actividad…"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() =>
                submitActivity.mutate(
                  { resourceId, content: activityText },
                  { onSuccess: () => setSavedActivity(true) },
                )
              }
              disabled={activityText.trim().length < 20 || submitActivity.isPending}
              className="text-sm px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-400"
            >
              {submitActivity.isPending ? 'Guardando…' : savedActivity ? '✓ Guardada' : 'Guardar actividad'}
            </button>
            {submitActivity.isError && <span className="text-xs text-rose-600">Mín. 20 caracteres.</span>}
          </div>
        </div>
      )}

      {quiz.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Comprueba tu comprensión</h3>
          <p className="text-xs text-gray-500 mb-4">
            {priorPassed
              ? '✓ Ya superaste este quiz. Puedes volver a intentarlo.'
              : 'Responde las preguntas; se guardan y cuentan para completar la lección.'}
          </p>
          <div className="space-y-5">
            {quiz.map((q, i) => {
              const chosen = answers[i];
              const detail = result?.detail?.find((d) => d.i === i);
              const show = detail !== undefined;
              return (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="font-medium text-gray-900 dark:text-white mb-3">
                    {i + 1}. {q.q}
                  </p>
                  <div className="space-y-2">
                    {q.opts.map((opt, j) => {
                      const isChosen = chosen === j;
                      const isCorrect = show && detail!.correctIndex === j;
                      const isWrongChoice = show && isChosen && !detail!.correct;
                      return (
                        <button
                          key={j}
                          onClick={() => !show && setAnswers((a) => ({ ...a, [i]: j }))}
                          disabled={show}
                          className={`w-full text-left px-3 py-2 rounded border text-sm flex items-start gap-2 ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                              : isWrongChoice
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                                : isChosen
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                          }`}
                        >
                          {show && <span>{isCorrect ? '✓' : isWrongChoice ? '✗' : ''}</span>}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {show && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">{detail!.correct ? 'Correcto. ' : 'Revisar. '}</span>
                      {detail!.why[chosen ?? detail!.correctIndex]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {!result ? (
            <button
              onClick={() =>
                submitFormative.mutate(
                  { resourceId, answers: Object.entries(answers).map(([i, choice]) => ({ i: Number(i), choice })) },
                  { onSuccess: setResult },
                )
              }
              disabled={!allAnswered || submitFormative.isPending}
              className="mt-4 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:bg-gray-400"
            >
              {submitFormative.isPending ? 'Enviando…' : 'Comprobar respuestas'}
            </button>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <span
                className={`text-sm font-semibold ${
                  result.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {result.score}/{result.maxScore} · {result.passed ? 'superado' : 'no superado'}
              </span>
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

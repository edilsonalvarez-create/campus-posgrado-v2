import { useRubric } from '../hooks/useEvaluation';
import type { RubricSnapshot } from '../hooks/useSubmissions';

// Rúbrica de solo lectura. Si se pasa `snapshot`, resalta el nivel obtenido por
// criterio y muestra el comentario del calificador.
export function RubricView({ slug, snapshot }: { slug: string; snapshot?: RubricSnapshot }) {
  const { data: rubric, isLoading } = useRubric(slug);
  if (isLoading) return <p className="text-sm text-gray-500">Cargando rúbrica…</p>;
  if (!rubric) return null;

  const byKey = new Map((snapshot?.criteria || []).map((c) => [c.key, c]));

  return (
    <div className="my-5 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white text-sm">{rubric.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {rubric.criteria.length} criterios · {rubric.totalPoints} puntos · aprueba con {rubric.passThreshold}%
          {snapshot ? ` · obtenido: ${snapshot.computedScore}%` : ''}
        </p>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {rubric.criteria.map((c) => {
          const got = byKey.get(c.key);
          return (
            <div key={c.key} className="p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{c.title}</p>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {got ? `${got.levelPoints}` : '—'} / {Math.max(...c.levels.map((l) => l.points))} pts
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{c.description}</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {c.levels.map((l) => {
                  const isGot = got && got.levelPoints === l.points;
                  return (
                    <div
                      key={l.label}
                      className={`text-xs rounded border p-2 ${
                        isGot
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <p className="font-semibold">
                        {l.label} · {l.points}
                      </p>
                      <p className="mt-0.5 leading-snug">{l.descriptor}</p>
                    </div>
                  );
                })}
              </div>
              {got?.comment && (
                <p className="mt-2 text-xs text-gray-700 dark:text-gray-300 border-l-2 border-emerald-400 pl-2">
                  <span className="font-semibold">Comentario: </span>
                  {got.comment}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

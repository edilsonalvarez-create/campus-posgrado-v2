import { useNavigate } from 'react-router-dom'
import { useReviewPlan } from '../hooks/useCommunity'

// Repaso dirigido: conceptos con bajo dominio (de skill_mastery) y su lección.
export function ReviewPlan() {
  const navigate = useNavigate()
  const { data: items = [], isLoading } = useReviewPlan()
  if (isLoading || items.length === 0) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4 mb-8">
      <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Repaso recomendado</p>
      <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">
        Conceptos donde tus respuestas de examen han fallado más. Repásalos antes de reintentar.
      </p>
      <ul className="space-y-1.5">
        {items.slice(0, 6).map((it) => (
          <li key={it.courseSlug + it.skillTag} className="text-sm flex items-center justify-between gap-2">
            <span className="text-amber-900 dark:text-amber-200 truncate">
              {it.skillTag} <span className="text-amber-600 dark:text-amber-400">· {it.correct}/{it.total} aciertos</span>
            </span>
            {it.lesson && (
              <button
                onClick={() => navigate(`/courses/${it.courseSlug}/${it.lesson!.resourceId}`)}
                className="text-xs px-2 py-1 rounded bg-amber-600 text-white shrink-0 hover:bg-amber-700"
              >
                Repasar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

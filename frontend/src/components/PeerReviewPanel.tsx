import { useState } from 'react'
import { useMyPeerReviews, useSubmitPeerReview, type PeerReviewTask } from '../hooks/useCommunity'
import { useRubric } from '../hooks/useEvaluation'

// Lista de revisiones por pares asignadas al estudiante (Dashboard).
export function PeerReviewInbox() {
  const { data: tasks = [], isLoading } = useMyPeerReviews()
  const pending = tasks.filter((t) => t.status === 'assigned')
  const [openId, setOpenId] = useState<string | null>(null)

  if (isLoading || tasks.length === 0) return null
  const open = tasks.find((t) => t.id === openId)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">
        Revisión por pares {pending.length > 0 && <span className="text-primary-600">· {pending.length} pendiente(s)</span>}
      </p>
      {open ? (
        <ReviewForm task={open} onDone={() => setOpenId(null)} />
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {t.courseTitle} · {t.resourceTitle}
              </span>
              {t.status === 'assigned' ? (
                <button
                  onClick={() => setOpenId(t.id)}
                  className="text-xs px-3 py-1 rounded bg-primary-600 text-white shrink-0"
                >
                  Revisar
                </button>
              ) : (
                <span className="text-xs text-emerald-600 shrink-0">✓ enviada</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ReviewForm({ task, onDone }: { task: PeerReviewTask; onDone: () => void }) {
  const { data: rubric } = useRubric(task.rubricSlug)
  const submit = useSubmitPeerReview()
  const [picks, setPicks] = useState<Record<string, { levelPoints: number; comment: string }>>({})
  const [comment, setComment] = useState('')

  if (!rubric) return <p className="text-sm text-gray-500">Cargando rúbrica…</p>
  const complete = rubric.criteria.every((c) => picks[c.key]?.levelPoints != null)

  return (
    <div className="space-y-3">
      <button onClick={onDone} className="text-xs text-gray-500 hover:underline">
        ← Volver
      </button>
      <div className="bg-gray-50 dark:bg-gray-700/40 rounded p-3 max-h-40 overflow-y-auto">
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{task.content}</p>
        {task.repoUrl && (
          <a href={task.repoUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline block mt-1">
            {task.repoUrl}
          </a>
        )}
        {task.files.map((f, i) => (
          <a key={i} href={f.url} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline block">
            {f.label}
          </a>
        ))}
      </div>
      {rubric.criteria.map((c) => (
        <div key={c.key}>
          <p className="text-xs font-medium text-gray-900 dark:text-white">{c.title}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {c.levels.map((l) => (
              <button
                key={l.label}
                onClick={() => setPicks((s) => ({ ...s, [c.key]: { levelPoints: l.points, comment: s[c.key]?.comment || '' } }))}
                className={`text-xs px-2 py-1 rounded border ${
                  picks[c.key]?.levelPoints === l.points
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Comentario para tu compañero (qué está bien, qué mejoraría)…"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
      />
      <button
        disabled={!complete || comment.trim().length < 10 || submit.isPending}
        onClick={() =>
          submit.mutate(
            {
              submissionId: task.submissionId,
              comment,
              scores: rubric.criteria.map((c) => ({ key: c.key, levelPoints: picks[c.key].levelPoints })),
            },
            { onSuccess: onDone },
          )
        }
        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-1.5 rounded-lg"
      >
        {submit.isPending ? 'Enviando…' : 'Enviar revisión'}
      </button>
      {(!complete || comment.trim().length < 10) && (
        <p className="text-xs text-gray-400">Elige un nivel por criterio y escribe un comentario (mín. 10 caracteres).</p>
      )}
    </div>
  )
}

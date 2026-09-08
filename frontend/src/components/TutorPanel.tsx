import { useEffect, useRef, useState } from 'react'
import { useTutor, useAskTutor } from '../hooks/useEvaluation'

// Tutor socrático anclado en la lección. No responde preguntas de examen.
export function TutorPanel({ resourceId }: { resourceId: string }) {
  const { data } = useTutor(resourceId)
  const ask = useAskTutor()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const messages = data?.messages || []

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, open, ask.isPending])

  return (
    <div className="my-6 border border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50/40 dark:bg-primary-900/10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2"
      >
        <span>💬</span> Tutor de la lección
        <span className="ml-auto text-xs font-normal text-gray-500">{open ? 'ocultar' : 'preguntar'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-primary-100 dark:border-primary-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 my-2">
            Te ayuda a razonar sobre esta lección. No responde preguntas de examen ni de quiz.
          </p>
          <div className="max-h-72 overflow-y-auto space-y-2 mb-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-lg p-2.5 ${
                  m.role === 'user'
                    ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ml-6'
                    : m.role === 'system-refusal'
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 mr-6'
                      : 'bg-primary-100/60 dark:bg-primary-900/20 text-gray-800 dark:text-gray-200 mr-6'
                }`}
              >
                {m.content}
              </div>
            ))}
            {ask.isPending && <div className="text-sm text-gray-400 mr-6">El tutor está pensando…</div>}
            <div ref={endRef} />
          </div>
          {data && !data.enabled && messages.length === 0 && (
            <p className="text-xs text-amber-600 mb-2">
              El tutor con IA no está activado en este entorno; recibirás punteros a la lección y al foro.
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (q.trim().length < 3) return
              ask.mutate({ resourceId, question: q })
              setQ('')
            }}
            className="flex gap-2"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="¿Qué no te queda claro de esta lección?"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <button
              disabled={q.trim().length < 3 || ask.isPending}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white text-sm px-4 rounded-lg"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

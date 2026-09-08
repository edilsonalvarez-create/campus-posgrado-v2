import { useState } from 'react'
import { useForum, useForumThread, useCreateThread, useReplyThread, useModerateThread } from '../hooks/useCommunity'
import { useAuthStore } from '../state/store'

export function Forum({ courseId }: { courseId: string }) {
  const { data: threads = [], isLoading } = useForum(courseId)
  const [openId, setOpenId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  if (isLoading) return <p className="text-gray-500 text-sm">Cargando foro…</p>
  if (openId) return <ThreadView threadId={openId} onBack={() => setOpenId(null)} />

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-900 dark:text-white">Foro de la asignatura</p>
        <button
          onClick={() => setCreating((c) => !c)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          {creating ? 'Cancelar' : '+ Nuevo hilo'}
        </button>
      </div>
      {creating && <NewThread courseId={courseId} onDone={() => setCreating(false)} />}
      <ul className="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
        {threads.map((t) => (
          <li key={t.id}>
            <button onClick={() => setOpenId(t.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="flex items-start gap-2">
                {t.pinned && <span title="fijado">📌</span>}
                {t.locked && <span title="cerrado">🔒</span>}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{t.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.authorName} · {t.replies} respuesta{t.replies === 1 ? '' : 's'}
                    {t.anchor ? ' · hilo de referencia' : ''}
                  </p>
                </div>
              </div>
            </button>
          </li>
        ))}
        {threads.length === 0 && <li className="px-4 py-6 text-sm text-gray-400 text-center">Aún no hay hilos.</li>}
      </ul>
    </div>
  )
}

function NewThread({ courseId, onDone }: { courseId: string; onDone: () => void }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const create = useCreateThread()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        create.mutate({ courseId, title, body }, { onSuccess: onDone })
      }}
      className="mb-4 space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título del hilo"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="¿Qué quieres plantear?"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
      />
      <button
        disabled={title.trim().length < 4 || body.trim().length < 4 || create.isPending}
        className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-1.5 rounded-lg"
      >
        {create.isPending ? 'Publicando…' : 'Publicar hilo'}
      </button>
    </form>
  )
}

function ThreadView({ threadId, onBack }: { threadId: string; onBack: () => void }) {
  const { data: thread, isLoading } = useForumThread(threadId)
  const reply = useReplyThread()
  const moderate = useModerateThread()
  const { user } = useAuthStore()
  const isStaff = user?.role && user.role !== 'student'
  const [text, setText] = useState('')

  if (isLoading || !thread) return <p className="text-gray-500 text-sm">Cargando hilo…</p>

  return (
    <div>
      <button onClick={onBack} className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-3">
        ← Volver al foro
      </button>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {thread.pinned && '📌 '}
            {thread.locked && '🔒 '}
            {thread.title}
          </h3>
          {isStaff && (
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => moderate.mutate({ threadId, pinned: !thread.pinned })}
                className="text-gray-500 hover:underline"
              >
                {thread.pinned ? 'Desfijar' : 'Fijar'}
              </button>
              <button
                onClick={() => moderate.mutate({ threadId, locked: !thread.locked })}
                className="text-gray-500 hover:underline"
              >
                {thread.locked ? 'Reabrir' : 'Cerrar'}
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{thread.authorName}</p>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{thread.body}</p>
      </div>

      <div className="mt-3 space-y-2">
        {thread.posts.map((p) => (
          <div key={p.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/40">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{p.authorName}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1">{p.body}</p>
          </div>
        ))}
      </div>

      {!(thread.locked && !isStaff) && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            reply.mutate({ threadId, body: text }, { onSuccess: () => setText('') })
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Responder…"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
          <button
            disabled={text.trim().length < 2 || reply.isPending}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white text-sm px-4 rounded-lg"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  )
}

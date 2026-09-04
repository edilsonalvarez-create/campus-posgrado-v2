import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourse } from '../hooks/useCourses'
import { useMarkResource } from '../hooks/useProgress'
import { useSubmissions } from '../hooks/useSubmissions'
import { Markdown } from '../components/Markdown'
import { QuizView } from '../components/QuizView'
import { SubmissionForm } from '../components/SubmissionForm'

interface Resource {
  id: string
  title: string
  type: string
  url?: string
  source?: string
  note?: string
  content?: string
  contentJson?: any
  completed?: boolean
}
interface Module {
  id: string
  title: string
  subtitle?: string
  meta?: any
  resources: Resource[]
}

const TYPE_LABEL: Record<string, string> = {
  lesson: 'Lección',
  exam: 'Examen',
  reading: 'Lectura',
  book: 'Libro',
  video: 'Video',
  lecture: 'Clase',
  exercise: 'Ejercicio',
  assignment: 'Entrega',
  project: 'Entrega',
  docs: 'Documentación',
  tool: 'Herramienta',
  dataset: 'Dataset',
  cert: 'Certificación',
  norma: 'Norma',
}

function LessonQuiz({ quiz }: { quiz: any[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  return (
    <div className="mt-6 space-y-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comprueba tu comprensión</h3>
      {quiz.map((q, i) => {
        const chosen = answers[i]
        return (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="font-medium text-gray-900 dark:text-white mb-3">
              {i + 1}. {q.q}
            </p>
            <div className="space-y-2">
              {(q.opts || []).map((opt: string, j: number) => {
                const isChosen = chosen === j
                const isCorrect = j === q.a
                const show = chosen !== undefined
                return (
                  <button
                    key={j}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                    disabled={show}
                    className={`block w-full text-left px-3 py-2 rounded border text-sm transition-colors ${
                      show && isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : show && isChosen
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {chosen !== undefined && q.why && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {chosen === q.a ? '✅ ' : '❌ '}
                {q.why[chosen]}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

const SUBMISSION_STATUS_LABEL: Record<string, string> = {
  submitted: 'Enviada · pendiente de calificación',
  graded: 'Calificada',
  draft: 'Borrador',
}

function ProjectDelivery({ resource, courseId }: { resource: Resource; courseId: string }) {
  const cj = resource.contentJson || {}
  const { data: submissions = [] } = useSubmissions({ courseId })
  const mine = submissions.filter((s) => s.resourceId === resource.id)

  return (
    <div>
      {Array.isArray(cj.contenidos) && cj.contenidos.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {cj.contenidos.map((c: string, i: number) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {c}
            </span>
          ))}
        </div>
      )}
      {cj.deliverable && (
        <div className="mb-5 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">Qué debes entregar</p>
          <p className="text-gray-700 dark:text-gray-300">{cj.deliverable}</p>
        </div>
      )}
      {cj.practice && (
        <div className="mb-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">Opciones de práctica sugeridas</p>
          <p className="text-gray-700 dark:text-gray-300">{cj.practice}</p>
        </div>
      )}
      {cj.mastery && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">Criterio de dominio</p>
          <p className="text-gray-700 dark:text-gray-300">{cj.mastery}</p>
        </div>
      )}

      {mine.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">Tus entregas</p>
          <div className="space-y-3">
            {mine.map((s) => (
              <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {new Date(s.submittedAt).toLocaleDateString('es-CO')} · {SUBMISSION_STATUS_LABEL[s.status] || s.status}
                  </span>
                  {typeof s.grade === 'number' && (
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">{s.grade}/100</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{s.content}</p>
                {s.feedback && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                    <span className="font-semibold">Retroalimentación: </span>
                    {s.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <SubmissionForm resourceId={resource.id} courseId={courseId} resourceTitle={resource.title} />
    </div>
  )
}

function ResourceBody({ resource, courseId }: { resource: Resource; courseId: string }) {
  const cj = resource.contentJson || {}

  if (resource.type === 'exam') {
    return (
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Examen de {Array.isArray(cj.questions) ? cj.questions.length : 10} preguntas. Necesitas 70% para aprobar y
          obtener el certificado.
        </p>
        <QuizView quizId={resource.id} />
      </div>
    )
  }

  if (resource.type === 'project') {
    return <ProjectDelivery resource={resource} courseId={courseId} />
  }

  if (resource.type === 'lesson' && Array.isArray(cj.body) && cj.body.length) {
    return (
      <div>
        {cj.mins ? <p className="text-sm text-gray-500 mb-4">⏱️ {cj.mins} min</p> : null}
        {cj.objetivo && (
          <div className="mb-4 flex gap-2 items-start bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded p-3">
            <span className="text-lg leading-none">🎯</span>
            <p className="text-sm text-indigo-900 dark:text-indigo-200">
              <span className="font-semibold">Objetivo: </span>
              {cj.objetivo}
            </p>
          </div>
        )}
        {cj.introduccion && (
          <p className="my-3 leading-relaxed text-gray-600 dark:text-gray-400 italic">{cj.introduccion}</p>
        )}
        {Array.isArray(cj.conceptosClave) && cj.conceptosClave.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {cj.conceptosClave.map((c: string, i: number) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {c}
              </span>
            ))}
          </div>
        )}
        {cj.body.map((p: string, i: number) => (
          <p key={i} className="my-3 leading-relaxed text-gray-700 dark:text-gray-300">
            {p}
          </p>
        ))}
        {cj.example && (
          <div className="my-5 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">{cj.example.title || 'Ejemplo'}</p>
            <p className="text-gray-700 dark:text-gray-300">{cj.example.text}</p>
          </div>
        )}
        {Array.isArray(cj.keys) && cj.keys.length > 0 && (
          <div className="my-5">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">Puntos clave</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              {cj.keys.map((k: string, i: number) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          </div>
        )}
        {cj.exercise && (
          <div className="my-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">
              Ejercicio {cj.exercise.mins ? `(${cj.exercise.mins} min)` : ''}
            </p>
            <p className="text-gray-700 dark:text-gray-300">{cj.exercise.text}</p>
          </div>
        )}
        {cj.preguntaReflexion && (
          <div className="my-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">💭 Pregunta de reflexión</p>
            <p className="text-gray-700 dark:text-gray-300">{cj.preguntaReflexion}</p>
          </div>
        )}
        {Array.isArray(cj.quiz) && cj.quiz.length > 0 && <LessonQuiz quiz={cj.quiz} />}
        {cj.criterioFinalizacion && (
          <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">
            <span className="font-semibold">Criterio de finalización: </span>
            {cj.criterioFinalizacion}
          </p>
        )}
      </div>
    )
  }

  if (resource.content) {
    return (
      <div>
        {resource.contentJson?.concepts && Array.isArray(resource.contentJson.concepts) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {resource.contentJson.concepts.map((c: string, i: number) => (
              <span key={i} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {c}
              </span>
            ))}
          </div>
        )}
        <Markdown text={resource.content} />
      </div>
    )
  }

  return (
    <div className="text-gray-600 dark:text-gray-400">
      <p>Contenido en preparación.</p>
      {resource.url && (
        <a href={resource.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline mt-2 inline-block">
          Abrir material original ↗
        </a>
      )}
    </div>
  )
}

export default function CourseView() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { data: course, isLoading, isError } = useCourse(courseId || '')
  const mark = useMarkResource()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})

  const modules: Module[] = course?.modules || []
  const flatResources = useMemo(() => modules.flatMap((m) => m.resources), [modules])

  useEffect(() => {
    if (!selectedId && flatResources.length) {
      setSelectedId(flatResources[0].id)
      if (modules[0]) setOpenModules({ [modules[0].id]: true })
    }
  }, [flatResources, selectedId, modules])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando curso...</div>
  }
  if (isError || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500">No se pudo cargar el curso.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
          Volver al dashboard
        </button>
      </div>
    )
  }

  const selected = flatResources.find((r) => r.id === selectedId) || null
  const selIndex = flatResources.findIndex((r) => r.id === selectedId)
  const pct = course.progress?.percentage ?? 0

  const go = (delta: number) => {
    const next = flatResources[selIndex + delta]
    if (next) {
      setSelectedId(next.id)
      const mod = modules.find((m) => m.resources.some((r) => r.id === next.id))
      if (mod) setOpenModules((o) => ({ ...o, [mod.id]: true }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            ← Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{course.title}</h1>
          {course.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-3xl">{course.description}</p>
          )}
          <div className="mt-3 max-w-md">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso del curso</span>
              <span>
                {course.progress?.completed ?? 0}/{course.progress?.total ?? 0} · {pct}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-max lg:sticky lg:top-6">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-900 dark:text-white text-sm">
            Contenido · {modules.length} módulos
          </div>
          <nav className="max-h-[70vh] overflow-y-auto">
            {modules.map((m) => {
              const open = openModules[m.id]
              const done = m.resources.filter((r) => r.completed).length
              return (
                <div key={m.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <button
                    onClick={() => setOpenModules((o) => ({ ...o, [m.id]: !o[m.id] }))}
                    className="w-full text-left px-3 py-2.5 flex items-start justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.title}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {done}/{m.resources.length} {open ? '▾' : '▸'}
                    </span>
                  </button>
                  {open && (
                    <ul className="pb-2">
                      {m.resources.map((r) => (
                        <li key={r.id}>
                          <button
                            onClick={() => setSelectedId(r.id)}
                            className={`w-full text-left pl-5 pr-3 py-1.5 text-sm flex items-center gap-2 ${
                              r.id === selectedId
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            <span>{r.completed ? '✅' : r.type === 'exam' ? '📝' : r.type === 'project' ? '📄' : '○'}</span>
                            <span className="flex-1">{r.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 min-w-0">
          {!selected ? (
            <p className="text-gray-500">Este curso todavía no tiene contenido.</p>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span className="uppercase tracking-wide">{TYPE_LABEL[selected.type] || selected.type}</span>
                {selected.source && <span>· {selected.source}</span>}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{selected.title}</h2>
              {selected.note && <p className="text-gray-500 dark:text-gray-400 mb-4">{selected.note}</p>}
              {selected.url && (
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mb-4 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Abrir material ↗
                </a>
              )}

              <ResourceBody resource={selected} courseId={course.id} />

              <div className="mt-8 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                <button
                  onClick={() => go(-1)}
                  disabled={selIndex <= 0}
                  className="text-sm text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:underline"
                >
                  ← Anterior
                </button>
                {selected.type !== 'exam' && selected.type !== 'project' && (
                  <button
                    onClick={() => mark.mutate({ resourceId: selected.id, completed: !selected.completed })}
                    disabled={mark.isPending}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selected.completed
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selected.completed ? '✅ Completada — desmarcar' : 'Marcar como completada'}
                  </button>
                )}
                <button
                  onClick={() => go(1)}
                  disabled={selIndex >= flatResources.length - 1}
                  className="text-sm text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:underline"
                >
                  Siguiente →
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourse } from '../hooks/useCourses'
import { useMarkResource } from '../hooks/useProgress'
import { useSubmissions } from '../hooks/useSubmissions'
import { useResume, useSaveResume, logEvent } from '../hooks/useEvaluation'
import { Markdown } from '../components/Markdown'
import { QuizView } from '../components/QuizView'
import { ExamRunner } from '../components/ExamRunner'
import { RubricView } from '../components/RubricView'
import { HandsOnSubmission } from '../components/HandsOnSubmission'
import { TfmMilestones } from '../components/TfmMilestones'
import { LessonFormative } from '../components/LessonFormative'
import { SubmissionForm } from '../components/SubmissionForm'
import { DiagramView } from '../components/DiagramView'
import { LecturaGuiada } from '../components/LecturaGuiada'
import { VideoPlayer } from '../components/VideoPlayer'
import { Forum } from '../components/Forum'
import { TutorPanel } from '../components/TutorPanel'
import { useRequestPeerReview, useReceivedPeerReviews } from '../hooks/useCommunity'

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
  revisedAt?: string
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

const SUBMISSION_STATUS_LABEL: Record<string, string> = {
  submitted: 'Enviada · pendiente de calificación',
  graded: 'Calificada',
  draft: 'Borrador',
}

function ProjectDelivery({ resource, courseId, courseSlug }: { resource: Resource; courseId: string; courseSlug?: string }) {
  const cj = resource.contentJson || {}
  const { data: submissions = [] } = useSubmissions({ courseId })
  const mine = submissions.filter((s) => s.resourceId === resource.id)

  // TFM: proceso de 4 hitos con director, no un textarea.
  if (courseSlug === 'master-tfm') {
    return (
      <div>
        {cj.deliverable && (
          <div className="mb-5 border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-r text-sm text-gray-700 dark:text-gray-300">
            {cj.deliverable}
          </div>
        )}
        <TfmMilestones />
      </div>
    )
  }

  // Tracks hands-on (III/VI/IX/X): entrega de repositorio + artefactos.
  if (cj.track === 'handson' && cj.handson) {
    return (
      <div>
        {cj.deliverable && (
          <div className="mb-5 border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-r">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Qué debes entregar</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{cj.deliverable}</p>
          </div>
        )}
        {cj.mastery && (
          <div className="mb-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-gray-900 dark:text-white">Criterio de dominio. </span>
            {cj.mastery}
          </div>
        )}
        <HandsOnSubmission resource={resource} courseId={courseId} spec={cj.handson} rubricSlug={cj.rubricSlug} />
      </div>
    )
  }

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
        <div className="mb-5 border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-r">
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

      {cj.rubricSlug && (
        <div className="mb-6">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">Rúbrica de evaluación</p>
          <p className="text-sm text-gray-500 mb-2">Así se calificará tu entrega. El primer criterio es el que más pesa.</p>
          <RubricView slug={cj.rubricSlug} />
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
                {s.rubric && cj.rubricSlug && (
                  <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-2">
                    <RubricView slug={cj.rubricSlug} snapshot={s.rubric} />
                  </div>
                )}
                {s.feedback && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                    <span className="font-semibold">Retroalimentación: </span>
                    {s.feedback}
                  </p>
                )}
                {cj.rubricSlug && <PeerReviewSection submissionId={s.id} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <SubmissionForm resourceId={resource.id} courseId={courseId} resourceTitle={resource.title} />
    </div>
  )
}

function PeerReviewSection({ submissionId }: { submissionId: string }) {
  const request = useRequestPeerReview()
  const { data: received = [] } = useReceivedPeerReviews(submissionId)
  return (
    <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-2">
      {received.length > 0 ? (
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Revisión por pares recibida</p>
          {received.map((r, i) => (
            <p key={i} className="text-xs text-gray-600 dark:text-gray-400">
              «{r.comment}»
            </p>
          ))}
        </div>
      ) : (
        <button
          onClick={() => request.mutate(submissionId)}
          disabled={request.isPending}
          className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
        >
          {request.isPending
            ? 'Asignando…'
            : request.data?.pending
              ? 'Aún no hay compañeros que hayan entregado; se asignará cuando los haya'
              : '👥 Solicitar revisión por pares'}
        </button>
      )}
    </div>
  )
}

function ResourceBody({ resource, courseId, courseSlug }: { resource: Resource; courseId: string; courseSlug?: string }) {
  const cj = resource.contentJson || {}

  if (resource.type === 'exam') {
    // Máster: motor de intentos con banco de ítems. Aulas legadas: quiz simple.
    if (cj.examConfig) {
      return <ExamRunner resourceId={resource.id} />
    }
    return (
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Examen de {Array.isArray(cj.questions) ? cj.questions.length : 10} preguntas. Necesitas 70% para aprobar.
        </p>
        <QuizView quizId={resource.id} />
      </div>
    )
  }

  if (resource.type === 'project') {
    return <ProjectDelivery resource={resource} courseId={courseId} courseSlug={courseSlug} />
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
        {cj.diagram?.mermaid && <DiagramView title={cj.diagram.title} chart={cj.diagram.mermaid} />}
        {cj.example && (
          <div className="my-5 border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-r">
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
        {cj.lecturaGuiada && <LecturaGuiada data={cj.lecturaGuiada} />}
        {cj.recursos?.libros?.length > 0 && (
          <div className="my-5 border border-gray-200 dark:border-gray-700 rounded p-4">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">📚 Para profundizar</p>
            <ul className="space-y-2">
              {cj.recursos.libros.map((b: any, i: number) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                  {b.url ? (
                    <a href={b.url} target="_blank" rel="noreferrer" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                      {b.titulo}
                    </a>
                  ) : (
                    <span className="font-medium">{b.titulo}</span>
                  )}
                  {b.autor && <span className="text-gray-500 dark:text-gray-400"> — {b.autor}</span>}
                  {b.ficha && <span className="text-gray-400"> · {b.ficha}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {cj.recursos?.videos?.length > 0 && (
          <div className="my-5">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">🎬 Vídeos recomendados</p>
            {cj.recursos.videos.map((v: any, i: number) => (
              <VideoPlayer key={i} url={v.url} title={`${v.titulo}${v.canal ? ` · ${v.canal}` : ''}`} />
            ))}
          </div>
        )}
        {cj.preguntaReflexion && (
          <div className="my-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">💭 Pregunta de reflexión</p>
            <p className="text-gray-700 dark:text-gray-300">{cj.preguntaReflexion}</p>
          </div>
        )}
        <TutorPanel resourceId={resource.id} />
        {((Array.isArray(cj.quiz) && cj.quiz.length > 0) || cj.exercise?.text) && (
          <LessonFormative resourceId={resource.id} quiz={cj.quiz || []} exercise={cj.exercise} />
        )}
        {resource.revisedAt && (
          <p className="mt-4 text-xs text-gray-400">Contenido revisado: {resource.revisedAt}</p>
        )}
        {cj.criterioFinalizacion && (
          <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">
            <span className="font-semibold">Para completar la lección: </span>
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
        <a href={resource.url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline mt-2 inline-block">
          Abrir material original ↗
        </a>
      )}
    </div>
  )
}

export default function CourseView() {
  const { courseId, resourceId } = useParams()
  const navigate = useNavigate()
  const { data: course, isLoading, isError } = useCourse(courseId || '')
  const mark = useMarkResource()
  const { data: resume } = useResume(course?.id)
  const saveResume = useSaveResume()
  const [selectedId, setSelectedId] = useState<string | null>(resourceId || null)
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})
  const [navOpen, setNavOpen] = useState(false)
  const [tab, setTab] = useState<'content' | 'forum'>('content')
  const initedRef = useRef<string | null>(null)

  const modules: Module[] = course?.modules || []
  const flatResources = useMemo(() => modules.flatMap((m) => m.resources), [modules])

  // Al cambiar de curso, olvidar la selección anterior (esta instancia del
  // componente se reutiliza al navegar entre cursos).
  useEffect(() => {
    setOpenModules({})
    initedRef.current = null
    if (!resourceId) setSelectedId(null)
  }, [courseId, resourceId])

  // Selección inicial: 1) resourceId de la URL, 2) posición guardada,
  // 3) primer recurso sin completar, 4) primero.
  useEffect(() => {
    if (!flatResources.length || initedRef.current === courseId) return
    let target = resourceId && flatResources.find((r) => r.id === resourceId)?.id
    if (!target && resume?.resourceId && flatResources.some((r) => r.id === resume.resourceId)) target = resume.resourceId
    if (!target) target = (flatResources.find((r) => !r.completed) || flatResources[0]).id
    initedRef.current = courseId || null
    setSelectedId(target)
    const mod = modules.find((m) => m.resources.some((r) => r.id === target))
    if (mod) setOpenModules({ [mod.id]: true })
  }, [flatResources, courseId, resourceId, resume, modules])

  // Guardar posición + sincronizar URL + evento.
  useEffect(() => {
    if (!selectedId || !course?.id) return
    if (resourceId !== selectedId) navigate(`/courses/${courseId}/${selectedId}`, { replace: true })
    saveResume.mutate({ courseId: course.id, resourceId: selectedId })
    logEvent('lesson_view', {}, selectedId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, course?.id])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando curso...</div>
  }
  if (isError || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500">No se pudo cargar el curso.</p>
        <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">
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
          <nav className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1">
            <button onClick={() => navigate('/')} className="text-primary-600 dark:text-primary-400 hover:underline">
              Dashboard
            </button>
            {course.meta?.programSlug === 'master-iep' && (
              <>
                <span>/</span>
                <button onClick={() => navigate('/master-iep')} className="text-primary-600 dark:text-primary-400 hover:underline">
                  Máster IEP
                </button>
              </>
            )}
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">{course.title}</span>
            {tab === 'content' && selected && (
              <>
                <span>/</span>
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-[40vw]">{selected.title}</span>
              </>
            )}
          </nav>
          <div className="flex items-start justify-between gap-3 mt-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setTab('content')}
                className={`text-xs px-3 py-1.5 rounded ${tab === 'content' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                Contenido
              </button>
              <button
                onClick={() => setTab('forum')}
                className={`text-xs px-3 py-1.5 rounded ${tab === 'forum' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                Foro
              </button>
            </div>
          </div>
          {course.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-3xl text-sm">{course.description}</p>
          )}
          <div className="mt-3 max-w-md">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso del curso</span>
              <span>
                {course.progress?.completed ?? 0}/{course.progress?.total ?? 0} · {pct}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      {tab === 'forum' ? (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Forum courseId={course.id} />
        </div>
      ) : (
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar — plegable en móvil */}
        <button
          onClick={() => setNavOpen((o) => !o)}
          className="lg:hidden w-full text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white"
        >
          {navOpen ? '▾' : '▸'} Contenido · {modules.length} módulos
        </button>
        <aside
          className={`${navOpen ? 'block' : 'hidden'} lg:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-max lg:sticky lg:top-6`}
        >
          <div className="hidden lg:block p-3 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-900 dark:text-white text-sm">
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
                            onClick={() => {
                              setSelectedId(r.id)
                              setNavOpen(false)
                            }}
                            className={`w-full text-left pl-5 pr-3 py-1.5 text-sm flex items-center gap-2 ${
                              r.id === selectedId
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
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
              {selected.contentJson?.internalCourseSlug && (
                <button
                  onClick={() => navigate(`/courses/${selected.contentJson.internalCourseSlug}`)}
                  className="inline-flex items-center gap-2 mb-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  ▶ Ver este curso completo aquí — sin salir de la plataforma
                </button>
              )}
              {selected.url && (
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mb-4 text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {selected.contentJson?.internalCourseSlug ? 'También disponible en el sitio original ↗' : 'Abrir material ↗'}
                </a>
              )}

              <ResourceBody resource={selected} courseId={course.id} courseSlug={course.slug} />

              <div className="mt-8 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                <button
                  onClick={() => go(-1)}
                  disabled={selIndex <= 0}
                  className="text-sm text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:underline"
                >
                  ← Anterior
                </button>
                {(() => {
                  const cjs = selected.contentJson || {}
                  const lessonHasFormative =
                    selected.type === 'lesson' &&
                    ((Array.isArray(cjs.quiz) && cjs.quiz.length > 0) || !!cjs.exercise?.text)
                  const canManual =
                    selected.type !== 'exam' && selected.type !== 'project' && !lessonHasFormative
                  if (lessonHasFormative) {
                    return (
                      <span className="text-xs text-gray-400">
                        {selected.completed
                          ? '✅ Lección completada'
                          : 'Entrega la actividad y aprueba el quiz para completar'}
                      </span>
                    )
                  }
                  if (!canManual) return <span />
                  return (
                    <button
                      onClick={() => mark.mutate({ resourceId: selected.id, completed: !selected.completed })}
                      disabled={mark.isPending}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selected.completed
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {selected.completed ? '✅ Completada — desmarcar' : 'Marcar como completada'}
                    </button>
                  )
                })()}
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
      )}
    </div>
  )
}

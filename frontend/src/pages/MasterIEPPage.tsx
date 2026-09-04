import { useNavigate } from 'react-router-dom'
import { useProgram, type ProgramAsignatura } from '../hooks/usePrograms'

const TRACK_ICON: Record<string, string> = {
  'PRO-essentials': '🧱',
  PROadvance: '🚀',
  PROexpertify: '🛡️',
  TFM: '🎓',
}

function AsignaturaCard({
  asignatura,
  prereqTitle,
  onOpen,
}: {
  asignatura: ProgramAsignatura
  prereqTitle: string | null
  onOpen: () => void
}) {
  const pct = asignatura.progress.percentage

  if (asignatura.locked) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800/60 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-5 opacity-70">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-500 dark:text-gray-400 flex-1">🔒 {asignatura.title}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {prereqTitle ? `Completa "${prereqTitle}" para desbloquear.` : 'Bloqueada.'}
        </p>
      </div>
    )
  }

  return (
    <button
      onClick={onOpen}
      className="text-left bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-600 shadow-md hover:shadow-lg transition p-5 flex flex-col"
    >
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{asignatura.title}</h3>
      {asignatura.contenidos.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {asignatura.contenidos.slice(0, 3).map((c, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {c}
            </span>
          ))}
          {asignatura.contenidos.length > 3 && (
            <span className="text-xs px-2 py-0.5 text-gray-400">+{asignatura.contenidos.length - 3}</span>
          )}
        </div>
      )}
      <div className="mt-auto">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progreso</span>
          <span>{asignatura.progress.completed}/{asignatura.progress.total} · {pct}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="mt-3 text-sm font-semibold text-primary">Ver asignatura →</span>
    </button>
  )
}

export function MasterIEPPage() {
  const navigate = useNavigate()
  const { data: program, isLoading, isError } = useProgram('master-iep')

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando programa...</div>
  }
  if (isError || !program) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500">No se pudo cargar el Máster.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
          Volver al dashboard
        </button>
      </div>
    )
  }

  const allAsignaturas = program.tracks.flatMap((t) => t.asignaturas)
  const titleBySlug: Record<string, string> = Object.fromEntries(allAsignaturas.map((a) => [a.slug, a.title]))
  const totalAsignaturas = allAsignaturas.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate('/')} className="text-primary hover:underline font-semibold mb-6 inline-block">
          ← Volver al dashboard
        </button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">🎓 {program.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {totalAsignaturas - 1} asignaturas + Proyecto Fin de Programa, organizadas en 3 certificados
            (PRO-essentials, PROadvance, PROexpertify).
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-primary">{totalAsignaturas}</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Asignaturas + TFM</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-primary">{program.tracks.length - 1}</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Certificados por tramo</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-primary">{program.progress.percentage}%</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Progreso general</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-primary">
                {allAsignaturas.filter((a) => !a.locked).length}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Desbloqueadas</p>
            </div>
          </div>
        </div>

        {/* Tramos */}
        {program.tracks.map((track) => (
          <section key={track.key} className="mb-12">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {TRACK_ICON[track.key] || '📘'} {track.label}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {track.progress.completed}/{track.progress.total} · {track.progress.percentage}%
                {track.completed ? ' · ✅ completado' : ''}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: `${track.progress.percentage}%` }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {track.asignaturas.map((a) => (
                <AsignaturaCard
                  key={a.slug}
                  asignatura={a}
                  prereqTitle={a.prerequisiteSlug ? titleBySlug[a.prerequisiteSlug] || null : null}
                  onOpen={() => navigate(`/courses/${a.slug}`)}
                />
              ))}
            </div>
          </section>
        ))}

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Cada asignatura se desbloquea al completar el 100% de la anterior. El orden y los contenidos de
          este programa siguen el documento oficial del Máster.
        </p>
      </div>
    </div>
  )
}

export default MasterIEPPage

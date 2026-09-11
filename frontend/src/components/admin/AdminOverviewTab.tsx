import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminOverview } from '../../hooks/useAdminAnalytics'
import { useCourseAnalytics } from '../../hooks/useAnalytics'

const KIND_LABEL: Record<string, string> = {
  program: 'Programa',
  aula: 'Aula',
  library: 'Biblioteca',
  master: 'Máster',
  native: 'Curso nativo',
  course: 'Curso',
}

function KpiCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

function CourseStudentsDrilldown({ courseId }: { courseId: string }) {
  const { data, isLoading } = useCourseAnalytics(courseId)
  if (isLoading) return <p className="text-sm text-gray-500 py-3">Cargando estudiantes…</p>
  if (!data || data.students.length === 0) {
    return <p className="text-sm text-gray-500 py-3">Ningún estudiante matriculado todavía.</p>
  }
  return (
    <div className="py-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 dark:text-gray-400">
            <th className="py-1 pr-4">Estudiante</th>
            <th className="py-1 pr-4">Progreso</th>
            <th className="py-1 pr-4">Entregas</th>
          </tr>
        </thead>
        <tbody>
          {[...data.students]
            .sort((a, b) => b.progress - a.progress)
            .map((s) => (
              <tr key={s.id} className="border-t border-gray-100 dark:border-gray-700">
                <td className="py-1.5 pr-4 text-gray-900 dark:text-white">{s.name}</td>
                <td className="py-1.5 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      <div
                        className="h-full bg-primary-600"
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">{s.progress}%</span>
                  </div>
                </td>
                <td className="py-1.5 pr-4 text-gray-600 dark:text-gray-300">{s.submissions}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export function AdminOverviewTab() {
  const navigate = useNavigate()
  const { data, isLoading } = useAdminOverview()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  if (isLoading || !data) {
    return <p className="text-gray-500 py-8 text-center">Cargando resumen…</p>
  }

  const filteredCourses = data.courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Alumnos" value={data.usersByRole.student} icon="🎓" />
        <KpiCard label="Profesores" value={data.usersByRole.instructor} icon="👩‍🏫" />
        <KpiCard label="Directores de TFM" value={data.usersByRole.director_tfm} icon="🧑‍🔬" />
        <KpiCard label="Administradores" value={data.usersByRole.admin} icon="🛡️" />
        <KpiCard label="Cursos" value={data.totalCourses} icon="📚" />
        <KpiCard label="Matrículas totales" value={data.totalEnrollments} icon="📝" />
        <KpiCard label="Avance promedio" value={`${data.avgCompletionRate}%`} icon="📊" />
        <KpiCard label="Usuarios totales" value={data.totalUsers} icon="👥" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Matrícula y avance por curso ({filteredCourses.length})
          </h2>
          <input
            type="text"
            placeholder="Buscar curso…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-4">Curso</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Matriculados</th>
                <th className="py-2 pr-4">Avance promedio</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((c) => (
                <Fragment key={c.id}>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-4 text-gray-900 dark:text-white">
                      {c.title}
                      {!c.published && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">(sin publicar)</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{KIND_LABEL[c.kind] || c.kind}</td>
                    <td className="py-2 pr-4 text-gray-900 dark:text-white font-medium">{c.enrolled}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                          <div className="h-full bg-green-600" style={{ width: `${c.avgProgress}%` }} />
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">{c.avgProgress}%</span>
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {c.enrolled > 0 && (
                        <button
                          onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                          className="text-primary-600 dark:text-primary-400 hover:underline text-xs font-medium"
                        >
                          {expanded === c.id ? 'Ocultar' : 'Ver estudiantes'}
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/courses/${c.slug}`)}
                        className="ml-3 text-gray-500 dark:text-gray-400 hover:underline text-xs"
                      >
                        Abrir curso
                      </button>
                    </td>
                  </tr>
                  {expanded === c.id && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 dark:bg-gray-900/40 px-4">
                        <CourseStudentsDrilldown courseId={c.id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

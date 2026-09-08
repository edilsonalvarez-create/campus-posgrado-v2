import { useCourseAnalytics } from '../hooks/useAnalytics';

interface AnalyticsDashboardProps {
  courseId: string;
  courseName: string;
}

export function AnalyticsDashboard({ courseId, courseName }: AnalyticsDashboardProps) {
  const { data: analytics, isLoading } = useCourseAnalytics(courseId);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Cargando estadísticas...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8 text-gray-500">No hay datos disponibles</div>;
  }

  const statsCards = [
    {
      label: 'Estudiantes Inscritos',
      value: analytics.totalStudents,
      icon: '👥',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20'
    },
    {
      label: 'Entregas Totales',
      value: analytics.totalSubmissions,
      icon: '📝',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'Entregas Calificadas',
      value: analytics.gradedSubmissions,
      icon: '✅',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Tasa de Completitud',
      value: `${analytics.completionRate}%`,
      icon: '📊',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Analytics - {courseName}
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bgColor} rounded-lg p-4 border border-gray-200 dark:border-gray-700`}
          >
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {stat.label}
            </p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Calificación Promedio */}
      {analytics.gradedSubmissions > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Calificación Promedio
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-5xl font-bold text-primary-600 dark:text-primary-400">
              {analytics.averageGrade.toFixed(1)}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              sobre 100 puntos
            </span>
          </div>
        </div>
      )}

      {/* Estudiantes por Progreso */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Progreso de Estudiantes
        </h3>
        {analytics.students.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No hay estudiantes inscritos
          </p>
        ) : (
          <div className="space-y-3">
            {analytics.students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {student.submissions} entrega{student.submissions !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white min-w-12 text-right">
                    {student.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dificultad por recurso (analítica de aprendizaje) */}
      {analytics.difficulty && analytics.difficulty.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Dificultad por examen</h3>
          <p className="text-xs text-gray-500 mb-4">Recursos con mayor tasa de suspenso en la cohorte.</p>
          <div className="space-y-2">
            {analytics.difficulty.map((d) => (
              <div key={d.resourceId} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{d.title}</span>
                <span className="text-gray-500 mx-3">{d.attempts} intento(s)</span>
                <span
                  className={`font-semibold ${d.failRate >= 50 ? 'text-rose-600' : d.failRate >= 25 ? 'text-amber-600' : 'text-emerald-600'}`}
                >
                  {d.failRate}% suspenso{d.avgScore != null ? ` · media ${d.avgScore}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conceptos con más fallo en la cohorte */}
      {analytics.skillGaps && analytics.skillGaps.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Conceptos que más cuestan</h3>
          <p className="text-xs text-gray-500 mb-4">Ratio de acierto agregado de la cohorte por contenido oficial.</p>
          <div className="space-y-2">
            {analytics.skillGaps.map((g) => (
              <div key={g.skillTag} className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300 truncate">{g.skillTag}</span>
                  <span className="text-gray-500 ml-2">{g.ratio}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full ${g.ratio < 50 ? 'bg-rose-500' : g.ratio < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${g.ratio}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entregas Pendientes */}
      {analytics.pendingSubmissions > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            ⚠️ {analytics.pendingSubmissions} entrega{analytics.pendingSubmissions !== 1 ? 's' : ''} pendiente{analytics.pendingSubmissions !== 1 ? 's' : ''} de calificar
          </p>
        </div>
      )}
    </div>
  );
}

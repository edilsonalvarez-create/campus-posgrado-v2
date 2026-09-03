import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { useSubmissions } from '../hooks/useSubmissions';
import { useAuthStore } from '../state/store';
import { GradingPanel } from '../components/GradingPanel';

export function InstructorDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'all'>('pending');

  const { data: allCourses = [], isLoading: coursesLoading } = useCourses();
  const { data: submissions = [], isLoading: submissionsLoading } = useSubmissions(
    selectedCourseId ? { courseId: selectedCourseId } : undefined
  );

  // Only show courses taught by this instructor
  const myCourses = allCourses.filter((c: any) => c.instructorId === user?.id);
  const pendingSubmissions = submissions.filter((s: any) => s.status === 'submitted');

  if (user?.role !== 'instructor') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No tienes acceso a esta página</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:underline"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panel de Instructor
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Volver al dashboard
          </button>
        </div>

        {/* Mis cursos */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Mis Cursos ({myCourses.length})
          </h2>
          {coursesLoading ? (
            <div className="text-center py-8 text-gray-500">Cargando cursos...</div>
          ) : myCourses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500">
              No has creado ningún curso aún
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCourses.map((course: any) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedCourseId === course.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {course.modules?.length || 0} módulos
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Entregas */}
        {selectedCourseId && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex gap-2 border-b border-gray-300 dark:border-gray-700 mb-6">
              <button
                onClick={() => setSelectedTab('pending')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  selectedTab === 'pending'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Pendientes ({pendingSubmissions.length})
              </button>
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  selectedTab === 'all'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Todas ({submissions.length})
              </button>
            </div>

            {submissionsLoading ? (
              <div className="text-center py-8 text-gray-500">Cargando entregas...</div>
            ) : selectedTab === 'pending' && pendingSubmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                ¡No hay entregas pendientes! 🎉
              </div>
            ) : selectedTab === 'all' && submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay entregas en este curso
              </div>
            ) : (
              <div className="space-y-4">
                {(selectedTab === 'pending' ? pendingSubmissions : submissions).map(
                  (submission: any) => (
                    <GradingPanel key={submission.id} submission={submission} />
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

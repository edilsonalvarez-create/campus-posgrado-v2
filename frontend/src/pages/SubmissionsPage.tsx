import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/store';
import { useCourseSubmissions } from '../hooks/useSubmissions';
import { useCourse } from '../hooks/useCourses';
import { SubmissionForm } from '../components/SubmissionForm';
import { SubmissionList } from '../components/SubmissionList';
import { GradingPanel } from '../components/GradingPanel';

export function SubmissionsPage() {
  const { courseId, resourceId } = useParams<{ courseId: string; resourceId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [selectedTab, setSelectedTab] = useState<'my-submissions' | 'grading'>('my-submissions');

  const { data: course, isLoading: courseLoading } = useCourse(courseId!);
  const { data: submissions = [], isLoading: submissionsLoading } = useCourseSubmissions(courseId!);

  if (!courseId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Curso no encontrado</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:underline mt-4"
        >
          Volver al dashboard
        </button>
      </div>
    );
  }

  if (courseLoading) {
    return <div className="text-center py-8">Cargando curso...</div>;
  }

  const resource = course?.modules
    ?.flatMap((m: any) => m.resources || [])
    .find((r: any) => r.id === resourceId);

  const mySubmissions = submissions.filter((s: any) => s.studentId === user?.id);
  const pendingSubmissions = submissions.filter((s: any) => s.status === 'submitted');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-2"
        >
          ← Volver al curso
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {resource?.title || 'Entregas'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{course?.title}</p>

        {user?.role === 'student' ? (
          <div className="space-y-8">
            {resourceId && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Enviar entrega
                </h2>
                <SubmissionForm
                  resourceId={resourceId}
                  courseId={courseId}
                  resourceTitle={resource?.title || 'Tarea'}
                />
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Mis entregas
              </h2>
              <SubmissionList submissions={mySubmissions} isLoading={submissionsLoading} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-gray-300 dark:border-gray-700">
              <button
                onClick={() => setSelectedTab('my-submissions')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  selectedTab === 'my-submissions'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Todas las entregas ({submissions.length})
              </button>
              <button
                onClick={() => setSelectedTab('grading')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  selectedTab === 'grading'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Pendientes de calificar ({pendingSubmissions.length})
              </button>
            </div>

            <div className="space-y-4">
              {selectedTab === 'my-submissions' && (
                <div>
                  {submissions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No hay entregas aún
                    </p>
                  ) : (
                    submissions.map((submission: any) => (
                      <GradingPanel key={submission.id} submission={submission} />
                    ))
                  )}
                </div>
              )}

              {selectedTab === 'grading' && (
                <div className="space-y-4">
                  {pendingSubmissions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No hay entregas pendientes de calificar
                    </p>
                  ) : (
                    pendingSubmissions.map((submission: any) => (
                      <GradingPanel key={submission.id} submission={submission} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

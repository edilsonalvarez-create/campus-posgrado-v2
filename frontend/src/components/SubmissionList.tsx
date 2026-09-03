import { Submission } from '../hooks/useSubmissions';

interface SubmissionListProps {
  submissions: Submission[];
  isLoading?: boolean;
}

export function SubmissionList({ submissions, isLoading }: SubmissionListProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Cargando entregas...</div>;
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay entregas aún. Envía tu primer trabajo.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                ID: {submission.id.slice(0, 8)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(submission.submittedAt).toLocaleDateString('es-CO')}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                submission.status === 'graded'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
              }`}
            >
              {submission.status === 'graded' ? 'Calificada' : 'Pendiente'}
            </span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
            {submission.content}
          </p>

          {submission.status === 'graded' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Calificación: <span className="text-blue-600 dark:text-blue-400">{submission.grade}/100</span>
              </p>
              {submission.feedback && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{submission.feedback}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

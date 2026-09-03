import { useState } from 'react';
import { useGradeSubmission } from '../hooks/useSubmissions';
import { Submission } from '../hooks/useSubmissions';

interface GradingPanelProps {
  submission: Submission;
  onSuccess?: () => void;
}

export function GradingPanel({ submission, onSuccess }: GradingPanelProps) {
  const [grade, setGrade] = useState<number>(submission.grade || 0);
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const { mutate: gradeSubmission, isPending } = useGradeSubmission();
  const [isEditing, setIsEditing] = useState(!submission.grade);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    gradeSubmission(
      { submissionId: submission.id, grade, feedback },
      {
        onSuccess: () => {
          setIsEditing(false);
          onSuccess?.();
        }
      }
    );
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Entrega de {submission.studentName}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(submission.submittedAt).toLocaleDateString('es-CO')}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 mb-4 max-h-40 overflow-y-auto">
        <p className="text-sm text-gray-700 dark:text-gray-300">{submission.content}</p>
      </div>

      {!isEditing && submission.grade !== null ? (
        <div className="space-y-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Calificación: <span className="text-green-600 dark:text-green-400">{submission.grade}/100</span>
            </p>
            {submission.feedback && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{submission.feedback}</p>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline py-2"
          >
            Editar calificación
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calificación (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retroalimentación
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Escribe tu comentario o evaluación..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 resize-none"
              rows={5}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isPending ? 'Guardando...' : 'Guardar calificación'}
            </button>
            {submission.grade !== null && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

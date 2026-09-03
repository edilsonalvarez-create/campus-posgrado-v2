import { useState } from 'react';
import { useCreateSubmission } from '../hooks/useSubmissions';

interface SubmissionFormProps {
  resourceId: string;
  courseId: string;
  resourceTitle: string;
  onSuccess?: () => void;
}

export function SubmissionForm({ resourceId, courseId, resourceTitle, onSuccess }: SubmissionFormProps) {
  const [content, setContent] = useState('');
  const { mutate: createSubmission, isPending } = useCreateSubmission();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createSubmission(
      { resourceId, courseId, content },
      {
        onSuccess: () => {
          setSubmitted(true);
          setContent('');
          onSuccess?.();
        }
      }
    );
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Entrega enviada</h3>
        <p className="text-sm text-green-700 dark:text-green-300">Tu trabajo ha sido entregado correctamente.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-3 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
        >
          Enviar otra entrega
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Actividad: {resourceTitle}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe tu respuesta o solución aquí..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={8}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isPending ? 'Enviando...' : 'Enviar entrega'}
      </button>
    </form>
  );
}

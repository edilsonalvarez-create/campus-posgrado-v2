import { useState } from 'react';
import { useQuiz, useSubmitQuiz } from '../hooks/useQuiz';

interface QuizViewProps {
  quizId: string;
  onComplete?: (score: number) => void;
}

export function QuizView({ quizId, onComplete }: QuizViewProps) {
  const { data: quiz, isLoading } = useQuiz(quizId);
  const { mutate: submitQuiz, isPending } = useSubmitQuiz();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Cargando cuestionario...</div>;
  }

  if (!quiz) {
    return <div className="text-center py-8 text-gray-500">Quiz no encontrado</div>;
  }

  if (completed && score !== null) {
    const passed = score >= 70;
    return (
      <div className={`rounded-lg p-8 text-center ${passed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
          {passed ? '🎉 ¡Aprobado!' : '❌ No aprobado'}
        </h2>
        <p className={`text-5xl font-bold mb-4 ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {score}%
        </p>
        <p className={`mb-6 ${passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
          {passed
            ? 'Obtuviste un certificado por completar este cuestionario'
            : 'Necesitas al menos 70% para pasar. Intenta nuevamente'}
        </p>
        <button
          onClick={() => {
            setCompleted(false);
            setCurrentQuestion(0);
            setAnswers({});
            setScore(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (currentQuestion >= quiz.questions.length) {
    const quizAnswers = quiz.questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || ''
    }));

    submitQuiz(
      { quizId, answers: quizAnswers },
      {
        onSuccess: (response: any) => {
          setScore(response.score);
          setCompleted(true);
          onComplete?.(response.score);
        }
      }
    );

    return (
      <div className="text-center py-8 text-gray-500">
        Procesando respuestas...
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Pregunta {currentQuestion + 1} de {quiz.questions.length}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {question.text}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option) => (
          <label
            key={option.id}
            className="flex items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={answers[question.id] === option.id}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [question.id]: e.target.value
                })
              }
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-3 text-gray-900 dark:text-white font-medium">
              {option.text}
            </span>
          </label>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
        >
          ← Anterior
        </button>
        <button
          onClick={() => {
            if (currentQuestion < quiz.questions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
            }
          }}
          disabled={!answers[question.id] || currentQuestion === quiz.questions.length - 1}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
        >
          Siguiente →
        </button>
        {currentQuestion === quiz.questions.length - 1 && (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={!answers[question.id] || isPending}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            {isPending ? 'Enviando...' : 'Enviar'}
          </button>
        )}
      </div>
    </div>
  );
}

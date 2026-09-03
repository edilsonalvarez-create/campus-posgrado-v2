import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

interface CourseCreationWizardProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CourseCreationWizard({ onSuccess, onCancel }: CourseCreationWizardProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCourse = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/courses', {
        title: formData.title,
        description: formData.description
      });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onSuccess?.();
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Crear Nuevo Curso
      </h2>

      {/* Progress Indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i <= step
                ? 'bg-blue-600 dark:bg-blue-400'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Información Básica */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título del Curso
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Inteligencia Artificial Avanzada"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe el contenido y objetivos del curso..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Paso 1 de 3: Información básica
          </p>
        </div>
      )}

      {/* Step 2: Estructura */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 En el siguiente paso podrás agregar módulos y recursos a tu curso.
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Tu curso se creará con la siguiente estructura:
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Módulo 1: Fundamentos
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Módulo 2: Intermedio
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Módulo 3: Avanzado
            </li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Paso 2 de 3: Estructura del curso
          </p>
        </div>
      )}

      {/* Step 3: Revisar y Crear */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Título
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formData.title || 'Sin título'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Descripción
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {formData.description || 'Sin descripción'}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Paso 3 de 3: Revisar información
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            ← Anterior
          </button>
        )}
        {step < 3 && (
          <button
            onClick={handleNext}
            disabled={step === 1 && !formData.title}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            Siguiente →
          </button>
        )}
        {step === 3 && (
          <>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateCourse}
              disabled={isSubmitting || !formData.title}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
            >
              {isSubmitting ? 'Creando...' : 'Crear Curso'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

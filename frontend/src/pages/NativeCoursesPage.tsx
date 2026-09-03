import React from 'react'
import { useParams } from 'react-router-dom'

interface NativeCourse {
  id: string
  title: string
  equivalentTo: string
  description: string
  credits: number
  weeks: number
  level: string
  modules: string[]
  outcomes: string[]
  evaluation: { [key: string]: number }
}

export const NativeCoursesPage: React.FC = () => {
  const { courseId } = useParams()

  const courses: { [key: string]: NativeCourse } = {
    'native-ai-101': {
      id: 'native-ai-101',
      title: 'Fundamentos de Inteligencia Artificial',
      equivalentTo: 'MIT 6.034',
      description: 'Aprende los fundamentos de la IA desde cero, con énfasis en algoritmos de búsqueda, representación del conocimiento y razonamiento automático.',
      credits: 12,
      weeks: 12,
      level: 'Principiante-Intermedio',
      modules: [
        'Introducción a la IA',
        'Resolución de Problemas y Búsqueda',
        'Representación del Conocimiento',
        'Razonamiento Automático',
        'Sistemas Expertos',
        'Ética en IA'
      ],
      outcomes: [
        'Comprender los principios fundamentales de la IA',
        'Implementar algoritmos de búsqueda y resolución',
        'Desarrollar sistemas de representación del conocimiento',
        'Aplicar razonamiento lógico y probabilístico'
      ],
      evaluation: {
        'Quizzes': 15,
        'Proyectos': 35,
        'Prácticas': 30,
        'Examen Final': 20
      }
    },
    'native-ml-101': {
      id: 'native-ml-101',
      title: 'Machine Learning desde Cero',
      equivalentTo: 'Google ML Crash Course',
      description: 'Domina los conceptos y prácticas de Machine Learning moderno. Desde regresión lineal hasta modelos complejos.',
      credits: 12,
      weeks: 8,
      level: 'Principiante',
      modules: [
        'Conceptos Fundamentales de ML',
        'Regresión Lineal',
        'Clasificación Logística',
        'Feature Engineering',
        'Model Validation y Evaluation',
        'Regularización y Optimización',
        'Practical ML Workflow'
      ],
      outcomes: [
        'Entender el ciclo completo de ML',
        'Implementar y entrenar modelos',
        'Evaluar y optimizar modelos',
        'Evitar trampas comunes en ML'
      ],
      evaluation: {
        'Quizzes': 15,
        'Proyectos': 35,
        'Prácticas': 30,
        'Examen Final': 20
      }
    },
    'native-dl-101': {
      id: 'native-dl-101',
      title: 'Deep Learning Fundamentals',
      equivalentTo: 'Andrew Ng Specialization',
      description: 'Conviértete en experto en redes neuronales profundas, CNNs, RNNs, Transformers y aplicaciones prácticas.',
      credits: 18,
      weeks: 16,
      level: 'Intermedio-Avanzado',
      modules: [
        'Fundamentos de Redes Neuronales',
        'Optimización y Regularización',
        'Convolutional Neural Networks',
        'Recurrent Neural Networks',
        'Sequence Models y Attention',
        'Transformers',
        'Transfer Learning',
        'Practical Deep Learning'
      ],
      outcomes: [
        'Construir y entrenar redes neuronales',
        'Optimizar redes profundas',
        'Trabajar con CNN para visión',
        'Trabajar con RNN para secuencias',
        'Implementar mejores prácticas de DL'
      ],
      evaluation: {
        'Quizzes': 15,
        'Proyectos': 35,
        'Prácticas': 30,
        'Examen Final': 20
      }
    }
  }

  const course = courseId ? courses[courseId] : null

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🚀 Cursos Nativos de Excelencia Académica
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {Object.values(courses).map((c) => (
              <a
                key={c.id}
                href={`/native-courses/${c.id}`}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="bg-gradient-to-r from-primary to-red-700 text-white p-6 h-40 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                    <p className="text-sm opacity-90">Equivalente: {c.equivalentTo}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-2">{c.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>📚 {c.credits} créditos</span>
                    <span>📅 {c.weeks} semanas</span>
                  </div>
                  <div className="mt-4 inline-block bg-red-100 text-primary px-3 py-1 rounded text-sm font-semibold">
                    {c.level}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Volver */}
        <a href="/native-courses" className="text-primary hover:underline font-semibold mb-6 inline-block">
          ← Volver a cursos
        </a>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-red-700 text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="inline-block bg-white text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
            {course.level}
          </div>
          <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
          <p className="text-lg opacity-90 mb-4">Equivalente: {course.equivalentTo}</p>
          <p className="text-base mb-5">{course.description}</p>
          <a
            href={`/courses/${course.id}`}
            className="inline-block bg-white text-primary px-5 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition"
          >
            📖 Entrar al curso y ver las lecciones →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl font-bold text-primary mb-2">{course.credits}</div>
            <p className="text-gray-600">Créditos académicos</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl font-bold text-primary mb-2">{course.weeks}</div>
            <p className="text-gray-600">Semanas de duración</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl font-bold text-primary mb-2">{course.modules.length}</div>
            <p className="text-gray-600">Módulos temáticos</p>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Resultados de Aprendizaje</h2>
          <ul className="space-y-3">
            {course.outcomes.map((outcome, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Modules */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 Módulos del Curso</h2>
          <div className="space-y-3">
            {course.modules.map((module, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{module}</h3>
                  <p className="text-sm text-gray-600">Semana {Math.ceil((idx + 1) * course.weeks / course.modules.length)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Sistema de Evaluación</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(course.evaluation).map(([name, percentage]) => (
              <div key={name} className="bg-gradient-to-br from-primary to-red-700 text-white p-4 rounded-lg">
                <div className="text-3xl font-bold mb-2">{percentage}%</div>
                <p className="text-sm">{name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee */}
        <div className="bg-primary text-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">✅ Garantía de Asimilación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3">Distribución de Contenido</h3>
              <ul className="space-y-2 text-sm">
                <li>• 30% Lecturas académicas</li>
                <li>• 30% Videos explicativos</li>
                <li>• 20% Ejercicios prácticos</li>
                <li>• 20% Proyectos integradores</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Técnicas Pedagógicas</h3>
              <ul className="space-y-2 text-sm">
                <li>• Spaced Repetition (1 semana, 1 mes)</li>
                <li>• Active Recall (preguntas antes de respuestas)</li>
                <li>• Interleaving (mezcla de temas)</li>
                <li>• Elaboration (explicación propia)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enrollment */}
        <div className="flex gap-4">
          <button className="flex-1 bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition">
            Matricularme ahora
          </button>
          <button className="flex-1 border-2 border-primary text-primary py-4 rounded-lg font-bold text-lg hover:bg-red-50 transition">
            Más información
          </button>
        </div>
      </div>
    </div>
  )
}

export default NativeCoursesPage

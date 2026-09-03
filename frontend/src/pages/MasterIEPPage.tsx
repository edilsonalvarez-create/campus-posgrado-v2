import React, { useState } from 'react'

interface Asignatura {
  id: string
  title: string
  description: string
  credits: number
  weeks: number
  level: string
  modules?: any[]
}

interface MasterIEPPageProps {}

export const MasterIEPPage: React.FC<MasterIEPPageProps> = () => {
  const [selectedAsignatura, setSelectedAsignatura] = useState<string | null>(null)

  const asignaturas: Asignatura[] = [
    {
      id: 'ma1',
      title: 'Asignatura 1: Fundamentos de IA y Tecnologías Disruptivas',
      description: 'Introducción integral a los fundamentos de la Inteligencia Artificial, Machine Learning, Deep Learning, Big Data, Cloud Computing e IoT.',
      credits: 6,
      weeks: 8,
      level: 'Introductorio'
    },
    {
      id: 'ma2',
      title: 'Asignatura 2: Machine Learning Avanzado',
      description: 'Profundización en técnicas avanzadas de ML: Feature Engineering, Ensemble Methods, Hyperparameter Tuning, AutoML y MLOps.',
      credits: 6,
      weeks: 8,
      level: 'Intermedio'
    },
    {
      id: 'ma3',
      title: 'Asignatura 3: Deep Learning Especializado',
      description: 'Técnicas avanzadas de Deep Learning: Transfer Learning, Fine-tuning, GANs, NLP con Transformers y Vision Transformers.',
      credits: 6,
      weeks: 8,
      level: 'Avanzado'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎓 Master de IEP
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Inteligencia Artificial y Tecnologías Disruptivas para la Innovación en la Industria 4.0
          </p>
          <div className="bg-primary/10 border-l-4 border-primary p-4 mb-6 rounded">
            <p className="text-gray-700 font-semibold">
              ✅ Este Master integra 3 Cursos Nativos de Excelencia Académica
            </p>
            <p className="text-gray-600 text-sm mt-2">
              AI-101 (MIT 6.034) + ML-101 (Google) + DL-101 (Andrew Ng) - Todos incluidos en el plan de estudio
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-primary">42</div>
              <p className="text-gray-600">Créditos totales</p>
              <p className="text-xs text-gray-500 mt-1">(Incluye cursos nativos)</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-primary">36</div>
              <p className="text-gray-600">Semanas de estudio</p>
              <p className="text-xs text-gray-500 mt-1">(Integrado)</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-primary">3+3</div>
              <p className="text-gray-600">Componentes</p>
              <p className="text-xs text-gray-500 mt-1">Asignaturas + Cursos Nativos</p>
            </div>
          </div>
        </div>

        {/* Asignaturas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Asignaturas del Programa</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {asignaturas.map((asignatura) => (
              <div
                key={asignatura.id}
                className="bg-white rounded-lg shadow-md border-l-4 border-primary hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedAsignatura(asignatura.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">
                      {asignatura.title}
                    </h3>
                    <span className="inline-block bg-red-100 text-primary px-3 py-1 rounded text-sm font-semibold">
                      {asignatura.level}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {asignatura.description}
                  </p>

                  <div className="flex gap-4 text-sm text-gray-500 mb-6">
                    <span>📚 {asignatura.credits} créditos</span>
                    <span>📅 {asignatura.weeks} semanas</span>
                  </div>

                  <button className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-red-700 transition">
                    Ver módulos →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalles de Asignatura Seleccionada */}
        {selectedAsignatura && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <button
              onClick={() => setSelectedAsignatura(null)}
              className="text-primary hover:underline mb-6 font-semibold"
            >
              ← Volver
            </button>

            {selectedAsignatura === 'ma1' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Asignatura 1: Fundamentos de IA y Tecnologías Disruptivas
                </h2>

                {/* Curso Nativo Integrado */}
                <div className="bg-gradient-to-r from-primary to-red-700 text-white rounded-lg p-6 mb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">🚀 Curso Nativo Integrado: AI-101</h3>
                      <p className="text-red-100 mb-4">
                        Fundamentos de Inteligencia Artificial (Equivalente MIT 6.034)
                      </p>
                      <p className="text-red-100 mb-4">
                        Este curso nativo es PARTE DEL PLAN DE ESTUDIO del Master y garantiza asimilación profunda de conceptos fundamentales de IA.
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span>📚 12 créditos</span>
                        <span>📅 12 semanas</span>
                        <span>✅ Rigor MIT</span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = '/native-courses/native-ai-101'}
                      className="bg-white text-primary px-6 py-2 rounded font-semibold hover:bg-red-50 transition whitespace-nowrap ml-4"
                    >
                      Ver curso →
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Módulos</h3>
                  <div className="space-y-4">
                    {[
                      { week: 1, title: 'Introducción a la Inteligencia Artificial' },
                      { week: '2-3', title: 'Resolución de Problemas y Búsqueda' },
                      { week: '4-5', title: 'Representación del Conocimiento y Razonamiento' },
                      { week: '6-7', title: 'Machine Learning - Fundamentos' },
                      { week: 8, title: 'Deep Learning y Redes Neuronales' }
                    ].map((mod) => (
                      <div key={mod.title} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                            {mod.week}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{mod.title}</h4>
                            <p className="text-sm text-gray-600">Semana {mod.week}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Evaluación</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Quizzes Semanales</p>
                      <p className="text-2xl font-bold text-primary">10%</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Proyectos Prácticos</p>
                      <p className="text-2xl font-bold text-primary">30%</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Prácticas Hands-On</p>
                      <p className="text-2xl font-bold text-primary">30%</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Examen Final</p>
                      <p className="text-2xl font-bold text-primary">30%</p>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition text-lg">
                  Matricularse en Asignatura 1
                </button>
              </div>
            )}

            {selectedAsignatura === 'ma2' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Asignatura 2: Machine Learning Avanzado
                </h2>

                {/* Curso Nativo Integrado */}
                <div className="bg-gradient-to-r from-primary to-red-700 text-white rounded-lg p-6 mb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">🚀 Curso Nativo Integrado: ML-101</h3>
                      <p className="text-red-100 mb-4">
                        Machine Learning desde Cero (Equivalente Google ML Crash Course)
                      </p>
                      <p className="text-red-100 mb-4">
                        Este curso nativo es PARTE DEL PLAN DE ESTUDIO del Master. Domina ML moderno con rigor académico garantizado.
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span>📚 12 créditos</span>
                        <span>📅 8 semanas</span>
                        <span>✅ Rigor Google</span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = '/native-courses/native-ml-101'}
                      className="bg-white text-primary px-6 py-2 rounded font-semibold hover:bg-red-50 transition whitespace-nowrap ml-4"
                    >
                      Ver curso →
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  Temas avanzados: Feature Engineering, Ensemble Methods, Hyperparameter Tuning, AutoML, MLOps
                </p>
                <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition text-lg">
                  Matricularse en Asignatura 2
                </button>
              </div>
            )}

            {selectedAsignatura === 'ma3' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Asignatura 3: Deep Learning Especializado
                </h2>

                {/* Curso Nativo Integrado */}
                <div className="bg-gradient-to-r from-primary to-red-700 text-white rounded-lg p-6 mb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">🚀 Curso Nativo Integrado: DL-101</h3>
                      <p className="text-red-100 mb-4">
                        Deep Learning Fundamentals (Equivalente Andrew Ng Specialization)
                      </p>
                      <p className="text-red-100 mb-4">
                        Este curso nativo es PARTE DEL PLAN DE ESTUDIO del Master. Domina redes neuronales profundas con rigor de especialización.
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span>📚 18 créditos</span>
                        <span>📅 16 semanas</span>
                        <span>✅ Rigor Andrew Ng</span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = '/native-courses/native-dl-101'}
                      className="bg-white text-primary px-6 py-2 rounded font-semibold hover:bg-red-50 transition whitespace-nowrap ml-4"
                    >
                      Ver curso →
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  Temas especializados: Transfer Learning, Fine-tuning, GANs, NLP con Transformers, Vision Transformers
                </p>
                <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition text-lg">
                  Matricularse en Asignatura 3
                </button>
              </div>
            )}
          </div>
        )}


        {/* Garantía de Asimilación */}
        <div className="bg-primary text-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">✅ Garantía de Asimilación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3">Mecanismos de Aprendizaje</h3>
              <ul className="space-y-2 text-sm">
                <li>📚 30% Lecturas académicas</li>
                <li>🎥 30% Videos explicativos</li>
                <li>💻 20% Ejercicios prácticos</li>
                <li>🔬 20% Proyectos integradores</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">Técnicas Pedagógicas</h3>
              <ul className="space-y-2 text-sm">
                <li>🔄 Spaced Repetition</li>
                <li>🧠 Active Recall</li>
                <li>🔀 Interleaving</li>
                <li>📝 Elaboration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MasterIEPPage

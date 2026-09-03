import { useParams } from 'react-router-dom'

export default function CourseView() {
  const { courseId } = useParams()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Curso {courseId}</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">Vista de curso en desarrollo</p>
        </div>
      </div>
    </div>
  )
}

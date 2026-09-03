import { useNavigate } from 'react-router-dom'

interface CourseCardProps {
  id: string
  title: string
  description: string
  imageUrl?: string
  progress: {
    completed: number
    total: number
    percentage: number
  }
}

export default function CourseCard({ id, title, description, imageUrl, progress }: CourseCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/courses/${id}`)}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
    >
      {/* Image */}
      <div className="w-full h-40 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-white text-4xl">📚</div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso</span>
            <span className="text-sm font-bold text-blue-600">{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>{progress.completed}/{progress.total} lecciones</span>
          <span>{progress.percentage === 100 ? '✅ Completado' : '🔄 En progreso'}</span>
        </div>
      </div>
    </div>
  )
}

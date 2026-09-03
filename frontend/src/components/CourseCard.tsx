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
  const pct = Math.round(progress?.percentage ?? 0)
  const completed = progress?.completed ?? 0
  const total = progress?.total ?? 0

  return (
    <button
      type="button"
      onClick={() => navigate(`/courses/${id}`)}
      className="text-left bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700"
    >
      <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-end p-4">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="absolute inset-0 h-32 w-full object-cover opacity-0" aria-hidden />
        ) : null}
        <span className="text-white font-semibold text-lg drop-shadow">{title}</span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 flex-1">{description}</p>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progreso</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {completed}/{total} lecciones
          </p>
        </div>
      </div>
    </button>
  )
}

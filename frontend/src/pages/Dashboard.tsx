import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/store'
import { useCourses, useProgress } from '../hooks/useCourses'
import CourseCard from '../components/CourseCard'
import { NotificationBell } from '../components/NotificationBell'
import { CertificatesList } from '../components/CertificatesList'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { data: courses, isLoading: coursesLoading } = useCourses()
  const { data: progress } = useProgress()
  const [showCertificates, setShowCertificates] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const activeCourses = courses?.filter(c => c.progress.percentage < 100) || []
  const completedCourses = courses?.filter(c => c.progress.percentage === 100) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow dark:bg-gray-800 dark:border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Posgrado</h1>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <button
              onClick={() => setShowCertificates(!showCertificates)}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              title="Ver certificados"
            >
              🎓
            </button>
            <span className="text-gray-700 dark:text-gray-300">{user?.name}</span>
            {user?.role === 'instructor' && (
              <button
                onClick={() => navigate('/instructor')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Panel de Instructor
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition dark:bg-red-700 dark:hover:bg-red-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome card */}
        <div className="md:col-span-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white mb-12 dark:from-blue-700 dark:to-indigo-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">¡Bienvenido, {user?.name}!</h2>
              <p className="text-blue-100">
                {user?.role === 'student'
                  ? `Estás en ${courses?.length || 0} programa(s). Tu progreso general es ${progress?.averageProgress || 0}%.`
                  : 'Gestiona tus cursos y estudiantes.'}
              </p>
            </div>
            {user?.role === 'student' && (
              <button
                onClick={() => navigate('/explore')}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap ml-4 dark:bg-gray-100 dark:hover:bg-gray-200"
              >
                Explorar Cursos
              </button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cursos Activos</p>
                <p className="text-3xl font-bold text-gray-900">{activeCourses.length}</p>
              </div>
              <div className="text-4xl text-blue-600">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Progreso General</p>
                <p className="text-3xl font-bold text-gray-900">{progress?.averageProgress || 0}%</p>
              </div>
              <div className="text-4xl text-green-600">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completados</p>
                <p className="text-3xl font-bold text-gray-900">{completedCourses.length}</p>
              </div>
              <div className="text-4xl text-yellow-600">✅</div>
            </div>
          </div>
        </div>

        {/* My Courses Section */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">En Progreso</h3>
          {coursesLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando cursos...</p>
            </div>
          ) : activeCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourses.map(course => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  imageUrl={course.imageUrl}
                  progress={course.progress}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 text-lg">No hay cursos activos</p>
              <p className="text-gray-500 mt-2">Explora el catálogo para comenzar</p>
            </div>
          )}
        </section>

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Completados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map(course => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  imageUrl={course.imageUrl}
                  progress={course.progress}
                />
              ))}
            </div>
          </section>
        )}

        {/* Certificates Section */}
        {showCertificates && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🎓 Tus Certificados
            </h3>
            <CertificatesList />
          </section>
        )}
      </main>
    </div>
  )
}

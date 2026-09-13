import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/store'

// Página exclusiva para cuentas con status='pending'. El router en App.tsx la
// monta para TODA ruta mientras la cuenta esté pendiente —no solo en "/"—
// para que no sea posible navegar al resto del campus escribiendo otra URL.
export default function PendingApprovalPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800 dark:border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Posgrado</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition dark:bg-red-700 dark:hover:bg-red-800"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Tu cuenta está pendiente de aprobación
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Hola {user?.name}, tu registro se recibió correctamente. Un administrador debe aprobar tu
          cuenta y decidir en qué cursos o programas te matricula antes de que puedas acceder al campus.
          Te avisaremos cuando esté lista — por ahora puedes cerrar sesión y volver más tarde.
        </p>
      </main>
    </div>
  )
}

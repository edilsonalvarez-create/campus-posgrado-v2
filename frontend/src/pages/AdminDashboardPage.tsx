import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/store'
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab'
import { AdminUsersTab } from '../components/admin/AdminUsersTab'

type Tab = 'overview' | 'users'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [tab, setTab] = useState<Tab>('overview')

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No tienes acceso a esta página</p>
          <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de administración</h1>
          <button onClick={() => navigate('/')} className="text-primary-600 dark:text-primary-400 hover:underline">
            ← Volver al dashboard
          </button>
        </div>

        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'overview'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Resumen y matrícula
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'users'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Usuarios
          </button>
        </div>

        {tab === 'overview' ? <AdminOverviewTab /> : <AdminUsersTab />}
      </div>
    </div>
  )
}

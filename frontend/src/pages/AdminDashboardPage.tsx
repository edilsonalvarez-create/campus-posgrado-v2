import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/store'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab'
import { AdminUsersTab } from '../components/admin/AdminUsersTab'
import { AdminPendingTab } from '../components/admin/AdminPendingTab'

type Tab = 'overview' | 'pending' | 'users'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [tab, setTab] = useState<Tab>('overview')
  const { data: pendingUsers } = useAdminUsers({ status: 'pending' })
  const pendingCount = pendingUsers?.length ?? 0

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

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
      tab === t
        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
    }`

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
          <button onClick={() => setTab('overview')} className={tabClass('overview')}>
            Resumen y matrícula
          </button>
          <button onClick={() => setTab('pending')} className={tabClass('pending')}>
            Pendientes de aprobación
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-600 text-white text-xs font-semibold">
                {pendingCount}
              </span>
            )}
          </button>
          <button onClick={() => setTab('users')} className={tabClass('users')}>
            Usuarios
          </button>
        </div>

        {tab === 'overview' && <AdminOverviewTab />}
        {tab === 'pending' && <AdminPendingTab />}
        {tab === 'users' && <AdminUsersTab />}
      </div>
    </div>
  )
}

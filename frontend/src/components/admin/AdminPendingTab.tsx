import { useState } from 'react'
import { useAdminUsers, useApproveUser, useDeleteUser, type AdminUser } from '../../hooks/useAdminUsers'
import { CourseMultiSelect } from './CourseMultiSelect'

const ROLE_LABEL: Record<string, string> = {
  student: 'Alumno',
  instructor: 'Profesor',
  director_tfm: 'Director de TFM',
  admin: 'Administrador',
}

function PendingRow({ pending }: { pending: AdminUser }) {
  const approveUser = useApproveUser()
  const deleteUser = useDeleteUser()
  const [courseIds, setCourseIds] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canEnroll = pending.role === 'student' || pending.role === 'instructor'

  const handleApprove = async () => {
    setError(null)
    try {
      const r = await approveUser.mutateAsync({ id: pending.id, courseIds: canEnroll ? courseIds : undefined })
      setResult(
        r.enrolledCourses > 0
          ? `Aprobado y matriculado en ${r.enrolledCourses} curso${r.enrolledCourses === 1 ? '' : 's'}.`
          : 'Aprobado.',
      )
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo aprobar')
    }
  }

  const handleReject = async () => {
    if (!window.confirm(`¿Rechazar y eliminar el registro de ${pending.name} (${pending.email})?`)) return
    setError(null)
    try {
      await deleteUser.mutateAsync(pending.id)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo eliminar')
    }
  }

  if (result) {
    return (
      <div className="border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-sm text-green-800 dark:text-green-300">
        {pending.name} ({pending.email}) — {result}
      </div>
    )
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{pending.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pending.email} · {ROLE_LABEL[pending.role]} · registrado el{' '}
            {new Date(pending.created_at).toLocaleDateString('es-CO')}
          </p>
        </div>
        <div className="flex gap-2">
          {canEnroll && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
            >
              {expanded ? 'Ocultar cursos' : 'Elegir cursos'}
              {courseIds.length > 0 ? ` (${courseIds.length})` : ''}
            </button>
          )}
          <button
            onClick={handleApprove}
            disabled={approveUser.isPending}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {approveUser.isPending ? 'Aprobando…' : 'Aprobar'}
          </button>
          <button
            onClick={handleReject}
            disabled={deleteUser.isPending}
            className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {expanded && canEnroll && (
        <div className="mt-3">
          <CourseMultiSelect selected={courseIds} onChange={setCourseIds} />
        </div>
      )}
    </div>
  )
}

export function AdminPendingTab() {
  const { data: pendingUsers, isLoading } = useAdminUsers({ status: 'pending' })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
        Pendientes de aprobación ({pendingUsers?.length ?? 0})
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Cuentas creadas desde "Regístrate aquí". No tienen acceso a ningún curso hasta que las apruebes —
        opcionalmente, matricúlalas de una vez en los cursos o programas que correspondan.
      </p>
      {isLoading ? (
        <p className="text-gray-500">Cargando…</p>
      ) : !pendingUsers || pendingUsers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No hay cuentas pendientes de aprobación.</p>
      ) : (
        <div className="space-y-3">
          {pendingUsers.map((p) => (
            <PendingRow key={p.id} pending={p} />
          ))}
        </div>
      )}
    </div>
  )
}

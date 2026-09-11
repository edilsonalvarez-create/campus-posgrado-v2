import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/store'
import { useAdminUsers, useCreateUser, useUpdateUserRole, type UserRole } from '../hooks/useAdminUsers'

const ROLE_LABEL: Record<UserRole, string> = {
  student: 'Alumno',
  instructor: 'Profesor',
  director_tfm: 'Director de TFM',
  admin: 'Administrador',
}

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let pw = ''
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < bytes.length; i++) pw += chars[bytes[i] % chars.length]
  return pw
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data: users, isLoading } = useAdminUsers()
  const createUser = useCreateUser()
  const updateRole = useUpdateUserRole()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [lastCreated, setLastCreated] = useState<{ email: string; password: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const handleGenerate = () => setPassword(randomPassword())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await createUser.mutateAsync({ email, name, password, role })
      setLastCreated({ email, password })
      setEmail('')
      setName('')
      setPassword('')
      setRole('student')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo crear el usuario')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administración de usuarios</h1>
          <button onClick={() => navigate('/')} className="text-primary-600 dark:text-primary-400 hover:underline">
            ← Volver al dashboard
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Crear usuario</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2"
                placeholder="profesor@sumimedical.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2"
              >
                <option value="student">Alumno</option>
                <option value="instructor">Profesor</option>
                <option value="director_tfm">Director de TFM</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña inicial</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="whitespace-nowrap bg-gray-200 dark:bg-gray-600 dark:text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Generar
                </button>
              </div>
            </div>

            {error && <p className="md:col-span-2 text-red-600 text-sm">{error}</p>}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={createUser.isPending}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {createUser.isPending ? 'Creando…' : 'Crear usuario'}
              </button>
            </div>
          </form>

          {lastCreated && (
            <div className="mt-4 border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                Usuario creado: {lastCreated.email}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Contraseña inicial (se muestra una sola vez): <span className="font-mono font-semibold">{lastCreated.password}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Compártela por un canal seguro; recomienda cambiarla en el primer inicio de sesión.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Usuarios ({users?.length ?? 0})
          </h2>
          {isLoading ? (
            <p className="text-gray-500">Cargando…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Correo</th>
                    <th className="py-2 pr-4">Rol</th>
                    <th className="py-2 pr-4">Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {(users || []).map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 pr-4 text-gray-900 dark:text-white">{u.name}</td>
                      <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{u.email}</td>
                      <td className="py-2 pr-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value as UserRole })}
                          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1"
                        >
                          {Object.entries(ROLE_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">
                        {new Date(u.created_at).toLocaleDateString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

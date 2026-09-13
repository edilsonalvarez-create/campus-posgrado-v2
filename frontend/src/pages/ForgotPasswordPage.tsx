import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo procesar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campus Posgrado</h1>
        <p className="text-gray-600 mb-8">Recuperar contraseña</p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            Si <strong>{email}</strong> está registrado, te enviamos un enlace para restablecer la contraseña.
            Revisa también la carpeta de spam. El enlace vence en 1 hora.
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6 text-sm">
              Escribe el correo con el que te registraste (alumno, profesor o administrador) y te enviamos un
              enlace para elegir una contraseña nueva.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="tu@email.com"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {isLoading ? 'Enviando…' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-gray-600 mt-6">
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            ← Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

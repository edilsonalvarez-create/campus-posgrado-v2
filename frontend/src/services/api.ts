import axios, { AxiosInstance } from 'axios'
import { useAuthStore } from '../state/store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = useAuthStore.getState().accessToken
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Ante un 401, intenta refrescar el access token UNA vez y reintentar la
    // petición original; solo cierra sesión si el refresh también falla. Evita el
    // cierre de sesión a mitad de un examen cuando caduca el token de 1 h.
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config
        if (error.response?.status === 401 && original && !original._retried) {
          const { refreshToken } = useAuthStore.getState()
          if (refreshToken) {
            try {
              const r = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
              const newAccess = r.data?.accessToken
              if (newAccess) {
                useAuthStore.getState().setAccessToken(newAccess)
                original._retried = true
                original.headers.Authorization = `Bearer ${newAccess}`
                return this.client.request(original)
              }
            } catch {
              /* el refresh falló: se cierra sesión abajo */
            }
          }
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      },
    )
  }

  async get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config)
  }

  async post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config)
  }

  async delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config)
  }
}

export const api = new ApiClient()

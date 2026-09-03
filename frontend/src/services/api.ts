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

    // Handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
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

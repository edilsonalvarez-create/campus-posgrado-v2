import { api } from './api'
import { useAuthStore } from '../state/store'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: 'student' | 'instructor' | 'admin'
  }
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    const { accessToken, refreshToken, user } = response.data

    useAuthStore.getState().setTokens(accessToken, refreshToken)
    useAuthStore.getState().setUser(user)

    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  logout() {
    useAuthStore.getState().logout()
  },

  async forgotPassword(email: string): Promise<{ ok: boolean; message: string }> {
    const response = await api.post<{ ok: boolean; message: string }>('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(token: string, password: string): Promise<{ ok: boolean }> {
    const response = await api.post<{ ok: boolean }>('/auth/reset-password', { token, password })
    return response.data
  },
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export type UserRole = 'student' | 'instructor' | 'director_tfm' | 'admin'
export type UserStatus = 'pending' | 'active'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  created_at: string
  enrolledCourses?: number
}

export function useAdminUsers(filters?: { role?: UserRole; status?: UserStatus }) {
  const role = filters?.role
  const status = filters?.status
  return useQuery<AdminUser[]>({
    queryKey: ['admin-users', role || 'all', status || 'all'],
    queryFn: async () => {
      const response = await api.get<AdminUser[]>('/admin/users', { params: { role, status } })
      return response.data
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { email: string; name: string; password: string; role: UserRole; courseIds?: string[] }) => {
      const response = await api.post<AdminUser>('/admin/users', input)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const response = await api.put<AdminUser>(`/admin/users/${id}`, { role })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useApproveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, courseIds }: { id: string; courseIds?: string[] }) => {
      const response = await api.post<{ ok: boolean; enrolledCourses: number }>(`/admin/users/${id}/approve`, {
        courseIds,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
  })
}

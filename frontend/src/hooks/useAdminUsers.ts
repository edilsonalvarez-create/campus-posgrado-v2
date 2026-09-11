import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export type UserRole = 'student' | 'instructor' | 'director_tfm' | 'admin'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

export function useAdminUsers(role?: UserRole) {
  return useQuery<AdminUser[]>({
    queryKey: ['admin-users', role || 'all'],
    queryFn: async () => {
      const response = await api.get<AdminUser[]>('/admin/users', { params: role ? { role } : undefined })
      return response.data
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { email: string; name: string; password: string; role: UserRole }) => {
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '../../services/admin';
import type { AdminFilters, RoutineFilters, SystemStats } from '../../types/admin.types';

export function useAdminAccess() {
  return useQuery({
    queryKey: ['admin-access'],
    queryFn: () => AdminService.isAdmin(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEditorAccess() {
  return useQuery({
    queryKey: ['editor-access'],
    queryFn: () => AdminService.isEditor(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserRoles() {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: () => AdminService.getUserRoles(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSystemStats() {
  return useQuery<SystemStats | null>({
    queryKey: ['system-stats'],
    queryFn: () => AdminService.getSystemStats(),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useUsersList(filters: AdminFilters) {
  return useQuery({
    queryKey: ['users-list', filters],
    queryFn: () => AdminService.getUsersList(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useRoutinesStats(filters: RoutineFilters) {
  return useQuery({
    queryKey: ['routines-stats', filters],
    queryFn: () => AdminService.getRoutinesStats(filters),
    staleTime: 1000 * 30,
  });
}

export function useAllRoles() {
  return useQuery({
    queryKey: ['all-roles'],
    queryFn: () => AdminService.getAllRoles(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: string[] }) => 
      AdminService.updateUserRoles(userId, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useAssignAdminRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (email: string) => AdminService.assignAdminRole(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => AdminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['system-stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => AdminService.restoreUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['system-stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, durationHours, reason }: { userId: string; durationHours: number | null; reason?: string }) =>
      AdminService.banUser(userId, durationHours, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['system-stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => AdminService.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['system-stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ routineId, updates }: { routineId: string; updates: Record<string, unknown> }) =>
      AdminService.updateRoutine(routineId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines-stats'] });
      queryClient.invalidateQueries({ queryKey: ['system-stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useAuditLogs(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['audit-logs', limit, offset],
    queryFn: () => AdminService.getAuditLogs(limit, offset),
    staleTime: 1000 * 30,
  });
}

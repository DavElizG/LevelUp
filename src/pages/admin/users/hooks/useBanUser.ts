import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import { useNotification } from '../../../../hooks/useNotification';

interface BanUserParams {
  userId: string;
  reason: string;
  durationDays: number | null;
}

export function useBanUser() {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ userId, reason, durationDays }: BanUserParams) => {
      if (!supabase) {
        throw new Error('Supabase client no disponible');
      }

      // Convert days to hours for admin_ban_user function
      const durationHours = durationDays !== null ? durationDays * 24 : null;

      const { data, error } = await supabase.rpc('admin_ban_user', {
        target_user_id: userId,
        ban_duration_hours: durationHours,
        reason: reason,
      });

      if (error) {
        console.error('Error banning user:', error);
        throw new Error(error.message || 'Error al banear el usuario');
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate all user-related queries to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['system-stats'] });
      showToast('Usuario baneado correctamente', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Error al banear el usuario', 'error');
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!supabase) {
        throw new Error('Supabase client no disponible');
      }

      const { data, error } = await supabase.rpc('admin_unban_user', {
        target_user_id: userId,
      });

      if (error) {
        console.error('Error unbanning user:', error);
        throw new Error(error.message || 'Error al desbanear el usuario');
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate all user-related queries to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['system-stats'] });
      showToast('Usuario desbaneado correctamente', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Error al desbanear el usuario', 'error');
    },
  });
}

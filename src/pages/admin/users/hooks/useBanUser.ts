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

      const { data, error } = await supabase.rpc('ban_user', {
        p_user_id: userId,
        p_reason: reason,
        p_duration_days: durationDays,
      });

      if (error) {
        console.error('Error banning user:', error);
        throw new Error(error.message || 'Error al banear el usuario');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
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

      const { data, error } = await supabase.rpc('unban_user', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error unbanning user:', error);
        throw new Error(error.message || 'Error al desbanear el usuario');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast('Usuario desbaneado correctamente', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Error al desbanear el usuario', 'error');
    },
  });
}

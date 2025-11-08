import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlan } from './usePlan';
import { useManagerAdministradoras } from '@/contexts/ManagerAdministradorasContext';
import { toast } from '@/utils/toast';

interface Filters {
  search?: string;
  city?: string;
  state?: string;
  status?: 'active' | 'inactive';
}

export function useManagerAdministrators() {
  const { administrators, loading, canCreateAdministrator, remainingSlots, refetch } = useManagerAdministradoras();
  const { isFreePlan } = usePlan();
  const [error, setError] = useState<string | null>(null);

  const deleteAdministrator = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('administrators')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      await refetch();
      toast.success('Administradora eliminada con éxito');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar administradora';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    administrators,
    loading,
    error,
    deleteAdministrator,
    canCreateAdministrator,
    remainingSlots,
    isFreePlan,
  };
}
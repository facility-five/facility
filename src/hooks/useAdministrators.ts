import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Administrator } from '@/types/entities';
import { checkPlanLimit } from '@/utils/planLimits';

interface UseAdministratorsOptions {
  pageSize?: number;
}

export interface AdministratorFormData {
  name: string;
  document: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

interface AdministratorFilters {
  search?: string;
  city?: string;
  state?: string;
  status?: 'active' | 'inactive';
}

export function useAdministrators(options: UseAdministratorsOptions = {}) {
  const { pageSize = 10 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Administrator[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  // Carregar lista de administradoras
  const loadAdministrators = async (
    page: number = 1,
    filters: AdministratorFilters = {}
  ) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Construir query base
      let query = supabase
        .from('administrators')
        .select('*', { count: 'exact' })
        .eq('tenant_id', user.id)
        .is('deleted_at', null);

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,document.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.state) {
        query = query.ilike('state', `%${filters.state}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Aplicar paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data: administrators, count, error } = await query
        .range(from, to)
        .order('name', { ascending: true });

      if (error) throw error;

      setData(administrators as Administrator[]);
      setTotal(count || 0);
      setCurrentPage(page);
    } catch (error: any) {
      toast.error('Erro ao carregar administradoras');
      console.error('Error loading administrators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Criar nova administradora
  const createAdministrator = async (data: AdministratorFormData) => {
    if (!user?.id) return;

    // Verificar limite do plano
    const canCreate = await checkPlanLimit(user.id, 'administrators');
    if (!canCreate) {
      toast.error('Limite de administradoras atingido no seu plano');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('administrators')
        .insert({
          ...data,
          tenant_id: user.id,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Administradora criada com sucesso');
      await loadAdministrators(); // Recarregar lista
    } catch (error: any) {
      toast.error('Erro ao criar administradora');
      console.error('Error creating administrator:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar administradora
  const updateAdministrator = async (id: string, data: Partial<AdministratorFormData>) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('administrators')
        .update(data)
        .eq('id', id)
        .eq('tenant_id', user.id); // Garantir que pertence ao tenant

      if (error) throw error;

      toast.success('Administradora atualizada com sucesso');
      await loadAdministrators(); // Recarregar lista
    } catch (error: any) {
      toast.error('Erro ao atualizar administradora');
      console.error('Error updating administrator:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir administradora (soft delete)
  const deleteAdministrator = async (id: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('administrators')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', user.id); // Garantir que pertence ao tenant

      if (error) throw error;

      toast.success('Administradora excluída com sucesso');
      await loadAdministrators(); // Recarregar lista
    } catch (error: any) {
      toast.error('Erro ao excluir administradora');
      console.error('Error deleting administrator:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar uma administradora específica
  const getAdministrator = async (id: string) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('administrators')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', user.id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;

      return data as Administrator;
    } catch (error: any) {
      toast.error('Erro ao carregar dados da administradora');
      console.error('Error loading administrator:', error);
      return null;
    }
  };

  return {
    data,
    total,
    isLoading,
    currentPage,
    pageSize,
    loadAdministrators,
    createAdministrator,
    updateAdministrator,
    deleteAdministrator,
    getAdministrator,
  };
}
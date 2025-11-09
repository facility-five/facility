import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { Administrator } from "@/types/entities";

// Estendendo o tipo Administrator com campos específicos do gerenciamento
export type ManagerAdministrator = Omit<Administrator, 'document'> & {
  owner_id?: string | null;
  responsible_id?: string | null;
  code?: string;
  nif?: string | null; // Campo específico para Espanha, equivalente ao document
  condos?: { count: number; }[];
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
};

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface FilterState {
  search: string;
  city: string;
  state: string;
  status: 'active' | 'inactive' | '';
}

interface ManagerAdministradorasContextValue {
  administrators: ManagerAdministrator[];
  loading: boolean;
  activeAdministratorId: string | null;
  activeAdministrator: ManagerAdministrator | null;
  setActiveAdministratorId: (id: string | null) => void;
  setActiveAdministrator: (admin: ManagerAdministrator | null) => void;
  // Novo: método para seleção por id (compatível com cabeçalho)
  handleSelect: (id: string) => void;
  selectAdministrator: (admin: ManagerAdministrator) => void;
  refetch: (filters?: FilterState) => Promise<void>;
  refetchAdministrators: () => Promise<void>;
  planLoading: boolean;
  planName: string | null;
  planLimit: number | null;
  usageLimit: number; // Limite efetivo para uso das administradoras
  totalAdministrators: number;
  remainingSlots: number | null;
  canCreateAdministrator: boolean;
  refreshPlan: () => Promise<void>;
  pagination: PaginationState;
  setPagination: (state: Partial<PaginationState>) => void;
  filters: FilterState;
  setFilters: (state: Partial<FilterState>) => void;
}

const ManagerAdministradorasContext = createContext<ManagerAdministradorasContextValue | undefined>(
  undefined,
);

export const ManagerAdministradorasProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { isFreePlan, hasActivePlan } = usePlan();
  const [administrators, setAdministrators] = useState<ManagerAdministrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAdministratorId, setActiveAdministratorId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [planLimit, setPlanLimit] = useState<number | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [pagination, setPaginationState] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFiltersState] = useState<FilterState>({
    search: '',
    city: '',
    state: '',
    status: ''
  });

  const fetchAdministrators = useCallback(async (newFilters?: Partial<FilterState>) => {
    if (!user?.id) {
      // console.log("🔍 ManagerAdministradorasContext: Usuário não autenticado", { user });
      setAdministrators([]);
      setActiveAdministratorId(null);
      setLoading(false);
      return;
    }

    // console.log("🔍 ManagerAdministradorasContext: Iniciando busca de administradoras para usuário", user.id, { isFreePlan });
    setLoading(true);

    // Atualiza filtros se fornecidos
    if (newFilters) {
      setFiltersState(current => ({ ...current, ...newFilters }));
    }

    try {
      // Buscar selected_administrator_id do perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("selected_administrator_id")
        .eq("id", user.id)
        .single();

      // console.log("🔍 ManagerAdministradorasContext: Selected administrator do perfil", profileData);

      // Constrói a query base
      // Construir query sem o uso de alias count:count() inline, que pode causar erros 400
      let query = supabase
        .from("administrators")
        .select(
          `id, code, name, nif, user_id, responsible_id, email, phone`,
          { count: 'exact' }
        )
        .or(`user_id.eq.${user.id},responsible_id.eq.${user.id}`);

      // Aplica filtros
      const activeFilters = newFilters || filters;
      if (activeFilters.search) {
        query = query.or(
          `name.ilike.%${activeFilters.search}%,` +
          `nif.ilike.%${activeFilters.search}%,` +
          `email.ilike.%${activeFilters.search}%,` +
          `code.ilike.%${activeFilters.search}%`
        );
      }

      if (activeFilters.city) {
        query = query.ilike('city', `%${activeFilters.city}%`);
      }

      if (activeFilters.state) {
        query = query.ilike('state', activeFilters.state);
      }

      if (activeFilters.status) {
        query = query.eq('status', activeFilters.status);
      }

      // Aplica paginação
      query = query
        .range(
          (pagination.page - 1) * pagination.pageSize, 
          pagination.page * pagination.pageSize - 1
        )
        .order('name', { ascending: true });

      // Executa a query
      const { data, error, count } = await query;
      
      // Log mais detalhado para facilitar debugging de erros PostgREST
      // console.log("🔍 ManagerAdministradorasContext: Resposta da query", { data, error, count });

      if (error) {
        console.error("❌ ManagerAdministradorasContext: Erro na query", {
          message: error.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          code: (error as any)?.code,
        });

        setAdministrators([]);
        setActiveAdministratorId(null);
        setLoading(false);
        return;
      }

      // Atualiza contagem total
      if (count !== null) {
        setPaginationState(current => ({ ...current, total: count }));
      }

      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        tenant_id: row.user_id,
        name: row.name,
        nif: row.nif ?? null,
        email: row.email ?? null,
        phone: row.phone ?? null,
        website: null,
        logo: null,
        address: null,
        city: null,
        state: null,
        country: 'España',
        postal_code: null,
        created_at: row.created_at ?? new Date().toISOString(),
        updated_at: row.updated_at ?? new Date().toISOString(),
        deleted_at: null,
        status: 'active' as const,
        // Campos específicos do ManagerAdministrator
        owner_id: row.user_id ?? null,
        responsible_id: row.responsible_id ?? null,
        code: row.code ?? "",
        // Não confiamos em row.count (removido do select). Use 0 como fallback.
        condos: [{ count: 0 }],
        profiles: null
      } satisfies ManagerAdministrator));

      // console.log("🔍 ManagerAdministradorasContext: Dados mapeados", mapped);

      // Já está filtrado pela query com OR, então não precisa filtrar novamente
      const filtered = mapped;

      // console.log("🔍 ManagerAdministradorasContext: Administradoras filtradas", filtered);

      setAdministrators(filtered);
      
      // Determinar administradora ativa considerando apenas o perfil do servidor
      const selectedId = profileData?.selected_administrator_id ?? null;
      const preferredId = selectedId ?? filtered[0]?.id ?? null;

      setActiveAdministratorId(preferredId);

      // Atualizar no perfil do usuário se necessário (server is authoritative)
      if (preferredId && preferredId !== selectedId) {
        await supabase
          .from("profiles")
          .update({ selected_administrator_id: preferredId })
          .eq("id", user.id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("❌ ManagerAdministradorasContext: Erro inesperado", error);
      setAdministrators([]);
      setActiveAdministratorId(null);
      setLoading(false);
    }
  }, [user?.id, isFreePlan]);

  // Carregar apenas uma vez na montagem
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (!mounted) return;
      await fetchAdministrators();
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, [user?.id]); // Só recarrega se o usuário mudar

  // Listener em tempo real para mudanças nas administradoras
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔔 Setting up real-time listener for administrators');

    const channel = supabase
      .channel('administrators-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'administrators',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Administrator change detected:', payload);
          fetchAdministrators();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'administrators',
          filter: `responsible_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Administrator change detected (as responsible):', payload);
          fetchAdministrators();
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Removing real-time listener for administrators');
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchAdministrators]);

  const fetchPlanInfo = useCallback(async () => {
    if (!user?.id) {
      setPlanName(null);
      setPlanLimit(null);
      setPlanLoading(false);
      return;
    }

    setPlanLoading(true);

    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .select("plan_id, plans(name, max_admins)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError && paymentError.code !== "PGRST116") {
      console.error("ManagerAdministradorasContext: erro ao buscar pagamento ativo", paymentError);
      setPlanName(null);
      setPlanLimit(null);
      setPlanLoading(false);
      return;
    }

    const planData = paymentData?.plans as any;
    const latestPlanName = planData?.name ?? null;
    const maxAdmins = planData?.max_admins ?? null;
    
    setPlanName(latestPlanName);
    setPlanLimit(maxAdmins);
    setPlanLoading(false);
  }, [user?.id]);

  // Carregar plano apenas uma vez na montagem
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (!mounted) return;
      await fetchPlanInfo();
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, [user?.id]); // Só recarrega se o usuário mudar

  const activeAdministrator = useMemo(() => {
    if (!activeAdministratorId) return null;
    const found = administrators.find((admin) => admin.id === activeAdministratorId) ?? null;
    console.log("🎯 activeAdministrator recalculated:", {
      id: activeAdministratorId,
      name: found?.name,
      totalAdmins: administrators.length
    });
    return found;
  }, [administrators, activeAdministratorId]);

  const updateActiveAdministratorId = useCallback(async (id: string | null) => {
    console.log("🔄 Changing active administrator to:", id);
    const oldId = activeAdministratorId;
    setActiveAdministratorId(id);
    
    // Salvar no perfil do usuário
    if (user?.id && id) {
      const { error } = await supabase
        .from("profiles")
        .update({ selected_administrator_id: id })
        .eq("id", user.id);
      
      if (error) {
        console.error("❌ Error updating profile with selected administrator:", error);
      } else {
        console.log("✅ Administrator changed from", oldId, "to", id);
      }
    }

    // Persistir em localStorage
    try {
      // localStorage persistence removed: server (profiles.selected_administrator_id)
      // is now the single source-of-truth for the selected administrator.
    } catch {}
  }, [user?.id, activeAdministratorId]);

  // Expor função que aceita o objeto diretamente
  const setActiveAdministrator = useCallback((admin: ManagerAdministrator | null) => {
    const id = admin?.id ?? null;
    updateActiveAdministratorId(id);
  }, [updateActiveAdministratorId]);

  const selectAdministrator = useCallback((admin: ManagerAdministrator) => {
    setActiveAdministrator(admin);
  }, [setActiveAdministrator]);

  // Alias: seleção recebendo apenas o id (usado pelo header)
  const handleSelect = useCallback((id: string) => {
    if (!id) {
      updateActiveAdministratorId(null);
      return;
    }
    // Persistência e atualização reativa via updateActiveAdministratorId
    updateActiveAdministratorId(id);
    // console.log("[ACTIVE ADMIN SELECT]", { id });
  }, [updateActiveAdministratorId]);

  const totalAdministrators = administrators.length;
  const usageLimit = (planLimit ?? 1);
  const remainingSlots =
    planLimit == null ? null : Math.max(usageLimit - totalAdministrators, 0);
  // Ajuste: criação permitida apenas quando used < usageLimit
  const canCreateAdministrator = totalAdministrators < usageLimit;

  // Função para atualizar paginação
  const setPagination = useCallback((newState: Partial<PaginationState>) => {
    setPaginationState(current => ({ ...current, ...newState }));
    // Recarrega os dados se necessário
    if (newState.page || newState.pageSize) {
      fetchAdministrators();
    }
  }, [fetchAdministrators]);

  // Função para atualizar filtros
  const setFilters = useCallback((newState: Partial<FilterState>) => {
    setFiltersState(current => ({ ...current, ...newState }));
    // Volta para a primeira página ao filtrar
    setPaginationState(current => ({ ...current, page: 1 }));
    // Recarrega os dados com novos filtros
    fetchAdministrators(newState);
  }, [fetchAdministrators]);

  const value = useMemo<ManagerAdministradorasContextValue>(
    () => ({
      administrators,
      loading,
      activeAdministratorId,
      activeAdministrator,
      setActiveAdministratorId: updateActiveAdministratorId,
      setActiveAdministrator,
      handleSelect,
      selectAdministrator,
      refetch: fetchAdministrators,
      refetchAdministrators: () => fetchAdministrators(),
      planLoading,
      planName,
      planLimit,
      usageLimit,
      totalAdministrators,
      remainingSlots,
      canCreateAdministrator,
      refreshPlan: fetchPlanInfo,
      pagination,
      setPagination,
      filters,
      setFilters
    }),
    [
      administrators,
      loading,
      activeAdministratorId,
      activeAdministrator,
      updateActiveAdministratorId,
      setActiveAdministrator,
      handleSelect,
      selectAdministrator,
      fetchAdministrators,
      planLoading,
      planName,
      planLimit,
      usageLimit,
      totalAdministrators,
      remainingSlots,
      canCreateAdministrator,
      fetchPlanInfo,
      pagination,
      setPagination,
      filters,
      setFilters
    ],
  );

  // Comentado para evitar re-renders desnecessários
  // useEffect(() => {
  //   console.log("[ADMIN SELECTOR]", { activeAdministrator, administrators });
  // }, [activeAdministrator, administrators]);

  return (
    <ManagerAdministradorasContext.Provider value={value}>
      {children}
    </ManagerAdministradorasContext.Provider>
  );
};

export const useManagerAdministradoras = () => {
  const context = useContext(ManagerAdministradorasContext);
  if (!context) {
    throw new Error("useManagerAdministradoras must be used within ManagerAdministradorasProvider");
  }
  return context;
};


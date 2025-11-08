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
  refetch: (filters?: FilterState) => Promise<void>;
  planLoading: boolean;
  planName: string | null;
  planLimit: number | null;
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
      console.log("🔍 ManagerAdministradorasContext: Usuário não autenticado", { user });
      setAdministrators([]);
      setActiveAdministratorId(null);
      setLoading(false);
      return;
    }

    console.log("🔍 ManagerAdministradorasContext: Iniciando busca de administradoras para usuário", user.id, { isFreePlan });
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

      console.log("🔍 ManagerAdministradorasContext: Selected administrator do perfil", profileData);

      // Constrói a query base
      let query = supabase
        .from("administrators")
        .select(`
          id,
          code,
          name,
          nif,
          user_id,
          responsible_id,
          email,
          phone,
          count:count()
        `, { count: 'exact' })
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
      
      console.log("🔍 ManagerAdministradorasContext: Resposta da query", { data, error });
      
      if (error) {
        console.error("❌ ManagerAdministradorasContext: Erro na query", error);
        
        if (isFreePlan) {
          // No plano gratuito, criar uma administradora padrão se não existir
          const { data: defaultAdmin, error: createError } = await supabase
            .from("administrators")
            .insert({
              name: "Mi Administradora",
              code: "ADM001",
              user_id: user.id,
              responsible_id: user.id,
              status: 'active'
            })
            .select()
            .single();

          if (!createError && defaultAdmin) {
            setAdministrators([{
              id: defaultAdmin.id,
              tenant_id: defaultAdmin.user_id,
              name: defaultAdmin.name,
              nif: null,
              email: null,
              phone: null,
              logo: null,
              address: null,
              city: null,
              state: null,
              country: 'España',
              postal_code: null,
              created_at: defaultAdmin.created_at,
              updated_at: defaultAdmin.updated_at,
              deleted_at: null,
              status: 'active',
              owner_id: defaultAdmin.user_id,
              responsible_id: defaultAdmin.responsible_id,
              code: defaultAdmin.code,
              condos: [{ count: 0 }],
              profiles: null
            }]);
            setActiveAdministratorId(defaultAdmin.id);
          }
        } else {
          // No plano pago, mostra erro
          showRadixError("Error al buscar las administradoras.");
          setAdministrators([]);
          setActiveAdministratorId(null);
        }
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
        condos: [{ count: row.count ?? 0 }],
        profiles: null
      } satisfies ManagerAdministrator));

      console.log("🔍 ManagerAdministradorasContext: Dados mapeados", mapped);

      const currentUserId = user.id;
      const filtered = mapped.filter((admin) => {
        const ownerMatches = admin.owner_id ? admin.owner_id === currentUserId : false;
        const responsibleMatches = admin.responsible_id ? admin.responsible_id === currentUserId : false;
        console.log(`🔍 Admin ${admin.name} (${admin.id}):`, {
          owner_id: admin.owner_id,
          responsible_id: admin.responsible_id,
          currentUserId,
          ownerMatches,
          responsibleMatches,
          willBeIncluded: ownerMatches || responsibleMatches
        });
        return ownerMatches || responsibleMatches;
      });

      console.log("🔍 ManagerAdministradorasContext: Administradoras filtradas", filtered);

      setAdministrators(filtered);
      
      // Usar selected_administrator_id do perfil, ou a primeira disponível
      const selectedId = profileData?.selected_administrator_id;
      const validSelectedId = selectedId && filtered.some((admin) => admin.id === selectedId) 
        ? selectedId 
        : filtered[0]?.id ?? null;
      
      setActiveAdministratorId(validSelectedId);
      
      // Se não tinha selected_administrator_id ou mudou, atualizar no perfil
      if (validSelectedId && validSelectedId !== selectedId) {
        await supabase
          .from("profiles")
          .update({ selected_administrator_id: validSelectedId })
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

  useEffect(() => {
    fetchAdministrators();
  }, [fetchAdministrators]);

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
      showRadixError("Error al buscar información del plan.");
      setPlanName(null);
      setPlanLimit(null);
      setPlanLoading(false);
      return;
    }

    const planData = paymentData?.plans as any;
    const latestPlanName = planData?.name ?? null;
    const maxAdmins = planData?.max_admins ?? null;
    
    console.log("🔍 ManagerAdministradorasContext: Plan info", { latestPlanName, maxAdmins, paymentData });
    
    setPlanName(latestPlanName);
    setPlanLimit(maxAdmins);
    setPlanLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchPlanInfo();
  }, [fetchPlanInfo]);

  const activeAdministrator = useMemo(() => {
    if (!activeAdministratorId) return null;
    return administrators.find((admin) => admin.id === activeAdministratorId) ?? null;
  }, [administrators, activeAdministratorId]);

  const updateActiveAdministratorId = useCallback(async (id: string | null) => {
    setActiveAdministratorId(id);
    
    // Salvar no perfil do usuário
    if (user?.id && id) {
      await supabase
        .from("profiles")
        .update({ selected_administrator_id: id })
        .eq("id", user.id);
      
      console.log("🔍 ManagerAdministradorasContext: Administradora selecionada atualizada no perfil", id);
    }
  }, [user?.id]);

  const totalAdministrators = administrators.length;
  const remainingSlots =
    planLimit == null ? null : Math.max(planLimit - totalAdministrators, 0);
  const canCreateAdministrator = remainingSlots === null ? true : remainingSlots > 0;

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
      refetch: fetchAdministrators,
      planLoading,
      planName,
      planLimit,
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
      fetchAdministrators,
      planLoading,
      planName,
      planLimit,
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


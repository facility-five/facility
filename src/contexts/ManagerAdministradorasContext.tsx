import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Administrator } from "@/components/admin/AdministratorCard";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";

export type ManagerAdministrator = Administrator & {
  email?: string | null;
  phone?: string | null;
  owner_id?: string | null;
  responsible_id?: string | null;
};

interface ManagerAdministradorasContextValue {
  administrators: ManagerAdministrator[];
  loading: boolean;
  activeAdministratorId: string | null;
  activeAdministrator: ManagerAdministrator | null;
  setActiveAdministratorId: (id: string | null) => void;
  refetch: () => Promise<void>;
  planLoading: boolean;
  planName: string | null;
  planLimit: number | null;
  totalAdministrators: number;
  remainingSlots: number | null;
  canCreateAdministrator: boolean;
  refreshPlan: () => Promise<void>;
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

  const fetchAdministrators = useCallback(async () => {
    if (!user?.id) {
      console.log("🔍 ManagerAdministradorasContext: Usuário não autenticado", { user });
      setAdministrators([]);
      setActiveAdministratorId(null);
      setLoading(false);
      return;
    }

    // No plano free, não precisa buscar administradoras - funciona sem elas
    if (isFreePlan) {
      console.log("🔍 ManagerAdministradorasContext: Plano free - não buscando administradoras");
      setAdministrators([]);
      setActiveAdministratorId(null);
      setLoading(false);
      return;
    }

    console.log("🔍 ManagerAdministradorasContext: Iniciando busca de administradoras para usuário", user.id);
    setLoading(true);

    try {
      // Busca administradoras com join correto para profiles
      const { data, error } = await supabase
        .from("administrators")
        .select(`
          id,
          code,
          name,
          nif,
          user_id,
          responsible_id,
          profiles!administrators_user_id_fkey(first_name, last_name, email, phone),
          condominiums(count)
        `)
        .or(`user_id.eq.${user.id},responsible_id.eq.${user.id}`);
      
      console.log("🔍 ManagerAdministradorasContext: Resposta da query", { data, error });
      
      if (error) {
        console.error("❌ ManagerAdministradorasContext: Erro na query", error);
        // No plano pago, mostra erro. No free, funciona sem administradoras
        if (!isFreePlan) {
          showRadixError("Erro ao buscar administradoras.");
        }
        setAdministrators([]);
        setActiveAdministratorId(null);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        owner_id: row.user_id ?? null,
        responsible_id: row.responsible_id ?? null,
        code: row.code ?? "",
        name: row.name ?? "Administradora",
        nif: row.nif ?? "",
        condos: [{ count: row.condominiums?.length || 0 }],
        profiles: row.profiles ? {
          first_name: row.profiles.first_name ?? "",
          last_name: row.profiles.last_name ?? ""
        } : null,
        email: row.profiles?.email ?? null,
        phone: row.profiles?.phone ?? null,
      })) as ManagerAdministrator[];

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
      setActiveAdministratorId((previous) => {
        if (previous && filtered.some((admin) => admin.id === previous)) {
          return previous;
        }
        return filtered[0]?.id ?? null;
      });
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
      .select("plan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError && paymentError.code !== "PGRST116") {
      console.error("ManagerAdministradorasContext: erro ao buscar pagamento ativo", paymentError);
      showRadixError("Erro ao buscar informa��ões do plano.");
      setPlanName(null);
      setPlanLimit(null);
      setPlanLoading(false);
      return;
    }

    const latestPlanName = paymentData?.plan ?? null;
    setPlanName(latestPlanName);

    if (latestPlanName) {
      const { data: planRecord, error: planError } = await supabase
        .from("plans")
        .select("name, max_admins")
        .eq("name", latestPlanName)
        .maybeSingle();

      if (planError && planError.code !== "PGRST116") {
        console.error("ManagerAdministradorasContext: erro ao carregar detalhes do plano", planError);
        showRadixError("Erro ao carregar detalhes do plano atual.");
        setPlanLimit(null);
      } else {
        setPlanName(planRecord?.name ?? latestPlanName);
        setPlanLimit(planRecord?.max_admins ?? null);
      }
    } else {
      setPlanLimit(null);
    }

    setPlanLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchPlanInfo();
  }, [fetchPlanInfo]);

  const activeAdministrator = useMemo(() => {
    if (!activeAdministratorId) return null;
    return administrators.find((admin) => admin.id === activeAdministratorId) ?? null;
  }, [administrators, activeAdministratorId]);

  const updateActiveAdministratorId = useCallback((id: string | null) => {
    setActiveAdministratorId(id);
  }, []);

  const totalAdministrators = administrators.length;
  const remainingSlots =
    planLimit == null ? null : Math.max(planLimit - totalAdministrators, 0);
  const canCreateAdministrator = remainingSlots === null ? true : remainingSlots > 0;

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


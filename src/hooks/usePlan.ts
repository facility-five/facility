import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  max_condos: number | null;
  max_admins: number | null;
}

interface PlanStatus {
  hasActivePlan: boolean;
  currentPlan: Plan | null;
  isLoading: boolean;
  isFreePlan: boolean;
}

export const usePlan = (): PlanStatus & { refreshPlanStatus: () => void; checkPlanStatus: () => Promise<void> } => {
  const { session } = useAuth();
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<number>(0);

  const checkPlanStatus = useCallback(async (forceRefresh = false) => {
    if (!session?.user?.id) {
      console.log("usePlan: Nenhum usuário logado");
      setHasActivePlan(false);
      setCurrentPlan(null);
      setIsLoading(false);
      return;
    }

    // Evitar verificações muito frequentes (mínimo 2 segundos entre verificações)
    const now = Date.now();
    if (!forceRefresh && now - lastCheck < 2000) {
      console.log("usePlan: Verificação muito recente, pulando...");
      return;
    }

    setLastCheck(now);
    setIsLoading(true);

    console.log("usePlan: Verificando plano para usuário:", session.user.id);

    try {
      // Primeiro, vamos verificar se existem pagamentos para este usuário
      const { data: allPayments, error: allPaymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", session.user.id);

      console.log("usePlan: Todos os pagamentos do usuário:", allPayments);

      if (allPaymentsError) {
        console.error("usePlan: Erro ao buscar todos os pagamentos:", allPaymentsError);
      }

      // Agora busca os pagamentos ativos com planos
      const { data: payments, error } = await supabase
        .from("payments")
        .select(`
          id,
          plan_id,
          status,
          created_at,
          plans (
            id,
            name,
            description,
            price,
            features,
            max_condos,
            max_admins
          )
        `)
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1);

      console.log("usePlan: Pagamentos ativos encontrados:", payments);
      console.log("usePlan: Erro na consulta:", error);

      if (error) throw error;

      if (payments && payments.length > 0) {
        const payment = payments[0] as any;
        console.log("usePlan: Pagamento ativo encontrado:", payment);
        setHasActivePlan(true);

        // Se a relação 'plans' não vier (por falta de FK), buscar pelo plan_id
        if (payment.plans) {
          setCurrentPlan(payment.plans as Plan);
        } else if (payment.plan_id) {
          console.log("usePlan: Relação 'plans' ausente; buscando plano por plan_id:", payment.plan_id);
          const { data: planById, error: planByIdError } = await supabase
            .from("plans")
            .select("id,name,description,price,features,max_condos,max_admins")
            .eq("id", payment.plan_id)
            .single();

          if (planByIdError) {
            console.error("usePlan: Erro ao buscar plano por ID:", planByIdError);
            // Manter acesso ativo com um plano padrão
            setCurrentPlan({
              id: payment.plan_id,
              name: payment.plan || "Plano Ativo",
              description: "Acesso habilitado após pagamento",
              price: payment.amount || 0,
              features: [],
              max_condos: null,
              max_admins: null,
            });
          } else if (planById) {
            setCurrentPlan({
              id: planById.id,
              name: planById.name,
              description: planById.description ?? "",
              price: planById.price ?? 0,
              features: planById.features ?? [],
              max_condos: planById.max_condos ?? null,
              max_admins: planById.max_admins ?? null,
            });
          }
        } else {
          console.warn("usePlan: Pagamento ativo sem plan_id; mantendo acesso via subscription_status");
        }
      } else {
        console.log("usePlan: Nenhum plano ativo encontrado");
        
        // Fallback: Se não encontrou pagamentos ativos, vamos verificar se há algum plano padrão
        // ou se o usuário deveria ter acesso completo por algum outro motivo
        
        // Verificar se o usuário tem role de admin ou manager que deveria ter acesso completo
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, subscription_status")
          .eq("id", session.user.id)
          .single();

        console.log("usePlan: Profile do usuário:", profile);

        if (profileError) {
          console.error("usePlan: Erro ao buscar profile:", profileError);
        }

        // Se o usuário tem subscription_status ativo ou é admin, considerar como tendo plano
        if (profile && (profile.subscription_status === "active" || profile.role === "admin")) {
          console.log("usePlan: Usuário tem acesso via profile/subscription_status");
          setHasActivePlan(true);
          // Criar um plano padrão para usuários com acesso
          setCurrentPlan({
            id: "default",
            name: "Plano Ativo",
            description: "Acesso completo às funcionalidades",
            price: 0,
            features: [],
            max_condos: null,
            max_admins: null
          });
        } else {
          setHasActivePlan(false);
          setCurrentPlan(null);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status do plano:", error);
      setHasActivePlan(false);
      setCurrentPlan(null);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, lastCheck]);

  // Função para forçar atualização (útil após pagamentos)
  const refreshPlanStatus = useCallback(() => {
    console.log("usePlan: Forçando atualização do status do plano");
    return checkPlanStatus(true);
  }, [checkPlanStatus]);

  // Verificação inicial e quando o usuário muda
  useEffect(() => {
    checkPlanStatus();
  }, [session?.user?.id, checkPlanStatus]);

  // Polling inteligente - mais frequente se não tem plano ativo
  useEffect(() => {
    if (!session?.user?.id) return;

    // Se não tem plano ativo, verificar a cada 10 segundos
    // Se tem plano ativo, verificar a cada 60 segundos
    const interval = hasActivePlan ? 60000 : 10000;
    
    const timer = setInterval(() => {
      checkPlanStatus();
    }, interval);

    return () => clearInterval(timer);
  }, [session?.user?.id, hasActivePlan, checkPlanStatus]);

  // Escutar mudanças em tempo real na tabela payments
  useEffect(() => {
    if (!session?.user?.id) return;

    console.log("usePlan: Configurando listener em tempo real para pagamentos");

    const channel = supabase
      .channel("payments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log("usePlan: Mudança detectada na tabela payments:", payload);
          // Aguardar um pouco para o webhook processar completamente
          setTimeout(() => {
            refreshPlanStatus();
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      console.log("usePlan: Removendo listener em tempo real");
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, refreshPlanStatus]);

  // Escutar mudanças em tempo real na tabela profiles
  useEffect(() => {
    if (!session?.user?.id) return;

    console.log("usePlan: Configurando listener em tempo real para profiles");

    const channel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${session.user.id}`
        },
        (payload) => {
          console.log("usePlan: Mudança detectada na tabela profiles:", payload);
          refreshPlanStatus();
        }
      )
      .subscribe();

    return () => {
      console.log("usePlan: Removendo listener de profiles");
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, refreshPlanStatus]);

  // isFreePlan deve verificar se o plano atual tem preço 0, não se não tem plano
  const isFreePlan = hasActivePlan && currentPlan?.price === 0;

  return {
    hasActivePlan,
    currentPlan,
    isLoading,
    isFreePlan,
    refreshPlanStatus,
    checkPlanStatus: () => checkPlanStatus(true)
  };
};
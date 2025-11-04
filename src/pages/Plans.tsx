import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlanCard } from "@/components/PlanCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { LoadingSpinner } from "@/components/LoadingSpinner"; // Importa o LoadingSpinner

type DbPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  period: string; // 'monthly' | 'annual'
  status: string;
  features: string[] | null;
  stripe_price_id: string | null;
};

const Plans = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [plans, setPlans] = useState<DbPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { refreshPlanStatus } = usePlan();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("status", "active")
        .order("price", { ascending: true });

      if (error) {
        showRadixError("Erro ao carregar planos.");
      } else {
        setPlans(data || []);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      showRadixSuccess("Pagamento processado com sucesso! Agora, cadastre sua administradora.");
      // Forçar atualização do status do plano após pagamento bem-sucedido
      setTimeout(() => {
        refreshPlanStatus();
      }, 2000); // Aguardar 2 segundos para o webhook processar
      navigate('/registrar-administradora', { replace: true });
    }
    if (params.get("canceled")) {
      showRadixError("Pagamento cancelado.");
    }
  }, [navigate, refreshPlanStatus]);

  // Auto-checkout do plano selecionado quando vem do cadastro
  useEffect(() => {
    const fromSignup = location.state?.fromSignup;
    const selectedPlanData = sessionStorage.getItem('selected_plan');
    
    if (fromSignup && selectedPlanData && session) {
      try {
        const selectedPlan = JSON.parse(selectedPlanData);
        // Encontrar o plano correspondente na lista de planos carregados
        const planToCheckout = plans.find(p => p.id === selectedPlan.id);
        if (planToCheckout) {
          // Limpar o sessionStorage
          sessionStorage.removeItem('selected_plan');
          // Iniciar o checkout automaticamente
          handleCheckout(planToCheckout);
        }
      } catch (error) {
        console.error('Erro ao processar plano selecionado:', error);
        sessionStorage.removeItem('selected_plan');
      }
    }
  }, [location.state, session, plans, handleCheckout]);

  const filteredPlans = useMemo(
    () => plans.filter((p) => p.period === billingCycle),
    [plans, billingCycle]
  );

  const handleCheckout = useCallback(async (plan: DbPlan) => {
    if (!session) {
      showRadixError("Faça login para contratar um plano.");
      return;
    }
    if (!plan.stripe_price_id) {
      showRadixError("Este plano não está configurado com Stripe (price_id ausente).");
      return;
    }
    const successUrl = `${window.location.origin}/planos?success=1`;
    const cancelUrl = `${window.location.origin}/planos?canceled=1`;

    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: {
        price_id: plan.stripe_price_id,
        plan_id: plan.id,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
    });

    if (error) {
      showRadixError(`Erro ao iniciar checkout: ${error.message}`);
      return;
    }
    const url = (data as any)?.url;
    if (url) {
      window.location.href = url;
    } else {
      showRadixError("Não foi possível obter a URL do checkout.");
    }
  }, [session]);

  return (
    <div className="min-h-screen w-full bg-[#2a214d] text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">
          Escolha o plano ideal para o seu negócio
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Oferecemos diferentes planos para satisfazer as necessidades
          específicas da sua empresa administradora de condomínios.
        </p>
      </div>

      <div className="my-8">
        <div className="inline-flex bg-gray-800/50 rounded-full p-1">
          <Button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-transparent text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            Mensal
          </Button>
          <Button
            onClick={() => setBillingCycle("annual")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === "annual"
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-transparent text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            Anual
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 justify-center">
        {loading ? (
          <div className="flex justify-center items-center w-full h-48">
            <LoadingSpinner size="lg" className="border-primary shadow-lg shadow-primary/50" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-gray-300">Nenhum plano disponível.</div>
        ) : (
          filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              description={plan.description || ""}
              price={new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(plan.price)}
              period={`/${plan.period === "monthly" ? "mensal" : "anual"}`}
              features={plan.features || []}
              buttonText="Contratar Plano"
              onClick={() => handleCheckout(plan)}
            />
          ))
        )}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold">
          Precisa de um plano personalizado?
        </h2>
        <p className="mt-2 text-gray-300">
          Contacte com a nossa equipa comercial para uma proposta
          personalizada.
        </p>
        <Button
          variant="outline"
          className="mt-6 bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
        >
          Falar com um consultor
        </Button>
      </div>
    </div>
  );
};

export default Plans;
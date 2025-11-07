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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { session } = useAuth();
  const { refreshPlanStatus, hasActivePlan, currentPlan } = usePlan();
  const navigate = useNavigate();
  const location = useLocation();

  // Definir handleCheckout antes de efeitos que o referenciam para evitar erro de TDZ
  const handleCheckout = useCallback(async (plan: DbPlan) => {
    if (!session) {
      showRadixError("Inicia sesión para contratar un plan.");
      return;
    }

    // Se o plano é gratuito (preço = 0), ativar diretamente sem passar pelo Stripe
    if (plan.price === 0) {
      try {
        // Criar registro de pagamento para plano gratuito
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: session.user.id,
            plan_id: plan.id,
            amount: 0,
            status: 'active',
            payment_method: 'free',
            period_start: new Date().toISOString(),
            period_end: null, // Plano gratuito não expira
          });

        if (paymentError) throw paymentError;

        // Atualizar profile com status de assinatura ativa
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('id', session.user.id);

        if (profileError) throw profileError;

        showRadixSuccess("¡Plan gratuito activado con éxito!");
        await refreshPlanStatus();
        navigate('/gestor');
        return;
      } catch (error: any) {
        showRadixError(`Error al activar plan gratuito: ${error.message}`);
        return;
      }
    }

    // Para planos pagos, verificar se tem stripe_price_id
    if (!plan.stripe_price_id) {
      showRadixError("Este plan no está configurado con Stripe (falta price_id).");
      return;
    }

    // Guardar el plan seleccionado para posibles fallbacks post-checkout
    try {
      sessionStorage.setItem('selected_plan', JSON.stringify({ id: plan.id }));
    } catch {}
    const successUrl = `${window.location.origin}/planes?success=1`;
    const cancelUrl = `${window.location.origin}/planes?canceled=1`;

    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: {
        price_id: plan.stripe_price_id,
        plan_id: plan.id,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
    });

    if (error) {
      showRadixError(`Error al iniciar el checkout: ${error.message}`);
      return;
    }
    const url = (data as any)?.url;
    if (url) {
      window.location.href = url;
    } else {
      showRadixError("No fue posible obtener la URL del checkout.");
    }
  }, [session, refreshPlanStatus, navigate]);

  const handleContinueWithoutPlan = useCallback(() => {
    try {
      sessionStorage.removeItem('selected_plan');
    } catch {}
    showRadixSuccess("Puedes continuar sin plan por ahora.");
    navigate('/gestor-dashboard');
  }, [navigate]);

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
    const hasSuccess = params.get("success");
    const sessionId = params.get("session_id");
    const hasCanceled = params.get("canceled");

    if (hasSuccess && !paymentSuccess) {
      setPaymentSuccess(true);
      showRadixSuccess("¡Pago procesado con éxito! Ahora, registra tu administradora.");
      // Forçar atualização do status do plano após pagamento bem-sucedido
      setTimeout(() => {
        refreshPlanStatus();
      }, 2000);
      // Verificar sessão do Stripe diretamente para ativação imediata
      if (sessionId) {
        (async () => {
          const selected = sessionStorage.getItem('selected_plan');
          const parsed = selected ? JSON.parse(selected) : null;
          const plan_id = parsed?.id ?? null;
          const { error } = await supabase.functions.invoke("verify-checkout-session", {
            body: { session_id: sessionId, plan_id },
          });
          if (!error) {
            refreshPlanStatus();
            showRadixSuccess("Verificación completada. Tu plan está activo.");
          }
        })();
      }
      // Fallback adicional: se após alguns segundos ainda não ativou, aciona função de ativação
      setTimeout(async () => {
        if (!hasActivePlan) {
          try {
            const selected = sessionStorage.getItem('selected_plan');
            const parsed = selected ? JSON.parse(selected) : null;
            const plan_id = parsed?.id ?? null;
            const { data, error } = await supabase.functions.invoke("activate-subscription-fallback", {
              body: { plan_id },
            });
            if (!error) {
              refreshPlanStatus();
              showRadixSuccess("Activación confirmada. Tu plan está activo.");
            }
          } catch {}
        }
      }, 4000);
      // Remover o parâmetro para evitar múltiplos toasts
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, document.title, url.pathname + (url.search ? `?${url.searchParams.toString()}` : ""));
    }

    if (hasCanceled) {
      showRadixError("Pago cancelado.");
      // Remover o parâmetro para evitar múltiplos toasts
      const url = new URL(window.location.href);
      url.searchParams.delete("canceled");
      window.history.replaceState({}, document.title, url.pathname + (url.search ? `?${url.searchParams.toString()}` : ""));
    }
  }, [paymentSuccess, refreshPlanStatus]);

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

  const cardsContainerClass = useMemo(() => {
    if (filteredPlans.length === 1) {
      return "w-full max-w-3xl grid grid-cols-1 auto-rows-fr gap-6 items-stretch mx-auto";
    }
    if (filteredPlans.length === 2) {
      return "w-full max-w-5xl grid grid-cols-2 auto-rows-fr gap-6 items-stretch mx-auto";
    }
    return "w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-6 items-stretch mx-auto";
  }, [filteredPlans.length]);
  

  return (
    <div className="min-h-screen w-full bg-[#2a214d] text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {paymentSuccess && (
        <div className="w-full max-w-3xl mx-auto mb-6">
          <div className="rounded-lg border border-green-500 bg-green-700/20 p-4">
            <p className="text-green-200">
              ¡Pago procesado con éxito! Haz clic en el botón abajo para registrar tu administradora.
            </p>
            <Button
              onClick={() => navigate('/gestor/administradoras')}
              className="mt-3 bg-purple-600 text-white hover:bg-purple-700"
            >
              Registrar Administradora
            </Button>
          </div>
        </div>
      )}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">
          Elige el plan ideal para tu negocio
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Ofrecemos diferentes planes para satisfacer las necesidades específicas
          de tu empresa administradora de condominios.
        </p>
      </div>

      <div className="my-8 w-full flex justify-center">
        <div className="inline-flex bg-gray-800/50 rounded-full p-1">
          <Button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 border-0 shadow-none ${
              billingCycle === "monthly"
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-transparent text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            Mensual
          </Button>
          <Button
            onClick={() => setBillingCycle("annual")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 border-0 shadow-none ${
              billingCycle === "annual"
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-transparent text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            Anual
          </Button>
        </div>
      </div>

      <div className={cardsContainerClass}>
        {loading ? (
          <div className="flex justify-center items-center w-full h-48">
            <LoadingSpinner size="lg" className="border-primary shadow-lg shadow-primary/50" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-gray-300">No hay planes disponibles.</div>
        ) : (
          filteredPlans.map((plan) => {
            const isCurrent = hasActivePlan && currentPlan?.id === plan.id;
            return (
            <div key={plan.id} className="h-full w-full max-w-lg mx-auto">
              <PlanCard
                name={plan.name}
                description={plan.description || ""}
                price={new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(plan.price)}
                period={`/${plan.period === "monthly" ? "mensual" : "anual"}`}
                features={plan.features || []}
                buttonText={isCurrent ? "Plan actual" : "Contratar Plan"}
                disabled={isCurrent}
                onClick={isCurrent ? undefined : () => handleCheckout(plan)}
              />
            </div>
            );
          })
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          variant="outline"
          onClick={handleContinueWithoutPlan}
          className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
        >
          Continuar sin plan
        </Button>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold">
          ¿Necesitas un plan personalizado?
        </h2>
        <p className="mt-2 text-gray-300">
          Contacta con nuestro equipo comercial para una propuesta personalizada.
        </p>
        <Button
          variant="outline"
          className="mt-6 bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
        >
          Hablar con un asesor
        </Button>
      </div>
    </div>
  );
};

export default Plans;
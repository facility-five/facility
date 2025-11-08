import { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Crown,
  Star,
  Building,
  Building2,
  Users,
  CreditCard,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  stripe_price_id: string;
  features: string[];
  max_condos: number;
  max_units: number;
  max_administrators?: number;
  max_admins?: number; // Campo alternativo no banco
  is_popular: boolean;
}

const MiPlan = () => {
  const { session } = useAuth();
  const { refreshPlanStatus } = usePlan();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [usage, setUsage] = useState({
    administrators: { used: 0, limit: 0 },
    condominiums: { used: 0, limit: 0 },
    units: { used: 0, limit: 0 },
  });

  // 🔹 Proteção: redirecionar se não houver sessão
  useEffect(() => {
    if (!session) {
      console.log("⚠️ Sem sessão de usuário, redirecionando para login");
      window.location.href = '/login';
    }
  }, [session]);

    // 🔹 Carrega dados ao montar
  useEffect(() => {
    loadPlans();
    loadCurrentPlan();
  }, [session?.user?.id]);

  // 🔹 Atualiza limites e consumo sempre que o plano mudar
  useEffect(() => {
    if (currentPlan && session?.user?.id) {
      console.log("Plano carregado:", currentPlan);
      fetchUsage();
    }
  }, [currentPlan, session?.user?.id]);

  // 🔹 Listener em tempo real para mudanças na tabela plans
  useEffect(() => {
    if (!currentPlan?.id) return;

    console.log("🔔 Configurando listener para plano:", currentPlan.id);

    const channel = supabase
      .channel(`plan-changes-${currentPlan.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'plans',
          filter: `id=eq.${currentPlan.id}`
        },
        (payload) => {
          console.log("🔔 Plano atualizado:", payload.new);
          // Atualizar o plano local com os novos dados
          setCurrentPlan(payload.new as Plan);
        }
      )
      .subscribe();

    return () => {
      console.log("🔕 Removendo listener do plano");
      supabase.removeChannel(channel);
    };
  }, [currentPlan?.id]);

  // 🔹 Listener em tempo real para mudanças nas tabelas de dados (administrators, condominiums, units)
  useEffect(() => {
    if (!session?.user?.id) return;

    console.log("🔔 Configurando listeners para consumo em tempo real");

    const channel = supabase
      .channel(`usage-changes-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'administrators',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log("🔔 Mudança em administrators:", payload);
          fetchUsage();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'condominiums',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log("🔔 Mudança em condominiums:", payload);
          fetchUsage();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'units',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log("🔔 Mudança em units:", payload);
          fetchUsage();
        }
      )
      .subscribe();

    return () => {
      console.log("🔕 Removendo listeners de consumo");
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const fetchUsage = async () => {
    if (!session?.user?.id || !currentPlan) {
      console.log("fetchUsage: Sem sessão de usuário ou plano não carregado");
      return;
    }

    console.log("fetchUsage: Buscando uso para usuário:", session.user.id);
    console.log("fetchUsage: Plano atual:", currentPlan);
    console.log("fetchUsage: Limites do plano:", {
      max_administrators: currentPlan.max_administrators,
      max_condos: currentPlan.max_condos,
      max_units: currentPlan.max_units
    });

    try {
      // Tentar usar RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_tenant_usage", {
        user_uuid: session.user.id,
      });

      if (rpcError) {
        console.warn("⚠️ RPC get_tenant_usage falhou, usando queries diretas:", rpcError);
        
        // Fallback: buscar contadores diretamente
        const [adminsResult, condosResult, unitsResult] = await Promise.all([
          supabase.from("administrators").select("id", { count: "exact", head: true }).or(`user_id.eq.${session.user.id},responsible_id.eq.${session.user.id}`),
          supabase.from("condominiums").select("id", { count: "exact", head: true }),
          supabase.from("units").select("id", { count: "exact", head: true }),
        ]);

        const counts = {
          administrators: adminsResult.count ?? 0,
          condominiums: condosResult.count ?? 0,
          units: unitsResult.count ?? 0,
        };

        console.log("fetchUsage: Contadores (queries diretas):", counts);

        setUsage({
          administrators: {
            used: counts.administrators,
            limit: currentPlan.max_administrators || currentPlan.max_admins || 0,
          },
          condominiums: {
            used: counts.condominiums,
            limit: currentPlan.max_condos || 0,
          },
          units: {
            used: counts.units,
            limit: currentPlan.max_units || 0,
          },
        });
      } else {
        // RPC funcionou
        const counts = rpcData || { administrators: 0, condominiums: 0, units: 0 };
        console.log("fetchUsage: Contadores (RPC):", counts);

        setUsage({
          administrators: {
            used: counts.administrators,
            limit: currentPlan.max_administrators || currentPlan.max_admins || 0,
          },
          condominiums: {
            used: counts.condominiums,
            limit: currentPlan.max_condos || 0,
          },
          units: {
            used: counts.units,
            limit: currentPlan.max_units || 0,
          },
        });
      }

      console.log("✅ fetchUsage: Uso atualizado com sucesso");
    } catch (error) {
      console.error("❌ fetchUsage: Erro ao buscar uso:", error);
      showRadixError("Erro ao atualizar o uso do plano.");
    }
  };

  // 🔹 Atualização automática a cada 15s
  useEffect(() => {
    if (currentPlan && session?.user?.id) {
      fetchUsage();
      const interval = setInterval(fetchUsage, 15000);
      return () => clearInterval(interval);
    }
  }, [currentPlan, session?.user?.id]);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase.from("plans").select("*").order("price", { ascending: true });
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      showRadixError("Erro ao carregar planos disponíveis.");
    }
  };

  const loadCurrentPlan = async () => {
    try {
      if (!session?.user?.id) {
        console.log("loadCurrentPlan: Sem sessão de usuário");
        return;
      }

      console.log("loadCurrentPlan: Buscando plano para usuário:", session.user.id);

      // Buscar pagamento ativo (sem tentar join com plans que não existe)
      const { data: payments, error } = await supabase
        .from("payments")
        .select("id, plan_id, status, created_at")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1);

      console.log("loadCurrentPlan: Resultado da busca de pagamentos:", { payments, error });

      if (error) throw error;
      
      if (payments && payments.length > 0) {
        console.log("✅ Pagamento ativo encontrado:", payments[0]);
        
        // Buscar o plano pelo plan_id
        const { data: planData, error: planError } = await supabase
          .from("plans")
          .select("*")
          .eq("id", payments[0].plan_id)
          .single();

        console.log("loadCurrentPlan: Resultado da busca do plano:", { planData, planError });

        if (planError) {
          console.error("❌ Erro ao buscar plano:", planError);
          setCurrentPlan(null);
        } else {
          console.log("✅ Plano encontrado:", planData);
          console.log("📊 Detalhes dos limites:", {
            max_administrators: planData.max_administrators,
            max_condos: planData.max_condos,
            max_units: planData.max_units,
            max_admins: planData.max_admins
          });
          setCurrentPlan(planData as Plan);
        }
      } else {
        console.log("⚠️ Nenhum pagamento ativo, buscando plano gratuito...");
        // Se não tem pagamento ativo, buscar plano gratuito
        const { data: freePlan, error: freePlanError } = await supabase
          .from("plans")
          .select("*")
          .eq("price", 0)
          .order("created_at", { ascending: true })
          .limit(1)
          .single();

        console.log("loadCurrentPlan: Resultado da busca de plano gratuito:", { freePlan, freePlanError });

        if (freePlanError) {
          console.error("❌ Erro ao buscar plano gratuito:", freePlanError);
          setCurrentPlan(null);
        } else {
          console.log("✅ Plano gratuito encontrado:", freePlan);
          setCurrentPlan(freePlan as Plan);
        }
      }
    } catch (error) {
      console.error("❌ Erro ao carregar plano atual:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!session?.user?.id) return;
    setProcessingPlan(plan.id);

    try {
      const successUrl = `${window.location.origin}/gestor/mi-plan?success=1`;
      const cancelUrl = `${window.location.origin}/gestor/mi-plan?canceled=1`;

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { price_id: plan.stripe_price_id, plan_id: plan.id, success_url: successUrl, cancel_url: cancelUrl },
      });

      if (error || !data?.url) {
        showRadixError("Erro ao iniciar o checkout. Tente novamente.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Erro no checkout:", error);
      showRadixError("Erro inesperado ao iniciar o checkout.");
    } finally {
      setProcessingPlan(null);
    }
  };

  // 🔹 Mostrar loading se não houver sessão
  if (!session || loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Plan</h1>
          <p className="text-muted-foreground">
            Administra tu suscripción y haz un seguimiento del uso de tu plan.
          </p>
        </div>

        {/* 🔹 Card do plano atual */}
        <Card className="bg-emerald-50 border-emerald-200 rounded-xl text-emerald-900">
          <CardHeader className="px-6 pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-[1.125rem] font-bold">
                  <Crown className="h-5 w-5 text-emerald-500" />
                  Plan Actual: {currentPlan?.name || "Gratuito"}
                </CardTitle>
                <CardDescription className="text-emerald-700">
                  Estás utilizando el plan {currentPlan?.name || "Gratuito"}.
                </CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 font-semibold rounded-full px-3 py-1 text-[0.8rem]">
                Activo
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-6">
            {[
              { label: "Administradoras", used: usage.administrators.used, limit: usage.administrators.limit, icon: <Building2 className="h-4 w-4 text-emerald-600" /> },
              { label: "Condomínios", used: usage.condominiums.used, limit: usage.condominiums.limit, icon: <Building className="h-4 w-4 text-emerald-600" /> },
              { label: "Unidades", used: usage.units.used, limit: usage.units.limit, icon: <Users className="h-4 w-4 text-emerald-600" /> },
            ].map((item, i) => {
              const limit = item.limit || 0;
              const percent = limit > 0 ? Math.min((item.used / limit) * 100, 100) : 0;
              const isNearLimit = percent >= 80 && limit > 0;
              const isAtLimit = percent >= 100 && limit > 0;
              
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-emerald-900">{item.label}</span>
                    </div>
                    <span className={`font-semibold ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-emerald-700'}`}>
                      {item.used} / {limit}
                    </span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-emerald-100 overflow-hidden shadow-inner">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-in-out ${
                        isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }} 
                    />
                  </div>
                  {isAtLimit && (
                    <p className="text-xs text-red-600 font-medium">⚠ Límite alcanzado</p>
                  )}
                  {isNearLimit && !isAtLimit && (
                    <p className="text-xs text-orange-600 font-medium">⚠ Cerca del límite</p>
                  )}
                </div>
              );
            })}

            <div className="mt-6 pt-4 flex flex-col md:flex-row items-center justify-between border-t border-green-200">
              <div className="flex items-center gap-2 text-emerald-700">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Valor Mensal:</span>
                <span className="text-sm font-bold text-emerald-700">
                  R$ {currentPlan?.price || 0}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 md:mt-0 w-full md:w-auto border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white rounded-lg px-4 py-2 font-semibold"
                onClick={() => document.getElementById("planos-disponiveis")?.scrollIntoView({ behavior: "smooth" })}
              >
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 🔹 Planos disponíveis */}
        <div id="planos-disponiveis">
          <h2 className="text-2xl font-bold mb-4">Planos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.is_popular ? "border-green-200 shadow-lg" : ""}`}>
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    R$ {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Até {plan.max_condos} condomínios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Até {plan.max_units} unidades</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={plan.is_popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={processingPlan === plan.id || currentPlan?.id === plan.id}
                  >
                    {processingPlan === plan.id && <LoadingSpinner size="sm" className="mr-2" />}
                    {currentPlan?.id === plan.id ? "Plano Atual" : "Contratar Plano"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default MiPlan;

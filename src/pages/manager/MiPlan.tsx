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
    administrators: { used: 0, limit: 2 },
    condominiums: { used: 0, limit: 2 },
    units: { used: 0, limit: 10 },
  });

  useEffect(() => {
    loadPlans();
    loadCurrentPlan();
    fetchUsage();

    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      showRadixSuccess("Pagamento processado com sucesso! Seu plano foi atualizado.");
      setTimeout(() => {
        refreshPlanStatus();
        loadCurrentPlan();
      }, 2000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get("canceled")) {
      showRadixError("Pagamento cancelado.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshPlanStatus]);

  const fetchUsage = async () => {
    if (!session?.user?.id) return;
    try {
      const [adminCount, condoCount, unitCount] = await Promise.all([
        supabase
          .from("administrators")
          .select("id", { count: "exact" })
          .eq("user_id", session.user.id),
        supabase
          .from("condominiums")
          .select("id", { count: "exact" })
          .eq("user_id", session.user.id),
        supabase
          .from("units")
          .select("id", { count: "exact" })
          .eq("user_id", session.user.id),
      ]);

      setUsage({
        administrators: { used: adminCount.count || 0, limit: 2 },
        condominiums: { used: condoCount.count || 0, limit: 2 },
        units: { used: unitCount.count || 0, limit: 10 },
      });
    } catch (error) {
      console.error("Erro ao buscar dados de uso:", error);
    }
  };

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      showRadixError("Erro ao carregar planos disponíveis");
    }
  };

  const loadCurrentPlan = async () => {
    try {
      if (!session?.user?.id) return;

      const { data: payments, error } = await supabase
        .from("payments")
        .select(
          `
          id,
          plan_id,
          status,
          plans (
            id,
            name,
            description,
            price,
            features,
            max_condos,
            max_units
          )
        `
        )
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (payments && payments.length > 0) {
        setCurrentPlan(payments[0].plans as any);
      }
    } catch (error) {
      console.error("Erro ao carregar plano atual:", error);
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

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            price_id: plan.stripe_price_id,
            plan_id: plan.id,
            success_url: successUrl,
            cancel_url: cancelUrl,
          },
        }
      );

      if (checkoutError) {
        showRadixError("Erro ao iniciar o checkout. Tente novamente.");
        return;
      }

      const url = (checkoutData as { url?: string })?.url;
      if (url) {
        window.location.href = url;
        return;
      }

      showRadixError("Não foi possível obter a página de pagamento. Tente novamente.");
    } catch (error) {
      console.error("Erro ao processar checkout:", error);
      showRadixError("Erro inesperado ao iniciar o checkout. Tente novamente.");
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold">Meu Plano</h1>
          <p className="text-muted-foreground">
            Gerencie sua assinatura e acompanhe o uso do seu plano.
          </p>
        </div>

        {/* Plano Atual */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-green-600" />
                  Plano Atual: {currentPlan?.name || "Plano Gratuito"}
                </CardTitle>
                <CardDescription>
                  Você está usando o plano {currentPlan?.name || "Gratuito"}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ativo
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {[
              {
                label: "Administradoras",
                used: usage.administrators.used,
                limit: usage.administrators.limit,
                icon: <Building2 className="h-4 w-4 text-green-500" />,
              },
              {
                label: "Condomínios",
                used: usage.condominiums.used,
                limit: usage.condominiums.limit,
                icon: <Building className="h-4 w-4 text-green-500" />,
              },
              {
                label: "Unidades",
                used: usage.units.used,
                limit: usage.units.limit,
                icon: <Users className="h-4 w-4 text-green-500" />,
              },
            ].map((item, i) => {
              const percent = Math.min((item.used / item.limit) * 100, 100);
              const progressColor =
                percent >= 100
                  ? "from-red-500 to-red-600"
                  : percent >= 80
                  ? "from-yellow-400 to-yellow-500"
                  : "from-green-500 to-emerald-600";

              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.used} / {item.limit}
                    </span>
                  </div>
                  <div className="relative h-3 rounded-full bg-green-100 overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-4 flex items-center justify-between border-t border-green-100 mt-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Valor Mensal:</span>
                <span className="text-sm font-bold text-green-700">
                  R$ {currentPlan?.price || 0}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-green-300 text-green-600 hover:bg-green-50"
                onClick={() =>
                  document
                    .getElementById("planos-disponiveis")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Planos Disponíveis */}
        <div id="planos-disponiveis">
          <h2 className="text-2xl font-bold mb-4">Planos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.is_popular ? "border-green-200 shadow-lg" : ""
                }`}
              >
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
                    <span className="text-sm font-normal text-muted-foreground">
                      /mês
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Até {plan.max_condos} condomínios
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Até {plan.max_units} unidades
                      </span>
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
                    disabled={
                      processingPlan === plan.id || currentPlan?.id === plan.id
                    }
                  >
                    {processingPlan === plan.id && (
                      <LoadingSpinner size="sm" className="mr-2" />
                    )}
                    {currentPlan?.id === plan.id
                      ? "Plano Atual"
                      : "Contratar Plano"}
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

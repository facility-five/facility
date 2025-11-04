import { useEffect, useMemo, useState, useCallback } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, Box, Building2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ManagerStatCard } from "@/components/manager/ManagerStatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { usePlan } from "@/hooks/usePlan";
import { showRadixSuccess, showRadixError } from "@/utils/toast";

interface Stats {
  condos: number;
  blocks: number;
  units: number;
  residents: number;
}

const ManagerDashboardContent = () => {
  const { user } = useAuth();
  const { isFreePlan, hasActivePlan, currentPlan, isLoading, refreshPlanStatus } = usePlan();
  const [stats, setStats] = useState<Stats>({ condos: 0, blocks: 0, units: 0, residents: 0 });
  const [loading, setLoading] = useState(true);
  const [paymentAnalysis, setPaymentAnalysis] = useState<any>(null);

  const analyzePayments = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Buscar todos os pagamentos do usuário
      const { data: allPayments, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          id,
          plan_id,
          status,
          created_at,
          amount,
          currency,
          stripe_payment_intent_id,
          plans (
            id,
            name,
            price
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Buscar profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, subscription_status")
        .eq("id", user.id)
        .single();

      setPaymentAnalysis({
        allPayments: allPayments || [],
        profile: profile,
        paymentsError,
        profileError,
        totalPayments: allPayments?.length || 0,
        activePayments: allPayments?.filter(p => p.status === "active").length || 0,
        paidPayments: allPayments?.filter(p => p.status === "paid").length || 0,
        lastPayment: allPayments?.[0] || null
      });
    } catch (error) {
      console.error("Erro ao analisar pagamentos:", error);
      setPaymentAnalysis({ error: (error as Error).message });
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      analyzePayments();
    }
  }, [user?.id, analyzePayments]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      const { data: condosData, error: condosError } = await supabase
        .from("condominiums")
        .select("id");

      if (condosError) {
        console.error("Error fetching condominiums:", condosError);
        setLoading(false);
        return;
      }

      const condoIds = condosData.map((c) => c.id);
      const condoCount = condoIds.length;

      let blockCount = 0;
      let unitCount = 0;

      if (condoCount > 0) {
        const { count: blocks } = await supabase
          .from("blocks")
          .select("*", { count: "exact", head: true })
          .in("condo_id", condoIds);
        blockCount = blocks || 0;

        const { count: units } = await supabase
          .from("units")
          .select("*", { count: "exact", head: true })
          .in("condo_id", condoIds);
        unitCount = units || 0;
      }

      setStats({
        condos: condoCount,
        blocks: blockCount,
        units: unitCount,
        residents: 0, // Placeholder
      });

      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            ¡Bienvenido a tu Panel de Gestión!
          </CardTitle>
          <CardDescription className="text-purple-100">
            Desde aquí puedes gestionar todos tus condominios, bloques, unidades,
            residentes, las reservas y mucho más en un solo lugar.
          </CardDescription>
        </CardHeader>
      </Card>

      {isFreePlan && (
        <UpgradeBanner
          title="Maximize o potencial do seu negócio"
          description="Faça upgrade para um plano pago e tenha acesso completo a todas as funcionalidades de gestão."
          variant="default"
        />
      )}

      {/* Debug do Status do Plano - Remover após correção */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">🔍 Análise Completa do Pagamento</CardTitle>
          <CardDescription className="text-orange-600">
            Informações detalhadas sobre o status do plano e pagamentos
          </CardDescription>
        </CardHeader>
        <div className="p-4 space-y-4 text-sm">
          {/* Status do Hook usePlan */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-orange-800 mb-2">📊 Status do Hook usePlan</h4>
            <div className="grid grid-cols-2 gap-2">
              <p><strong>isFreePlan:</strong> <span className={isFreePlan ? "text-red-600" : "text-green-600"}>{isFreePlan ? "Sim" : "Não"}</span></p>
              <p><strong>hasActivePlan:</strong> <span className={hasActivePlan ? "text-green-600" : "text-red-600"}>{hasActivePlan ? "Sim" : "Não"}</span></p>
              <p><strong>isLoading:</strong> {isLoading ? "Sim" : "Não"}</p>
              <p><strong>currentPlan:</strong> {currentPlan?.name || "Nenhum"}</p>
            </div>
          </div>

          {/* Análise de Pagamentos */}
          {paymentAnalysis && (
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold text-orange-800 mb-2">💳 Análise de Pagamentos</h4>
              {paymentAnalysis.error ? (
                <p className="text-red-600">Erro: {paymentAnalysis.error}</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <p><strong>Total:</strong> {paymentAnalysis.totalPayments}</p>
                    <p><strong>Ativos:</strong> <span className="text-green-600">{paymentAnalysis.activePayments}</span></p>
                    <p><strong>Pagos:</strong> <span className="text-blue-600">{paymentAnalysis.paidPayments}</span></p>
                  </div>
                  
                  {paymentAnalysis.lastPayment && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="font-medium">Último Pagamento:</p>
                      <p><strong>Status:</strong> <span className={paymentAnalysis.lastPayment.status === 'active' ? 'text-green-600' : paymentAnalysis.lastPayment.status === 'paid' ? 'text-blue-600' : 'text-gray-600'}>{paymentAnalysis.lastPayment.status}</span></p>
                      <p><strong>Plano:</strong> {paymentAnalysis.lastPayment.plans?.name}</p>
                      <p><strong>Valor:</strong> {paymentAnalysis.lastPayment.amount} {paymentAnalysis.lastPayment.currency}</p>
                      <p><strong>Data:</strong> {new Date(paymentAnalysis.lastPayment.created_at).toLocaleString()}</p>
                    </div>
                  )}

                  {paymentAnalysis.profile && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="font-medium">Profile do Usuário:</p>
                      <p><strong>Role:</strong> {paymentAnalysis.profile.role}</p>
                      <p><strong>Subscription Status:</strong> <span className={paymentAnalysis.profile.subscription_status === 'active' ? 'text-green-600' : 'text-gray-600'}>{paymentAnalysis.profile.subscription_status || 'Não definido'}</span></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => {
                refreshPlanStatus();
                analyzePayments();
              }}
              className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
            >
              🔄 Atualizar Análise
            </button>
            <button 
              onClick={analyzePayments}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              📊 Recarregar Pagamentos
            </button>
            <button 
              onClick={() => {
                // Simular um pagamento ativo para testes
                const simulatePayment = async () => {
                  try {
                    const { error } = await supabase
                      .from('payments')
                      .insert([
                        {
                          user_id: user.id,
                          plan_id: 'test-plan',
                          plan: 'Plano Teste',
                          amount: 99.90,
                          currency: 'EUR',
                          status: 'active',
                          stripe_payment_intent_id: 'test_' + Date.now(),
                        },
                      ]);
                    
                    if (error) throw error;
                    
                    showRadixSuccess('Pagamento de teste criado com sucesso!');
                    setTimeout(() => {
                      refreshPlanStatus();
                      analyzePayments();
                    }, 1000);
                  } catch (error) {
                    console.error('Erro ao simular pagamento:', error);
                    showRadixError('Erro ao simular pagamento');
                  }
                };
                simulatePayment();
              }}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              🧪 Simular Pagamento
            </button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </>
        ) : (
          <>
            <ManagerStatCard
              title="Condominios"
              value={stats.condos.toString()}
              description="Total de Condominios"
              icon={Building}
              iconBgClass="bg-purple-500"
            />
            <ManagerStatCard
              title="Bloques"
              value={stats.blocks.toString()}
              description="Total de Bloques"
              icon={Box}
              iconBgClass="bg-blue-500"
            />
            <ManagerStatCard
              title="Unidades"
              value={stats.units.toString()}
              description="Total de unidades"
              icon={Building2}
              iconBgClass="bg-green-500"
            />
            <ManagerStatCard
              title="Residentes"
              value={stats.residents.toString()}
              description="Total de Residentes"
              icon={Users}
              iconBgClass="bg-sky-500"
            />
          </>
        )}
      </div>
    </div>
  );
};

const ManagerDashboard = () => (
  <ManagerLayout>
    <ManagerDashboardContent />
  </ManagerLayout>
);

export default ManagerDashboard;











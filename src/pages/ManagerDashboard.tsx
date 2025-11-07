import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, Box, Building2, Users, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ManagerStatCard } from "@/components/manager/ManagerStatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { showRadixSuccess, showRadixError } from "@/utils/toast";
import { FreePlanDebug } from "@/components/FreePlanDebug";

interface Stats {
  condos: number;
  blocks: number;
  units: number;
  residents: number;
}

const ManagerDashboardContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isFreePlan, hasActivePlan, currentPlan, isLoading, refreshPlanStatus } = usePlan();
  const [stats, setStats] = useState<Stats>({ condos: 0, blocks: 0, units: 0, residents: 0 });
  const [loading, setLoading] = useState(true);

  // Debug temporário
  console.log('ManagerDashboard - isFreePlan:', isFreePlan);
  console.log('ManagerDashboard - hasActivePlan:', hasActivePlan);
  console.log('ManagerDashboard - currentPlan:', currentPlan);
  console.log('ManagerDashboard - isLoading:', isLoading);

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

      {/* DEBUG VISUAL */}
      <Card className="border-4 border-red-500 bg-red-50">
        <div className="p-4">
          <h3 className="font-bold text-red-800 mb-2">🔴 DEBUG - Por que banner não aparece?</h3>
          <div className="space-y-1 text-sm">
            <p><strong>hasActivePlan:</strong> <span className={hasActivePlan ? "text-green-600" : "text-red-600"}>{String(hasActivePlan)}</span></p>
            <p><strong>currentPlan:</strong> {currentPlan ? JSON.stringify(currentPlan) : "NULL"}</p>
            <p><strong>currentPlan?.price:</strong> <span className="text-blue-600">{currentPlan?.price ?? "undefined"}</span></p>
            <p><strong>currentPlan?.price === 0:</strong> <span className={currentPlan?.price === 0 ? "text-green-600" : "text-red-600"}>{String(currentPlan?.price === 0)}</span></p>
            <p className="mt-2 pt-2 border-t border-red-300">
              <strong>Condição completa:</strong> <span className={hasActivePlan && currentPlan?.price === 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {hasActivePlan && currentPlan?.price === 0 ? "✅ TRUE - Banner DEVE aparecer" : "❌ FALSE - Banner NÃO aparece"}
              </span>
            </p>
          </div>
        </div>
      </Card>

      {/* Componente de Debug do Plano Gratuito */}
      <FreePlanDebug />

      {/* Banner de Upgrade para Plano Gratuito */}
      {hasActivePlan && currentPlan?.price === 0 && (
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Crown className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Maximize o potencial do seu negócio</h3>
                <p className="text-sm text-white/90 mb-3">
                  Faça upgrade para um plano pago e tenha acesso completo a todas as funcionalidades de gestão.
                </p>
                <Button
                  onClick={() => navigate("/gestor/mi-plan")}
                  className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-6"
                >
                  Ver Planos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

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











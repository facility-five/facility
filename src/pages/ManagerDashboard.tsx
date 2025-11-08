import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, Box, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ManagerStatCard } from "@/components/manager/ManagerStatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { showRadixSuccess, showRadixError } from "@/utils/toast";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";

interface Stats {
  condos: number;
  blocks: number;
  units: number;
  residents: number;
}

// Card de boas-vindas com nome da administradora
const WelcomeCard = memo(({ administratorName }: { administratorName?: string }) => (
  <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
    <CardHeader>
      <CardTitle className="text-2xl font-bold">
        ¡Bienvenido a tu Panel de Gestión!
      </CardTitle>
      <CardDescription className="text-purple-100">
        {administratorName ? (
          <>
            Administradora: <strong>{administratorName}</strong>
            <br />
          </>
        ) : null}
        Desde aquí puedes gestionar todos tus condominios, bloques, unidades,
        residentes, las reservas y mucho más en un solo lugar.
      </CardDescription>
    </CardHeader>
  </Card>
));

WelcomeCard.displayName = "WelcomeCard";

// Memoizar os skeletons de loading
const LoadingSkeletons = memo(() => (
  <>
    <Skeleton className="h-28 rounded-lg" />
    <Skeleton className="h-28 rounded-lg" />
    <Skeleton className="h-28 rounded-lg" />
    <Skeleton className="h-28 rounded-lg" />
  </>
));

LoadingSkeletons.displayName = "LoadingSkeletons";

// Memoizar as estatísticas
const StatsCards = memo(({ stats }: { stats: Stats }) => (
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
));

StatsCards.displayName = "StatsCards";

const ManagerDashboardContent = () => {
  const { activeAdministratorId, activeAdministrator, loading: adminLoading } = useManagerAdministradoras();
  const [stats, setStats] = useState<Stats>({ condos: 0, blocks: 0, units: 0, residents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aguarda carregamento das administradoras
    if (adminLoading) return;
    
    // Se não há administradora selecionada, não busca dados
    if (!activeAdministratorId) {
      setStats({ condos: 0, blocks: 0, units: 0, residents: 0 });
      setLoading(false);
      return;
    }
    
    const fetchStats = async () => {
      setLoading(true);
      console.log("📊 Buscando estatísticas para administradora:", activeAdministratorId, activeAdministrator?.name);

      // Buscar condomínios da administradora selecionada
      const { data: condosData, error: condosError } = await supabase
        .from("condominiums")
        .select("id")
        .eq("administrator_id", activeAdministratorId);

      if (condosError) {
        console.error("❌ Error fetching condominiums:", condosError);
        setLoading(false);
        return;
      }

      const condoIds = condosData.map((c) => c.id);
      const condoCount = condoIds.length;

      let blockCount = 0;
      let unitCount = 0;
      let residentCount = 0;

      if (condoCount > 0) {
        // Buscar blocos
        const { count: blocks } = await supabase
          .from("blocks")
          .select("*", { count: "exact", head: true })
          .in("condo_id", condoIds);
        blockCount = blocks || 0;

        // Buscar unidades
        const { count: units } = await supabase
          .from("units")
          .select("*", { count: "exact", head: true })
          .in("condo_id", condoIds);
        unitCount = units || 0;

        // Buscar residentes
        const { count: residents } = await supabase
          .from("residents")
          .select("*", { count: "exact", head: true })
          .in("condo_id", condoIds);
        residentCount = residents || 0;
      }

      console.log("📊 Estatísticas carregadas:", {
        administradora: activeAdministrator?.name,
        condos: condoCount,
        blocks: blockCount,
        units: unitCount,
        residents: residentCount
      });

      setStats({
        condos: condoCount,
        blocks: blockCount,
        units: unitCount,
        residents: residentCount,
      });

      setLoading(false);
    };

    fetchStats();
  }, [activeAdministratorId, adminLoading]);

  // Mostrar mensagem se não há administradora selecionada
  if (!adminLoading && !activeAdministratorId) {
    return (
      <div className="space-y-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-yellow-800">
              ⚠️ Nenhuma Administradora Selecionada
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Por favor, selecione uma administradora no menu superior para visualizar as estatísticas.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeCard administratorName={activeAdministrator?.name} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading || adminLoading ? <LoadingSkeletons /> : <StatsCards stats={stats} />}
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











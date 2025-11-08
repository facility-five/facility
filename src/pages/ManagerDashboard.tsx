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

interface Stats {
  condos: number;
  blocks: number;
  units: number;
  residents: number;
}

// Memoizar o card de boas-vindas
const WelcomeCard = memo(() => (
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
  const [stats, setStats] = useState<Stats>({ condos: 0, blocks: 0, units: 0, residents: 0 });
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Só busca uma vez
    if (hasFetched) return;
    
    const fetchStats = async () => {
      setLoading(true);
      setHasFetched(true);

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
      <WelcomeCard />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? <LoadingSkeletons /> : <StatsCards stats={stats} />}
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











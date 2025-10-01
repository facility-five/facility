import { useEffect, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, Box, Building2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ManagerStatCard } from "@/components/manager/ManagerStatCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  condos: number;
  blocks: number;
  units: number;
  residents: number;
}

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ condos: 0, blocks: 0, units: 0, residents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);

      const { data: adminData, error: adminError } = await supabase
        .from('administrators')
        .select('id')
        .eq('responsible_id', user.id)
        .single();

      if (adminError || !adminData) {
        console.error("Could not find administrator profile for user.", adminError);
        setLoading(false);
        return;
      }
      const administratorId = adminData.id;

      const { data: condosData, error: condosError } = await supabase
        .from('condos')
        .select('id')
        .eq('administrator_id', administratorId);

      if (condosError) {
        console.error("Error fetching condos:", condosError);
        setLoading(false);
        return;
      }

      const condoIds = condosData.map(c => c.id);
      const condoCount = condoIds.length;

      let blockCount = 0;
      let unitCount = 0;

      if (condoCount > 0) {
        const { count: blocks } = await supabase
          .from('blocks')
          .select('*', { count: 'exact', head: true })
          .in('condo_id', condoIds);
        blockCount = blocks || 0;

        const { count: units } = await supabase
          .from('units')
          .select('*', { count: 'exact', head: true })
          .in('condo_id', condoIds);
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
  }, [user]);

  return (
    <ManagerLayout>
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Panel de la Administradora</h1>
            </div>

            <Card className="bg-white shadow-sm">
                <CardHeader>
                    <CardTitle>Bem-vindo ao Facility Fincas</CardTitle>
                    <CardDescription>
                        Administre su condominio de forma eficiente con herramientas modernas. Supervise a los residentes, las reservas y mucho más en un solo lugar.
                    </CardDescription>
                </CardHeader>
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
    </ManagerLayout>
  );
};
export default ManagerDashboard;
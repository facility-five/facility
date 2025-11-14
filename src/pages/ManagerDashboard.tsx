import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building, Box, Building2, Users, Calendar, MessageSquare, AlertTriangle, Plus, BarChart3, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ManagerStatCard } from "@/components/manager/ManagerStatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { showRadixSuccess, showRadixError } from "@/utils/toast";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";
import { logger } from "@/utils/logger";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Stats {
  condos: number;
  blocks: number;
  units: number;
  residents: number;
  reservations: number;
  communications: number;
  requests: number;
  recentActivity: Activity[];
}

interface Activity {
  type: string;
  description: string;
  timestamp: string;
  icon: string;
}

// Card de boas-vindas modernizado
const WelcomeCard = memo(({ administratorName }: { administratorName?: string }) => (
  <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white border-none">
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
    <CardHeader className="relative z-10 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-2xl font-bold mb-2">
            ¡Bienvenido a tu Panel de Gestión!
          </CardTitle>
          <CardDescription className="text-purple-100 text-base">
            {administratorName ? (
              <span className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {administratorName}
                </Badge>
                <span>Tu administradora activa</span>
              </span>
            ) : null}
          </CardDescription>
        </div>
        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
          <BarChart3 className="h-6 w-6" />
        </div>
      </div>
      <p className="text-white/90 mt-4 text-sm leading-relaxed">
        Gestiona condominios, bloques, unidades, residentes y más desde un solo lugar.
      </p>
    </CardHeader>
  </Card>
));

WelcomeCard.displayName = "WelcomeCard";

// Card de atalhos rápidos
const QuickActions = memo(() => {
  const navigate = useNavigate();
  
  const actions = [
    { label: "Nuevo Condominio", icon: Building, path: "/gestor/condominios", color: "bg-purple-500" },
    { label: "Gestión Residentes", icon: Users, path: "/gestor/residentes", color: "bg-blue-500" },
    { label: "Nuevo Comunicado", icon: MessageSquare, path: "/gestor/comunicados", color: "bg-green-500" },
    { label: "Ver Reservas", icon: Calendar, path: "/gestor/reservas", color: "bg-orange-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Acciones Rápidas
        </CardTitle>
        <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
              onClick={() => navigate(action.path)}
            >
              <div className={`p-2 rounded-full ${action.color} text-white`}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

QuickActions.displayName = "QuickActions";

// Gráfico simples de crescimento
const GrowthChart = memo(({ stats }: { stats: Stats }) => {
  const growth = [
    { label: "Condominios", value: stats.condos, max: 10, color: "bg-purple-500" },
    { label: "Unidades", value: stats.units, max: 100, color: "bg-blue-500" },
    { label: "Residentes", value: stats.residents, max: 200, color: "bg-green-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Visión General
        </CardTitle>
        <CardDescription>Progreso actual de tu gestión</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {growth.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.value}/{item.max}</span>
              </div>
              <Progress value={(item.value / item.max) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

GrowthChart.displayName = "GrowthChart";

// Atividades recentes
const RecentActivity = memo(({ activities }: { activities: Activity[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        Actividad Reciente
      </CardTitle>
      <CardDescription>Últimas acciones en tu gestión</CardDescription>
    </CardHeader>
    <CardContent>
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-purple-100 rounded-full">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay actividad reciente</p>
        </div>
      )}
    </CardContent>
  </Card>
));

RecentActivity.displayName = "RecentActivity";

// Memoizar os skeletons de loading
const LoadingSkeletons = memo(() => (
  <>
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-28 rounded-lg" />
    ))}
  </>
));

LoadingSkeletons.displayName = "LoadingSkeletons";

// Estatísticas modernizadas
const ModernStatsCards = memo(({ stats }: { stats: Stats }) => (
  <>
    <ManagerStatCard
      title="Condominios"
      value={stats.condos.toString()}
      description="Total de Condominios"
      icon={Building}
      iconBgClass="bg-purple-500"
    />
    <ManagerStatCard
      title="Unidades"
      value={stats.units.toString()}
      description="Total de unidades"
      icon={Building2}
      iconBgClass="bg-blue-500"
    />
    <ManagerStatCard
      title="Residentes"
      value={stats.residents.toString()}
      description="Total de Residentes"
      icon={Users}
      iconBgClass="bg-green-500"
    />
    <ManagerStatCard
      title="Solicitudes"
      value={stats.requests.toString()}
      description="Solicitudes activas"
      icon={AlertTriangle}
      iconBgClass="bg-orange-500"
    />
  </>
));

ModernStatsCards.displayName = "ModernStatsCards";

const ManagerDashboardContent = () => {
  const { activeAdministratorId, activeAdministrator, loading: adminLoading } = useManagerAdministradoras();
  const [stats, setStats] = useState<Stats>({ 
    condos: 0, blocks: 0, units: 0, residents: 0, 
    reservations: 0, communications: 0, requests: 0, 
    recentActivity: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adminLoading) return;
    
    if (!activeAdministratorId) {
      setStats({ condos: 0, blocks: 0, units: 0, residents: 0, reservations: 0, communications: 0, requests: 0, recentActivity: [] });
      setLoading(false);
      return;
    }
    
    const fetchStats = async () => {
      setLoading(true);
      logger.info("Buscando estatísticas para administradora", { 
        administratorId: activeAdministratorId, 
        name: activeAdministrator?.name 
      });

      try {
        // Buscar condomínios da administradora selecionada
        const { data: condosData, error: condosError } = await supabase
          .from("condominiums")
          .select("id")
          .eq("administrator_id", activeAdministratorId);

        if (condosError) throw condosError;

        const condoIds = condosData.map((c) => c.id);
        const condoCount = condoIds.length;

        let blockCount = 0, unitCount = 0, residentCount = 0, reservationCount = 0, communicationCount = 0, requestCount = 0;

        if (condoCount > 0) {
          // Buscar dados em paralelo para melhor performance
          const [blocksRes, unitsRes, residentsRes, reservationsRes, communicationsRes, requestsRes] = await Promise.all([
            supabase.from("blocks").select("*", { count: "exact", head: true }).in("condo_id", condoIds),
            supabase.from("units").select("*", { count: "exact", head: true }).in("condo_id", condoIds),
            supabase.from("residents").select("*", { count: "exact", head: true }).in("condo_id", condoIds),
            supabase.from("reservations").select("*", { count: "exact", head: true }).in("condo_id", condoIds),
            supabase.from("communications").select("*", { count: "exact", head: true }).in("condo_id", condoIds),
            supabase.from("resident_requests").select("*", { count: "exact", head: true }).in("condominium_id", condoIds)
          ]);

          blockCount = blocksRes.count || 0;
          unitCount = unitsRes.count || 0;
          residentCount = residentsRes.count || 0;
          reservationCount = reservationsRes.count || 0;
          communicationCount = communicationsRes.count || 0;
          requestCount = requestsRes.count || 0;
        }

        // Simular atividade recente (em produção viria do banco)
        const recentActivity: Activity[] = [
          { type: "resident", description: "Nuevo residente agregado", timestamp: new Date().toISOString(), icon: "user" },
          { type: "communication", description: "Comunicado enviado", timestamp: new Date(Date.now() - 86400000).toISOString(), icon: "message" },
          { type: "reservation", description: "Nueva reserva registrada", timestamp: new Date(Date.now() - 172800000).toISOString(), icon: "calendar" },
        ];

        setStats({
          condos: condoCount,
          blocks: blockCount,
          units: unitCount,
          residents: residentCount,
          reservations: reservationCount,
          communications: communicationCount,
          requests: requestCount,
          recentActivity
        });
      } catch (error) {
        logger.error("Error fetching dashboard stats", error);
        showRadixError("Error al cargar estadísticas del dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activeAdministratorId, adminLoading]);

  if (!adminLoading && !activeAdministratorId) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl font-bold text-yellow-800">
              Selecciona una Administradora
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Elige una administradora en el menú superior para visualizar tu dashboard personalizado
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeCard administratorName={activeAdministrator?.name} />
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading || adminLoading ? <LoadingSkeletons /> : <ModernStatsCards stats={stats} />}
      </div>

      {/* Charts and Actions Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-80 rounded-lg col-span-1" />
            <Skeleton className="h-80 rounded-lg col-span-1" />
            <Skeleton className="h-80 rounded-lg col-span-1" />
          </>
        ) : (
          <>
            <QuickActions />
            <GrowthChart stats={stats} />
            <RecentActivity activities={stats.recentActivity} />
          </>
        )}
      </div>
    </div>
  );
};

const ManagerDashboard = () => {
  logger.info('ManagerDashboard: Componente carregado');
  
  return (
    <ManagerLayout>
      <ManagerDashboardContent />
    </ManagerLayout>
  );
};

export default ManagerDashboard;
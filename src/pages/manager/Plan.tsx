import { useEffect, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showError } from "@/utils/toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  CreditCard, 
  Calendar, 
  Users, 
  Building, 
  CheckCircle, 
  AlertCircle,
  Crown,
  Zap
} from "lucide-react";

interface PlanDetails {
  id: string;
  name: string;
  description: string | null;
  price: number;
  period: string;
  features: string[] | null;
  max_admins: number | null;
  max_condos: number | null;
}

interface UsageStats {
  totalAdmins: number;
  totalCondos: number;
}

const ManagerPlan = () => {
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!profile?.administradora_id) {
        console.log("Plan.tsx: No administradora_id found in profile:", profile);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Plan.tsx: Starting to fetch plan data for administradora_id:", profile.administradora_id);

        // Buscar detalhes do plano da administradora
        const { data: adminData, error: adminError } = await supabase
          .from("administradoras")
          .select(`
            plan_id,
            plans (
              id,
              name,
              description,
              price,
              period,
              features,
              max_admins,
              max_condos
            )
          `)
          .eq("id", profile.administradora_id)
          .single();

        console.log("Plan.tsx: Admin data response:", { adminData, adminError });

        if (adminError) throw adminError;

        if (adminData?.plans) {
          setPlanDetails(adminData.plans as PlanDetails);
          console.log("Plan.tsx: Plan details set:", adminData.plans);
        }

        // Buscar estatísticas de uso
        const [adminsResponse, condosResponse] = await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("administradora_id", profile.administradora_id),
          supabase
            .from("condominiums")
            .select("id", { count: "exact" })
            .eq("administrator_id", profile.administrator_id)
        ]);

        console.log("Plan.tsx: Usage stats responses:", { adminsResponse, condosResponse });

        if (adminsResponse.error) throw adminsResponse.error;
        if (condosResponse.error) throw condosResponse.error;

        setUsageStats({
          totalAdmins: adminsResponse.count || 0,
          totalCondos: condosResponse.count || 0
        });

        console.log("Plan.tsx: Usage stats set:", {
          totalAdmins: adminsResponse.count || 0,
          totalCondos: condosResponse.count || 0
        });

      } catch (error) {
        console.error("Plan.tsx: Error fetching plan data:", error);
        showRadixError("Error al cargar los datos del plan");
      } finally {
        console.log("Plan.tsx: Setting loading to false");
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [profile?.administradora_id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };

  const getUsagePercentage = (used: number, limit: number | null) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-96">
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
            Gestiona tu suscripción y revisa el uso de tu plan actual.
          </p>
        </div>

        {planDetails ? (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Detalles del Plan */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <CardTitle>Plan Actual</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Activo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{planDetails.name}</h3>
                  <p className="text-muted-foreground">{planDetails.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{formatPrice(planDetails.price)}</span>
                  <span className="text-muted-foreground">
                    /{planDetails.period === "monthly" ? "mes" : "año"}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Funcionalidades Incluidas
                  </h4>
                  <ul className="space-y-1">
                    {planDetails.features?.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    )) || (
                      <li className="text-sm text-muted-foreground">
                        No hay funcionalidades especificadas
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Uso del Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Uso del Plan
                </CardTitle>
                <CardDescription>
                  Revisa tu uso actual y los límites de tu plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Administradores */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Administradores
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {usageStats?.totalAdmins || 0}
                      {planDetails.max_admins ? ` / ${planDetails.max_admins}` : " / Ilimitado"}
                    </span>
                  </div>
                  {planDetails.max_admins && (
                    <Progress 
                      value={getUsagePercentage(usageStats?.totalAdmins || 0, planDetails.max_admins)}
                      className="h-2"
                    />
                  )}
                  {planDetails.max_admins && usageStats && 
                   getUsagePercentage(usageStats.totalAdmins, planDetails.max_admins) >= 90 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      Cerca del límite de administradores
                    </div>
                  )}
                </div>

                {/* Condominios */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Condominios
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {usageStats?.totalCondos || 0}
                      {planDetails.max_condos ? ` / ${planDetails.max_condos}` : " / Ilimitado"}
                    </span>
                  </div>
                  {planDetails.max_condos && (
                    <Progress 
                      value={getUsagePercentage(usageStats?.totalCondos || 0, planDetails.max_condos)}
                      className="h-2"
                    />
                  )}
                  {planDetails.max_condos && usageStats && 
                   getUsagePercentage(usageStats.totalCondos, planDetails.max_condos) >= 90 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      Cerca del límite de condominios
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Historial de Pagos
                  </Button>
                  <Button className="w-full">
                    <Crown className="h-4 w-4 mr-2" />
                    Actualizar Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">No se encontró información del plan</h3>
                  <p className="text-muted-foreground">
                    No se pudo cargar la información de tu plan actual.
                  </p>
                </div>
                <Button onClick={() => window.location.reload()}>
                  Intentar de nuevo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ManagerLayout>
  );
};

export default ManagerPlan;

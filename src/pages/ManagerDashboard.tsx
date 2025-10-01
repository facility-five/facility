import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Building2 } from "lucide-react";

const StatCard = ({ title, value, icon: Icon }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
);

const ManagerDashboard = () => {
  return (
    <ManagerLayout>
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Painel do Gestor</h1>
                <p className="text-muted-foreground">Bem-vindo de volta!</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total de Condomínios" value="12" icon={Building} />
                <StatCard title="Total de Unidades" value="452" icon={Building2} />
                <StatCard title="Total de Moradores" value="1,234" icon={Users} />
            </div>
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Outros gráficos e informações virão aqui.</p>
            </div>
        </div>
    </ManagerLayout>
  );
};
export default ManagerDashboard;
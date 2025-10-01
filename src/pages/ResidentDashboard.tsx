import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Megaphone, Wrench, Plus, Dot } from "lucide-react";

const StatCard = ({ icon: Icon, title, description, action, actionText, count }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-gray-400" />
    </CardHeader>
    <CardContent>
      <p className="text-xs text-gray-500 mb-4">{description}</p>
      {count && <p className="text-sm font-semibold mb-4">{count}</p>}
      {action && <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={action}><Plus className="mr-2 h-4 w-4" />{actionText}</Button>}
    </CardContent>
  </Card>
);

const ResidentDashboard = () => {
  const { profile } = useAuth();

  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Olá, {profile?.first_name}!</h1>
          <p className="text-gray-500">Bem-vindo ao seu portal do condomínio.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard 
            icon={CalendarCheck}
            title="Minhas Reservas"
            description="Veja e gestione suas reservas de áreas comunes."
            action={() => {}}
            actionText="Nova Reserva"
          />
          <StatCard 
            icon={Megaphone}
            title="Comunicados"
            description="Mantenha-se a par dos últimos avisos e comunicados."
            count="Você tem 2 novos comunicados."
          />
          <StatCard 
            icon={Wrench}
            title="Minhas Solicitações"
            description="Acompanhe suas reclamações e solicitações de serviço."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Salão de Festas</p>
                  <p className="text-sm text-gray-500">Sábado, 22 de Junho</p>
                  <p className="text-sm text-gray-500">19h - 23h</p>
                </div>
                <p className="text-sm text-center text-gray-400 pt-4">Você não tem outras reservas.</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Avisos Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Dot className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Manutenção da piscina agendada para 25/06.</span>
                </li>
                <li className="flex items-start">
                  <Dot className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Reunião de condomínio será no dia 30/06 às 20h.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResidentLayout>
  );
};
export default ResidentDashboard;
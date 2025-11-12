import { useEffect, useState } from "react";
import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Megaphone, Wrench, Plus, Dot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ reservationsTotal: 0, reservationsPending: 0, communicationsNew: 0, requestsTotal: 0 });
  const [nextReservation, setNextReservation] = useState<{ area?: string; date?: string; start?: string; end?: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data: resident } = await supabase.from('residents').select('id, condo_id').eq('profile_id', user.id).single();
      if (!resident) return;

      const { data: reservas } = await supabase
        .from('reservas')
        .select('id, status, reservation_date, start_time, end_time, common_areas(name)')
        .eq('resident_id', resident.id)
        .order('reservation_date', { ascending: true });
      const total = reservas?.length || 0;
      const pending = (reservas || []).filter(r => r.status === 'Pendente').length;
      const upcoming = (reservas || []).find(r => new Date(r.reservation_date) >= new Date());
      if (upcoming) {
        setNextReservation({ area: upcoming.common_areas?.name || '', date: new Date(upcoming.reservation_date).toLocaleDateString('pt-BR'), start: upcoming.start_time?.substring(0,5), end: upcoming.end_time?.substring(0,5) });
      } else {
        setNextReservation(null);
      }

      let communicationsNew = 0;
      if (resident.condo_id) {
        const { data: comms } = await supabase
          .from('communications')
          .select('id, created_at')
          .eq('condo_id', resident.condo_id)
          .order('created_at', { ascending: false })
          .limit(20);
        communicationsNew = (comms || []).filter(c => Date.now() - new Date(c.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000).length;
      }

      const { data: requests } = await supabase
        .from('resident_requests')
        .select('id')
        .eq('resident_id', user.id);

      setStats({ reservationsTotal: total, reservationsPending: pending, communicationsNew, requestsTotal: (requests || []).length });
    };
    load();
  }, [user]);

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
            description="Veja e gestione suas reservas de áreas comuns."
            count={`${stats.reservationsTotal} reservas (${stats.reservationsPending} pendentes)`}
            action={() => {}}
            actionText="Nova Reserva"
          />
          <StatCard 
            icon={Megaphone}
            title="Comunicados"
            description="Mantenha-se a par dos últimos avisos e comunicados."
            count={`Você tem ${stats.communicationsNew} novos comunicados.`}
          />
          <StatCard 
            icon={Wrench}
            title="Minhas Solicitações"
            description="Acompanhe suas reclamações e solicitações de serviço."
            count={`${stats.requestsTotal} solicitações`}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nextReservation ? (
                  <div>
                    <p className="font-semibold">{nextReservation.area}</p>
                    <p className="text-sm text-gray-500">{nextReservation.date}</p>
                    <p className="text-sm text-gray-500">{nextReservation.start} - {nextReservation.end}</p>
                  </div>
                ) : (
                  <p className="text-sm text-center text-gray-400">Você não tem próximas reservas.</p>
                )}
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

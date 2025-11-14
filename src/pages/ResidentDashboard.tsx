import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { PWAInstallPrompt } from "@/components/resident/PWAInstallPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Megaphone, Wrench, Plus, Dot, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

const MobileStatCard = ({ icon: Icon, title, description, action, actionText, count }: any) => (
  <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-sm hover:shadow-md transition-all duration-200">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <Icon className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </div>
        {action && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-purple-600 hover:bg-purple-50"
            onClick={action}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      {count && <p className="text-sm font-medium text-gray-700">{count}</p>}
      {action && actionText && (
        <Button 
          size="sm" 
          className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-sm" 
          onClick={action}
        >
          <Plus className="mr-2 h-4 w-4" />
          {actionText}
        </Button>
      )}
    </CardContent>
  </Card>
);

const DesktopStatCard = ({ icon: Icon, title, description, action, actionText, count }: any) => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-gray-400" />
    </CardHeader>
    <CardContent>
      <p className="text-xs text-gray-500 mb-4">{description}</p>
      {count && <p className="text-sm font-semibold mb-4">{count}</p>}
      {action && (
        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={action}>
          <Plus className="mr-2 h-4 w-4" />
          {actionText}
        </Button>
      )}
    </CardContent>
  </Card>
);

const ResidentDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useDeviceInfo();
  const [stats, setStats] = useState({ reservationsTotal: 0, reservationsPending: 0, communicationsNew: 0, requestsTotal: 0 });
  const [nextReservation, setNextReservation] = useState<{ area?: string; date?: string; start?: string; end?: string } | null>(null);
  const [importantNotices, setImportantNotices] = useState<Array<{ id: string | number; title: string }>>([]);

  const StatCard = isMobile ? MobileStatCard : DesktopStatCard;

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
          .select('id, title, created_at')
          .eq('condo_id', resident.condo_id)
          .order('created_at', { ascending: false })
          .limit(20);
        communicationsNew = (comms || []).filter(c => Date.now() - new Date(c.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000).length;
        setImportantNotices((comms || []).slice(0, 3).map(c => ({ id: c.id, title: c.title })));
      }

      const { data: requests } = await supabase
        .from('resident_requests')
        .select('id')
        .eq('resident_id', resident.id);

      setStats({ reservationsTotal: total, reservationsPending: pending, communicationsNew, requestsTotal: (requests || []).length });
    };
    load();
  }, [user]);

  return (
    <ResidentLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Welcome Section - Mobile Optimized */}
        <div className="px-1">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Olá, {profile?.first_name}!
          </h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">
            Bem-vindo ao seu portal do condomínio.
          </p>
        </div>

        {/* Quick Stats - Mobile First Grid */}
        <div className="space-y-3 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <StatCard 
            icon={CalendarCheck}
            title="Minhas Reservas"
            description="Veja e gestione suas reservas de áreas comuns."
            count={`${stats.reservationsTotal} reservas (${stats.reservationsPending} pendentes)`}
            action={() => navigate('/morador/reservas')}
            actionText="Nova Reserva"
          />
          <StatCard 
            icon={Megaphone}
            title="Comunicados"
            description="Mantenha-se a par dos últimos avisos."
            count={`${stats.communicationsNew} novos comunicados`}
            action={() => navigate('/morador/comunicados')}
            actionText="Ver Todos"
          />
          <StatCard 
            icon={Wrench}
            title="Solicitações"
            description="Acompanhe suas reclamações e solicitações."
            count={`${stats.requestsTotal} solicitações`}
            action={() => navigate('/morador/solicitacoes')}
            actionText="Nova Solicitação"
          />
        </div>

        {/* Detail Cards - Mobile Optimized */}
        <div className="space-y-4 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-2">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 lg:border lg:bg-white">
            <CardHeader className="pb-3 lg:pb-6">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
                Próximas Reservas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {nextReservation ? (
                <div className="bg-white/60 lg:bg-transparent rounded-lg p-3 lg:p-0">
                  <p className="font-semibold text-gray-900">{nextReservation.area}</p>
                  <p className="text-sm text-gray-600 mt-1">{nextReservation.date}</p>
                  <p className="text-sm text-blue-600 font-medium">
                    {nextReservation.start} - {nextReservation.end}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 lg:py-6">
                  <CalendarCheck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Você não tem próximas reservas.</p>
                  <Button 
                    size="sm" 
                    className="mt-3 bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/morador/reservas')}
                  >
                    Fazer Reserva
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 lg:border lg:bg-white">
            <CardHeader className="pb-3 lg:pb-6">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-600" />
                Avisos Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {importantNotices.length > 0 ? (
                <div className="space-y-3">
                  {importantNotices.map((notice) => (
                    <div 
                      key={notice.id} 
                      className="flex items-start gap-3 bg-white/60 lg:bg-transparent rounded-lg p-3 lg:p-0"
                    >
                      <Dot className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        {notice.title || 'Aviso do condomínio'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 lg:py-6">
                  <Megaphone className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Sem avisos importantes no momento.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </ResidentLayout>
  );
};
export default ResidentDashboard;

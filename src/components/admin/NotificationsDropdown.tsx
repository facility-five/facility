import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setUnreadCount(count || 0);

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setNotifications(data);
        // Seed data for demo if no notifications exist
        if (data.length === 0) {
          seedNotifications(user.id);
        }
      }
    };

    const seedNotifications = async (userId: string) => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

        const { data } = await supabase.from('notifications').insert([
          { user_id: userId, title: 'Manutenção da Piscina', message: 'A piscina estará fechada para manutenção no dia 25/06.', is_read: false, created_at: threeMonthsAgo.toISOString() },
          { user_id: userId, title: 'Sua solicitação foi atualizada', message: "O chamado REQ-1721054321 teve o status alterado para 'Em Andamento'.", is_read: false, created_at: fourMonthsAgo.toISOString() },
          { user_id: userId, title: 'Reunião de Condomínio', message: 'A reunião de condomínio será no dia 30/06 às 20h no salão de festas.', is_read: true, created_at: fourMonthsAgo.toISOString() },
        ]).select();

        if(data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    }

    fetchNotifications();
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-admin-foreground-muted hover:text-admin-foreground hover:bg-admin-border">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-admin-card border-admin-border text-admin-foreground" align="end">
        <div className="p-4">
          <h3 className="font-bold">Notificações</h3>
        </div>
        <div className="space-y-4 p-4 pt-0 max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(n => (
              <div key={n.id} className="flex gap-3">
                {!n.is_read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
                <div className={n.is_read ? 'ml-5' : ''}>
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-xs text-admin-foreground-muted">{n.message}</p>
                  <p className="text-xs text-admin-foreground-muted mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-admin-foreground-muted text-center py-4">Nenhuma notificação nova.</p>
          )}
        </div>
        <div className="p-2 border-t border-admin-border">
          <Link to="/admin/notificacoes" className="text-sm text-purple-400 hover:underline text-center block w-full">
            Ver todas as notificações
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
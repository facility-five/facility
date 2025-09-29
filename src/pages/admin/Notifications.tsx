import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showError("Erro ao buscar notificações.");
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    if (error) {
      showError("Erro ao marcar notificações como lidas.");
    } else {
      showSuccess("Todas as notificações foram marcadas como lidas.");
      fetchNotifications();
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notificações</h1>
        <Button onClick={markAllAsRead}>
          Marcar todas como lidas
        </Button>
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-card p-4 space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-admin-border" />
          ))
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div key={n.id} className={cn("p-4 rounded-lg border border-admin-border flex items-start gap-4", !n.is_read && "bg-admin-background")}>
              {!n.is_read && <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
              <div className="flex-grow">
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-admin-foreground-muted">{n.message}</p>
                <p className="text-xs text-admin-foreground-muted mt-2">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-admin-foreground-muted">Você não tem nenhuma notificação.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Notifications;
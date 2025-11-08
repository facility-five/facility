import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess, showRadixToast } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  entity_type?: string | null;
  entity_id?: string | null;
  deleted_at?: string | null;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq('user_id', user.id) // Filter by current user's notifications
      .is('deleted_at', null) // exclude soft-deleted
      .order("created_at", { ascending: false });

    if (error) {
      showRadixError("Erro ao buscar notificações.");
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  const deleteNotification = async (id: string) => {
    const prev = notifications;
    const toDelete = notifications.find(n => n.id === id);
    if (!toDelete) return;

    // optimistic remove
    setNotifications(prevList => prevList.filter(n => n.id !== id));

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // show undo toast
      const undo = async () => {
        try {
          const { data: restored, error: uerr } = await supabase
            .from('notifications')
            .update({ deleted_at: null })
            .eq('id', id)
            .select('*')
            .single();

          if (uerr) throw uerr;
          setNotifications(curr => [restored, ...curr]);
          showRadixSuccess('Notificação restaurada');
        } catch (ue) {
          showRadixError('Não foi possível restaurar a notificação.');
        }
      };

      showRadixToast('Notificação removida', undefined, {
        variant: 'default',
        action: (
          <button className="underline text-sm" onClick={undo}>Desfazer</button>
        ),
        duration: 6000,
      });
    } catch (err) {
      showRadixError('Erro ao remover notificação');
      // revert
      setNotifications(prev);
    }
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
      showRadixError("Erro ao marcar notificações como lidas.");
    } else {
      showRadixSuccess("Todas as notificações foram marcadas como lidas.");
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
            <div key={n.id} className={cn("p-4 rounded-lg border border-admin-border flex items-start gap-4 justify-between", !n.is_read && "bg-admin-background")}>
              <div className="flex items-start gap-4 flex-1">
                {!n.is_read && <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
                <div className="flex-grow">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-admin-foreground-muted">{n.message}</p>
                  <p className="text-xs text-admin-foreground-muted mt-2">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 self-start">
                <button onClick={() => deleteNotification(n.id)} className="text-admin-foreground-muted hover:text-red-500 p-1">
                  <Trash className="w-4 h-4" />
                </button>
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

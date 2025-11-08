import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixToast, showRadixError } from "@/utils/toast";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onNotificationCreated = (e: any) => {
      try {
        const created = e?.detail as Notification[] | undefined;
        console.debug('NotificationsDropdown: notification:created event received', created);
        if (created && created.length > 0) {
          setNotifications(prev => [...created, ...prev].slice(0,5));
          setUnreadCount(prev => prev + created.filter(n => !n.is_read).length);
        }
      } catch (err) {
        console.warn('NotificationsDropdown: error handling notification:created event', err);
      }
    };
    window.addEventListener('notification:created', onNotificationCreated as EventListener);

    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .is('deleted_at', null);
      
      setUnreadCount(count || 0);

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setNotifications(data as Notification[]);
      }
    };

    fetchNotifications();

    // Subscribe to realtime changes for the current user's notifications
    const subscribeRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase.channel(`notifications:${user.id}`);

      channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload: any) => {
          console.debug('NotificationsDropdown: realtime INSERT payload', payload);
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev].slice(0, 5));
          setUnreadCount(prev => prev + (newNotif.is_read ? 0 : 1));
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload: any) => {
          console.debug('NotificationsDropdown: realtime UPDATE payload', payload);
          const updated = payload.new as Notification;
          setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
          // Adjust unread count if read status changed
          setUnreadCount(prev => {
            const wasUnread = (payload.old?.is_read === false);
            const isNowRead = updated.is_read === true;
            if (wasUnread && isNowRead) return Math.max(prev - 1, 0);
            if (!wasUnread && !updated.is_read) return prev + 1;
            return prev;
          });
        })
        .subscribe();

      // Cleanup
      return () => {
        supabase.removeChannel(channel);
      };
    };

    const unsubPromise = subscribeRealtime();

    return () => {
      // ensure unsubscribe when effect unmounts
      (async () => {
        const unsub = await unsubPromise;
        if (typeof unsub === 'function') {
          unsub();
        }
      })();
      window.removeEventListener('notification:created', onNotificationCreated as EventListener);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      // optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(prev - 1, 0));
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (e) {
      // revert on error by refetching
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount((data as Notification[]).filter(n => !n.is_read).length);
      }
    }
  };

  const deleteNotification = async (id: string) => {
    const toDelete = notifications.find(n => n.id === id);
    if (!toDelete) return;

    // optimistic remove
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => toDelete.is_read ? prev : Math.max(prev - 1, 0));

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      const undo = async () => {
        try {
          const { data: restored, error: uerr } = await supabase
            .from('notifications')
            .update({ deleted_at: null })
            .eq('id', id)
            .select('*')
            .single();

          if (uerr) throw uerr;
          setNotifications(curr => [restored, ...curr].slice(0, 5));
          setUnreadCount(curr => restored.is_read ? curr : curr + 1);
        } catch (ue) {
          showRadixError('Não foi possível restaurar a notificação.');
        }
      };

      showRadixToast('Notificação removida', undefined, {
        variant: 'default',
        duration: 6000,
        action: (<button className="underline text-sm" onClick={undo}>Desfazer</button>)
      });
    } catch (err) {
      showRadixError('Erro ao remover notificação');
      // refetch on error
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setNotifications(data as Notification[]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-admin-foreground-muted hover:text-admin-foreground hover:bg-admin-border">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[18px] text-center">
              {unreadCount}
            </span>
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
              <div key={n.id} className="flex gap-3 items-start justify-between cursor-pointer" onClick={async () => {
                await markAsRead(n.id);
                // If the notification references an admin task, navigate to tasks list with query param
                if (n.entity_type === 'admin_task' && n.entity_id) {
                  navigate(`/admin/tareas?task=${n.entity_id}`);
                } else {
                  // default: open full notifications page
                  navigate('/admin/notificacoes');
                }
              }}>
                <div className="flex gap-3 items-start flex-1">
                  {!n.is_read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
                  <div className={n.is_read ? 'ml-5' : ''}>
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className="text-xs text-admin-foreground-muted">{n.message}</p>
                    <p className="text-xs text-admin-foreground-muted mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); deleteNotification(n.id); }} className="text-admin-foreground-muted hover:text-red-500 p-1">
                    <Trash className="w-4 h-4" />
                  </button>
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

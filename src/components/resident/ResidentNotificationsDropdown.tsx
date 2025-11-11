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
  type?: string;
};

export const ResidentNotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for custom notification events from other components
    const onNotificationCreated = (e: any) => {
      try {
        const created = e?.detail as Notification[] | undefined;
        console.debug('ResidentNotificationsDropdown: notification:created event received', created);
        if (created && created.length > 0) {
          setNotifications(prev => [...created, ...prev].slice(0,5));
          setUnreadCount(prev => prev + created.filter(n => !n.is_read).length);
        }
      } catch (err) {
        console.warn('ResidentNotificationsDropdown: error handling notification:created event', err);
      }
    };
    window.addEventListener('notification:created', onNotificationCreated as EventListener);

    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get unread count
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .is('deleted_at', null);

      setUnreadCount(count || 0);

      // Get recent notifications
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

      const channel = supabase.channel(`resident_notifications:${user.id}`);

      channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload: any) => {
          console.debug('ResidentNotificationsDropdown: realtime INSERT payload', payload);
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
          setUnreadCount(prev => prev + 1);
          
          // Show a toast notification for new communications
          if (newNotif.type === 'communication.new') {
            showRadixToast('Nova notificação', newNotif.title, { variant: 'default' });
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload: any) => {
          console.debug('ResidentNotificationsDropdown: realtime UPDATE payload', payload);
          const updatedNotif = payload.new as Notification;
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotif.id ? updatedNotif : n)
          );
          
          // Update unread count if notification was marked as read
          if (payload.old.is_read === false && updatedNotif.is_read === true) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        })
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    };

    subscribeRealtime();

    return () => {
      window.removeEventListener('notification:created', onNotificationCreated as EventListener);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state immediately
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      showRadixToast('Notificação removida', 'A notificação foi removida com sucesso.', { variant: 'default' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      showRadixError('Erro ao remover notificação');
    }
  };

  const refreshNotifications = async () => {
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
  };

  const getNotificationIcon = (type?: string) => {
    if (type?.includes('communication')) return '💬';
    if (type?.includes('reservation')) return '📅';
    if (type?.includes('maintenance')) return '🔧';
    if (type?.includes('request')) return '📋';
    return '🔔';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-800 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border border-gray-200" align="end">
        <div className="p-4">
          <h3 className="font-bold text-gray-900">Notificações</h3>
        </div>
        <div className="space-y-4 p-4 pt-0 max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(n => (
              <div key={n.id} className="flex gap-3 items-start justify-between cursor-pointer" onClick={async () => {
                await markAsRead(n.id);
                // Navigate based on notification type
                if (n.entity_type === 'communication' && n.entity_id) {
                  navigate('/morador/comunicados');
                } else if (n.type?.includes('reservation')) {
                  navigate('/morador/reservas');
                } else if (n.type?.includes('request')) {
                  navigate('/morador/solicitudes');
                } else {
                  // Default: stay on current page
                }
              }}>
                <div className="flex gap-3 items-start flex-1">
                  {!n.is_read && <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>}
                  <div className={n.is_read ? 'ml-5' : ''}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm">{getNotificationIcon(n.type)}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { locale: ptBR, addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 self-start">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }} 
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Você não tem nenhuma notificação.</p>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="border-t p-4">
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={refreshNotifications}
            >
              Atualizar notificações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Bell
} from 'lucide-react';

export interface FloatNotificationProps {
  id?: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

const iconColorMap = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

export function FloatNotification({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  position = 'top-right',
  onClose,
  action,
  persistent = false,
}: FloatNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const IconComponent = iconMap[type];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, persistent, handleClose]);

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50';
    
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        getPositionClasses(),
        'animate-in slide-in-from-top-2 fade-in-0 duration-300',
        isExiting && 'animate-out slide-out-to-top-2 fade-out-0 duration-200'
      )}
    >
      <Card className={cn(
        'w-80 p-4 shadow-lg border-l-4',
        colorMap[type]
      )}>
        <div className="flex items-start gap-3">
          <IconComponent className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColorMap[type])} />
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
            {message && (
              <p className="text-sm opacity-90 leading-relaxed">{message}</p>
            )}
            
            {action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  className="h-7 text-xs"
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Hook para gerenciar múltiplas notificações
export function useFloatNotifications() {
  const [notifications, setNotifications] = useState<FloatNotificationProps[]>([]);

  const addNotification = (notification: Omit<FloatNotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}

// Componente para renderizar todas as notificações
export function FloatNotificationContainer() {
  const { notifications, removeNotification } = useFloatNotifications();

  return (
    <>
      {notifications.map((notification) => (
        <FloatNotification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id!)}
        />
      ))}
    </>
  );
}
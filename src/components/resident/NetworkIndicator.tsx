import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const NetworkIndicator = () => {
  const networkInfo = useNetworkStatus();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    if (!networkInfo.isOnline) {
      setShowOfflineMessage(true);
    } else {
      // Hide message after coming back online
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [networkInfo.isOnline]);

  const getSignalStrength = () => {
    if (!networkInfo.effectiveType) return 'strong';
    
    switch (networkInfo.effectiveType) {
      case '4g':
        return 'strong';
      case '3g':
        return 'medium';
      case '2g':
      case 'slow-2g':
        return 'weak';
      default:
        return 'strong';
    }
  };

  const getSignalColor = () => {
    if (!networkInfo.isOnline) return 'text-red-500';
    
    const strength = getSignalStrength();
    switch (strength) {
      case 'strong':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'weak':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <>
      {/* Network indicator icon */}
      <div className="flex items-center gap-1">
        {networkInfo.isOnline ? (
          <Signal className={cn('h-4 w-4', getSignalColor())} />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
      </div>

      {/* Offline message */}
      {showOfflineMessage && (
        <div className={cn(
          'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300',
          networkInfo.isOnline 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        )}>
          <div className="flex items-center gap-2">
            {networkInfo.isOnline ? (
              <>
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Conexão restaurada
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Sem conexão - Modo offline
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
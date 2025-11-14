import { useState, useEffect } from 'react';

interface NetworkInfo {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export const useNetworkStatus = (): NetworkInfo => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setNetworkInfo({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
      });
    };

    const handleOnline = () => {
      updateNetworkInfo();
    };

    const handleOffline = () => {
      setNetworkInfo(prev => ({
        ...prev,
        isOnline: false,
      }));
    };

    // Initial check
    updateNetworkInfo();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
};
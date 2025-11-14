/**
 * Service Worker Manager para controlar cache
 * Evita problemas de hard refresh no ambiente do morador
 */

import { useEffect } from 'react';

export const ServiceWorkerManager = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const updateServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          
          if (registration) {
            // Force update check
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available, but don't force refresh
                    console.log('Nova versão disponível. Será aplicada na próxima visita.');
                  }
                });
              }
            });

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          }
        } catch (error) {
          console.debug('Service Worker error (non-critical):', error);
        }
      };

      updateServiceWorker();
    }

    // Clear any problematic caches
    const clearOldCaches = async () => {
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          const oldCaches = cacheNames.filter(name => 
            name.includes('workbox') || name.includes('facility-cache-v1')
          );
          
          await Promise.all(
            oldCaches.map(cacheName => caches.delete(cacheName))
          );
        } catch (error) {
          console.debug('Cache cleanup error (non-critical):', error);
        }
      }
    };

    clearOldCaches();
  }, []);

  return null;
};

/**
 * Hook para detectar e lidar com problemas de carregamento
 */
export const useLoadingFix = () => {
  useEffect(() => {
    // Detect if page was loaded from cache incorrectly
    const handlePageShow = (event: PageTransitionEvent) => {
      // If page was loaded from cache but content seems stale
      if (event.persisted) {
        // Force a soft reload of critical data
        window.dispatchEvent(new CustomEvent('app:refresh-data'));
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    
    // Handle visibility change (tab becomes active)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, check if data needs refresh
        const lastRefresh = sessionStorage.getItem('lastDataRefresh');
        const now = Date.now();
        
        if (!lastRefresh || now - parseInt(lastRefresh) > 300000) { // 5 minutes
          window.dispatchEvent(new CustomEvent('app:refresh-data'));
          sessionStorage.setItem('lastDataRefresh', now.toString());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
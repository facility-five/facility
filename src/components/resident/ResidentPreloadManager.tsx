/**
 * Componente de preload para melhorar performance
 * Carrega dados essenciais do morador em background
 */

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useResidentProfile } from '@/hooks/useResidentData';
import { supabase } from '@/integrations/supabase/client';

interface PreloadManagerProps {
  children: React.ReactNode;
}

export const ResidentPreloadManager = ({ children }: PreloadManagerProps) => {
  const { user, profile } = useAuth();
  const { profile: residentProfile } = useResidentProfile();

  useEffect(() => {
    const preloadEssentialData = async () => {
      if (!user?.id || !residentProfile?.condo_id) return;

      try {
        // Preload communications (mais acessado)
        supabase
          .from('communications')
          .select('id, title, content, created_at, expiration_date')
          .eq('condo_id', residentProfile.condo_id)
          .order('created_at', { ascending: false })
          .limit(10)
          .then(({ data }) => {
            // Cache será gerenciado automaticamente pelo browser
            console.debug('Communications preloaded:', data?.length || 0);
          });

        // Preload common areas (para reservas)
        if (residentProfile.condo_id) {
          supabase
            .from('common_areas')
            .select('id, name, description, hourly_rate, status')
            .eq('condominium_id', residentProfile.condo_id)
            .eq('status', 'active')
            .then(({ data }) => {
              console.debug('Common areas preloaded:', data?.length || 0);
            });
        }
      } catch (error) {
        console.debug('Preload error (non-critical):', error);
      }
    };

    // Delay preload to not interfere with main loading
    const timer = setTimeout(preloadEssentialData, 1500);
    return () => clearTimeout(timer);
  }, [user?.id, residentProfile?.condo_id]);

  return <>{children}</>;
};
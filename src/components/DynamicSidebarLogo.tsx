"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Building } from 'lucide-react';

export const DynamicSidebarLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [systemName, setSystemName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('logo_negative_url, system_name')
        .limit(1)
        .single();

      if (data) {
        setLogoUrl(data.logo_negative_url);
        setSystemName(data.system_name || 'Facility Fincas');
      } else if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching system settings for DynamicSidebarLogo:", error);
        setSystemName('Facility Fincas'); // Fallback even on error
      } else {
        setSystemName('Facility Fincas');
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={systemName ? `${systemName} Logo` : 'Logo do Sistema'}
          className="h-16 object-contain"
        />
      ) : (
        <div className="h-16 w-16 bg-purple-600 rounded-md flex items-center justify-center text-white">
            <Building size={32} />
        </div>
      )}
    </div>
  );
};
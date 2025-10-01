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
      const { data } = await supabase
        .from('system_settings')
        .select('logo_negative_url, system_name')
        .limit(1)
        .single();

      if (data) {
        setLogoUrl(data.logo_negative_url);
        setSystemName(data.system_name || 'Facility Fincas');
      } else {
        setSystemName('Facility Fincas');
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-32" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 truncate">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={systemName ? `${systemName} Logo` : 'Logo do Sistema'}
          className="h-8 object-contain"
        />
      ) : (
        <div className="h-8 w-8 bg-purple-600 rounded-md flex items-center justify-center text-white">
            <Building size={20} />
        </div>
      )}
      <span className="font-bold text-lg text-white truncate">{systemName}</span>
    </div>
  );
};
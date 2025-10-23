"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { Skeleton } from '@/components/ui/skeleton';

export const DynamicLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [systemName, setSystemName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('logo_url, system_name')
        .limit(1)
        .single();

      if (data) {
        setLogoUrl(data.logo_url);
        setSystemName(data.system_name);
      } else if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching system settings for DynamicLogo:", error);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mb-8 h-20">
        <Skeleton className="h-full w-48" />
      </div>
    );
  }

  if (logoUrl) {
    return (
      <div className="flex flex-col items-center justify-center mb-8">
        <img
          src={logoUrl}
          alt={systemName ? `${systemName} Logo` : 'Logo do Sistema'}
          className="w-auto max-w-xs max-h-20 object-contain"
        />
      </div>
    );
  }

  return <Logo />;
};
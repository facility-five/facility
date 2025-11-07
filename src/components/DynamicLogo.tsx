"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils'; // Import cn utility

interface DynamicLogoProps {
  className?: string; // Add className prop for external styling
  imageClassName?: string; // Add imageClassName for image-specific styling
}

export const DynamicLogo = ({ className, imageClassName }: DynamicLogoProps) => {
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
    // Retorna o logo padrão enquanto carrega para evitar flash de skeleton
    return <Logo />;
  }

  if (logoUrl) {
    return (
      <div className={cn("flex flex-col items-center justify-center mb-8", className)}>
        <img
          src={logoUrl}
          alt={systemName ? `${systemName} Logo` : 'Logo do Sistema'}
          className={cn("w-auto max-w-xs max-h-20 object-contain", imageClassName)}
        />
      </div>
    );
  }

  return <Logo />;
};
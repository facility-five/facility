"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

interface DynamicLogoProps {
  className?: string;
  imageClassName?: string;
}

const DEFAULT_LOGO_URL = "https://a4f4baa75172da68aa688051984fd151.cdn.bubble.io/f1744250402403x458193812617061060/facility_logo.svg";

export const DynamicLogo = ({ className, imageClassName }: DynamicLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO_URL);
  const [systemName, setSystemName] = useState<string>('Facility Fincas');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('logo_url, system_name')
        .limit(1)
        .single();

      if (data?.logo_url) {
        // Preload the new image before switching
        const img = new Image();
        img.onload = () => {
          setLogoUrl(data.logo_url);
          setSystemName(data.system_name || 'Facility Fincas');
        };
        img.onerror = () => {
          console.warn('Failed to load custom logo, using default');
        };
        img.src = data.logo_url;
      } else if (error && error.code !== 'PGRST116') {
        console.error("Error fetching system settings for DynamicLogo:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className={cn("flex flex-col items-center justify-center mb-8", className)}>
      <img
        src={logoUrl}
        alt={systemName ? `${systemName} Logo` : 'Logo do Sistema'}
        className={cn("w-auto max-w-xs max-h-20 object-contain transition-opacity duration-300", imageClassName)}
        onLoad={() => setImageLoaded(true)}
        style={{ opacity: imageLoaded ? 1 : 0.8 }}
      />
    </div>
  );
};
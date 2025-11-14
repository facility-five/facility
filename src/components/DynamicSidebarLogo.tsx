"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Building } from 'lucide-react';

const DEFAULT_LOGO_URL = "https://a4f4baa75172da68aa688051984fd151.cdn.bubble.io/f1744250402403x458193812617061060/facility_logo.svg";

export const DynamicSidebarLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [systemName, setSystemName] = useState<string>('Facility Fincas');
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('logo_negative_url, system_name')
        .limit(1)
        .single();

      if (data?.logo_negative_url) {
        // Preload the image before switching
        const img = new Image();
        img.onload = () => {
          setLogoUrl(data.logo_negative_url);
          setSystemName(data.system_name || 'Facility Fincas');
          setShowFallback(false);
        };
        img.onerror = () => {
          setShowFallback(true);
        };
        img.src = data.logo_negative_url;
      } else {
        setShowFallback(true);
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching system settings for DynamicSidebarLogo:", error);
        }
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="flex items-center justify-center h-16">
      {logoUrl && !showFallback ? (
        <img
          src={logoUrl}
          alt={systemName ? `${systemName} Logo` : 'Logo do Sistema'}
          className="h-full max-w-full object-contain transition-opacity duration-300"
          onError={() => setShowFallback(true)}
        />
      ) : (
        <div className="h-12 w-12 bg-purple-600 rounded-md flex items-center justify-center text-white transition-all duration-300">
          <Building size={24} />
        </div>
      )}
    </div>
  );
};
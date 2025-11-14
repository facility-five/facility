"use client";

import { useState } from 'react';
import { Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicLogoProps {
  className?: string;
  imageClassName?: string;
}

export const DynamicLogo = ({ className, imageClassName }: DynamicLogoProps) => {
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const logoPath = '/logo_negative.png';

  if (hasError) {
    return (
      <div className={cn("flex flex-col items-center justify-center mb-8", className)}>
        <div className="h-16 w-16 bg-purple-600 rounded-md flex items-center justify-center text-white">
          <Building size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center mb-8", className)}>
      <img
        src={logoPath}
        alt="Facility Fincas Logo"
        className={cn("w-auto max-w-xs max-h-20 object-contain transition-opacity duration-300", imageClassName)}
        onLoad={() => setImageLoaded(true)}
        onError={() => setHasError(true)}
        style={{ opacity: imageLoaded ? 1 : 0.8 }}
      />
    </div>
  );
};
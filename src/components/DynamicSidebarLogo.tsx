"use client";

import { useState } from 'react';
import { Building } from 'lucide-react';

export const DynamicSidebarLogo = () => {
  const [hasError, setHasError] = useState(false);
  const logoPath = '/logo_negative.png';

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-16">
        <div className="h-12 w-12 bg-purple-600 rounded-md flex items-center justify-center text-white transition-all duration-300">
          <Building size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-16">
      <img
        src={logoPath}
        alt="Facility Fincas Logo"
        className="h-full max-w-full object-contain transition-opacity duration-300"
        onError={() => setHasError(true)}
      />
    </div>
  );
};
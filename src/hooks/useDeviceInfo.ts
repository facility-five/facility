import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint: number = 1024) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkIsMobile();

    // Add event listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
};

export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    isPWA: false,
    isIOS: false,
    isAndroid: false,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const webApp = 'standalone' in (window.navigator as any) && (window.navigator as any).standalone;
      
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isPWA: standalone || webApp || window.matchMedia('(display-mode: minimal-ui)').matches,
        isIOS: /iphone|ipad|ipod/.test(userAgent),
        isAndroid: /android/.test(userAgent),
      });
    };

    // Check on mount
    updateDeviceInfo();

    // Add event listener
    window.addEventListener('resize', updateDeviceInfo);

    // Cleanup
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
};
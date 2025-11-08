import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";

interface AppLoaderProps {
  children: React.ReactNode;
}

export const AppLoader = ({ children }: AppLoaderProps) => {
  const { loading, profileLoaded } = useAuth();
  const hasRemovedLoader = useRef(false);

  useEffect(() => {
    // Quando o auth carregar completamente, remove o loader do HTML
    if (!loading && profileLoaded && !hasRemovedLoader.current) {
      hasRemovedLoader.current = true;
      
      // Pequeno delay para transição suave
      setTimeout(() => {
        const loader = document.getElementById('initial-loader');
        if (loader) {
          // Fade out suave
          loader.style.transition = 'opacity 0.3s ease-out';
          loader.style.opacity = '0';
          
          // Remove do DOM após a transição
          setTimeout(() => {
            loader.remove();
          }, 300);
        }
      }, 100);
    }
  }, [loading, profileLoaded]);

  // Sempre renderiza os children - o loader do HTML é que controla a visibilidade inicial
  return <>{children}</>;
};

import { Building } from "lucide-react";

export const HeaderLogo = () => {
  return (
    <div className="lg:hidden">
      <img
        src="/logo_main.png"
        alt="Facility"
        className="h-8 w-auto object-contain"
        onError={(e) => {
          // Fallback para ícone se a imagem não carregar
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="h-8 w-8 bg-purple-600 rounded-md flex items-center justify-center text-white">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
            `;
          }
        }}
      />
    </div>
  );
};
import { LoadingSpinner } from "./LoadingSpinner";

interface FullPageLoaderProps {
  message?: string;
}

export const FullPageLoader = ({ message = "Cargando..." }: FullPageLoaderProps) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
        {/* Logo ou ícone animado */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-20">
            <LoadingSpinner size="lg" className="text-purple-600" />
          </div>
          <LoadingSpinner size="lg" className="text-purple-600" />
        </div>
        
        {message && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xl font-semibold text-gray-800 animate-pulse">
              {message}
            </p>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

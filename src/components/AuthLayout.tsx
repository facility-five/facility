import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { DynamicLogo } from "@/components/DynamicLogo"; // Adicionado esta linha
import { useTranslation } from "react-i18next";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  variant?: "two-column" | "single";
  hideHeader?: boolean;
  containerClassName?: string;
}

export const AuthLayout = ({ children, title, description, variant = "two-column", hideHeader = false, containerClassName }: AuthLayoutProps) => {
  const { loading } = useAuth(); // Removed session from here
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  // AuthLayout should only render its children (auth forms) if not loading and no session is handled by parent.
  // The parent (Index.tsx) will handle redirection if a session exists.

  if (variant === "single") {
    return (
      <div className={`${containerClassName ? containerClassName : "bg-white"} min-h-screen w-full flex items-center justify-center px-4 overflow-hidden`}>
        <div className="mx-auto w-full max-w-[645px] space-y-6">
          {!hideHeader && (
            <div className="flex flex-col items-center text-center space-y-4">
              <DynamicLogo />
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <div
        className="relative hidden flex-col items-center justify-center bg-gray-900 p-10 text-white lg:flex"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('/building-bg.svg')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700/80 to-indigo-900/80" />
        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full">
          <div />
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {t('Facility Fincas')}
            </h2>
            <p className="mt-4 text-purple-200">
              {t('auth.complete_platform_description')}
            </p>
          </div>
          <div className="text-center text-sm text-purple-300">
            <p>&copy; {new Date().getFullYear()} {t('auth.your_app')}. {t('auth.all_rights_reserved')}</p>
            <a
              href="https://fiveagenciadigital.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Five Agência Digital
            </a>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-white p-6 py-12 sm:p-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          {!hideHeader && (
            <div className="flex flex-col items-center text-center space-y-4">
              <DynamicLogo />
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};


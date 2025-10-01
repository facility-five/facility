import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col items-center justify-center bg-gray-900 p-10 text-white lg:flex">
        <img
          src="/placeholder.svg"
          alt="Condomínio"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700/80 to-indigo-900/80" />
        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full">
          <div />
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Gerencie seu condomínio com facilidade
            </h2>
            <p className="mt-4 text-purple-200">
              Uma plataforma completa para administradores, gestores e moradores.
              Tudo em um só lugar.
            </p>
          </div>
          <div className="text-center text-sm text-purple-300">
            <p>&copy; {new Date().getFullYear()} Seu App. Todos os direitos reservados.</p>
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
      <div className="flex items-center justify-center p-6 py-12 sm:p-12">
        <div className="mx-auto w-full max-w-md space-y-6">{children}</div>
      </div>
    </div>
  );
};
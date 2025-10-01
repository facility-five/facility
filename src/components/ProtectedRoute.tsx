import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { profile, loading, session } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <LoadingSpinner size="lg" className="border-primary shadow-lg shadow-primary/50" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    // Se o usuário está logado mas não tem a permissão,
    // redireciona para a página inicial, que por sua vez
    // o enviará para o dashboard correto.
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
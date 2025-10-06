import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { profile, loading, session, profileLoaded } = useAuth();

  // Show spinner if authentication state is still loading OR if profile hasn't finished loading yet
  if (loading || !profileLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <LoadingSpinner size="lg" className="border-primary shadow-lg shadow-primary/50" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!session) {
    return <Navigate to="/" replace />;
  }

  // If authenticated but no profile (and profileLoaded is true),
  // it means the profile is missing. Redirect to home, which will then
  // handle the "authenticated but no profile" case (e.g., to /registrar-administradora).
  if (!profile) {
    return <Navigate to="/" replace />;
  }

  // If profile exists but role is not allowed, redirect to home.
  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  // All checks passed, render the protected content
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
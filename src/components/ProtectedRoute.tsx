import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const normalizeRole = (role?: string) =>
  (role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .toLowerCase();

const isAllowedRole = (role: string, allowed?: string[]) => {
  if (!allowed || allowed.length === 0) return true;
  const normalized = normalizeRole(role);
  return allowed.some((r) => normalizeRole(r) === normalized);
};

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  // Permite acesso mesmo sem profile carregado (útil para onboarding)
  allowWithoutProfile?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, allowWithoutProfile }: ProtectedRouteProps) => {
  const { loading, session, profile, profileLoaded } = useAuth();
  const location = useLocation();

  if (loading || !profileLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!profile) {
    // Se não há profile, tentamos usar o papel do user_metadata como fallback
    const metadataRole = (session?.user?.user_metadata as any)?.role as string | undefined;
    if (metadataRole && isAllowedRole(metadataRole, allowedRoles)) {
      return <>{children}</>;
    }
    // Em fluxos de onboarding, permitimos seguir mesmo sem profile
    if (allowWithoutProfile) {
      return <>{children}</>;
    }
    return <Navigate to="/" replace />;
  }

  if (!isAllowedRole(profile.role, allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
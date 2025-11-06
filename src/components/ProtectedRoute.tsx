import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
    return null;
  }

  if (!session) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!profile) {
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
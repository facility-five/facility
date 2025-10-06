import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AuthLayout } from "@/components/AuthLayout";

const Index = () => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session && profile) {
      switch (profile.role) {
        case 'Administrador':
          navigate('/admin', { replace: true });
          break;
        case 'Administradora':
        case 'Síndico':
          navigate('/gestor-dashboard', { replace: true });
          break;
        case 'Morador':
          navigate('/morador-dashboard', { replace: true });
          break;
        default:
          // Se o papel for desconhecido, não redireciona e permite o logout manual
          console.warn("User logged in with unhandled role:", profile.role);
          break;
      }
    }
  }, [loading, session, profile, navigate]);

  // Show spinner if authentication state is still loading OR if session exists but profile is not yet loaded
  if (loading || (session && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  // If not loading and no session, display the login form
  if (!session) {
    return (
      <AuthLayout
        title="Bem-vindo de volta!"
        description="Faça login para acessar sua conta."
      >
        <AuthForm />
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Não tem uma conta?
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-6" onClick={() => navigate("/criar-conta")}>
          Crie uma agora
        </Button>
      </AuthLayout>
    );
  }

  // If loading is false, session exists, and profile is loaded,
  // the useEffect above should have already handled the navigation.
  // If we reach here, it means the useEffect hasn't triggered yet or there's an unhandled role.
  // For now, we can return null or a generic message, as the useEffect is expected to redirect.
  return null;
};

export default Index;
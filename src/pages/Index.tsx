import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AuthLayout } from "@/components/AuthLayout";
import { supabase } from "@/integrations/supabase/client"; // Importar supabase aqui

const Index = () => {
  const { session, profile, loading, profileLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profileLoaded) { // Only act once initial loading is done and profile fetch attempt is complete
      if (session && profile) {
        // User is authenticated and has a profile, redirect based on role
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
            console.warn("User logged in with unhandled role:", profile.role);
            // For unhandled roles, maybe redirect to a generic dashboard or force logout
            // For now, let's keep them on the login page or a generic message
            break;
        }
      } else if (session && !profile) {
        // User is authenticated but has no profile.
        // This typically happens right after signup if the profile creation is asynchronous
        // or if the profile was deleted.
        // For 'Administrador' role, they need to register their company.
        // For other roles, they might need to complete a generic profile.
        // Assuming the first user is always 'Administrador' and needs to register company.
        // If the user is an 'Administrador' and has no profile, they should go to RegisterAdministrator.
        // This logic might need refinement based on how roles are assigned initially.
        // For simplicity, if session exists but no profile, and it's not the initial setup,
        // we can direct them to register an administrator.
        // Or, if the system is not set up, they go to setup-master.
        
        // Let's check if the system is set up.
        const checkSystemSetupAndRedirect = async () => {
          const { data: isSystemSetup } = await supabase.rpc('is_system_setup');
          if (!isSystemSetup) {
            navigate("/setup-master", { replace: true });
          } else {
            // If system is set up, and user is logged in but has no profile,
            // they likely need to register their administrator company.
            // This assumes only 'Administrador' users would be in this state.
            // If other roles can exist without a profile, this needs more logic.
            navigate("/registrar-administradora", { replace: true });
          }
        };
        checkSystemSetupAndRedirect();

      } else {
        // Not authenticated, do nothing (AuthLayout will show login form)
      }
    }
  }, [loading, profileLoaded, session, profile, navigate]);

  // Show spinner while initial auth state is being determined
  if (loading || !profileLoaded) { // Show spinner until profile fetch attempt is complete
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

  // If we reach here, it means:
  // 1. loading is false
  // 2. profileLoaded is true
  // 3. session exists
  // 4. profile is null (this case is handled by the useEffect above, redirecting to /registrar-administradora or /setup-master)
  // This return null should ideally not be reached if the redirects in useEffect work as expected.
  return null;
};

export default Index;
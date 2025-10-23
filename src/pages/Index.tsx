import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AuthLayout } from "@/components/AuthLayout";
import { supabase } from "@/integrations/supabase/client";
import LandingPageContent from "@/components/LandingPageContent"; // Importar LandingPageContent

const Index = () => {
  const { session, profile, loading, profileLoaded } = useAuth();
  const navigate = useNavigate();

  console.log("Index: Render. loading:", loading, "profileLoaded:", profileLoaded, "session:", session, "profile:", profile);

  useEffect(() => {
    console.log("Index: useEffect for redirection triggered. !loading:", !loading, "profileLoaded:", profileLoaded);
    if (!loading && profileLoaded) { // Only act once initial loading is done and profile fetch attempt is complete
      if (session && profile) {
        console.log("Index: Redirecting based on profile role:", profile.role);
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
            console.warn("Index: User logged in with unhandled role:", profile.role);
            // For unhandled roles, maybe redirect to a generic dashboard or force logout
            // For now, let's keep them on the login page or a generic message
            break;
        }
      } else if (session && !profile) {
        console.log("Index: Authenticated but no profile. Checking system setup...");
        // User is authenticated but has no profile.
        // This typically happens right after signup if the profile creation is asynchronous
        // or if the profile was deleted.
        
        // Let's check if the system is set up by looking at system_settings table.
        const checkSystemSetupAndRedirect = async () => {
          const { data: systemSettings, error: settingsError } = await supabase
            .from('system_settings')
            .select('id', { count: 'exact', head: true });

          if (settingsError && settingsError.code !== 'PGRST116') {
            console.error("Index: Error checking system settings:", settingsError);
            // Potentially show an error message
          } else if ((systemSettings?.count || 0) === 0) {
            console.log("Index: System not set up, redirecting to /setup-master");
            navigate("/setup-master", { replace: true });
          } else {
            console.log("Index: System set up, but no profile. Redirecting to /registrar-administradora");
            navigate("/registrar-administradora", { replace: true });
          }
        };
        checkSystemSetupAndRedirect();

      } else {
        console.log("Index: Not authenticated, displaying login form.");
        // Not authenticated, do nothing (AuthLayout will show login form)
      }
    }
  }, [loading, profileLoaded, session, profile, navigate]);

  // Show spinner while initial auth state is being determined
  if (loading || !profileLoaded) { // Show spinner until profile fetch attempt is complete
    console.log("Index: Displaying spinner.");
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  // If not loading and no session, display the landing page
  if (!session) {
    console.log("Index: Displaying LandingPageContent.");
    return <LandingPageContent />;
  }

  console.log("Index: Reached end of render, returning null. (Should have redirected by now if applicable)");
  return null;
};

export default Index;
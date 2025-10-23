import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import LandingPageContent from "@/components/LandingPageContent";

const Index = () => {
  const { session, profile, loading, profileLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only act once initial loading is done and profile fetch attempt is complete
    if (!loading && profileLoaded) {
      if (session && profile) {
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
            break;
        }
      } else if (session && !profile) {
        const checkSystemSetupAndRedirect = async () => {
          const { data: systemSettings, error: settingsError } = await supabase
            .from('system_settings')
            .select('id', { count: 'exact', head: true });

          if (settingsError && settingsError.code !== 'PGRST116') {
            console.error("Index: Error checking system settings:", settingsError);
          } else if ((systemSettings?.count || 0) === 0) {
            navigate("/setup-master", { replace: true });
          } else {
            navigate("/registrar-administradora", { replace: true });
          }
        };
        checkSystemSetupAndRedirect();

      } else {
        // Not authenticated, do nothing (it will fall through to render LandingPageContent)
      }
    }
  }, [loading, profileLoaded, session, profile, navigate]);

  // Show spinner while initial auth state is being determined
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  // If not loading and no session, display the landing page
  if (!session) {
    return <LandingPageContent />;
  }

  // If loading is false and session exists, but no redirection happened yet (e.g., profile is still null after session)
  // This case should ideally be handled by the useEffect. If we reach here, it means the useEffect
  // has not yet completed its redirection, or there's a delay.
  // For now, returning null means the page will be blank until the useEffect navigates.
  // This is a safe fallback if the useEffect is guaranteed to navigate.
  return null;
};

export default Index;
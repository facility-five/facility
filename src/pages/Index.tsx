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
      // If a session exists but no profile is found (e.g., new user after signup, before admin registration)
      if (session && !profile) {
        const checkSystemSetupAndRedirect = async () => {
          const { data: systemSettings, error: settingsError } = await supabase
            .from('system_settings')
            .select('id', { count: 'exact', head: true });

          if (settingsError && settingsError.code !== 'PGRST116') {
            console.error("Index: Error checking system settings:", settingsError);
          } else if ((systemSettings?.count || 0) === 0) {
            // If no system settings exist, it's the very first user, go to master setup
            navigate("/setup-master", { replace: true });
          } else {
            // System is set up, but user has no profile (needs to register administrator)
            navigate("/registrar-administradora", { replace: true });
          }
        };
        checkSystemSetupAndRedirect();
      }
      // If no session, it will render LandingPageContent, which now has a correct link to /login.
      // If session and profile exist, the LandingPageContent will show the user menu and "Go to App" button.
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

  // If not loading, render the LandingPageContent.
  // The LandingPageContent itself will adapt based on whether a session exists.
  return <LandingPageContent />;
};

export default Index;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

type RedirectOptions = {
  keepSpinner?: boolean;
};

const normalizeRole = (role: string): string =>
  role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .toLowerCase();

function Login() {
  const { session, profile, loading, profileLoaded } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    let active = true;

    const clearOnboardingSelection = async () => {
      sessionStorage.removeItem("onboarding_plan_id");
      if (session?.user?.user_metadata?.selected_plan_id) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { selected_plan_id: null },
        });
        if (updateError) {
           
          console.error(
            "Login: failed to clear selected_plan_id metadata",
            updateError,
          );
        }
      }
    };

    const goTo = (path: string, options?: RedirectOptions) => {
      if (!active || redirected) return;
      setRedirected(true);
      if (!options?.keepSpinner) {
        setProcessing(true);
      }
      navigate(path, { replace: true });
    };

    const redirectAfterLogin = async () => {
      if (loading || !profileLoaded || redirected) return;
      if (!session) return;

      // Se existe sessão mas não há perfil, enviar para a Home (Landing)
      // A Landing não faz redirecionamento automático; usuário decide o próximo passo.
      if (!profile) {
        goTo("/");
        return;
      }

      const normalizedRole = normalizeRole(profile.role);

      if (normalizedRole === "admin do saas") {
        goTo("/admin");
        return;
      }

      if (normalizedRole === "administradora") {
        // Permitir acesso gratuito - redirecionar diretamente para o gestor
        await clearOnboardingSelection();
        goTo("/gestor", { keepSpinner: true });
        return;
      }

      switch (normalizedRole) {
        case "sindico":
          goTo("/sindico");
          break;
        case "funcionario":
        case "funcionrio":
          goTo("/gestor");
          break;
        case "morador":
          goTo("/morador-dashboard");
          break;
        default:
          goTo("/");
          break;
      }
    };

    redirectAfterLogin();

    return () => {
      active = false;
    };
  }, [loading, profileLoaded, session, profile, navigate, redirected]);

  useEffect(() => {
    if (!session) {
      setProcessing(false);
      setRedirected(false);
    }
  }, [session]);

  if (loading || processing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-600 p-4">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  return (
    <AuthLayout
      title={t("auth.welcome_back")}
      description={t("auth.login_description")}
    >
      <AuthForm />
    </AuthLayout>
  );
}

export default Login;

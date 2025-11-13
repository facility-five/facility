import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { authLogger } from "@/utils/logger";

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
  const { session, profile, loading, profileLoaded, signOut } = useAuth();
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
      try { sessionStorage.removeItem('fromLogin'); } catch {}
      navigate(path, { replace: true });
    };

    const redirectAfterLogin = async () => {
      if (loading || redirected) return;
      if (!session) return;
      if (!profileLoaded) return; // Aguardar o profile ser carregado

      // Se não há profile, aguardar um pouco e tentar novamente (o trigger deve criar)
      if (!profile) {
        authLogger.info("Usuário sem profile, aguardando criação automática");
        // Aguardar 2 segundos e recarregar para dar tempo do trigger criar o profile
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }

      // Detecta papel via profile ou, como fallback, via user_metadata
      const roleSource = profile?.role || (session.user?.user_metadata as { role?: string })?.role || "";
      const normalizedRole = normalizeRole(roleSource);

      // Se não há role definido, não redirecionar (evitar loop)
      if (!normalizedRole) {
        authLogger.warn("Usuário sem role definido");
        toast.error("Seu perfil não está configurado corretamente. Entre em contato com o suporte.");
        return;
      }

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
          authLogger.error("Role não reconhecido", { role: normalizedRole });
          toast.error("Tipo de perfil não reconhecido. Entre em contato com o suporte.");
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

  // Se o usuário já está autenticado mas ainda não foi redirecionado pelo useEffect,
  // mostrar spinner enquanto processa
  if (session && profileLoaded && !redirected) {
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

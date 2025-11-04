import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterAdministratorForm } from "@/components/RegisterAdministratorForm";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError } from "@/utils/toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";

const RegisterAdministrator = () => {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const ensurePayment = async () => {
      if (!session) {
        navigate("/planes", { replace: true });
        return;
      }

      if (profile?.role !== "Administradora") {
        navigate("/", { replace: true });
        return;
      }

      const { data, error } = await supabase
        .from("payments")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1);

      if (error) {
        console.error("RegisterAdministrator: error al validar pagos", error);
        showRadixError(t("registerAdmin.paymentValidationError"));
        navigate("/planes", { replace: true });
        return;
      }

      if (!data || data.length === 0) {
        showRadixError(t("registerAdmin.paymentMissingError"));
        navigate("/planes", { replace: true });
        return;
      }

      setChecking(false);
    };

    ensurePayment();
  }, [session, profile, navigate]);

  if (checking) {
    return (
      <AuthLayout
        title={t("registerAdmin.validatingTitle")}
        description={t("registerAdmin.validatingDescription")}
      >
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t("registerAdmin.pageTitle")}
      description={t("registerAdmin.pageDescription")}
    >
      <RegisterAdministratorForm />
    </AuthLayout>
  );
};

export default RegisterAdministrator;

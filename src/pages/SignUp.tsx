import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpForm } from "@/components/SignUpForm";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AuthLayout } from "@/components/AuthLayout";
import { useTranslation } from "react-i18next";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const checkUsers = async () => {
      const { data: isSetup } = await supabase.rpc('is_system_setup');
      if (!isSetup) {
        navigate("/setup-master");
      }
      setLoading(false);
    };
    checkUsers();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AuthLayout
      title={t("auth.registerTitle")}
      description={t("auth.registerDescription")}
    >
      <SignUpForm />
    </AuthLayout>
  );
};

export default SignUp;
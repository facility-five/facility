import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AuthLayout } from "@/components/AuthLayout";
import { SignUpForm } from "@/components/SignUpForm";
import { DynamicLogo } from "@/components/DynamicLogo";

type DbPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  period: string;
};

const SignUpDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<DbPlan | null>(null);

  const email = searchParams.get("email") || "";
  const planId = searchParams.get("plan") || "";

  const priceFormatted = useMemo(() => {
    if (!plan) return "";
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(plan.price);
  }, [plan]);

  useEffect(() => {
    const init = async () => {
      if (!email) {
        navigate("/registrarse" + (planId ? `?plan=${planId}` : ""), {
          replace: true,
        });
        return;
      }

      const { data: isSetup } = await supabase.rpc("is_system_setup");
      if (!isSetup) {
        navigate("/setup-master");
        return;
      }

      if (planId) {
        const { data } = await supabase
          .from("plans")
          .select("id,name,description,price,period")
          .eq("id", planId)
          .maybeSingle();
        setPlan((data as DbPlan) || null);
      }

      setLoading(false);
    };

    init();
  }, [email, planId, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#272A3D] to-[#754FE5]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AuthLayout
      title="Finalizar Cadastro de Diretor"
      description="Complete seus dados pessoais para contratar um plano e gerenciar condomínios."
      variant="single"
      hideHeader
      containerClassName="bg-[#f1f1f1]"
    >
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full sm:w-[645px] mx-auto rounded-2xl overflow-hidden border border-admin-border shadow-xl bg-white p-6 dark:bg-[#1E1E2D]">
          <div className="mb-4 flex items-start justify-start">
            <DynamicLogo className="mb-0" imageClassName="h-[4rem] w-auto max-h-[4rem] object-contain" />
          </div>
          {plan ? (
            <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-3">
              <p className="mb-1 text-xs text-purple-700">
                Plano Selecionado para sua Administradora
              </p>
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-bold text-purple-800">
                  {plan.name}
                </h3>
                <p className="font-semibold text-purple-600">
                  {priceFormatted}
                  <span className="ml-1 text-xs text-purple-500">
                    /{plan.period === "monthly" ? "mês" : "ano"}
                  </span>
                </p>
              </div>
              {plan.description && (
                <p className="mt-1 text-sm text-purple-600">
                  {plan.description}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                Após completar o cadastro, você poderá escolher um plano para
                sua administradora.{" "}
                <Link to="/planes" className="text-purple-600 hover:underline">
                  Ver planos disponíveis
                </Link>
              </p>
            </div>
          )}
          <h2 className="text-xl font-semibold text-left">
            Dados Pessoais do Diretor
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Complete seus dados para criar sua conta como diretor da
            administradora.
          </p>
          <SignUpForm initialEmail={email} planId={planId || undefined} />
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignUpDetails;

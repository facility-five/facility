import { useState } from "react";
import { PlanCard } from "@/components/PlanCard";
import { Button } from "@/components/ui/button";

const Plans = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const basicPlanMonthly = {
    name: "Básico",
    description: "Ideal para começar",
    price: "€199,00",
    period: "/mensal",
    features: [
      "Até 5 condomínios",
      "Gestão financeira básica",
      "Suporte por email",
      "Relatórios mensais",
    ],
    buttonText: "Contratar Plano",
  };

  const basicPlanAnnual = {
    name: "Básico",
    description: "Ideal para começar",
    price: "€1990,00",
    period: "/anual",
    features: [
      "Até 5 condomínios",
      "Gestão financeira básica",
      "Suporte por email",
      "Relatórios mensais",
      "2 meses grátis",
    ],
    buttonText: "Contratar Plano",
  };

  const selectedPlan =
    billingCycle === "monthly" ? basicPlanMonthly : basicPlanAnnual;

  return (
    <div className="min-h-screen w-full bg-[#2a214d] text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">
          Escolha o plano ideal para o seu negócio
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Oferecemos diferentes planos para satisfazer as necessidades
          específicas da sua empresa administradora de condomínios.
        </p>
      </div>

      <div className="my-8">
        <div className="inline-flex bg-gray-800/50 rounded-full p-1">
          <Button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-transparent text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            Mensal
          </Button>
          <Button
            onClick={() => setBillingCycle("annual")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === "annual"
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-transparent text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            Anual
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <PlanCard {...selectedPlan} />
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold">
          Precisa de um plano personalizado?
        </h2>
        <p className="mt-2 text-gray-300">
          Contacte com a nossa equipa comercial para uma proposta
          personalizada.
        </p>
        <Button
          variant="outline"
          className="mt-6 bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
        >
          Falar com um consultor
        </Button>
      </div>
    </div>
  );
};

export default Plans;
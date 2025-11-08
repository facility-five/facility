import { ReactNode } from "react";
import { usePlan } from "@/hooks/usePlan";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanGuardProps {
  children: ReactNode;
  feature?: string;
  fallback?: "banner" | "button" | "disabled" | "hidden";
  bannerVariant?: "default" | "compact" | "floating";
  customMessage?: string;
}

export const PlanGuard = ({
  children,
  feature = "esta funcionalidade",
  fallback = "banner",
  bannerVariant = "compact",
  customMessage
}: PlanGuardProps) => {
  const { isFreePlan, isLoading } = usePlan();
  const navigate = useNavigate();

  // Enquanto carrega, mostra o conteúdo original
  if (isLoading) {
    return <>{children}</>;
  }

  // Se tem plano pago, mostra o conteúdo normalmente
  if (!isFreePlan) {
    return <>{children}</>;
  }

  // Se está no plano gratuito, aplica as restrições
  switch (fallback) {
    case "hidden":
      return null;

    case "disabled":
      return (
        <div className="relative">
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
            <div className="text-center p-4">
              <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {customMessage || `Upgrade necessário para ${feature}`}
              </p>
              <Button
                size="sm"
                onClick={() => navigate("/gestor/mi-plan")}
              >
                Ver Planos
              </Button>
            </div>
          </div>
        </div>
      );

    case "button":
      return (
        <Button
          variant="outline"
          onClick={() => navigate("/gestor/mi-plan")}
          className="flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Upgrade para {feature}
        </Button>
      );

    case "banner":
    default:
      return (
        <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
          <Lock className="w-6 h-6" />
          <div className="flex-1">
            <p className="font-semibold">{customMessage || `Upgrade para acessar ${feature}`}</p>
            <p className="text-sm opacity-90">Faça upgrade para um plano pago e desbloqueie todas as funcionalidades.</p>
          </div>
          <Button onClick={() => navigate("/gestor/mi-plan")} variant="secondary">Ver Planos</Button>
        </div>
      );
  }
};

// Hook para verificar se uma ação pode ser executada
export const usePlanGuard = () => {
  const { isFreePlan, isLoading } = usePlan();
  const navigate = useNavigate();

  const canPerformAction = !isFreePlan && !isLoading;

  const guardAction = (action: () => void, feature?: string) => {
    if (canPerformAction) {
      action();
    } else {
      // Redireciona para a página de planos
      navigate("/gestor/mi-plan");
    }
  };

  return {
    canPerformAction,
    guardAction,
    isFreePlan,
    isLoading
  };
};
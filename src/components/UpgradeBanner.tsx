import { Crown, Zap, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface UpgradeBannerProps {
  title?: string;
  description?: string;
  ctaText?: string;
  variant?: "default" | "compact" | "floating";
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const UpgradeBanner = ({
  title = "Desbloqueie todo o potencial do Facility",
  description = "Faça upgrade para um plano pago e tenha acesso completo a todas as funcionalidades.",
  ctaText = "Ver Planos",
  variant = "default",
  showCloseButton = false,
  onClose
}: UpgradeBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleUpgrade = () => {
    navigate("/gestor/mi-plan");
  };

  if (!isVisible) return null;

  if (variant === "compact") {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-300" />
          <span className="text-sm font-medium">Upgrade para desbloquear esta funcionalidade</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleUpgrade}
            className="text-xs bg-white text-purple-600 hover:bg-gray-100 font-semibold"
          >
            {ctaText}
          </Button>
          {showCloseButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="p-1 h-auto text-white hover:bg-white/20"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "floating") {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Card className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white border-0 shadow-2xl">
          <div className="p-4">
            {showCloseButton && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClose}
                className="absolute top-2 right-2 p-1 h-auto text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-300" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{title}</h4>
                <p className="text-xs text-white/80 mb-3">{description}</p>
                <Button
                  size="sm"
                  onClick={handleUpgrade}
                  className="w-full text-xs bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                >
                  {ctaText}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Default variant
  return (
    <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
      <div className="p-4">
        {showCloseButton && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 h-auto text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Crown className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm text-white/90 mb-3">{description}</p>
            <Button
              onClick={handleUpgrade}
              className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-6"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Não mostrar o banner se o usuário estiver verificado ou não estiver logado
  if (!user || user.email_confirmed_at) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" aria-hidden="true" />
            </span>
            <p className="ml-3 font-medium text-yellow-700">
              <span>
                {t("emailVerification.pendingMessage", "Por favor, verifique seu email para ativar sua conta. ")}
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-600 bg-white hover:bg-yellow-50"
            >
              {t("emailVerification.refreshButton", "Atualizar página")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
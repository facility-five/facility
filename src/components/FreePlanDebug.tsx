import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { showRadixSuccess, showRadixError } from "@/utils/toast";

export const FreePlanDebug = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  const checkPlanStatus = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_user_plan_status', {
        target_user_id: user.id
      });

      if (error) throw error;
      
      setStatus(data);
      showRadixSuccess("Status verificado com sucesso");
    } catch (error: any) {
      console.error("Erro ao verificar status:", error);
      showRadixError("Erro ao verificar status", error.message);
    } finally {
      setLoading(false);
    }
  };

  const activateFreePlan = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('activate_free_plan_for_user', {
        target_user_id: user.id
      });

      if (error) throw error;
      
      if (data.success) {
        showRadixSuccess("Plano gratuito ativado!", data.message);
        // Recarregar status
        setTimeout(() => checkPlanStatus(), 1000);
      } else {
        showRadixError("Erro ao ativar plano", data.message);
      }
    } catch (error: any) {
      console.error("Erro ao ativar plano:", error);
      showRadixError("Erro ao ativar plano", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Debug - Plano Gratuito
        </CardTitle>
        <CardDescription>
          Ferramentas para verificar e ativar o plano gratuito
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={checkPlanStatus}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Verificar Status
          </Button>
          
          <Button
            onClick={activateFreePlan}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Ativar Plano Gratuito
          </Button>
        </div>

        {status && (
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2">Status Atual:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <strong>Email:</strong> {status.email}
              </div>
              <div className="flex items-center gap-2">
                <strong>Subscription Status:</strong> 
                <span className={status.subscription_status === 'active' ? 'text-green-600' : 'text-red-600'}>
                  {status.subscription_status || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <strong>Tem Payment Ativo:</strong>
                {status.has_active_payment ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              
              {status.active_payments && status.active_payments.length > 0 && (
                <div className="mt-3">
                  <strong>Payments Ativos:</strong>
                  <div className="mt-2 space-y-2">
                    {status.active_payments.map((payment: any) => (
                      <div key={payment.payment_id} className="bg-gray-50 p-2 rounded text-xs">
                        <div><strong>Plano:</strong> {payment.plan_name}</div>
                        <div><strong>Valor:</strong> R$ {payment.amount}</div>
                        <div><strong>Status:</strong> {payment.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

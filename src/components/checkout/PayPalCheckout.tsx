import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { paypalService } from '../../services/payment/paypalService';
import { supabase } from '@/integrations/supabase/client';

interface PayPalCheckoutProps {
  amount: number;
  currency: string;
  planId: string;
  planName: string;
  onSuccess: (orderId: string) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  currency,
  planId,
  planName,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paypalConfig, setPaypalConfig] = useState<{ clientId: string; environment: string } | null>(null);

  useEffect(() => {
    loadPayPalConfig();
  }, []);

  const loadPayPalConfig = async () => {
    try {
      let clientId = '';
      let environment = 'sandbox';

      // Primeiro tentar localStorage
      const localSettings = localStorage.getItem('paypal_settings');
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          clientId = parsed.clientId || '';
          environment = parsed.sandboxMode ? 'sandbox' : 'live';
          
          if (clientId) {
            setPaypalConfig({ clientId, environment });
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error('Erro ao ler localStorage:', err);
        }
      }

      // Tentar buscar do banco sem falhar
      try {
        const { data: settingsData } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['paypal_client_id', 'paypal_environment']);

        if (settingsData && settingsData.length > 0) {
          const config = settingsData.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
          }, {} as any);

          clientId = config.paypal_client_id || '';
          environment = config.paypal_environment || 'sandbox';
        }
      } catch (error) {
        // Silenciosamente ignorar erro de tabela não existente
        console.log('Banco não disponível, verificando localStorage...');
      }

      if (!clientId) {
        throw new Error('PayPal não configurado. Configure as credenciais do PayPal primeiro.');
      }

      setPaypalConfig({ clientId, environment });
      setIsLoading(false);
      
    } catch (err) {
      console.error('Erro ao carregar configurações PayPal:', err);
      setError(err.message || 'Erro ao carregar PayPal');
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const orderId = await paypalService.createOrder(amount, currency, {
        planId,
        planName
      });
      return orderId;
    } catch (error) {
      console.error('Erro ao criar ordem PayPal:', error);
      onError(error);
      throw error;
    }
  };

  const handleApprove = async (data: any) => {
    try {
      const capture = await paypalService.captureOrder(data.orderID);
      console.log('Pagamento capturado:', capture);
      onSuccess(data.orderID);
    } catch (error) {
      console.error('Erro ao capturar pagamento:', error);
      onError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando PayPal...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800 mb-2">Erro PayPal</h3>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Para configurar o PayPal temporariamente, execute no console:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`localStorage.setItem('paypal_settings', JSON.stringify({
  clientId: 'seu-client-id-aqui',
  sandboxMode: true
}));`}
          </pre>
        </div>
        <button 
          onClick={loadPayPalConfig}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!paypalConfig) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-600">PayPal não configurado</p>
      </div>
    );
  }

  const initialOptions = {
    clientId: paypalConfig.clientId,
    currency: currency,
    intent: 'capture' as const,
    components: 'buttons',
    locale: 'pt_BR'
  };

  return (
    <div className="paypal-checkout">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Resumo do Pedido</h3>
        <div className="text-sm text-blue-700">
          <p><strong>Plano:</strong> {planName}</p>
          <p><strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: currency 
          }).format(amount)}</p>
        </div>
      </div>
      
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            tagline: false,
            height: 45
          }}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={(err) => {
            console.error('Erro no PayPal:', err);
            onError(new Error('Erro no processamento do pagamento PayPal'));
          }}
          onCancel={() => {
            console.log('Pagamento PayPal cancelado');
            onCancel?.();
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalCheckout;
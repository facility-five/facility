import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons as PayPalButtonsOfficial } from '@paypal/react-paypal-js';
import { paypalService } from '../../services/payment/paypalService';
import { supabase } from '@/integrations/supabase/client';

interface PayPalCheckoutProps {
  amount: number;
  currency?: string;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  currency = 'BRL',
  onSuccess,
  onError,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paypalConfig, setPaypalConfig] = useState<{ clientId: string; environment: string } | null>(null);

  useEffect(() => {
    loadPayPalConfig();
  }, []);

  const loadPayPalConfig = async () => {
    try {
      // Buscar configurações do banco de dados
      const { data: settingsData, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['paypal_client_id', 'paypal_environment', 'paypal_enabled']);

      if (error) {
        throw new Error(`Erro ao carregar configurações: ${error.message}`);
      }

      if (!settingsData || settingsData.length === 0) {
        throw new Error('PayPal não configurado. Configure em Configurações > PayPal.');
      }

      // Converter array para objeto
      const config = settingsData.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as any);

      const clientId = config.paypal_client_id || '';
      const environment = config.paypal_environment || 'sandbox';
      const enabled = config.paypal_enabled === 'true';

      if (!clientId) {
        throw new Error('PayPal Client ID não configurado.');
      }

      if (!enabled) {
        throw new Error('PayPal está desabilitado. Ative em Configurações > PayPal.');
      }

      setPaypalConfig({ clientId, environment });
      setIsLoading(false);
      
    } catch (err: any) {
      console.error('Erro ao carregar configurações PayPal:', err);
      setError(err.message || 'Erro ao carregar PayPal');
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const orderId = await paypalService.createOrder(amount, currency);
      return orderId;
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      onError(error);
      throw error;
    }
  };

  const handleApprove = async (data: any) => {
    try {
      const capture = await paypalService.captureOrder(data.orderID);
      onSuccess(capture);
    } catch (error) {
      console.error('Erro ao capturar pagamento:', error);
      onError(error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando PayPal...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadPayPalConfig}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!paypalConfig) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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
    <div className="paypal-checkout w-full">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtonsOfficial
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay',
            tagline: false,
          }}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={(err) => {
            console.error('Erro no PayPal:', err);
            onError(err);
          }}
          onCancel={() => {
            console.log('Pagamento cancelado');
            onCancel?.();
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalCheckout;
export { PayPalCheckout };
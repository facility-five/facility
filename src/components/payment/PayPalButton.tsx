import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { paypalService } from '../../services/payment/paypalService';
import { supabase } from '@/integrations/supabase/client';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: Error) => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'BRL',
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className = '',
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
        throw new Error('PayPal não configurado. Vá em Configurações > PayPal para configurar.');
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
      const orderId = await paypalService.createOrder(amount, currency);
      return orderId;
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      onError(error as Error);
      throw error;
    }
  };

  const handleApprove = async (data: any) => {
    try {
      const capture = await paypalService.captureOrder(data.orderID);
      onSuccess(capture);
    } catch (error) {
      console.error('Erro ao capturar pagamento:', error);
      onError(error as Error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando PayPal...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
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
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <p className="text-yellow-600 text-sm">PayPal não configurado</p>
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
    <div className={`paypal-button-container ${className}`}>
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          disabled={disabled}
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            tagline: false,
          }}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={(err) => {
            console.error('Erro no PayPal:', err);
            onError(new Error('Erro no processamento do pagamento'));
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
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
      // Buscar configurações do PayPal do Supabase
      const { data: settings, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['paypal_client_id', 'paypal_environment']);

      if (error) throw error;

      const config = settings?.reduce((acc, setting) => {
        const key = setting.key.replace('paypal_', '');
        acc[key] = setting.value;
        return acc;
      }, {} as any);

      if (!config?.client_id) {
        throw new Error('Configurações do PayPal não encontradas');
      }

      setPaypalConfig({
        clientId: config.client_id,
        environment: config.environment || 'sandbox'
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao carregar configurações PayPal:', err);
      setError('Erro ao carregar PayPal');
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
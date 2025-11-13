import React, { useEffect, useState } from 'react';
import { paypalService, PayPalConfig } from '../../services/payment/paypalService';
import { PaymentMethod } from '../../types/payment';

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
  const [paypalContainerId] = useState(`paypal-button-${Date.now()}`);

  useEffect(() => {
    const initializePayPal = async () => {
      try {
        // Buscar configuração do PayPal do backend
        const configResponse = await fetch('/api/payment/config/paypal');
        if (!configResponse.ok) {
          throw new Error('Configuração do PayPal não encontrada');
        }

        const config: PayPalConfig = await configResponse.json();
        await paypalService.initialize(config);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao inicializar PayPal:', err);
        setError('Erro ao carregar PayPal');
        setIsLoading(false);
      }
    };

    initializePayPal();
  }, []);

  useEffect(() => {
    if (!paypalService.isInitialized() || isLoading || disabled) {
      return;
    }

    const container = document.getElementById(paypalContainerId);
    if (!container) {
      return;
    }

    // Limpar container antes de renderizar
    container.innerHTML = '';

    try {
      const paypal = paypalService.getPayPalButtons();
      
      paypal({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          tagline: false,
        },
        createOrder: async () => {
          try {
            const orderId = await paypalService.createOrder(amount, currency);
            return orderId;
          } catch (error) {
            console.error('Erro ao criar ordem:', error);
            throw error;
          }
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const captureData = await paypalService.captureOrder(data.orderID);
            
            const paymentData: PaymentMethod = {
              id: captureData.id,
              type: 'paypal',
              provider: 'paypal',
              amount: parseFloat(captureData.amount.value),
              currency: captureData.amount.currency_code,
              status: captureData.status,
              email: captureData.buyer.email_address,
              metadata: {
                orderId: data.orderID,
                captureId: captureData.id,
                payerName: `${captureData.buyer.name.given_name} ${captureData.buyer.name.surname}`,
              },
              createdAt: new Date().toISOString(),
            };

            onSuccess(paymentData);
          } catch (error) {
            console.error('Erro ao capturar pagamento:', error);
            onError(error as Error);
          }
        },
        onCancel: () => {
          if (onCancel) {
            onCancel();
          }
        },
        onError: (err: any) => {
          console.error('Erro no PayPal:', err);
          onError(new Error('Erro no processamento do PayPal'));
        },
      }).render(`#${paypalContainerId}`);
    } catch (err) {
      console.error('Erro ao renderizar botão PayPal:', err);
      setError('Erro ao carregar botão do PayPal');
    }
  }, [amount, currency, paypalContainerId, isLoading, disabled, onSuccess, onError, onCancel]);

  if (isLoading) {
    return (
      <div className={`paypal-button-container ${className}`}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando PayPal...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`paypal-button-container ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`paypal-button-container ${className}`}>
      <div id={paypalContainerId} className="paypal-buttons"></div>
    </div>
  );
};

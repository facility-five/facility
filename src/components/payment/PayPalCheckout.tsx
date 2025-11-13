import React, { useEffect, useState } from 'react';
import { paypalService } from '../../services/payment/paypalService';

interface PayPalCheckoutProps {
  amount: number;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializePayPal();
  }, []);

  const initializePayPal = async () => {
    try {
      await paypalService.initialize();
      setIsLoading(false);
    } catch (err) {
      setError('Erro ao carregar PayPal');
      setIsLoading(false);
    }
  };

  const handleApprove = async (data: any, actions: any) => {
    try {
      const capture = await paypalService.captureOrder(data.orderID);
      onSuccess(capture);
      return capture;
    } catch (error) {
      console.error('Erro ao capturar pagamento:', error);
      onError(error);
      throw error;
    }
  };

  const handleCreateOrder = async (data: any, actions: any) => {
    try {
      const orderId = await paypalService.createOrder(amount);
      return orderId;
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
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
      </div>
    );
  }

  return (
    <div className="paypal-checkout">
      <div id="paypal-button-container"></div>
      <PayPalButtons
        amount={amount}
        onApprove={handleApprove}
        onCreateOrder={handleCreateOrder}
        onError={onError}
        onCancel={onCancel}
      />
    </div>
  );
};

interface PayPalButtonsProps {
  amount: number;
  onApprove: (data: any, actions: any) => Promise<any>;
  onCreateOrder: (data: any, actions: any) => Promise<string>;
  onError: (error: any) => void;
  onCancel?: () => void;
}

const PayPalButtons: React.FC<PayPalButtonsProps> = ({
  amount,
  onApprove,
  onCreateOrder,
  onError,
  onCancel,
}) => {
  const [buttonRendered, setButtonRendered] = useState(false);

  useEffect(() => {
    if (!paypalService.isInitialized()) return;

    const renderButtons = async () => {
      try {
        const paypal = paypalService.getPayPalButtons();
        
        paypal({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay',
          },
          createOrder: onCreateOrder,
          onApprove: onApprove,
          onError: (err: any) => {
            console.error('Erro no PayPal:', err);
            onError(err);
          },
          onCancel: () => {
            console.log('Pagamento cancelado');
            onCancel?.();
          },
        }).render('#paypal-button-container');

        setButtonRendered(true);
      } catch (error) {
        console.error('Erro ao renderizar botões PayPal:', error);
        onError(error);
      }
    };

    renderButtons();
  }, [amount, onApprove, onCreateOrder, onError, onCancel]);

  return <div id="paypal-button-container" className="w-full"></div>;
};

export default PayPalCheckout

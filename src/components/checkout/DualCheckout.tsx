import React, { useState } from 'react';
import PayPalCheckout from './PayPalCheckout';
// import StripeCheckout from './StripeCheckout'; // TODO: Implementar
import { PaymentProvider } from '../../types/payment';

interface DualCheckoutProps {
  amount: number;
  currency: string;
  planId: string;
  planName: string;
  onSuccess: (provider: PaymentProvider, paymentId: string) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

const DualCheckout: React.FC<DualCheckoutProps> = ({
  amount,
  currency,
  planId,
  planName,
  onSuccess,
  onError,
  onCancel
}) => {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe');

  const handlePayPalSuccess = (orderId: string) => {
    onSuccess('paypal', orderId);
  };

  const handleStripeSuccess = (paymentId: string) => {
    onSuccess('stripe', paymentId);
  };

  return (
    <div className="dual-checkout">
      <div className="provider-selector">
        <h3>Escolha seu método de pagamento:</h3>
        <div className="provider-buttons">
          <button
            className={`provider-button ${selectedProvider === 'stripe' ? 'active' : ''}`}
            onClick={() => setSelectedProvider('stripe')}
          >
            <div className="provider-icon">💳</div>
            <span>Cartão de Crédito (Stripe)</span>
          </button>
          <button
            className={`provider-button ${selectedProvider === 'paypal' ? 'active' : ''}`}
            onClick={() => setSelectedProvider('paypal')}
          >
            <div className="provider-icon">🅿️</div>
            <span>PayPal</span>
          </button>
        </div>
      </div>

      <div className="checkout-container">
        {selectedProvider === 'stripe' && (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              ⚠️ Stripe Checkout ainda não implementado nesta versão.
              <br />
              Por favor, use PayPal por enquanto.
            </p>
            <button 
              onClick={() => setSelectedProvider('paypal')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Usar PayPal
            </button>
          </div>
        )}
        
        {selectedProvider === 'paypal' && (
          <PayPalCheckout
            amount={amount}
            currency={currency}
            planId={planId}
            planName={planName}
            onSuccess={handlePayPalSuccess}
            onError={onError}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  );
};

export default DualCheckout;
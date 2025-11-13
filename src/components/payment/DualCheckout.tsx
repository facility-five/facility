import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalCheckout } from './PayPalCheckout';
import { CreditCard, PaymentForm } from 'react-square-web-payments-sdk';
import { loadSquare } from '../../services/payment/squareService';
import { PaymentMethod, PaymentProvider } from '../../types/payment';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DualCheckoutProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: Error) => void;
  selectedPlan?: string;
  customerEmail?: string;
  customerName?: string;
}

export const DualCheckout: React.FC<DualCheckoutProps> = ({
  amount,
  currency = 'BRL',
  onSuccess,
  onError,
  selectedPlan,
  customerEmail,
  customerName,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProviderChange = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setIsProcessing(false);
    onSuccess({
      ...paymentData,
      provider: selectedProvider,
      amount,
      currency,
      plan: selectedPlan,
    });
  };

  const handlePaymentError = (error: Error) => {
    setIsProcessing(false);
    onError(error);
  };

  const renderPaymentForm = () => {
    switch (selectedProvider) {
      case 'stripe':
        return (
          <Elements stripe={stripePromise}>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium mb-3">Cartão de Crédito</h4>
                {/* Stripe Elements seriam adicionados aqui */}
                <div className="text-sm text-gray-600">
                  Stripe integration placeholder
                </div>
              </div>
            </div>
          </Elements>
        );

      case 'paypal':
        return (
          <PayPalCheckout
            amount={amount}
            currency={currency}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            customerEmail={customerEmail}
            customerName={customerName}
          />
        );

      case 'square':
        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-3">Cartão de Crédito (Square)</h4>
              <CreditCard
                amount={amount.toString()}
                currency={currency}
                onNonceGenerated={async (nonce) => {
                  setIsProcessing(true);
                  try {
                    // Processar pagamento com Square
                    const response = await fetch('/api/payment/square/process', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        nonce,
                        amount,
                        currency,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('Erro ao processar pagamento');
                    }

                    const result = await response.json();
                    handlePaymentSuccess(result);
                  } catch (error) {
                    handlePaymentError(error as Error);
                  }
                }}
                onError={handlePaymentError}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Provedor */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Escolha seu método de pagamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleProviderChange('stripe')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedProvider === 'stripe'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">💳</div>
              <div className="font-medium">Cartão de Crédito</div>
              <div className="text-sm text-gray-600">Stripe</div>
            </div>
          </button>

          <button
            onClick={() => handleProviderChange('paypal')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedProvider === 'paypal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🅿️</div>
              <div className="font-medium">PayPal</div>
              <div className="text-sm text-gray-600">Conta ou Cartão</div>
            </div>
          </button>

          <button
            onClick={() => handleProviderChange('square')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedProvider === 'square'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium">Square</div>
              <div className="text-sm text-gray-600">Cartão de Crédito</div>
            </div>
          </button>
        </div>
      </div>

      {/* Formulário de Pagamento */}
      <div className="space-y-4">
        {renderPaymentForm()}
      </div>

      {/* Resumo do Pedido */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total:</span>
          <span className="text-xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: currency,
            }).format(amount)}
          </span>
        </div>
        {selectedPlan && (
          <div className="text-sm text-gray-600 mt-1">
            Plano: {selectedPlan}
          </div>
        )}
      </div>
    </div>
  );
};
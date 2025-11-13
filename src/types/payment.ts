export type PaymentProvider = 'stripe' | 'paypal';

export interface PaymentConfig {
  provider: PaymentProvider;
  amount: number;
  currency: string;
  planId?: string;
  planName?: string;
}

export interface PaymentResult {
  provider: PaymentProvider;
  paymentId: string;
  orderId?: string;
  status: 'success' | 'error' | 'cancelled';
  details?: any;
}

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'live';
  webhookId?: string;
}

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
}

export interface PaymentSettings {
  paypal?: PayPalConfig;
  stripe?: StripeConfig;
  defaultProvider: PaymentProvider;
}
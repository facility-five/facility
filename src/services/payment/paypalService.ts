import { loadScript, PayPalScriptOptions } from '@paypal/react-paypal-js';

declare global {
  interface Window {
    paypal: any;
  }
}

export interface PayPalConfig {
  clientId: string;
  environment: 'sandbox' | 'production';
  currency?: string;
  locale?: string;
}

export interface PayPalOrderData {
  id: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
}

export interface PayPalCaptureData {
  id: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
  buyer: {
    email_address: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
}

class PayPalService {
  private config: PayPalConfig | null = null;
  private isLoaded = false;
  private isLoading = false;

  isInitialized(): boolean {
    return this.config !== null && this.isLoaded;
  }

  async initialize(config: PayPalConfig): Promise<void> {
    if (this.isInitialized()) {
      return;
    }

    this.config = config;

    if (!this.isLoading) {
      this.isLoading = true;
      await this.loadPayPalSDK();
      this.isLoading = false;
    }
  }

  private async loadPayPalSDK(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('PayPal SDK não pode ser carregado no servidor');
    }

    if (window.paypal) {
      this.isLoaded = true;
      return;
    }

    try {
      const options: PayPalScriptOptions = {
        'client-id': this.config!.clientId,
        currency: this.config!.currency || 'BRL',
        intent: 'capture',
        components: 'buttons',
        locale: this.config!.locale || 'pt_BR'
      };

      await loadScript(options);
      this.isLoaded = true;
    } catch (error) {
      throw new Error(`Falha ao carregar SDK do PayPal: ${error}`);
    }
  }

  getPayPalButtons(): any {
    if (!this.isInitialized()) {
      throw new Error('PayPal não está inicializado');
    }
    return window.paypal.Buttons;
  }

  async createOrder(amount: number, currency: string = 'BRL'): Promise<string> {
    try {
      const response = await fetch('/functions/v1/paypal-create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}`,
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
          currency,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar ordem no PayPal');
      }

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error('Erro ao criar ordem PayPal:', error);
      throw error;
    }
  }

  async captureOrder(orderId: string): Promise<PayPalCaptureData> {
    try {
      const response = await fetch('/functions/v1/paypal-capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}`,
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao capturar ordem no PayPal');
      }

      const data = await response.json();
      return data.capture;
    } catch (error) {
      console.error('Erro ao capturar ordem PayPal:', error);
      throw error;
    }
  }

  async refundPayment(captureId: string, amount?: number): Promise<any> {
    try {
      const response = await fetch('/api/payment/paypal/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          captureId,
          amount: amount ? amount.toFixed(2) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar reembolso no PayPal');
      }

      const data = await response.json();
      return data.refund;
    } catch (error) {
      console.error('Erro ao processar reembolso PayPal:', error);
      throw error;
    }
  }

  async getOrderDetails(orderId: string): Promise<PayPalOrderData> {
    try {
      const response = await fetch(`/api/payment/paypal/order/${orderId}`);

      if (!response.ok) {
        throw new Error('Erro ao obter detalhes da ordem PayPal');
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error('Erro ao obter detalhes da ordem PayPal:', error);
      throw error;
    }
  }
}

export const paypalService = new PayPalService();

declare global {
  interface Window {
    paypal: any;
  }
}

export interface PayPalConfig {
  clientId: string;
  environment: 'sandbox' | 'production';
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
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('PayPal SDK não pode ser carregado no servidor'));
        return;
      }

      if (window.paypal) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.config!.clientId}&currency=BRL&intent=capture`;
      script.async = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Falha ao carregar SDK do PayPal'));
      };
      document.head.appendChild(script);
    });
  }

  getPayPalButtons(): any {
    if (!this.isInitialized()) {
      throw new Error('PayPal não está inicializado');
    }
    return window.paypal.Buttons;
  }

  async createOrder(amount: number, currency: string = 'BRL'): Promise<string> {
    try {
      const response = await fetch('/api/payment/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar ordem no PayPal');
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
      const response = await fetch('/api/payment/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao capturar ordem no PayPal');
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

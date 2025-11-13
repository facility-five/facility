export interface PaymentGatewayConfig {
  stripe: {
    enabled: boolean;
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'live';
    webhookId?: string;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  gateway: 'stripe' | 'paypal';
  enabled: boolean;
}

class PaymentConfigService {
  private static instance: PaymentConfigService;
  private config: PaymentGatewayConfig | null = null;
  private methods: PaymentMethod[] = [];

  private constructor() {}

  static getInstance(): PaymentConfigService {
    if (!PaymentConfigService.instance) {
      PaymentConfigService.instance = new PaymentConfigService();
    }
    return PaymentConfigService.instance;
  }

  async loadConfig(): Promise<PaymentGatewayConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const response = await fetch('/api/payment/config');
      const data = await response.json();
      this.config = data.config;
      this.methods = data.methods;
      return this.config;
    } catch (error) {
      console.error('Erro ao carregar configuração de pagamento:', error);
      throw error;
    }
  }

  getConfig(): PaymentGatewayConfig | null {
    return this.config;
  }

  getAvailableMethods(): PaymentMethod[] {
    return this.methods.filter(method => method.enabled);
  }

  isStripeEnabled(): boolean {
    return this.config?.stripe.enabled ?? false;
  }

  isPayPalEnabled(): boolean {
    return this.config?.paypal.enabled ?? false;
  }

  async updateConfig(newConfig: Partial<PaymentGatewayConfig>): Promise<void> {
    try {
      const response = await fetch('/api/payment/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar configuração');
      }

      this.config = { ...this.config!, ...newConfig };
    } catch (error) {
      console.error('Erro ao atualizar configuração de pagamento:', error);
      throw error;
    }
  }
}

export const paymentConfigService = PaymentConfigService.getInstance();

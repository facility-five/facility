import { getApiUrl } from '../utils/api';

export interface PayPalOrder {
  id: string;
  status: string;
  intent: string;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    reference_id: string;
  }>;
  create_time: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface CreateOrderData {
  amount: number;
  currency: string;
  description?: string;
  reference_id?: string;
}

export interface CaptureOrderData {
  orderId: string;
}

class PayPalService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = getApiUrl();
  }

  async createOrder(data: CreateOrderData): Promise<{ orderId: string; order: PayPalOrder }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar ordem PayPal');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar ordem PayPal:', error);
      throw error;
    }
  }

  async captureOrder(data: CaptureOrderData): Promise<{ orderId: string; status: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/paypal/capture-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao capturar ordem PayPal');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao capturar ordem PayPal:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const response = await fetch(`${this.apiUrl}/api/paypal/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar ordem PayPal');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar ordem PayPal:', error);
      throw error;
    }
  }
}

export default new PayPalService();
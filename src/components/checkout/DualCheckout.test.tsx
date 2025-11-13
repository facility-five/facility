import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DualCheckout from '../DualCheckout'
import React from 'react'

// Mock simples dos componentes filhos
vi.mock('./PayPalCheckout', () => ({
  default: () => <div data-testid="paypal-checkout">PayPal Checkout</div>
}))

vi.mock('./StripeCheckout', () => ({
  default: () => <div data-testid="stripe-checkout">Stripe Checkout</div>
}))

describe('DualCheckout', () => {
  const mockProps = {
    amount: 99.99,
    currency: 'BRL',
    planId: 'plan-test-123',
    planName: 'Plano Teste',
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onCancel: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização inicial', () => {
    it('deve renderizar o componente corretamente', () => {
      render(<DualCheckout {...mockProps} />)
      
      expect(screen.getByText('Escolha seu método de pagamento:')).toBeInTheDocument()
      expect(screen.getByText('Cartão de Crédito (Stripe)')).toBeInTheDocument()
      expect(screen.getByText('PayPal')).toBeInTheDocument()
    })

    it('deve renderizar o StripeCheckout por padrão', () => {
      render(<DualCheckout {...mockProps} />)
      
      expect(screen.getByTestId('stripe-checkout')).toBeInTheDocument()
    })
  })

  describe('Seleção de provedor', () => {
    it('deve alternar para PayPal ao clicar no botão', async () => {
      render(<DualCheckout {...mockProps} />)
      
      const paypalButton = screen.getByText('PayPal').closest('button')!
      fireEvent.click(paypalButton)
      
      expect(screen.getByTestId('paypal-checkout')).toBeInTheDocument()
    })

    it('deve voltar para Stripe ao clicar no botão', async () => {
      render(<DualCheckout {...mockProps} />)
      
      // Vai para PayPal
      const paypalButton = screen.getByText('PayPal').closest('button')!
      fireEvent.click(paypalButton)
      
      // Volta para Stripe
      const stripeButton = screen.getByText('Cartão de Crédito (Stripe)').closest('button')!
      fireEvent.click(stripeButton)
      
      expect(screen.getByTestId('stripe-checkout')).toBeInTheDocument()
    })
  })
})
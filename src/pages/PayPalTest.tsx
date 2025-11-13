import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PayPalCheckout } from '@/components/payment/PayPalCheckout';
import { PayPalButton } from '@/components/payment/PayPalButton';
import PayPalSettings from '@/components/admin/PayPalSettings';
import DualCheckout from '@/components/checkout/DualCheckout';

const PayPalTestPage = () => {
  const [amount, setAmount] = useState(29.99);
  const [currency, setCurrency] = useState('BRL');
  const [testResult, setTestResult] = useState<string>('');

  const handlePaymentSuccess = (provider: string, paymentId: string) => {
    setTestResult(`✅ Sucesso! Provider: ${provider}, ID: ${paymentId}`);
    console.log('Pagamento bem-sucedido:', { provider, paymentId });
  };

  const handlePaymentError = (error: any) => {
    setTestResult(`❌ Erro: ${error.message || JSON.stringify(error)}`);
    console.error('Erro no pagamento:', error);
  };

  const handlePaymentCancel = () => {
    setTestResult(`⚠️ Pagamento cancelado pelo usuário`);
    console.log('Pagamento cancelado');
  };

  const handleButtonSuccess = (paymentData: any) => {
    setTestResult(`✅ PayPalButton Sucesso! Dados: ${JSON.stringify(paymentData, null, 2)}`);
    console.log('PayPalButton sucesso:', paymentData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Teste PayPal Integration</h1>
        <p className="text-gray-600">
          Página para testar todos os componentes PayPal implementados
        </p>
      </div>

      {/* Configuração de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Teste</CardTitle>
          <CardDescription>
            Ajuste os parâmetros para testar diferentes cenários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="currency">Moeda</Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-semibold mb-2">Resultado do Teste:</h4>
              <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testes dos Componentes */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="checkout">PayPal Checkout</TabsTrigger>
          <TabsTrigger value="button">PayPal Button</TabsTrigger>
          <TabsTrigger value="dual">Dual Checkout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>PayPal Settings</CardTitle>
              <CardDescription>
                Configure as credenciais PayPal (usa localStorage como fallback)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PayPalSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkout">
          <Card>
            <CardHeader>
              <CardTitle>PayPal Checkout Component</CardTitle>
              <CardDescription>
                Teste do componente PayPalCheckout completo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: currency 
                  }).format(amount)}
                </p>
                <PayPalCheckout
                  amount={amount}
                  currency={currency}
                  planId="test-plan"
                  planName="Plano de Teste"
                  onSuccess={(orderId) => handlePaymentSuccess('paypal', orderId)}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="button">
          <Card>
            <CardHeader>
              <CardTitle>PayPal Button Component</CardTitle>
              <CardDescription>
                Teste do componente PayPalButton simples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: currency 
                  }).format(amount)}
                </p>
                <PayPalButton
                  amount={amount}
                  currency={currency}
                  onSuccess={handleButtonSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dual">
          <Card>
            <CardHeader>
              <CardTitle>Dual Checkout Component</CardTitle>
              <CardDescription>
                Teste do componente com Stripe e PayPal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: currency 
                  }).format(amount)}
                </p>
                <DualCheckout
                  amount={amount}
                  currency={currency}
                  planId="test-plan"
                  planName="Plano de Teste"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Como Testar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Configure PayPal (Sandbox)</h4>
            <p className="text-sm text-gray-600">
              Na aba "Configurações", insira seu Client ID do PayPal Sandbox.
              Se não tiver, use este temporariamente para teste: <code>sb</code>
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">2. Teste os Componentes</h4>
            <p className="text-sm text-gray-600">
              - <strong>PayPal Checkout:</strong> Componente completo com resumo
              <br />
              - <strong>PayPal Button:</strong> Apenas o botão de pagamento
              <br />
              - <strong>Dual Checkout:</strong> Escolha entre Stripe e PayPal
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">3. Monitorar Resultados</h4>
            <p className="text-sm text-gray-600">
              Os resultados dos testes aparecerão na seção "Resultado do Teste" acima
              e também no console do navegador (F12).
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Para usar PayPal real, você precisa:
              <br />
              1. Conta PayPal Business
              <br />
              2. App criado no PayPal Developer Dashboard
              <br />
              3. Client ID e Secret válidos
              <br />
              4. Edge Functions configuradas no Supabase
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPalTestPage;
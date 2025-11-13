# Configuração Temporária PayPal

Para configurar temporariamente o PayPal enquanto o banco de dados não está disponível, execute este código no console do navegador:

## 1. Abra o console do navegador (F12)

## 2. Execute este código para configurar PayPal Sandbox:

```javascript
// Configuração PayPal Sandbox (teste)
const paypalSettings = {
  clientId: 'sb', // Substitua pelo seu Client ID do PayPal Sandbox
  clientSecret: 'sandbox-secret', // Substitua pelo seu Client Secret
  sandboxMode: true,
  webhookId: 'webhook-test'
};

localStorage.setItem('paypal_settings', JSON.stringify(paypalSettings));
console.log('PayPal configurado temporariamente!');
```

## 3. Para configurar PayPal Live (produção):

```javascript
// Configuração PayPal Live (produção)
const paypalSettings = {
  clientId: 'seu-client-id-live', 
  clientSecret: 'seu-client-secret-live',
  sandboxMode: false,
  webhookId: 'webhook-live'
};

localStorage.setItem('paypal_settings', JSON.stringify(paypalSettings));
console.log('PayPal Live configurado!');
```

## 4. Para verificar a configuração atual:

```javascript
console.log(JSON.parse(localStorage.getItem('paypal_settings')));
```

## 5. Para limpar a configuração:

```javascript
localStorage.removeItem('paypal_settings');
console.log('Configuração PayPal removida');
```

## Como obter as credenciais PayPal:

1. Acesse [PayPal Developer Dashboard](https://developer.paypal.com)
2. Faça login com sua conta PayPal
3. Vá em "My Apps & Credentials"
4. Para Sandbox: Use as credenciais da seção "Sandbox"
5. Para Live: Crie um app na seção "Live" (requer conta verificada)

## Testando o PayPal:

1. Configure as credenciais no localStorage
2. Vá na página de Pagamentos ou onde o PayPal está implementado
3. O sistema agora deve carregar as configurações do localStorage
4. Se ainda não funcionar, verifique o console para mensagens de erro

## Importante:

- Esta é uma configuração temporária apenas para testes
- Em produção, as credenciais devem estar no banco de dados
- Nunca exponha credenciais reais em código público
- Use sempre Sandbox para desenvolvimento e testes
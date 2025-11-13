# Documentação de Testes - DualCheckout Component

## Resumo
Este documento descreve a implementação completa de testes para o componente `DualCheckout`, incluindo configuração do ambiente de testes, criação de casos de teste e execução.

## 1. Configuração do Ambiente de Testes

### 1.1 Dependências Instaladas
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom
```

### 1.2 Arquivos de Configuração

#### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### src/test/setup.ts
```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Limpar após cada teste
afterEach(() => {
  cleanup()
})
```

### 1.3 Scripts Adicionados no package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## 2. Estrutura dos Testes

### 2.1 Arquivo de Teste Principal
**Localização:** `src/components/checkout/DualCheckout.test.tsx`

### 2.2 Mock dos Componentes Filhos
```typescript
vi.mock('./PayPalCheckout', () => ({
  default: () => <div data-testid="paypal-checkout">PayPal Checkout</div>
}))

vi.mock('./StripeCheckout', () => ({
  default: () => <div data-testid="stripe-checkout">Stripe Checkout</div>
}))
```

## 3. Casos de Teste Implementados

### 3.1 Testes de Renderização Inicial
- ✅ Renderização correta do componente
- ✅ Renderização do StripeCheckout por padrão
- ✅ Presença dos botões de seleção de pagamento
- ✅ Textos e elementos da interface

### 3.2 Testes de Seleção de Provedor
- ✅ Alternância para PayPal ao clicar no botão
- ✅ Volta para Stripe ao clicar no botão Stripe
- ✅ Renderização condicional dos componentes filhos
- ✅ Estados ativos dos botões

### 3.3 Testes de Props e Callbacks
- ✅ Props obrigatórias (amount, currency, planId, planName)
- ✅ Props de callback (onSuccess, onError, onCancel)
- ✅ Funcionamento com onCancel opcional

## 4. Componente em Teste

### 4.1 Props do DualCheckout
```typescript
interface DualCheckoutProps {
  amount: number;
  currency: string;
  planId: string;
  planName: string;
  onSuccess: (provider: PaymentProvider, paymentId: string) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}
```

### 4.2 Funcionalidades Testadas
- Seleção de provedor de pagamento (Stripe/PayPal)
- Renderização condicional baseada na seleção
- Estados dos botões de seleção
- Integração com componentes filhos

## 5. Comandos de Execução

### 5.1 Executar Todos os Testes
```bash
pnpm test
```

### 5.2 Executar Testes em Modo UI
```bash
pnpm test:ui
```

### 5.3 Executar com Cobertura
```bash
pnpm test:coverage
```

### 5.4 Executar Teste Específico
```bash
pnpm test src/components/checkout/DualCheckout.test.tsx
```

## 6. Teste Básico de Ambiente

### 6.1 Arquivo de Teste Básico
**Localização:** `src/test/basic.test.tsx`

### 6.2 Propósito
- Verificar se o ambiente de testes está funcionando corretamente
- Testar renderização básica de componentes React
- Validar configuração do Vitest e React Testing Library

## 7. Estrutura de Diretórios
```
src/
├── components/
│   └── checkout/
│       ├── DualCheckout.tsx          # Componente principal
│       └── DualCheckout.test.tsx     # Testes do componente
├── test/
│   ├── setup.ts                      # Configuração global dos testes
│   └── basic.test.tsx               # Teste básico de ambiente
└── types/
    └── payment.ts                    # Tipos TypeScript
```

## 8. Próximos Passos

### 8.1 Melhorias de Teste Sugeridas
1. **Testes de Integração**: Criar testes que verifiquem a integração com os componentes PayPalCheckout e StripeCheckout reais
2. **Testes de Usuário**: Implementar testes com user-event para simular interações mais complexas
3. **Testes de Acessibilidade**: Adicionar testes para verificar acessibilidade (ARIA labels, keyboard navigation)
4. **Testes de Performance**: Verificar tempo de renderização e performance do componente
5. **Testes de Snapshot**: Criar snapshots para detectar mudanças visuais não intencionais

### 8.2 Componentes Adicionais para Testar
- PayPalCheckout (quando implementado)
- StripeCheckout (quando implementado)
- PaymentGatewaySelector
- Outros componentes de checkout

### 8.3 Configurações Avançadas
- Configurar CI/CD para executar testes automaticamente
- Adicionar relatórios de cobertura detalhados
- Implementar testes de mutação
- Configurar testes paralelos para performance

## 9. Notas de Implementação

### 9.1 Desafios Encontrados
- Problemas de compatibilidade com jsdom e ES modules
- Necessidade de configurar pool de threads para estabilidade
- Mock de componentes filhos que ainda não existem

### 9.2 Soluções Aplicadas
- Configuração de singleThread para evitar problemas de concorrência
- Mock simplificado dos componentes filhos
- Testes modulares focados no componente principal

### 9.3 Boas Práticas Seguidas
- Separação de testes por categorias (renderização, interação, callbacks)
- Uso de data-testid para elementos de teste
- Limpeza de mocks entre testes
- Nomenclatura descritiva dos testes em português

## 10. Conclusão

A estrutura de testes implementada fornece uma base sólida para garantir a qualidade e funcionamento correto do componente DualCheckout. Os testes cobrem os cenários principais de uso e podem ser facilmente expandidos conforme novas funcionalidades forem adicionadas ao componente.
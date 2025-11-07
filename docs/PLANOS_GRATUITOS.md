# Como Disponibilizar Planos Gratuitos

## Visão Geral do Sistema Atual

O sistema de planos está integrado com Stripe para pagamentos e possui as seguintes características:

### Estrutura da Tabela `plans`
- `id`: UUID
- `name`: Nome do plano
- `description`: Descrição do plano
- `price`: Preço (número)
- `period`: "monthly" ou "annual"
- `status`: "active" ou "inactive"
- `stripe_price_id`: ID do preço no Stripe (opcional)
- `features`: Array de recursos
- `max_admins`: Limite de administradoras
- `max_condos`: Limite de condomínios
- `max_units`: Limite de unidades

### Lógica Atual de Verificação de Planos

O hook `usePlan.ts` verifica se um usuário tem plano ativo através de:
1. Pagamentos ativos na tabela `payments` (status = "active")
2. Campo `subscription_status` no perfil do usuário
3. Role do usuário (admin tem acesso completo)

---

## 3 Opções para Implementar Planos Gratuitos

### **Opção 1: Plano Gratuito com Limitações (RECOMENDADO)**

Esta é a opção mais comum em SaaS e oferece melhor controle.

#### Vantagens:
✅ Controle preciso de limites (ex: 1 condomínio, 3 administradoras)
✅ Facilita upsell para planos pagos
✅ Rastreamento de uso e métricas
✅ Experiência clara para o usuário

#### Como Implementar:

**1. Criar Plano Gratuito no Admin:**
```
Nome: Plano Gratuito
Preço: 0
Período: monthly
Status: active
Stripe Price ID: (deixar vazio)
Max Administradoras: 1
Max Condomínios: 1
Max Unidades: 10
Features: Gestão básica, Comunicados, Reservas
```

**2. Modificar `AuthForm.tsx` para ativar plano gratuito após registro:**

```typescript
// Após criar usuário com sucesso
const { error: paymentError } = await supabase
  .from("payments")
  .insert({
    user_id: userId,
    plan_id: FREE_PLAN_ID, // ID do plano gratuito
    plan: "Plano Gratuito",
    amount: 0,
    currency: "EUR",
    status: "active",
    stripe_payment_intent_id: `free_${Date.now()}`
  });

// Atualizar profile
await supabase
  .from("profiles")
  .update({ subscription_status: "active" })
  .eq("id", userId);
```

**3. Adicionar verificação de limites nos componentes:**

```typescript
// Em ManagerCondominios.tsx, ManagerAdministradoras.tsx, etc.
const { currentPlan } = usePlan();

const canAddMore = () => {
  if (!currentPlan) return false;
  if (currentPlan.max_condos === null) return true; // Ilimitado
  return currentCount < currentPlan.max_condos;
};

// Mostrar banner de upgrade quando atingir limite
if (!canAddMore()) {
  return <UpgradeBanner message="Você atingiu o limite do plano gratuito" />;
}
```

---

### **Opção 2: Trial Gratuito de 14/30 Dias**

Permite acesso completo por período limitado.

#### Vantagens:
✅ Usuários experimentam todas as funcionalidades
✅ Maior taxa de conversão para planos pagos
✅ Implementação mais simples

#### Como Implementar:

**1. Adicionar campos na tabela `payments`:**
```sql
ALTER TABLE payments 
ADD COLUMN trial_ends_at TIMESTAMP,
ADD COLUMN is_trial BOOLEAN DEFAULT false;
```

**2. Criar registro de trial após registro:**
```typescript
const trialEndDate = new Date();
trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 dias

await supabase.from("payments").insert({
  user_id: userId,
  plan_id: null,
  plan: "Trial Gratuito",
  amount: 0,
  currency: "EUR",
  status: "active",
  is_trial: true,
  trial_ends_at: trialEndDate.toISOString(),
  stripe_payment_intent_id: `trial_${Date.now()}`
});
```

**3. Modificar `usePlan.ts` para verificar expiração:**
```typescript
// Verificar se trial expirou
if (payment.is_trial && payment.trial_ends_at) {
  const trialEnd = new Date(payment.trial_ends_at);
  if (trialEnd < new Date()) {
    setHasActivePlan(false);
    return;
  }
}
```

**4. Mostrar contador de dias restantes:**
```typescript
const daysRemaining = Math.ceil(
  (new Date(trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)
);

// Exibir banner: "Restam X dias do seu trial gratuito"
```

---

### **Opção 3: Acesso Gratuito Permanente para Perfis Específicos**

Dar acesso gratuito baseado no role do usuário.

#### Vantagens:
✅ Simples de implementar
✅ Útil para parceiros, beta testers, etc.

#### Como Implementar:

**1. Modificar `usePlan.ts`:**
```typescript
// Adicionar roles com acesso gratuito
const FREE_ACCESS_ROLES = ['Administradora', 'Beta Tester', 'Partner'];

if (profile && FREE_ACCESS_ROLES.includes(profile.role)) {
  setHasActivePlan(true);
  setCurrentPlan({
    id: "free_access",
    name: "Acesso Gratuito",
    description: "Acesso completo às funcionalidades",
    price: 0,
    features: [],
    max_condos: null, // Ilimitado
    max_admins: null,
    max_units: null
  });
  return;
}
```

**2. Adicionar campo no profile:**
```sql
ALTER TABLE profiles 
ADD COLUMN has_free_access BOOLEAN DEFAULT false;
```

---

## Recomendação Final

**Use a Opção 1 (Plano Gratuito com Limitações)** porque:

1. ✅ Oferece melhor experiência ao usuário
2. ✅ Facilita monetização futura
3. ✅ Permite rastreamento de uso
4. ✅ Componente `UpgradeBanner` já existe no código
5. ✅ Lógica de verificação de limites já está parcialmente implementada

### Passos Imediatos:

1. **Criar plano gratuito** via Admin → Planes
2. **Modificar processo de registro** para ativar plano gratuito automaticamente
3. **Adicionar verificações de limite** nos componentes principais
4. **Testar fluxo completo** de registro → uso → upgrade

### Arquivos a Modificar:

- `src/components/AuthForm.tsx` - Ativar plano após registro
- `src/pages/manager/Condominios.tsx` - Verificar limite de condomínios
- `src/pages/manager/Administradoras.tsx` - Verificar limite de administradoras
- `src/pages/manager/Unidades.tsx` - Verificar limite de unidades
- `src/components/UpgradeBanner.tsx` - Já existe, usar quando atingir limites

---

## Exemplo de Implementação Completa

### 1. Criar Edge Function para ativar plano gratuito:

```typescript
// supabase/functions/activate-free-plan/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const FREE_PLAN_ID = "UUID_DO_PLANO_GRATUITO"; // Obter do banco

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const authHeader = req.headers.get("Authorization")!;
  const { data: { user } } = await supabaseAdmin.auth.getUser(
    authHeader.replace("Bearer ", "")
  );

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401
    });
  }

  // Verificar se já tem plano ativo
  const { data: existing } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);

  if (existing && existing.length > 0) {
    return new Response(JSON.stringify({ ok: true, status: "already_active" }), {
      status: 200
    });
  }

  // Ativar plano gratuito
  await supabaseAdmin.from("payments").insert({
    user_id: user.id,
    plan_id: FREE_PLAN_ID,
    plan: "Plano Gratuito",
    amount: 0,
    currency: "EUR",
    status: "active",
    stripe_payment_intent_id: `free_${Date.now()}`
  });

  await supabaseAdmin
    .from("profiles")
    .update({ subscription_status: "active" })
    .eq("id", user.id);

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
```

### 2. Chamar após registro bem-sucedido:

```typescript
// Em AuthForm.tsx ou após criar usuário
await supabase.functions.invoke("activate-free-plan");
```

---

## Considerações Importantes

1. **Migração de Usuários Existentes**: Decidir se usuários atuais recebem plano gratuito automaticamente
2. **Comunicação Clara**: Informar limites do plano gratuito na UI
3. **Processo de Upgrade**: Facilitar upgrade para planos pagos
4. **Métricas**: Rastrear conversão de free → paid
5. **Suporte**: Definir nível de suporte para plano gratuito

---

## Perguntas para Decisão

Antes de implementar, responda:

1. Qual limite de condomínios no plano gratuito? (Sugestão: 1)
2. Qual limite de administradoras? (Sugestão: 1)
3. Qual limite de unidades? (Sugestão: 10-20)
4. Quais funcionalidades restringir? (Ex: relatórios avançados, integrações)
5. Ativar automaticamente no registro ou exigir ação do usuário?
6. Permitir trial de planos pagos após plano gratuito?

---

**Próximos Passos**: Defina os limites desejados e posso implementar a solução completa!

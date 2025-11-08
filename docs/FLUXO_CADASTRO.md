# Fluxo de Cadastro e Hierarquia de Dados

## 🎯 Fluxo Completo

### 1. Landing Page → Seleção de Plano
- Usuário acessa landing page
- Seleciona um plano (gratuito ou pago)
- Plano é salvo em `sessionStorage` com chave `selected_plan`

### 2. Cadastro
- Redireciona para `/registrarse`
- Usuário preenche dados de cadastro
- Sistema verifica o plano selecionado

### 3. Redirecionamento Pós-Cadastro

#### Plano Gratuito:
- ✅ Cria registro de pagamento com `status: 'active'`
- ✅ Redireciona direto para `/gestor`

#### Plano Pago:
- ✅ Cria registro de pagamento com `status: 'pending'`
- ✅ Redireciona para sessão do Stripe
- Após pagamento: Stripe webhook atualiza status para `active`

### 4. Dashboard do Gestor
- Usuário entra em `/gestor`
- **Primeira vez:** Não tem administradoras cadastradas
- Sistema mostra mensagem: "Crie sua primeira administradora"

### 5. Cadastro de Administradora
- Usuário vai em **Administradoras** no menu
- Clica em "Nova Administradora"
- Preenche dados e salva
- **Automático:** Primeira administradora criada é **automaticamente selecionada**
- Sistema salva em:
  - `localStorage.setItem("activeAdministratorId", id)`
  - `profiles.selected_administrator_id = id`

### 6. Gestão de Dados
Após ter administradora selecionada, pode cadastrar:

## 📊 Hierarquia de Dados

```
USER (auth.users)
    ↓
ADMINISTRADORA (administrators)
    ↓ tenant_id / user_id
    ↓
CONDOMÍNIOS (condominiums)
    ↓ administrator_id
    ↓
BLOCOS (blocks)
    ↓ condominium_id
    ↓
UNIDADES (units)
    ↓ block_id
    ↓
├── MORADORES (residents)
│   └── unit_id
├── PETS (pets)
│   └── unit_id
└── VEÍCULOS (vehicles)
    └── unit_id

ÁREAS COMUNS (common_areas)
    └── condominium_id

COMUNICADOS (communications)
    └── condominium_id
```

## 🔑 Regras de Negócio

### Administradora
- **Um usuário pode ter múltiplas administradoras** (dependendo do plano)
- **Apenas uma administradora ativa por vez** (contexto de trabalho)
- **Uma administradora pode ter N condomínios** (sem limite específico, controlado pelo plano)

### Condomínios
- Sempre pertencem a **uma administradora**
- Filtrados automaticamente pela administradora ativa
- Quantidade limitada pelo plano

### Blocos
- Sempre pertencem a **um condomínio**
- Herdám o contexto da administradora via condomínio

### Unidades
- Sempre pertencem a **um bloco**
- Herdam o contexto da administradora via bloco → condomínio

### Moradores, Pets, Veículos
- Sempre pertencem a **uma unidade**
- Herdam todo o contexto hierárquico

### Áreas Comuns e Comunicados
- Pertencem diretamente a **um condomínio**
- Herdam o contexto da administradora via condomínio

## 🎨 Interface

### Header (ManagerHeader)
- Sempre visível no topo
- Mostra **dropdown de seleção de administradora**
- Se não há administradoras: mostra "Sin administradoras" (desabilitado)
- Se há administradoras: mostra nome da ativa e permite trocar

### Menu Lateral
- **Administradoras** → Lista e CRUD de administradoras
- **Condomínios** → Lista e CRUD de condomínios (da administradora ativa)
- **Blocos** → Lista e CRUD de blocos (filtrados por administradora)
- **Unidades** → Lista e CRUD de unidades (filtradas por administradora)
- **Moradores** → Lista e CRUD de moradores (filtrados por administradora)
- **Pets** → Lista e CRUD de pets (filtrados por administradora)
- **Veículos** → Lista e CRUD de veículos (filtrados por administradora)
- **Áreas Comuns** → Lista e CRUD (filtradas por administradora)
- **Comunicados** → Lista e CRUD (filtrados por administradora)

### Páginas de Listagem
Quando **não há administradora selecionada**:
- Mostra mensagem amigável
- Botão para ir criar primeira administradora

Quando **há administradora selecionada**:
- Mostra dados filtrados
- Permite criar novos registros (com administrator_id automático)

## 🔒 Segurança (RLS)

### Políticas Supabase

**Administradoras:**
```sql
-- Ver suas próprias administradoras
user_id = auth.uid() OR responsible_id = auth.uid() OR tenant_id = auth.uid()
```

**Condomínios:**
```sql
-- Ver condomínios de suas administradoras
EXISTS (
  SELECT 1 FROM administrators
  WHERE administrators.id = condominiums.administrator_id
  AND (administrators.user_id = auth.uid() 
    OR administrators.responsible_id = auth.uid()
    OR administrators.tenant_id = auth.uid())
)
```

**Blocos, Unidades, etc:**
- Cascata via join com condominiums

## ✅ Checklist de Implementação

- [x] Landing page salva plano em sessionStorage
- [x] SignUp verifica plano e cria payment
- [x] Redirecionamento correto (gratuito → /gestor, pago → Stripe)
- [x] ManagerHeader mostra seletor de administradora
- [x] Context gerencia administradora ativa (localStorage + banco)
- [x] Primeira administradora é auto-selecionada ao criar
- [ ] Todas queries filtram por administrator_id (via joins)
- [ ] Todas criações incluem administrator_id automaticamente
- [ ] Mensagens amigáveis quando não há administradora
- [ ] RLS configurado corretamente em todas tabelas

---

**Última atualização:** 8 de novembro de 2025

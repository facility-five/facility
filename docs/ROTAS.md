# Relação de Páginas/Rotas da Aplicação

## 🌐 Rotas Públicas (Sem autenticação)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | Index | Página inicial |
| `/landing-v2` | LandingPageV2 | Landing page versão 2 |
| `/contacto` | Contacto | Página de contato |
| `/login` | Login | Página de login |
| `/registrarse` | SignUp | Cadastro - escolha de plano |
| `/registrarse/datos` | SignUpDetails | Cadastro - dados do usuário |
| `/recuperar-senha` | ForgotPassword | Recuperação de senha |
| `/nova-senha` | ResetPassword | Redefinir senha (PT) |
| `/nueva-contrasena` | ResetPassword | Redefinir senha (ES) |
| `/planes` | Plans | Seleção de planos |
| `/email-confirmation` | EmailConfirmation | Confirmação de email |
| `/acesso-morador` | ResidentAccess | Acesso para moradores |
| `/test-toast` | TestToast | Página de teste de toasts |
| `/auth/callback` | AuthCallback | Callback de autenticação |

---

## 👔 Rotas do Gestor (Roles: Administradora, Administrador, Funcionario)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/gestor` | ManagerDashboard | Dashboard principal |
| `/gestor-dashboard` | ManagerDashboard | Dashboard (rota alternativa) |
| `/gestor/administradoras` | ManagerAdministradoras | Gestão de administradoras |
| `/gestor/condominios` | ManagerCondominios | Gestão de condomínios |
| `/gestor/blocos` | ManagerBlocos | Gestão de blocos (apenas Administradora/Funcionario) |
| `/gestor/unidades` | ManagerUnidades | Gestão de unidades (apenas Administradora/Funcionario) |
| `/gestor/residentes` | ManagerResidentes | Gestão de residentes |
| `/gestor/mascotas` | ManagerMascotas | Gestão de pets (apenas Administradora/Funcionario) |
| `/gestor/vehiculos` | ManagerVehiculos | Gestão de veículos |
| `/gestor/areas-comuns` | ManagerAreasComuns | Gestão de áreas comuns |
| `/gestor/reservas` | ManagerReservas | Gestão de reservas |
| `/gestor/comunicados` | ManagerComunicados | Gestão de comunicados |
| `/gestor/mi-plan` | MiPlan | Detalhes do plano |
| `/gestor/configuracoes` | ManagerConfiguracoes | Configurações |

**Permissões especiais:**
- Rotas `/gestor/blocos`, `/gestor/unidades` e `/gestor/mascotas` são acessíveis apenas para roles `Administradora` e `Funcionario`
- Demais rotas são acessíveis para `Administradora`, `Administrador` e `Funcionario`

---

## 🏢 Rotas do Síndico (Role: Sindico)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/sindico` | SyndicDashboard | Dashboard do síndico |

---

## 🏠 Rotas do Morador (Role: Morador)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/morador-dashboard` | ResidentDashboard | Dashboard do morador |
| `/morador/reservas` | ResidentReservations | Minhas reservas |
| `/morador/comunicados` | ResidentCommunications | Comunicados |
| `/morador/solicitudes` | ResidentRequests | Solicitações |
| `/morador/unidade` | ResidentUnit | Minha unidade |
| `/morador/documentos` | ResidentDocuments | Documentos |
| `/morador/perfil` | ResidentProfile | Meu perfil |
| `/morador/configuracoes` | ResidentSettings | Configurações |

---

## 🔧 Rotas do Admin SaaS (Role: Admin do SaaS)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/admin` | Dashboard | Dashboard admin |
| `/admin/minha-conta` | MyAccount | Minha conta |
| `/admin/administradoras` | Administrators | Administradoras cadastradas |
| `/admin/condominios` | Condominios | Todos os condomínios |
| `/admin/bloques` | Blocks | Todos os blocos |
| `/admin/unidades` | Units | Todas as unidades |
| `/admin/areas-comunes` | CommonAreas | Áreas comuns |
| `/admin/usuarios` | Users | Gestão de usuários |
| `/admin/moradores` | ResidentsManagement | Gestão de moradores |
| `/admin/planes` | AdminPlans | Gestão de planos |
| `/admin/pagos` | Payments | Pagamentos |
| `/admin/pagina` | LandingPageSettings | Configurar landing page |
| `/admin/clientes-potenciales` | Leads | Leads/clientes potenciais |
| `/admin/notificacoes` | Notifications | Notificações |
| `/admin/configuracoes` | Settings | Configurações |
| `/admin/soporte` | Soporte | Suporte |
| `/admin/tareas` | Tareas | Tarefas |
| `/admin/design-system` | DesignSystem | Sistema de design |

---

## ⚙️ Rotas Especiais

| Rota | Componente | Descrição | Permissão |
|------|-----------|-----------|-----------|
| `/registrar-administradora` | RegisterAdministrator | Registro de administradora | Role: Administradora (allowWithoutProfile) |
| `*` | NotFound | Página 404 - não encontrada | Pública |

---

## 📊 Resumo

- **Total de rotas**: 60+
- **Rotas públicas**: 13
- **Rotas do Gestor**: 14
- **Rotas do Síndico**: 1
- **Rotas do Morador**: 8
- **Rotas do Admin SaaS**: 19
- **Rotas especiais**: 2

---

## 🔐 Sistema de Proteção de Rotas

Todas as rotas protegidas utilizam o componente `<ProtectedRoute>` que verifica:
- Autenticação do usuário
- Role/permissão do usuário
- Existência de perfil (exceto quando `allowWithoutProfile` está habilitado)

---

## ⚡ Otimizações

- **Lazy Loading**: Todas as rotas protegidas utilizam `React.lazy()` para carregamento sob demanda
- **Suspense**: Fallback com `<SuspenseFallback />` durante o carregamento de componentes
- **Code Splitting**: Cada rota é um bundle separado, melhorando o tempo de carregamento inicial
- **Context Wrapping**: Rotas do Gestor são envolvidas pelo `<ManagerAdministradorasProvider>` para gestão de estado global

---

## 📁 Localização dos Arquivos

```
src/
├── App.tsx                          # Definição de todas as rotas
├── pages/
│   ├── Index.tsx                    # /
│   ├── Login.tsx                    # /login
│   ├── SignUp.tsx                   # /registrarse
│   ├── Plans.tsx                    # /planes
│   ├── ManagerDashboard.tsx         # /gestor
│   ├── ResidentDashboard.tsx        # /morador-dashboard
│   ├── RegisterAdministrator.tsx    # /registrar-administradora
│   ├── NotFound.tsx                 # *
│   ├── admin/                       # Páginas do Admin SaaS
│   │   ├── Dashboard.tsx
│   │   ├── Administrators.tsx
│   │   └── ...
│   ├── manager/                     # Páginas do Gestor
│   │   ├── Administradoras.tsx
│   │   ├── Condominios.tsx
│   │   └── ...
│   ├── resident/                    # Páginas do Morador
│   │   ├── Reservations.tsx
│   │   ├── Communications.tsx
│   │   └── ...
│   └── sindico/                     # Páginas do Síndico
│       └── Dashboard.tsx
└── components/
    └── ProtectedRoute.tsx           # Componente de proteção de rotas
```

---

## 🚀 Fluxo de Navegação

### Novo Usuário
1. `/` ou `/landing-v2` → Landing page
2. `/planes` → Escolha do plano
3. `/registrarse` → Cadastro inicial
4. `/registrarse/datos` → Completar dados
5. `/email-confirmation` → Confirmar email
6. `/registrar-administradora` → Criar administradora (se role = Administradora)
7. `/gestor` → Dashboard

### Usuário Existente
1. `/login` → Login
2. Redirecionamento automático baseado na role:
   - **Administradora/Administrador/Funcionario**: `/gestor`
   - **Morador**: `/morador-dashboard`
   - **Síndico**: `/sindico`
   - **Admin do SaaS**: `/admin`

### Recuperação de Senha
1. `/recuperar-senha` → Solicitar reset
2. Email com link
3. `/nova-senha` ou `/nueva-contrasena` → Definir nova senha
4. `/login` → Login com nova senha

---

**Última atualização**: Novembro 2025

/**
 * Utilitários para cadastro de moradores
 * Funções compartilhadas entre diferentes modais de cadastro
 */

/**
 * Gera um código único para residente
 */
export const generateResidentCode = (): string => {
  return `RE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

/**
 * Separa nome completo em primeiro nome e sobrenome
 */
export const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return { firstName, lastName };
};

/**
 * Valida se um email é válido (regex simples)
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Normaliza dados do formulário de residente antes de salvar
 */
export const normalizeResidentData = (values: any) => {
  return {
    full_name: values.full_name?.trim() || '',
    email: values.email?.trim() || null,
    phone: values.phone?.trim() || null,
    document: values.document?.trim() || null,
    birth_date: values.birth_date || null,
    entry_date: values.entry_date || null,
    exit_date: values.exit_date || null,
    is_owner: Boolean(values.is_owner),
    is_tenant: Boolean(values.is_tenant),
    status: values.status || 'active',
    condo_id: values.condo_id,
    block_id: values.block_id || null,
    unit_id: values.unit_id || null,
    notes: values.notes?.trim() || null,
  };
};

/**
 * Tipos de residente padronizados
 */
export const RESIDENT_TYPES = {
  OWNER: 'owner',
  TENANT: 'tenant', 
  DEPENDENT: 'dependent'
} as const;

/**
 * Status de residente padronizados
 */
export const RESIDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

/**
 * Configurações padrão para novos moradores
 */
export const DEFAULT_RESIDENT_SETTINGS = {
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  communication_notifications: true,
  reservation_notifications: true,
  maintenance_notifications: true,
  profile_visibility: 'residents_only' as const,
  theme_preference: 'system' as const,
  language: 'pt' as const,
  timezone: 'America/Sao_Paulo' as const,
};

/**
 * Labels padronizados em português
 */
export const RESIDENT_LABELS = {
  // Campos básicos
  FULL_NAME: 'Nome completo',
  EMAIL: 'Email',
  PHONE: 'Telefone',
  DOCUMENT: 'Documento',
  BIRTH_DATE: 'Data de nascimento',
  ENTRY_DATE: 'Data de entrada',
  EXIT_DATE: 'Data de saída',
  
  // Localização
  CONDOMINIUM: 'Condomínio',
  BLOCK: 'Bloco',
  UNIT: 'Unidade',
  
  // Tipos
  OWNER: 'Proprietário',
  TENANT: 'Inquilino',
  DEPENDENT: 'Dependente',
  
  // Status
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  
  // Outros
  NOTES: 'Observações',
  STATUS: 'Status',
  
  // Placeholders
  PLACEHOLDER_EMAIL: 'email@exemplo.com',
  PLACEHOLDER_PHONE: '(11) 99999-9999',
  PLACEHOLDER_DOCUMENT: 'CPF, RG ou Passaporte',
  PLACEHOLDER_NOTES: 'Observações adicionais sobre o morador',
  
  // Seletores
  SELECT_CONDOMINIUM: 'Selecione o condomínio',
  SELECT_BLOCK: 'Selecione o bloco',
  SELECT_UNIT: 'Selecione a unidade',
  SELECT_STATUS: 'Selecione o status',
  
  // Estados vazios
  NO_CONDOMINIUMS: 'Nenhum condomínio disponível',
  NO_BLOCKS: 'Nenhum bloco disponível',
  NO_UNITS: 'Nenhuma unidade disponível',
  
  // Ações
  CANCEL: 'Cancelar',
  SAVE: 'Salvar',
  CREATE: 'Cadastrar',
  EDIT: 'Editar',
  UPDATE: 'Atualizar',
  
  // Modais
  CREATE_TITLE: 'Cadastrar Novo Morador',
  EDIT_TITLE: 'Editar Morador',
  INVITE_TITLE: 'Convidar Novo Morador',
  
  // Mensagens
  SUCCESS_CREATE: 'Morador cadastrado com sucesso!',
  SUCCESS_UPDATE: 'Morador atualizado com sucesso!',
  SUCCESS_INVITE: 'Convite enviado com sucesso!',
  SUCCESS_WITH_EMAIL: 'Email de boas-vindas enviado',
  ERROR_SAVE: 'Erro ao salvar morador',
  ERROR_EMAIL_SEND: 'Erro ao enviar email',
  
  // Informações
  AUTO_USER_CREATION: 'Criação automática de conta',
  AUTO_USER_INFO: 'Se um email for fornecido, uma conta de usuário será criada automaticamente e um email de boas-vindas será enviado com instruções para definir a senha.',
} as const;
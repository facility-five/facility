/**
 * Schemas de validação reutilizáveis para toda a aplicação
 * Baseados em Zod para validação robusta e type-safe
 */

import { z } from "zod";

// Validações comuns
export const emailSchema = z
  .string()
  .min(1, "O e-mail é obrigatório.")
  .email("Por favor, insira um e-mail válido.")
  .max(100, "O e-mail não pode ter mais de 100 caracteres.")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "O formato do e-mail é inválido.")
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(1, "A senha é obrigatória.")
  .min(6, "A senha deve ter pelo menos 6 caracteres.")
  .max(128, "A senha não pode ter mais de 128 caracteres.");

export const strongPasswordSchema = z
  .string()
  .min(1, "A senha é obrigatória.")
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(128, "A senha não pode ter mais de 128 caracteres.")
  .regex(/.*[a-z].*/, "A senha deve conter pelo menos uma letra minúscula.")
  .regex(/.*[A-Z].*/, "A senha deve conter pelo menos uma letra maiúscula.")
  .regex(/.*\d.*/, "A senha deve conter pelo menos um número.")
  .regex(/.*[!@#$%^&*(),.?\":{}|<>].*/, "A senha deve conter pelo menos um caractere especial.");

export const nameSchema = z
  .string()
  .min(1, "O nome é obrigatório.")
  .min(2, "O nome deve ter pelo menos 2 caracteres.")
  .max(50, "O nome não pode ter mais de 50 caracteres.")
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "O nome deve conter apenas letras e espaços.")
  .trim();

export const phoneSchema = z
  .string()
  .min(1, "O telefone é obrigatório.")
  .regex(/^\+?[\d\s\-\(\)]+$/, "O formato do telefone é inválido.")
  .min(10, "O telefone deve ter pelo menos 10 dígitos.")
  .max(20, "O telefone não pode ter mais de 20 caracteres.");

export const documentSchema = z
  .string()
  .min(1, "O documento é obrigatório.")
  .regex(/^\d+$/, "O documento deve conter apenas números.")
  .refine((val) => val.length === 11 || val.length === 14, {
    message: "Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).",
  });

export const cnpjSchema = z
  .string()
  .min(1, "O CNPJ é obrigatório.")
  .regex(/^\d+$/, "O CNPJ deve conter apenas números.")
  .length(14, "O CNPJ deve ter 14 dígitos.");

export const cpfSchema = z
  .string()
  .min(1, "O CPF é obrigatório.")
  .regex(/^\d+$/, "O CPF deve conter apenas números.")
  .length(11, "O CPF deve ter 11 dígitos.");

// Schemas de formulário
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, "A confirmação de senha é obrigatória.")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
}).refine((data) => !data.email.includes(data.firstName.toLowerCase()) && !data.email.includes(data.lastName.toLowerCase()), {
  message: "Por segurança, o e-mail não deve conter seu nome ou sobrenome.",
  path: ["email"],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, "A confirmação de senha é obrigatória.")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

// Schemas de endereço
export const addressSchema = z.object({
  street: z.string().min(1, "A rua é obrigatória.").max(200, "A rua não pode ter mais de 200 caracteres."),
  number: z.string().min(1, "O número é obrigatório.").max(20, "O número não pode ter mais de 20 caracteres."),
  complement: z.string().max(100, "O complemento não pode ter mais de 100 caracteres.").optional(),
  neighborhood: z.string().min(1, "O bairro é obrigatório.").max(100, "O bairro não pode ter mais de 100 caracteres."),
  city: z.string().min(1, "A cidade é obrigatória.").max(100, "A cidade não pode ter mais de 100 caracteres."),
  state: z.string().min(2, "O estado é obrigatório.").max(2, "O estado deve ter 2 caracteres."),
  postalCode: z.string().min(1, "O CEP é obrigatório.").regex(/^\d{5}-?\d{3}$/, "O formato do CEP é inválido."),
  country: z.string().min(1, "O país é obrigatório.").max(50, "O país não pode ter mais de 50 caracteres."),
});

// Schemas de condomínio
export const condominiumSchema = z.object({
  name: z.string().min(1, "O nome do condomínio é obrigatório.").max(200, "O nome não pode ter mais de 200 caracteres."),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.partial(),
  type: z.enum(["residencial", "comercial", "misto"]).default("residencial"),
});

// Schemas de unidade
export const unitSchema = z.object({
  number: z.string().min(1, "O número da unidade é obrigatório.").max(20, "O número não pode ter mais de 20 caracteres."),
  floor: z.number().int().min(0, "O andar deve ser um número positivo.").optional(),
  area: z.number().positive("A área deve ser um número positivo.").optional(),
  bedrooms: z.number().int().min(0, "O número de quartos deve ser positivo.").optional(),
  bathrooms: z.number().int().min(0, "O número de banheiros deve ser positivo.").optional(),
  parkingSpots: z.number().int().min(0, "O número de vagas deve ser positivo.").optional(),
  type: z.enum(["residencial", "comercial"]).default("residencial"),
});

// Schemas de área comum
export const commonAreaSchema = z.object({
  name: z.string().min(1, "O nome da área comum é obrigatório.").max(100, "O nome não pode ter mais de 100 caracteres."),
  description: z.string().max(500, "A descrição não pode ter mais de 500 caracteres.").optional(),
  type: z.enum(["lazer", "esporte", "servico", "outro"]).default("lazer"),
  capacity: z.number().int().min(1, "A capacidade deve ser pelo menos 1.").max(1000, "A capacidade não pode ser maior que 1000."),
  hourlyRate: z.number().min(0, "A taxa horária não pode ser negativa.").optional(),
  dailyRate: z.number().min(0, "A taxa diária não pode ser negativa.").optional(),
  rules: z.string().max(2000, "As regras não podem ter mais de 2000 caracteres.").optional(),
});

// Schemas de reserva
export const reservationSchema = z.object({
  commonAreaId: z.string().min(1, "A área comum é obrigatória."),
  date: z.string().min(1, "A data é obrigatória."),
  startTime: z.string().min(1, "O horário de início é obrigatório."),
  endTime: z.string().min(1, "O horário de término é obrigatório."),
  purpose: z.string().min(10, "A finalidade deve ter pelo menos 10 caracteres.").max(500, "A finalidade não pode ter mais de 500 caracteres."),
  guests: z.number().int().min(0, "O número de convidados não pode ser negativo.").max(100, "O número de convidados não pode ser maior que 100.").optional(),
}).refine((data) => {
  const start = new Date(`${data.date}T${data.startTime}`);
  const end = new Date(`${data.date}T${data.endTime}`);
  return end > start;
}, {
  message: "O horário de término deve ser posterior ao horário de início.",
  path: ["endTime"],
});

// Schemas de pet
export const petSchema = z.object({
  name: z.string().min(1, "O nome do pet é obrigatório.").max(50, "O nome não pode ter mais de 50 caracteres."),
  species: z.enum(["dog", "cat", "bird", "other"]),
  breed: z.string().max(100, "A raça não pode ter mais de 100 caracteres.").optional(),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  weight: z.number().positive("O peso deve ser um número positivo.").optional(),
  color: z.string().max(50, "A cor não pode ter mais de 50 caracteres.").optional(),
  birthDate: z.string().optional(),
  vaccinated: z.boolean().default(false),
  microchipped: z.boolean().default(false),
  notes: z.string().max(1000, "As observações não podem ter mais de 1000 caracteres.").optional(),
});

// Schemas de comunicação
export const communicationSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres.").max(200, "O título não pode ter mais de 200 caracteres."),
  content: z.string().min(20, "O conteúdo deve ter pelo menos 20 caracteres.").max(5000, "O conteúdo não pode ter mais de 5000 caracteres."),
  type: z.enum(["announcement", "maintenance", "emergency", "general"]).default("announcement"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  targetAudience: z.enum(["all", "residents", "owners", "managers"]).default("all"),
  scheduledFor: z.string().optional(),
  expiresAt: z.string().optional(),
}).refine((data) => {
  if (data.scheduledFor && data.expiresAt) {
    return new Date(data.expiresAt) > new Date(data.scheduledFor);
  }
  return true;
}, {
  message: "A data de expiração deve ser posterior à data de agendamento.",
  path: ["expiresAt"],
});

// Schemas de administradora
export const administratorSchema = z.object({
  name: z.string().min(1, "O nome da administradora é obrigatório.").max(200, "O nome não pode ter mais de 200 caracteres."),
  document: documentSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema.partial().optional(),
});

// Schemas de morador
export const residentSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  isOwner: z.boolean().default(false),
  moveInDate: z.string().optional(),
});

// Schemas de configurações
export const settingsSchema = z.object({
  systemName: z.string().min(1, "O nome do sistema é obrigatório.").max(100, "O nome não pode ter mais de 100 caracteres."),
  systemEmail: emailSchema,
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "A cor primária deve estar no formato hexadecimal.").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "A cor secundária deve estar no formato hexadecimal.").optional(),
  logo: z.string().url("A logo deve ser uma URL válida.").optional(),
  favicon: z.string().url("O favicon deve ser uma URL válida.").optional(),
});

// Funções utilitárias
export const validateDocument = (document: string): boolean => {
  const cleanDoc = document.replace(/\D/g, '');
  return cleanDoc.length === 11 || cleanDoc.length === 14;
};

export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return strongPasswordSchema.safeParse(password).success;
};

export const formatDocument = (document: string): string => {
  const cleanDoc = document.replace(/\D/g, '');
  if (cleanDoc.length === 11) {
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleanDoc.length === 14) {
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return document;
};

export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};
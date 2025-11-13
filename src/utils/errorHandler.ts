/**
 * Sistema de tratamento de erros com retry mechanisms
 * Implementa estratégias robustas para lidar com falhas de API
 */

import { PostgrestError } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

// Tipos de erro
export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN'
}

// Interface para configuração de retry
export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: ErrorType[];
  onRetry?: (error: Error, attempt: number) => void;
  onFinalError?: (error: Error) => void;
}

// Interface para erro customizado
export interface AppError extends Error {
  type: ErrorType;
  code?: string;
  details?: any;
  retryable?: boolean;
  timestamp: Date;
}

// Configuração padrão de retry
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 30000, // 30 segundos
  backoffMultiplier: 2,
  retryableErrors: [
    ErrorType.NETWORK,
    ErrorType.TIMEOUT,
    ErrorType.RATE_LIMIT,
    ErrorType.SERVER_ERROR
  ],
  onRetry: () => {},
  onFinalError: () => {}
};

// Classe para criar erros customizados
export class CustomAppError extends Error implements AppError {
  type: ErrorType;
  code?: string;
  details?: any;
  retryable: boolean;
  timestamp: Date;

  constructor(
    message: string,
    type: ErrorType,
    code?: string,
    details?: any,
    retryable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.retryable = retryable;
    this.timestamp = new Date();
  }
}

// Função para classificar erros do Supabase
export function classifySupabaseError(error: PostgrestError | Error): ErrorType {
  if ('code' in error) {
    const code = error.code;
    
    // Erros de autenticação
    if (code.startsWith('PGRST1')) return ErrorType.AUTHENTICATION;
    
    // Erros de validação
    if (code.startsWith('23')) return ErrorType.VALIDATION;
    
    // Erros de not found
    if (code === 'PGRST116') return ErrorType.NOT_FOUND;
    
    // Erros de conflito
    if (code.startsWith('23') && code.includes('23505')) return ErrorType.CONFLICT;
    
    // Erros de servidor
    if (code.startsWith('PGRST3') || code.startsWith('XX')) return ErrorType.SERVER_ERROR;
    
    // Rate limiting
    if (code === 'PGRST301') return ErrorType.RATE_LIMIT;
  }

  // Erros de rede
  if (error.message.includes('Network') || error.message.includes('fetch')) {
    return ErrorType.NETWORK;
  }

  // Timeout
  if (error.message.includes('timeout') || error.message.includes('Timeout')) {
    return ErrorType.TIMEOUT;
  }

  // Erros de autenticação
  if (error.message.includes('JWT') || error.message.includes('auth')) {
    return ErrorType.AUTHENTICATION;
  }

  return ErrorType.UNKNOWN;
}

// Função para criar erro customizado a partir de erro do Supabase
export function createAppError(error: PostgrestError | Error): AppError {
  const type = classifySupabaseError(error);
  const code = 'code' in error ? error.code : undefined;
  const details = 'details' in error ? error.details : undefined;
  const retryable = type !== ErrorType.VALIDATION && type !== ErrorType.AUTHENTICATION;

  return new CustomAppError(
    error.message,
    type,
    code,
    details,
    retryable
  );
}

// Função de delay exponencial
function exponentialBackoff(attempt: number, config: Required<RetryConfig>): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelay
  );
  
  // Adicionar jitter para evitar thundering herd
  const jitter = Math.random() * 0.1 * delay;
  return Math.floor(delay + jitter);
}

// Função principal de retry com backoff exponencial
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
    try {
      logger.debug(`Attempting operation (attempt ${attempt}/${finalConfig.maxRetries + 1})`);
      const result = await fn();
      
      if (attempt > 1) {
        logger.info(`Operation succeeded after ${attempt} attempts`);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      const appError = error instanceof CustomAppError ? error : createAppError(error as any);
      
      logger.error(`Operation failed (attempt ${attempt})`, {
        error: appError.message,
        type: appError.type,
        code: appError.code,
        retryable: appError.retryable
      });

      // Verificar se devemos tentar novamente
      const isLastAttempt = attempt === finalConfig.maxRetries + 1;
      const shouldRetry = appError.retryable && 
        finalConfig.retryableErrors.includes(appError.type) && 
        !isLastAttempt;

      if (!shouldRetry) {
        finalConfig.onFinalError(appError);
        throw appError;
      }

      // Executar callback de retry
      finalConfig.onRetry(appError, attempt);

      // Aguardar antes da próxima tentativa
      const delay = exponentialBackoff(attempt, finalConfig);
      logger.debug(`Waiting ${delay}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Isso nunca deve acontecer, mas garantimos que temos um erro para lançar
  throw lastError || new CustomAppError('Max retries exceeded', ErrorType.UNKNOWN);
}

// Função para tratar erros de forma consistente
export function handleError(error: Error, context?: string): AppError {
  const appError = error instanceof CustomAppError ? error : createAppError(error);
  
  logger.error(`Error handled${context ? ` in ${context}` : ''}`, {
    message: appError.message,
    type: appError.type,
    code: appError.code,
    details: appError.details,
    timestamp: appError.timestamp
  });

  return appError;
}

// Função para obter mensagem amigável para o usuário
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Erro de conexão. Por favor, verifique sua internet e tente novamente.';
    
    case ErrorType.TIMEOUT:
      return 'A requisição demorou muito. Por favor, tente novamente.';
    
    case ErrorType.RATE_LIMIT:
      return 'Muitas requisições. Por favor, aguarde um momento e tente novamente.';
    
    case ErrorType.AUTHENTICATION:
      return 'Erro de autenticação. Por favor, faça login novamente.';
    
    case ErrorType.VALIDATION:
      return 'Dados inválidos. Por favor, verifique as informações inseridas.';
    
    case ErrorType.NOT_FOUND:
      return 'Registro não encontrado.';
    
    case ErrorType.CONFLICT:
      return 'Conflito com dados existentes. Por favor, verifique e tente novamente.';
    
    case ErrorType.SERVER_ERROR:
      return 'Erro no servidor. Por favor, tente novamente mais tarde.';
    
    default:
      return 'Ocorreu um erro. Por favor, tente novamente.';
  }
}

// Função para verificar se devemos mostrar mensagem de erro técnica
export function shouldShowTechnicalDetails(error: AppError): boolean {
  return import.meta.env.DEV && error.type === ErrorType.SERVER_ERROR;
}

// Wrapper para queries do Supabase com retry automático
export async function supabaseQueryWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  context?: string,
  retryConfig?: RetryConfig
): Promise<T> {
  return withRetry(async () => {
    const { data, error } = await queryFn();
    
    if (error) {
      const appError = createAppError(error);
      logger.error(`Supabase query error${context ? ` in ${context}` : ''}`, {
        message: appError.message,
        type: appError.type,
        code: appError.code,
        details: appError.details
      });
      throw appError;
    }
    
    if (data === null) {
      throw new CustomAppError('No data returned', ErrorType.NOT_FOUND, 'NO_DATA');
    }
    
    return data;
  }, retryConfig);
}

// Função para limpar erros de autenticação e redirecionar
export function handleAuthError(error: AppError): void {
  if (error.type === ErrorType.AUTHENTICATION) {
    logger.warn('Authentication error detected, clearing session');
    
    // Limpar dados de autenticação
    sessionStorage.clear();
    localStorage.clear();
    
    // Redirecionar para login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

// Exportar tipos e funções utilitárias
export const ErrorUtils = {
  classifySupabaseError,
  createAppError,
  handleError,
  getUserFriendlyMessage,
  shouldShowTechnicalDetails,
  supabaseQueryWithRetry,
  handleAuthError,
  withRetry
};
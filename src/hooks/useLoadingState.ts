/**
 * Hook para gerenciamento consistente de estado de loading
 * Implementa estratégias de otimização e prevenção de flickering
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Configuração de loading
export interface LoadingConfig {
  minLoadingTime?: number; // Tempo mínimo de loading (ms)
  delayBeforeLoading?: number; // Delay antes de mostrar loading (ms)
  preventFlicker?: boolean; // Prevenir flicker de loading rápido
}

// Estado de loading avançado
export interface LoadingState {
  isLoading: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  isFetching: boolean;
  error: string | null;
  progress?: number; // Progresso de 0-100
  message?: string; // Mensagem de status
}

// Hook principal de loading
export function useLoadingState(config: LoadingConfig = {}) {
  const {
    minLoadingTime = 300, // 300ms mínimo
    delayBeforeLoading = 0,
    preventFlicker = true,
  } = config;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    isSubmitting: false,
    isValidating: false,
    isFetching: false,
    error: null,
    progress: undefined,
    message: undefined,
  });

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para iniciar loading
  const startLoading = useCallback((
    type: 'loading' | 'submitting' | 'validating' | 'fetching' = 'loading',
    message?: string
  ) => {
    const startTime = Date.now();
    startTimeRef.current = startTime;

    // Limpar timeouts anteriores
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (minLoadingTimeoutRef.current) {
      clearTimeout(minLoadingTimeoutRef.current);
    }

    const updateState = () => {
      setLoadingState(prev => ({
        ...prev,
        [`is${type.charAt(0).toUpperCase() + type.slice(1)}`]: true,
        error: null,
        message: message || prev.message,
      }));
    };

    if (delayBeforeLoading > 0) {
      timeoutRef.current = setTimeout(updateState, delayBeforeLoading);
    } else {
      updateState();
    }

    // Garantir tempo mínimo de loading se preventFlicker estiver ativado
    if (preventFlicker) {
      minLoadingTimeoutRef.current = setTimeout(() => {
        // Este timeout será limpo se stopLoading for chamado antes
      }, minLoadingTime);
    }
  }, [delayBeforeLoading, minLoadingTime, preventFlicker]);

  // Função para parar loading
  const stopLoading = useCallback((error?: string | null) => {
    const endTime = Date.now();
    const actualLoadingTime = endTime - startTimeRef.current;

    // Limpar timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const finishLoading = () => {
      setLoadingState(prev => ({
        isLoading: false,
        isSubmitting: false,
        isValidating: false,
        isFetching: false,
        error: error || null,
        progress: undefined,
        message: error ? undefined : prev.message,
      }));
    };

    if (preventFlicker && actualLoadingTime < minLoadingTime) {
      // Aguardar tempo restante para evitar flicker
      const remainingTime = minLoadingTime - actualLoadingTime;
      minLoadingTimeoutRef.current = setTimeout(finishLoading, remainingTime);
    } else {
      finishLoading();
      if (minLoadingTimeoutRef.current) {
        clearTimeout(minLoadingTimeoutRef.current);
        minLoadingTimeoutRef.current = null;
      }
    }
  }, [minLoadingTime, preventFlicker]);

  // Função para atualizar progresso
  const setProgress = useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message,
    }));
  }, []);

  // Função para atualizar mensagem
  const setMessage = useCallback((message: string) => {
    setLoadingState(prev => ({
      ...prev,
      message,
    }));
  }, []);

  // Função para limpar erro
  const clearError = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (minLoadingTimeoutRef.current) {
        clearTimeout(minLoadingTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    setProgress,
    setMessage,
    clearError,
  };
}

// Hook para loading com timeout
export function useLoadingWithTimeout(
  timeout: number,
  onTimeout?: () => void,
  config: LoadingConfig = {}
) {
  const { startLoading, stopLoading, ...loadingState } = useLoadingState(config);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoadingWithTimeout = useCallback((
    type?: 'loading' | 'submitting' | 'validating' | 'fetching',
    message?: string
  ) => {
    startLoading(type, message);

    timeoutRef.current = setTimeout(() => {
      stopLoading('Tempo limite excedido');
      onTimeout?.();
    }, timeout);
  }, [timeout, onTimeout, startLoading, stopLoading]);

  const stopLoadingWithTimeout = useCallback((error?: string | null) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    stopLoading(error);
  }, [stopLoading]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...loadingState,
    startLoading: startLoadingWithTimeout,
    stopLoading: stopLoadingWithTimeout,
  };
}

// Hook para loading sequencial (múltiplas operações)
export function useSequentialLoading(config: LoadingConfig = {}) {
  const { startLoading, stopLoading, ...loadingState } = useLoadingState(config);
  const [operations, setOperations] = useState<string[]>([]);
  const [currentOperation, setCurrentOperation] = useState<string>('');

  const startOperation = useCallback((operation: string, message?: string) => {
    setOperations(prev => [...prev, operation]);
    setCurrentOperation(operation);
    startLoading('loading', message || `Executando: ${operation}`);
  }, [startLoading]);

  const completeOperation = useCallback((operation: string, error?: string) => {
    setOperations(prev => prev.filter(op => op !== operation));
    
    if (operations.length <= 1) {
      // Última operação
      stopLoading(error || null);
      setCurrentOperation('');
    } else {
      // Ainda há operações pendentes
      const nextOp = operations.find(op => op !== operation);
      if (nextOp) {
        setCurrentOperation(nextOp);
        startLoading('loading', `Executando: ${nextOp}`);
      }
    }
  }, [operations, stopLoading, startLoading]);

  return {
    ...loadingState,
    operations,
    currentOperation,
    startOperation,
    completeOperation,
  };
}

// Hook para loading com debounce
export function useDebouncedLoading(
  delay: number = 300,
  config: LoadingConfig = {}
) {
  const [isDebouncedLoading, setIsDebouncedLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { startLoading, stopLoading, ...loadingState } = useLoadingState(config);

  const startDebouncedLoading = useCallback((
    type?: 'loading' | 'submitting' | 'validating' | 'fetching',
    message?: string
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsDebouncedLoading(true);
      startLoading(type, message);
    }, delay);
  }, [delay, startLoading]);

  const stopDebouncedLoading = useCallback((error?: string | null) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDebouncedLoading(false);
    stopLoading(error);
  }, [stopLoading]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...loadingState,
    isDebouncedLoading,
    startLoading: startDebouncedLoading,
    stopLoading: stopDebouncedLoading,
  };
}

// Hook para loading progressivo (com progresso simulado)
export function useProgressiveLoading(config: LoadingConfig = {}) {
  const { startLoading, stopLoading, setProgress, ...loadingState } = useLoadingState(config);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProgressiveLoading = useCallback((
    type?: 'loading' | 'submitting' | 'validating' | 'fetching',
    estimatedDuration: number = 2000,
    message?: string
  ) => {
    startLoading(type, message);
    setProgress(0);

    const startTime = Date.now();
    const updateInterval = 100; // Atualizar a cada 100ms

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(90, (elapsed / estimatedDuration) * 100); // Não ir além de 90%
      setProgress(progress);
    }, updateInterval);
  }, [startLoading, setProgress]);

  const completeProgressiveLoading = useCallback((error?: string | null) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Completar progresso
    setProgress(100);

    // Pequeno delay antes de parar para mostrar 100%
    setTimeout(() => {
      stopLoading(error);
    }, 200);
  }, [setProgress, stopLoading]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return {
    ...loadingState,
    startProgressiveLoading,
    completeProgressiveLoading,
  };
}

// Utilitários para loading states
export const LoadingUtils = {
  // Combinar múltiplos estados de loading
  combineLoadingStates: (...states: LoadingState[]): LoadingState => {
    return {
      isLoading: states.some(s => s.isLoading),
      isSubmitting: states.some(s => s.isSubmitting),
      isValidating: states.some(s => s.isValidating),
      isFetching: states.some(s => s.isFetching),
      error: states.find(s => s.error)?.error || null,
      progress: states.find(s => s.progress)?.progress,
      message: states.find(s => s.message)?.message,
    };
  },

  // Verificar se está em qualquer estado de loading
  isAnyLoading: (state: LoadingState): boolean => {
    return state.isLoading || state.isSubmitting || state.isValidating || state.isFetching;
  },

  // Verificar se está em estado específico
  isLoadingType: (state: LoadingState, type: keyof Omit<LoadingState, 'error' | 'progress' | 'message'>): boolean => {
    return state[type];
  },

  // Criar estado inicial
  createInitialState: (overrides?: Partial<LoadingState>): LoadingState => ({
    isLoading: false,
    isSubmitting: false,
    isValidating: false,
    isFetching: false,
    error: null,
    progress: undefined,
    message: undefined,
    ...overrides,
  }),
};
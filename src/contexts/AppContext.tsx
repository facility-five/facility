/**
 * Contexto global para gerenciamento de estado da aplicação
 * Consolida estados comuns e fornece API consistente
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useLoadingState, LoadingState } from '@/hooks/useLoadingState';
import { ErrorType, AppError, handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';

// Tipos de estado global
export interface AppState {
  // Estado de UI
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  
  // Estado de dados
  notifications: AppNotification[];
  onlineStatus: boolean;
  appVersion: string;
  
  // Estado de cache
  cacheKeys: string[];
  
  // Estado de sincronização
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  lastSyncAt?: Date;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Ações do reducer
export type AppAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppNotification, 'id' | 'timestamp' | 'read'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_SYNC_STATUS'; payload: 'idle' | 'syncing' | 'error' | 'success' }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'ADD_CACHE_KEY'; payload: string }
  | { type: 'REMOVE_CACHE_KEY'; payload: string }
  | { type: 'CLEAR_ALL_CACHE' };

// Estado inicial
const initialState: AppState = {
  sidebarCollapsed: false,
  theme: 'system',
  language: 'pt-BR',
  notifications: [],
  onlineStatus: true,
  appVersion: '1.0.0',
  cacheKeys: [],
  syncStatus: 'idle',
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'ADD_NOTIFICATION':
      const newNotification: AppNotification = {
        ...action.payload,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications].slice(0, 50), // Limitar a 50 notificações
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    case 'SET_ONLINE_STATUS':
      return { ...state, onlineStatus: action.payload };
    
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSyncAt: action.payload };
    
    case 'ADD_CACHE_KEY':
      return {
        ...state,
        cacheKeys: [...new Set([...state.cacheKeys, action.payload])],
      };
    
    case 'REMOVE_CACHE_KEY':
      return {
        ...state,
        cacheKeys: state.cacheKeys.filter(key => key !== action.payload),
      };
    
    case 'CLEAR_ALL_CACHE':
      return { ...state, cacheKeys: [] };
    
    default:
      return state;
  }
}

// Contexto
interface AppContextType {
  state: AppState;
  loading: LoadingState;
  
  // Ações de UI
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  
  // Ações de notificações
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Ações de conectividade
  setOnlineStatus: (online: boolean) => void;
  
  // Ações de sincronização
  setSyncStatus: (status: 'idle' | 'syncing' | 'error' | 'success') => void;
  setLastSync: (date: Date) => void;
  
  // Ações de cache
  addCacheKey: (key: string) => void;
  removeCacheKey: (key: string) => void;
  clearAllCache: () => void;
  
  // Utilitários
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  
  // Loading actions
  startLoading: (type?: 'loading' | 'submitting' | 'validating' | 'fetching', message?: string) => void;
  stopLoading: (error?: string | null) => void;
  setLoadingProgress: (progress: number, message?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const loading = useLoadingState({ preventFlicker: true, minLoadingTime: 300 });

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      logger.info('Application is online');
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
      addNotification({
        type: 'success',
        title: 'Conexão Restabelecida',
        message: 'Sua conexão com a internet foi restaurada.',
        persistent: false,
      });
    };

    const handleOffline = () => {
      logger.warn('Application is offline');
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
      addNotification({
        type: 'warning',
        title: 'Sem Conexão',
        message: 'Você está offline. Algumas funcionalidades podem estar limitadas.',
        persistent: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar status inicial
    dispatch({ type: 'SET_ONLINE_STATUS', payload: navigator.onLine });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ações de UI
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
    // Aplicar tema ao DOM
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Sistema - usar preferência do usuário
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    logger.info('Theme changed', { theme });
  }, []);

  const setLanguage = useCallback((language: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
    // Aplicar idioma (se houver sistema de i18n)
    logger.info('Language changed', { language });
  }, []);

  // Ações de notificações
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    logger.info('Notification added', { title: notification.title, type: notification.type });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  // Ações de conectividade
  const setOnlineStatus = useCallback((online: boolean) => {
    dispatch({ type: 'SET_ONLINE_STATUS', payload: online });
  }, []);

  // Ações de sincronização
  const setSyncStatus = useCallback((status: 'idle' | 'syncing' | 'error' | 'success') => {
    dispatch({ type: 'SET_SYNC_STATUS', payload: status });
  }, []);

  const setLastSync = useCallback((date: Date) => {
    dispatch({ type: 'SET_LAST_SYNC', payload: date });
  }, []);

  // Ações de cache
  const addCacheKey = useCallback((key: string) => {
    dispatch({ type: 'ADD_CACHE_KEY', payload: key });
  }, []);

  const removeCacheKey = useCallback((key: string) => {
    dispatch({ type: 'REMOVE_CACHE_KEY', payload: key });
  }, []);

  const clearAllCache = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_CACHE' });
  }, []);

  // Utilitários para notificações
  const showError = useCallback((message: string, title: string = 'Erro') => {
    addNotification({
      type: 'error',
      title,
      message,
      persistent: false,
    });
  }, [addNotification]);

  const showSuccess = useCallback((message: string, title: string = 'Sucesso') => {
    addNotification({
      type: 'success',
      title,
      message,
      persistent: false,
    });
  }, [addNotification]);

  const showWarning = useCallback((message: string, title: string = 'Aviso') => {
    addNotification({
      type: 'warning',
      title,
      message,
      persistent: false,
    });
  }, [addNotification]);

  const showInfo = useCallback((message: string, title: string = 'Informação') => {
    addNotification({
      type: 'info',
      title,
      message,
      persistent: false,
    });
  }, [addNotification]);

  // Ações de loading
  const startLoading = useCallback((
    type?: 'loading' | 'submitting' | 'validating' | 'fetching',
    message?: string
  ) => {
    loading.startLoading(type, message);
  }, [loading]);

  const stopLoading = useCallback((error?: string | null) => {
    loading.stopLoading(error);
  }, [loading]);

  const setLoadingProgress = useCallback((progress: number, message?: string) => {
    loading.setProgress(progress, message);
  }, [loading]);

  // Context value
  const contextValue: AppContextType = {
    state,
    loading,
    
    // UI actions
    toggleSidebar,
    setTheme,
    setLanguage,
    
    // Notification actions
    addNotification,
    removeNotification,
    markNotificationRead,
    clearNotifications,
    
    // Connectivity actions
    setOnlineStatus,
    
    // Sync actions
    setSyncStatus,
    setLastSync,
    
    // Cache actions
    addCacheKey,
    removeCacheKey,
    clearAllCache,
    
    // Utilities
    showError,
    showSuccess,
    showWarning,
    showInfo,
    
    // Loading actions
    startLoading,
    stopLoading,
    setLoadingProgress,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook para usar o contexto
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Hook para notificações
export function useNotifications() {
  const { state, addNotification, removeNotification, markNotificationRead, clearNotifications } = useApp();
  
  return {
    notifications: state.notifications,
    unreadCount: state.notifications.filter(n => !n.read).length,
    addNotification,
    removeNotification,
    markNotificationRead,
    clearNotifications,
  };
}

// Hook para UI state
export function useUI() {
  const { state, toggleSidebar, setTheme, setLanguage } = useApp();
  
  return {
    sidebarCollapsed: state.sidebarCollapsed,
    theme: state.theme,
    language: state.language,
    toggleSidebar,
    setTheme,
    setLanguage,
  };
}

// Hook para conectividade
export function useConnectivity() {
  const { state, setOnlineStatus } = useApp();
  
  return {
    onlineStatus: state.onlineStatus,
    setOnlineStatus,
    isOnline: state.onlineStatus,
  };
}

// Hook para sincronização
export function useSync() {
  const { state, setSyncStatus, setLastSync } = useApp();
  
  return {
    syncStatus: state.syncStatus,
    lastSyncAt: state.lastSyncAt,
    setSyncStatus,
    setLastSync,
  };
}
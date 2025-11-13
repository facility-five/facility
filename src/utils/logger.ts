/**
 * Professional logging utility for App Facility
 * Only logs in development environment to prevent performance issues
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

class Logger {
  private isDevelopment: boolean;
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
    this.isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    // Only log in development environment
    if (!this.isDevelopment) {
      return false;
    }

    // Optional: Add log level filtering based on environment variable
    const logLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'debug';
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    const formattedMessage = `${prefix} ${message}`;
    
    if (data !== undefined) {
      return `${formattedMessage} ${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      const formattedMessage = this.formatMessage('error', message, error);
      console.error(formattedMessage);
      
      // In development, also log the stack trace if available
      if (error?.stack && this.isDevelopment) {
        console.error('Stack trace:', error.stack);
      }
    }
  }

  // Utility method for logging API responses
  logApiResponse(endpoint: string, response: any, duration?: number): void {
    if (this.shouldLog('debug')) {
      const message = `API Response: ${endpoint}`;
      const data = {
        response,
        duration: duration ? `${duration}ms` : undefined,
      };
      this.debug(message, data);
    }
  }

  // Utility method for logging API errors
  logApiError(endpoint: string, error: any, duration?: number): void {
    if (this.shouldLog('error')) {
      const message = `API Error: ${endpoint}`;
      const data = {
        error: error.message || error,
        duration: duration ? `${duration}ms` : undefined,
      };
      this.error(message, data);
    }
  }
}

// Create logger instances for different contexts
export const logger = new Logger('App');
export const authLogger = new Logger('Auth');
export const apiLogger = new Logger('API');
export const dbLogger = new Logger('Database');

// Helper function to create contextual loggers
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

// Performance logging utility
export const logPerformance = (operation: string, startTime: number): void => {
  if (import.meta.env.DEV) {
    const duration = performance.now() - startTime;
    apiLogger.debug(`${operation} completed in ${duration.toFixed(2)}ms`);
  }
};

// Error boundary logging
export const logErrorBoundary = (error: Error, errorInfo: any): void => {
  logger.error('Error Boundary caught an error', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  });
};

// Deprecated: Remove all console.log statements and replace with logger
export const deprecatedConsoleLog = (...args: any[]): void => {
  if (import.meta.env.DEV) {
    console.warn('[DEPRECATED] console.log detected. Use logger instead:', ...args);
  }
};
/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

/**
 * Log context
 */
export interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

/**
 * Simple logger wrapper around console methods
 */
export const logger = {
  /**
   * Log a debug message
   * @param message The log message
   * @param data Additional data to log
   */
  debug: (message: string, data?: any) => console.debug(message, data),
  
  /**
   * Log an info message
   * @param message The log message
   * @param data Additional data to log
   */
  info: (message: string, data?: any) => console.info(message, data),
  
  /**
   * Log a warning message
   * @param message The log message
   * @param data Additional data to log
   */
  warn: (message: string, data?: any) => console.warn(message, data),
  
  /**
   * Log an error message
   * @param message The log message
   * @param error The error object
   * @param data Additional data to log
   */
  error: (message: string, error?: Error, data?: any) => console.error(message, error, data)
};

interface ErrorLogEntry {
  timestamp: Date
  error: Error
  context?: string
  userAgent?: string
  url?: string
  userId?: string
}

class GlobalErrorHandler {
  private errorLog: ErrorLogEntry[] = []
  private maxLogEntries = 100

  constructor() {
    // Only setup global handlers in browser environment
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers()
    }
  }

  private setupGlobalErrorHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'Global Error Handler')
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(event.reason?.toString() || 'Unhandled Promise Rejection'), 
        'Promise Rejection Handler'
      )
    })
  }

  handleError(error: Error, context?: string) {
    const errorEntry: ErrorLogEntry = {
      timestamp: new Date(),
      error,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server'
    }

    // Add to local error log
    this.errorLog.push(errorEntry)
    
    // Keep only the most recent errors
    if (this.errorLog.length > this.maxLogEntries) {
      this.errorLog.shift()
    }

    // Console logging
    console.error(`[${context || 'Unknown Context'}] Error:`, error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: errorEntry.timestamp.toISOString(),
      url: errorEntry.url
    })

    // In production, you might want to send errors to an external service
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      this.reportToExternalService(errorEntry)
    }
  }

  private reportToExternalService(errorEntry: ErrorLogEntry) {
    // Placeholder for external error reporting service
    // In a real app, you might use services like Sentry, LogRocket, etc.
    console.log('Would report to external service:', errorEntry)
  }

  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog]
  }

  clearErrorLog() {
    this.errorLog = []
  }

  getErrorSummary() {
    const totalErrors = this.errorLog.length
    const errorTypes = new Map<string, number>()
    
    this.errorLog.forEach(entry => {
      const errorType = entry.error.name || 'Unknown'
      errorTypes.set(errorType, (errorTypes.get(errorType) || 0) + 1)
    })

    return {
      totalErrors,
      errorTypes: Object.fromEntries(errorTypes),
      recentErrors: this.errorLog.slice(-5)
    }
  }
}

// Create singleton instance
export const globalErrorHandler = new GlobalErrorHandler()

// Utility functions for components to use
export function logError(error: Error, context?: string) {
  globalErrorHandler.handleError(error, context)
}

export function getErrorSummary() {
  return globalErrorHandler.getErrorSummary()
}

export function clearErrorLog() {
  globalErrorHandler.clearErrorLog()
}

// Custom error types for better error categorization
export class TripServiceError extends Error {
  constructor(message: string, public readonly operation: string) {
    super(message)
    this.name = 'TripServiceError'
  }
}

export class WeatherServiceError extends Error {
  constructor(message: string, public readonly cause?: string) {
    super(message)
    this.name = 'WeatherServiceError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'NetworkError'
  }
}

// Error formatting utilities
export function formatErrorMessage(error: Error): string {
  if (error instanceof TripServiceError) {
    return `Trip operation failed: ${error.message}`
  }
  
  if (error instanceof WeatherServiceError) {
    return `Weather service error: ${error.message}`
  }
  
  if (error instanceof ValidationError) {
    return `Validation error: ${error.message}`
  }
  
  if (error instanceof NetworkError) {
    return `Network error: ${error.message}`
  }
  
  return error.message || 'An unexpected error occurred'
}

export function isRetryableError(error: Error): boolean {
  return error instanceof NetworkError || 
         error instanceof WeatherServiceError ||
         error.name === 'TypeError' ||
         error.name === 'ReferenceError'
}
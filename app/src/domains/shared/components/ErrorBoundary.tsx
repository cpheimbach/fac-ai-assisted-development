import { Component, ReactNode } from 'react'

import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2 className={styles.errorTitle}>Something went wrong</h2>
            <p className={styles.errorMessage}>
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary className={styles.errorSummary}>Error Details (Development Only)</summary>
                <div className={styles.errorStack}>
                  <strong>Error:</strong> {this.state.error.message}
                  <br />
                  <strong>Stack:</strong>
                  <pre>{this.state.error.stack}</pre>
                  {this.state.errorInfo && (
                    <>
                      <strong>Component Stack:</strong>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
            
            <div className={styles.errorActions}>
              <button onClick={this.handleReset} className={styles.retryButton}>
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className={styles.reloadButton}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  message?: string
}

export function ErrorFallback({ 
  error, 
  resetError, 
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again." 
}: ErrorFallbackProps) {
  return (
    <div className={styles.errorFallback}>
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3 className={styles.errorTitle}>{title}</h3>
        <p className={styles.errorMessage}>{message}</p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className={styles.errorDetails}>
            <summary className={styles.errorSummary}>Error Details (Development Only)</summary>
            <div className={styles.errorStack}>
              <strong>Error:</strong> {error.message}
              <br />
              <strong>Stack:</strong>
              <pre>{error.stack}</pre>
            </div>
          </details>
        )}
        
        {resetError && (
          <div className={styles.errorActions}>
            <button onClick={resetError} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
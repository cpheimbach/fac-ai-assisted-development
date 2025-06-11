import styles from './WeatherError.module.css'

interface WeatherErrorProps {
  error: string
  onRetry?: () => void
  onDismiss?: () => void
  title?: string
}

export function WeatherError({ 
  error, 
  onRetry, 
  onDismiss, 
  title = 'Weather Error' 
}: WeatherErrorProps) {
  const getErrorMessage = (error: string): string => {
    if (error.includes('network') || error.includes('fetch')) {
      return 'Unable to connect to weather service. Please check your internet connection.'
    }
    
    if (error.includes('rate limit') || error.includes('quota')) {
      return 'Weather service is temporarily unavailable. Please try again later.'
    }
    
    if (error.includes('location') || error.includes('not found')) {
      return 'Weather data not available for this location. Please try a different location.'
    }
    
    if (error.includes('timeout')) {
      return 'Weather request timed out. Please try again.'
    }
    
    return error || 'An unexpected error occurred while fetching weather data.'
  }

  const getErrorIcon = (error: string): string => {
    if (error.includes('network') || error.includes('fetch')) {
      return '🌐'
    }
    
    if (error.includes('rate limit') || error.includes('quota')) {
      return '⏰'
    }
    
    if (error.includes('location') || error.includes('not found')) {
      return '📍'
    }
    
    if (error.includes('timeout')) {
      return '⏱️'
    }
    
    return '⚠️'
  }

  return (
    <div className={styles.weatherError}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          {getErrorIcon(error)}
        </div>
        
        <div className={styles.errorText}>
          <h4 className={styles.errorTitle}>{title}</h4>
          <p className={styles.errorMessage}>
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className={styles.errorActions}>
          {onRetry && (
            <button 
              onClick={onRetry}
              className={styles.retryButton}
              type="button"
            >
              Try Again
            </button>
          )}
          
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className={styles.dismissButton}
              type="button"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
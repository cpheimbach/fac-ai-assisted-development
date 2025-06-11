import { CreateTripData, UpdateTripData } from '../../trip-management/types/trip'

export function generateId(): string {
  return crypto.randomUUID()
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = formatDateShort(startDate)
  const end = formatDateShort(endDate)
  
  if (start === end) {
    return start
  }
  
  return `${start} - ${end}`
}

export function calculateTripDuration(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate
}

export function isValidTripName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 100
}

export function isValidDestination(destination: string): boolean {
  return destination.trim().length > 0 && destination.trim().length <= 200
}

export function validateCreateTripData(data: CreateTripData): string[] {
  const errors: string[] = []
  
  if (!isValidTripName(data.name)) {
    errors.push('Trip name must be between 1 and 100 characters')
  }
  
  if (!isValidDestination(data.destination)) {
    errors.push('Destination must be between 1 and 200 characters')
  }
  
  if (!isValidDateRange(data.startDate, data.endDate)) {
    errors.push('Start date must be before or equal to end date')
  }
  
  return errors
}

export function validateUpdateTripData(data: UpdateTripData): string[] {
  const errors: string[] = []
  
  if (data.name !== undefined && !isValidTripName(data.name)) {
    errors.push('Trip name must be between 1 and 100 characters')
  }
  
  if (data.destination !== undefined && !isValidDestination(data.destination)) {
    errors.push('Destination must be between 1 and 200 characters')
  }
  
  if (data.startDate && data.endDate && !isValidDateRange(data.startDate, data.endDate)) {
    errors.push('Start date must be before or equal to end date')
  }
  
  return errors
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

export function isDateInPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function getDaysUntilTrip(startDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tripStart = new Date(startDate.getTime())
  tripStart.setHours(0, 0, 0, 0)
  
  const diffTime = tripStart.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Re-export error handling utilities
export {
  globalErrorHandler,
  logError,
  getErrorSummary,
  clearErrorLog,
  TripServiceError,
  WeatherServiceError,
  ValidationError,
  NetworkError,
  formatErrorMessage,
  isRetryableError
} from './errorHandler'
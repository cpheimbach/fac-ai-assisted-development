import { CreateTripData, UpdateTripData } from '../types/trip'
import { 
  validateCreateTripData, 
  validateUpdateTripData, 
  sanitizeString,
  isValidDateRange 
} from '../../shared/utils'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedData?: CreateTripData | UpdateTripData
}

export function validateAndSanitizeCreateTripData(data: CreateTripData): ValidationResult {
  try {
    const sanitizedData: CreateTripData = {
      name: sanitizeString(data.name),
      destination: sanitizeString(data.destination),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    }

    const errors = validateCreateTripData(sanitizedData)

    if (isNaN(sanitizedData.startDate.getTime())) {
      errors.push('Start date is not a valid date')
    }

    if (isNaN(sanitizedData.endDate.getTime())) {
      errors.push('End date is not a valid date')
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Invalid trip data: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

export function validateAndSanitizeUpdateTripData(data: UpdateTripData): ValidationResult {
  try {
    const sanitizedData: UpdateTripData = {}

    if (data.name !== undefined) {
      sanitizedData.name = sanitizeString(data.name)
    }

    if (data.destination !== undefined) {
      sanitizedData.destination = sanitizeString(data.destination)
    }

    if (data.startDate !== undefined) {
      sanitizedData.startDate = new Date(data.startDate)
      if (isNaN(sanitizedData.startDate.getTime())) {
        return {
          isValid: false,
          errors: ['Start date is not a valid date']
        }
      }
    }

    if (data.endDate !== undefined) {
      sanitizedData.endDate = new Date(data.endDate)
      if (isNaN(sanitizedData.endDate.getTime())) {
        return {
          isValid: false,
          errors: ['End date is not a valid date']
        }
      }
    }

    if (sanitizedData.startDate && sanitizedData.endDate) {
      if (!isValidDateRange(sanitizedData.startDate, sanitizedData.endDate)) {
        return {
          isValid: false,
          errors: ['Start date must be before or equal to end date']
        }
      }
    }

    const errors = validateUpdateTripData(sanitizedData)

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Invalid trip data: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

export function validateTripId(id: string): ValidationResult {
  if (!id || typeof id !== 'string') {
    return {
      isValid: false,
      errors: ['Trip ID is required and must be a string']
    }
  }

  if (id.trim().length === 0) {
    return {
      isValid: false,
      errors: ['Trip ID cannot be empty']
    }
  }

  return {
    isValid: true,
    errors: []
  }
}
export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface ValidationError {
  field: string
  message: string
}

export type EntityId = string
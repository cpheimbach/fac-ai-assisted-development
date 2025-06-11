import React, { useState, useCallback } from 'react'

import { CreateTripData, Trip, UpdateTripData } from '../types/trip'

interface TripFormProps {
  trip?: Trip
  onSubmit: (data: CreateTripData | UpdateTripData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

interface FormData {
  name: string
  destination: string
  startDate: string
  endDate: string
}

interface FormErrors {
  name?: string
  destination?: string
  startDate?: string
  endDate?: string
  general?: string
}

export function TripForm({ trip, onSubmit, onCancel, isLoading = false }: TripFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: trip?.name || '',
    destination: trip?.destination || '',
    startDate: trip?.startDate ? trip.startDate.toISOString().split('T')[0] : '',
    endDate: trip?.endDate ? trip.endDate.toISOString().split('T')[0] : ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Trip name must be 100 characters or less'
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required'
    } else if (formData.destination.trim().length > 200) {
      newErrors.destination = 'Destination must be 200 characters or less'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      
      if (endDate < startDate) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleInputChange = useCallback((field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm() || isLoading) {
      return
    }

    try {
      const tripData = {
        name: formData.name.trim(),
        destination: formData.destination.trim(),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      }

      await onSubmit(tripData)
      
      if (!trip) {
        setFormData({ name: '', destination: '', startDate: '', endDate: '' })
      }
      setErrors({})
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save trip'
      setErrors(prev => ({ ...prev, general: errorMessage }))
    }
  }, [formData, trip, onSubmit, validateForm, isLoading])

  const isEditing = Boolean(trip)

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit Trip' : 'Create New Trip'}</h2>
      
      {errors.general && (
        <div role="alert">
          {errors.general}
        </div>
      )}

      <div>
        <label htmlFor="trip-name">
          Trip Name *
        </label>
        <input
          id="trip-name"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          disabled={isLoading}
          maxLength={100}
          required
        />
        {errors.name && (
          <div role="alert">
            {errors.name}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="trip-destination">
          Destination *
        </label>
        <input
          id="trip-destination"
          type="text"
          value={formData.destination}
          onChange={handleInputChange('destination')}
          disabled={isLoading}
          maxLength={200}
          required
        />
        {errors.destination && (
          <div role="alert">
            {errors.destination}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="trip-start-date">
          Start Date *
        </label>
        <input
          id="trip-start-date"
          type="date"
          value={formData.startDate}
          onChange={handleInputChange('startDate')}
          disabled={isLoading}
          required
        />
        {errors.startDate && (
          <div role="alert">
            {errors.startDate}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="trip-end-date">
          End Date *
        </label>
        <input
          id="trip-end-date"
          type="date"
          value={formData.endDate}
          onChange={handleInputChange('endDate')}
          disabled={isLoading}
          required
        />
        {errors.endDate && (
          <div role="alert">
            {errors.endDate}
          </div>
        )}
      </div>

      <div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (isEditing ? 'Update Trip' : 'Create Trip')}
        </button>
        
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
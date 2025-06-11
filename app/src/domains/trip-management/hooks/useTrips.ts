import { useCallback, useEffect, useState } from 'react'

import { LoadingState } from '../../shared/types'
import { tripService } from '../services/tripService'
import { CreateTripData, Trip, UpdateTripData } from '../types/trip'

interface UseTripsReturn {
  trips: Trip[]
  loading: LoadingState
  createTrip: (data: CreateTripData) => Promise<void>
  updateTrip: (id: string, data: UpdateTripData) => Promise<void>
  deleteTrip: (id: string) => Promise<void>
  getTripById: (id: string) => Trip | undefined
  refreshTrips: () => Promise<void>
  getTripsByDestination: (destination: string) => Promise<Trip[]>
  getUpcomingTrips: () => Promise<Trip[]>
  getPastTrips: () => Promise<Trip[]>
  getCurrentTrips: () => Promise<Trip[]>
}

export function useTrips(): UseTripsReturn {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null
  })

  const updateLoadingState = useCallback((isLoading: boolean, error: string | null = null) => {
    setLoading({ isLoading, error })
  }, [])

  const refreshTrips = useCallback(async () => {
    try {
      updateLoadingState(true)
      const allTrips = await tripService.getAllTrips()
      setTrips(allTrips)
      updateLoadingState(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load trips'
      updateLoadingState(false, errorMessage)
    }
  }, [updateLoadingState])

  const createTrip = useCallback(async (data: CreateTripData) => {
    try {
      updateLoadingState(true)
      const newTrip = await tripService.createTrip(data)
      setTrips(currentTrips => [...currentTrips, newTrip])
      updateLoadingState(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create trip'
      updateLoadingState(false, errorMessage)
      throw error
    }
  }, [updateLoadingState])

  const updateTrip = useCallback(async (id: string, data: UpdateTripData) => {
    try {
      updateLoadingState(true)
      const updatedTrip = await tripService.updateTrip(id, data)
      setTrips(currentTrips => 
        currentTrips.map(trip => trip.id === id ? updatedTrip : trip)
      )
      updateLoadingState(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update trip'
      updateLoadingState(false, errorMessage)
      throw error
    }
  }, [updateLoadingState])

  const deleteTrip = useCallback(async (id: string) => {
    try {
      updateLoadingState(true)
      await tripService.deleteTrip(id)
      setTrips(currentTrips => currentTrips.filter(trip => trip.id !== id))
      updateLoadingState(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete trip'
      updateLoadingState(false, errorMessage)
      throw error
    }
  }, [updateLoadingState])

  const getTripById = useCallback((id: string): Trip | undefined => {
    return trips.find(trip => trip.id === id)
  }, [trips])

  const getTripsByDestination = useCallback(async (destination: string): Promise<Trip[]> => {
    try {
      return await tripService.getTripsByDestination(destination)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search trips by destination'
      updateLoadingState(false, errorMessage)
      throw error
    }
  }, [updateLoadingState])

  const getUpcomingTrips = useCallback(async (): Promise<Trip[]> => {
    try {
      return await tripService.getUpcomingTrips()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get upcoming trips'
      updateLoadingState(false, errorMessage)
      throw error
    }
  }, [updateLoadingState])

  const getPastTrips = useCallback(async (): Promise<Trip[]> => {
    try {
      return await tripService.getPastTrips()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get past trips'
      updateLoadingState(false, errorMessage)
      throw error
    }
  }, [updateLoadingState])

  const getCurrentTrips = useCallback(async (): Promise<Trip[]> => {
    try {
      return await tripService.getCurrentTrips()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get current trips'
      updateLoadingState(false, errorMessage)
      throw error
    }
  }, [updateLoadingState])

  useEffect(() => {
    refreshTrips()
  }, [refreshTrips])

  return {
    trips,
    loading,
    createTrip,
    updateTrip,
    deleteTrip,
    getTripById,
    refreshTrips,
    getTripsByDestination,
    getUpcomingTrips,
    getPastTrips,
    getCurrentTrips
  }
}
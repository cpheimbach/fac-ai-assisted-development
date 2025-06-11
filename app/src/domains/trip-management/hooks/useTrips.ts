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
    console.log('useTrips: Updating loading state:', { isLoading, error })
    setLoading({ isLoading, error })
  }, [])

  const refreshTrips = useCallback(async () => {
    try {
      console.log('useTrips: Starting refreshTrips, setting loading=true')
      updateLoadingState(true)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), 10000)
      )
      
      const tripsPromise = tripService.getAllTrips()
      const allTrips = await Promise.race([tripsPromise, timeoutPromise])
      
      console.log('useTrips: Successfully loaded trips:', allTrips.length)
      setTrips(allTrips as any)
      updateLoadingState(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load trips'
      console.error('useTrips: Error in refreshTrips:', errorMessage)
      updateLoadingState(false, errorMessage)
    }
  }, [updateLoadingState])

  const createTrip = useCallback(async (data: CreateTripData) => {
    try {
      console.log('useTrips: Starting createTrip, setting loading=true')
      updateLoadingState(true)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Create operation timed out')), 10000)
      )
      
      const createPromise = tripService.createTrip(data)
      const newTrip = await Promise.race([createPromise, timeoutPromise])
      
      console.log('useTrips: Successfully created trip:', newTrip)
      setTrips(currentTrips => [...currentTrips, newTrip as any])
      updateLoadingState(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create trip'
      console.error('useTrips: Error in createTrip:', errorMessage)
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
    
    // Cleanup function to reset loading state on unmount
    return () => {
      console.log('useTrips: Component unmounting, resetting loading state')
      setLoading({ isLoading: false, error: null })
    }
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
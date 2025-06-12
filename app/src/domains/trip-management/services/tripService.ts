import { Trip, CreateTripData, UpdateTripData } from '../types/trip'
import { appStore } from '../../../data/store'
import { persistenceService } from '../../../data/persistence'
import { generateId } from '../../shared/utils'
import { 
  validateAndSanitizeCreateTripData, 
  validateAndSanitizeUpdateTripData, 
  validateTripId 
} from './validation'

export class TripService {
  async createTrip(data: CreateTripData): Promise<Trip> {
    try {
      // Wait for store initialization
      await appStore.waitForInitialization()
      
      const validation = validateAndSanitizeCreateTripData(data)
      
      if (!validation.isValid) {
        throw new Error(`Invalid trip data: ${validation.errors.join(', ')}`)
      }

      const sanitizedData = validation.sanitizedData as CreateTripData
      const now = new Date()
      
      const trip: Trip = {
        id: generateId(),
        name: sanitizedData.name,
        destination: sanitizedData.destination,
        startDate: sanitizedData.startDate,
        endDate: sanitizedData.endDate,
        createdAt: now,
        updatedAt: now
      }

      appStore.addTrip(trip)
      await persistenceService.save(appStore.getStore())

      return trip
    } catch (error) {
      throw new Error(`Failed to create trip: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getAllTrips(): Promise<Trip[]> {
    try {
      // Wait for store initialization
      await appStore.waitForInitialization()
      
      const trips = appStore.getAllTrips()
      return trips
    } catch (error) {
      throw new Error(`Failed to retrieve trips: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getTripById(id: string): Promise<Trip> {
    try {
      const validation = validateTripId(id)
      
      if (!validation.isValid) {
        throw new Error(`Invalid trip ID: ${validation.errors.join(', ')}`)
      }

      const trip = appStore.getTrip(id)
      
      if (!trip) {
        throw new Error(`Trip not found with ID: ${id}`)
      }

      return trip
    } catch (error) {
      throw new Error(`Failed to retrieve trip: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateTrip(id: string, data: UpdateTripData): Promise<Trip> {
    try {
      const idValidation = validateTripId(id)
      
      if (!idValidation.isValid) {
        throw new Error(`Invalid trip ID: ${idValidation.errors.join(', ')}`)
      }

      const existingTrip = appStore.getTrip(id)
      
      if (!existingTrip) {
        throw new Error(`Trip not found with ID: ${id}`)
      }

      const dataValidation = validateAndSanitizeUpdateTripData(data)
      
      if (!dataValidation.isValid) {
        throw new Error(`Invalid update data: ${dataValidation.errors.join(', ')}`)
      }

      const sanitizedData = dataValidation.sanitizedData as UpdateTripData
      
      const updatedTrip: Trip = {
        ...existingTrip,
        ...sanitizedData,
        updatedAt: new Date()
      }

      if (updatedTrip.startDate || updatedTrip.endDate) {
        const startDate = updatedTrip.startDate || existingTrip.startDate
        const endDate = updatedTrip.endDate || existingTrip.endDate
        
        if (startDate > endDate) {
          throw new Error('Start date must be before or equal to end date')
        }
      }

      appStore.updateTrip(id, updatedTrip)
      await persistenceService.save(appStore.getStore())

      return updatedTrip
    } catch (error) {
      throw new Error(`Failed to update trip: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteTrip(id: string): Promise<boolean> {
    try {
      const validation = validateTripId(id)
      
      if (!validation.isValid) {
        throw new Error(`Invalid trip ID: ${validation.errors.join(', ')}`)
      }

      const existingTrip = appStore.getTrip(id)
      
      if (!existingTrip) {
        throw new Error(`Trip not found with ID: ${id}`)
      }

      const deleted = appStore.removeTrip(id)
      
      if (deleted) {
        await persistenceService.save(appStore.getStore())
      }

      return deleted
    } catch (error) {
      throw new Error(`Failed to delete trip: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getTripsByDestination(destination: string): Promise<Trip[]> {
    try {
      if (!destination || destination.trim().length === 0) {
        throw new Error('Destination cannot be empty')
      }

      const normalizedDestination = destination.trim().toLowerCase()
      const allTrips = appStore.getAllTrips()
      
      return allTrips.filter(trip => 
        trip.destination.toLowerCase().includes(normalizedDestination)
      )
    } catch (error) {
      throw new Error(`Failed to search trips by destination: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getUpcomingTrips(): Promise<Trip[]> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const allTrips = appStore.getAllTrips()
      
      return allTrips
        .filter(trip => trip.startDate >= today)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    } catch (error) {
      throw new Error(`Failed to retrieve upcoming trips: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPastTrips(): Promise<Trip[]> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const allTrips = appStore.getAllTrips()
      
      return allTrips
        .filter(trip => trip.endDate < today)
        .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
    } catch (error) {
      throw new Error(`Failed to retrieve past trips: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getCurrentTrips(): Promise<Trip[]> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const allTrips = appStore.getAllTrips()
      
      return allTrips.filter(trip => 
        trip.startDate <= today && trip.endDate >= today
      )
    } catch (error) {
      throw new Error(`Failed to retrieve current trips: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const tripService = new TripService()
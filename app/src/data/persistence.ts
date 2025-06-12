import { Trip } from '../domains/trip-management/types/trip'
import { WeatherData } from '../domains/weather/types/weather'
import { AppStore } from './store'

export interface PersistenceService {
  save(data: AppStore): Promise<void>
  load(): Promise<AppStore>
  backup(): Promise<string>
  restore(backup: string): Promise<void>
}

interface SerializedStore {
  trips: Array<[string, Trip]>
  weather: Array<[string, WeatherData]>
  lastSync: string
}

// Browser-compatible LocalStorage persistence service
class BrowserPersistenceService implements PersistenceService {
  private readonly storageKey = 'travel-app-store'
  private readonly backupKey = 'travel-app-backup'

  constructor() {
    // Browser-compatible persistence with localStorage
  }

  private serializeStore(store: AppStore): SerializedStore {
    return {
      trips: Array.from(store.trips.entries()),
      weather: Array.from(store.weather.entries()),
      lastSync: store.lastSync.toISOString()
    }
  }

  private deserializeStore(serialized: SerializedStore): AppStore {
    const tripsMap = new Map<string, Trip>()
    serialized.trips.forEach(([id, trip]) => {
      // Convert date strings back to Date objects
      const convertedTrip: Trip = {
        ...trip,
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
        createdAt: new Date(trip.createdAt),
        updatedAt: new Date(trip.updatedAt)
      }
      tripsMap.set(id, convertedTrip)
    })

    const weatherMap = new Map<string, WeatherData>()
    serialized.weather.forEach(([location, weather]) => {
      const convertedWeather: WeatherData = {
        ...weather,
        lastUpdated: new Date(weather.lastUpdated),
        forecast: weather.forecast.map(f => ({
          ...f,
          date: new Date(f.date)
        }))
      }
      weatherMap.set(location, convertedWeather)
    })

    return {
      trips: tripsMap,
      weather: weatherMap,
      lastSync: new Date(serialized.lastSync)
    }
  }

  async save(data: AppStore): Promise<void> {
    try {
      const serialized = this.serializeStore(data)
      const jsonData = JSON.stringify(serialized, null, 2)
      
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, jsonData)
      } else {
        console.warn('localStorage not available, data not persisted')
      }
    } catch (error) {
      console.error('Failed to save data to localStorage:', error)
      throw new Error(`Failed to save store: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async load(): Promise<AppStore> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const jsonData = window.localStorage.getItem(this.storageKey)
        
        if (!jsonData) {
          return {
            trips: new Map(),
            weather: new Map(),
            lastSync: new Date()
          }
        }

        const serialized: SerializedStore = JSON.parse(jsonData)
        const store = this.deserializeStore(serialized)
        return store
      } else {
        console.warn('localStorage not available, returning empty store')
        return {
          trips: new Map(),
          weather: new Map(),
          lastSync: new Date()
        }
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error)
      return {
        trips: new Map(),
        weather: new Map(),
        lastSync: new Date()
      }
    }
  }

  async backup(): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(this.storageKey)
        if (data) {
          const backupId = `backup_${new Date().toISOString()}`
          window.localStorage.setItem(`${this.backupKey}_${backupId}`, data)
          return backupId
        }
      }
      throw new Error('No data to backup')
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async restore(backup: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const backupData = window.localStorage.getItem(`${this.backupKey}_${backup}`)
        if (backupData) {
          window.localStorage.setItem(this.storageKey, backupData)
          return
        }
      }
      throw new Error('Backup not found')
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Create and export the singleton instance
export const persistenceService = new BrowserPersistenceService()
import { Trip } from '../domains/trip-management/types/trip'
import { WeatherData } from '../domains/weather/types/weather'

export interface AppStore {
  trips: Map<string, Trip>
  weather: Map<string, WeatherData>
  lastSync: Date
}

class InMemoryStore {
  private store: AppStore
  private initialized = false

  constructor() {
    this.store = {
      trips: new Map<string, Trip>(),
      weather: new Map<string, WeatherData>(),
      lastSync: new Date()
    }
    
    // Initialize with persisted data
    this.initializeFromPersistence()
  }
  
  private async initializeFromPersistence() {
    try {
      // Import here to avoid circular dependency
      const { persistenceService } = await import('./persistence')
      const persistedData = await persistenceService.load()
      
      if (persistedData.trips.size > 0 || persistedData.weather.size > 0) {
        this.store = persistedData
      }
      
      this.initialized = true
    } catch (error) {
      console.error('InMemoryStore: Failed to initialize from persistence:', error)
      this.initialized = true // Mark as initialized even if loading failed
    }
  }
  
  async waitForInitialization(): Promise<void> {
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait
    
    while (!this.initialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    if (!this.initialized) {
      console.warn('InMemoryStore: Initialization timeout, proceeding with empty store')
    }
  }

  getStore(): AppStore {
    return this.store
  }

  updateLastSync(): void {
    this.store.lastSync = new Date()
  }

  getTrips(): Map<string, Trip> {
    return this.store.trips
  }

  getWeather(): Map<string, WeatherData> {
    return this.store.weather
  }

  setTrips(trips: Map<string, Trip>): void {
    this.store.trips = trips
    this.updateLastSync()
  }

  setWeather(weather: Map<string, WeatherData>): void {
    this.store.weather = weather
    this.updateLastSync()
  }

  addTrip(trip: Trip): void {
    this.store.trips.set(trip.id, trip)
    this.updateLastSync()
  }

  removeTrip(tripId: string): boolean {
    const deleted = this.store.trips.delete(tripId)
    if (deleted) {
      this.updateLastSync()
    }
    return deleted
  }

  updateTrip(tripId: string, trip: Trip): void {
    this.store.trips.set(tripId, trip)
    this.updateLastSync()
  }

  getTrip(tripId: string): Trip | undefined {
    return this.store.trips.get(tripId)
  }

  addWeatherData(location: string, weatherData: WeatherData): void {
    this.store.weather.set(location, weatherData)
    this.updateLastSync()
  }

  getWeatherData(location: string): WeatherData | undefined {
    return this.store.weather.get(location)
  }

  removeWeatherData(location: string): boolean {
    const deleted = this.store.weather.delete(location)
    if (deleted) {
      this.updateLastSync()
    }
    return deleted
  }

  clearAllData(): void {
    this.store.trips.clear()
    this.store.weather.clear()
    this.updateLastSync()
  }

  getAllTrips(): Trip[] {
    return Array.from(this.store.trips.values())
  }

  getAllWeatherData(): WeatherData[] {
    return Array.from(this.store.weather.values())
  }
}

export const appStore = new InMemoryStore()
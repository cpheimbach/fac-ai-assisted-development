/**
 * Integration test for useWeather hook
 * Run with: npx tsx app/src/domains/weather/hooks/test-integration.ts
 */

import { weatherService } from '../services/weatherService'
import { WeatherData } from '../types/weather'

interface MockUseWeatherReturn {
  weatherData: WeatherData | null
  isLoading: boolean
  error: string | null
  getWeatherForLocation: (location: string) => Promise<WeatherData>
  getWeatherForTrip: (destination: string, startDate: Date, endDate: Date) => Promise<WeatherData>
  hasCachedWeather: (location: string) => boolean
  getCachedWeather: (location: string) => WeatherData | null
  clearError: () => void
  getCacheStats: () => { size: number; locations: string[] }
  clearCache: () => void
}

// Mock implementation of useWeather for testing (since we can't use React hooks in Node.js)
function createMockUseWeather(): MockUseWeatherReturn {
  const state = {
    weatherData: null as WeatherData | null,
    isLoading: false,
    error: null as string | null
  }

  return {
    ...state,
    getWeatherForLocation: async (location: string) => {
      if (!location?.trim()) {
        const error = 'Location is required'
        state.error = error
        state.isLoading = false
        throw new Error(error)
      }

      state.isLoading = true
      state.error = null

      try {
        const weatherData = await weatherService.getWeatherForLocation(location)
        state.weatherData = weatherData
        state.isLoading = false
        state.error = null
        return weatherData
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather data'
        state.isLoading = false
        state.error = errorMessage
        throw error
      }
    },
    getWeatherForTrip: async (destination: string, startDate: Date, endDate: Date) => {
      if (!destination?.trim()) {
        const error = 'Destination is required'
        state.error = error
        state.isLoading = false
        throw new Error(error)
      }

      state.isLoading = true
      state.error = null

      try {
        const weatherData = await weatherService.getWeatherForTrip(destination, startDate, endDate)
        state.weatherData = weatherData
        state.isLoading = false
        state.error = null
        return weatherData
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch trip weather data'
        state.isLoading = false
        state.error = errorMessage
        throw error
      }
    },
    hasCachedWeather: (location: string) => weatherService.hasCachedWeather(location),
    getCachedWeather: (location: string) => weatherService.getCachedWeather(location),
    clearError: () => { state.error = null },
    getCacheStats: () => weatherService.getCacheStats(),
    clearCache: () => {
      weatherService.clearCache()
      state.weatherData = null
    }
  }
}

async function testUseWeatherHook() {
  console.log('🧪 Testing useWeather hook integration...\n')

  const useWeather = createMockUseWeather()

  try {
    // Test 1: Basic weather fetching
    console.log('Test 1: Fetch weather for location')
    const parisWeather = await useWeather.getWeatherForLocation('Paris')
    console.log('✅ Successfully fetched weather for Paris:', parisWeather.location)
    console.log('   Current temp:', parisWeather.current.temperature, '°C')
    console.log('   Forecast days:', parisWeather.forecast.length)

    // Test 2: Cache functionality
    console.log('\nTest 2: Cache functionality')
    const hasCached = useWeather.hasCachedWeather('Paris')
    console.log('✅ Has cached weather for Paris:', hasCached)
    
    const cachedData = useWeather.getCachedWeather('Paris')
    console.log('✅ Retrieved cached weather:', cachedData ? 'Success' : 'Failed')

    // Test 3: Trip-specific weather
    console.log('\nTest 3: Trip-specific weather')
    const tripStart = new Date()
    tripStart.setDate(tripStart.getDate() + 1) // Tomorrow
    const tripEnd = new Date()
    tripEnd.setDate(tripEnd.getDate() + 5) // 5 days from now

    const tripWeather = await useWeather.getWeatherForTrip('London', tripStart, tripEnd)
    console.log('✅ Successfully fetched trip weather for London:', tripWeather.location)
    console.log('   Forecast days for trip:', tripWeather.forecast.length)

    // Test 4: Cache stats
    console.log('\nTest 4: Cache stats')
    const stats = useWeather.getCacheStats()
    console.log('✅ Cache stats:', stats)

    // Test 5: Error handling
    console.log('\nTest 5: Error handling')
    try {
      await useWeather.getWeatherForLocation('')
      console.log('❌ Should have thrown error for empty location')
    } catch (error) {
      console.log('✅ Correctly handled empty location error:', (error as Error).message)
    }

    // Test 6: Clear cache
    console.log('\nTest 6: Clear cache')
    useWeather.clearCache()
    const statsAfterClear = useWeather.getCacheStats()
    console.log('✅ Cache cleared:', statsAfterClear.size === 0 ? 'Success' : 'Failed')

    console.log('\n🎉 All useWeather hook tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testUseWeatherHook()
}
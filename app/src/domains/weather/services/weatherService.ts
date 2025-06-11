import { weatherApi } from '../api/weatherApi'
import { WeatherData, WeatherApiResponse, CurrentWeather, WeatherForecast } from '../types/weather'

interface CacheEntry {
  data: WeatherData
  timestamp: number
  location: string
}

export class WeatherService {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly cacheExpirationMs = 30 * 60 * 1000 // 30 minutes

  private transformApiResponse(response: WeatherApiResponse): WeatherData {
    const current: CurrentWeather = {
      temperature: response.current.temp_c,
      description: response.current.condition.text,
      humidity: response.current.humidity,
      windSpeed: response.current.wind_kph,
      icon: response.current.condition.icon
    }

    const forecast: WeatherForecast[] = response.forecast.forecastday.map(day => ({
      date: new Date(day.date),
      temperature: {
        min: day.day.mintemp_c,
        max: day.day.maxtemp_c
      },
      description: day.day.condition.text,
      humidity: day.day.avghumidity,
      windSpeed: 0, // Not provided in day forecast
      icon: day.day.condition.icon
    }))

    return {
      location: response.location,
      current,
      forecast,
      lastUpdated: new Date()
    }
  }

  private getCacheKey(location: string): string {
    return location.toLowerCase().trim()
  }

  private isCacheValid(entry: CacheEntry): boolean {
    const now = Date.now()
    return (now - entry.timestamp) < this.cacheExpirationMs
  }

  private cleanExpiredCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= this.cacheExpirationMs) {
        this.cache.delete(key)
      }
    }
  }

  async getWeatherForLocation(location: string): Promise<WeatherData> {
    if (!location?.trim()) {
      throw new Error('Location is required')
    }

    const cacheKey = this.getCacheKey(location)
    
    // Check cache first
    const cachedEntry = this.cache.get(cacheKey)
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      console.log(`Weather cache hit for ${location}`)
      return cachedEntry.data
    }

    try {
      console.log(`Fetching weather data for ${location}`)
      const apiResponse = await weatherApi.getCurrentWeather(location)
      const weatherData = this.transformApiResponse(apiResponse)

      // Cache the result
      this.cache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now(),
        location: weatherData.location
      })

      // Clean expired entries periodically
      if (this.cache.size > 10) {
        this.cleanExpiredCache()
      }

      return weatherData
    } catch (error) {
      // If we have expired cache data, return it as fallback
      if (cachedEntry) {
        console.warn(`Using expired cache for ${location} due to API error:`, error)
        return cachedEntry.data
      }

      if (error instanceof Error) {
        throw new Error(`Failed to get weather for ${location}: ${error.message}`)
      }
      throw new Error(`Failed to get weather for ${location}: Unknown error`)
    }
  }

  async getWeatherForTrip(destination: string, startDate: Date, endDate: Date): Promise<WeatherData> {
    const weatherData = await this.getWeatherForLocation(destination)
    
    // Filter forecast to trip date range if possible
    const tripStart = new Date(startDate)
    const tripEnd = new Date(endDate)
    
    const relevantForecast = weatherData.forecast.filter(forecast => {
      const forecastDate = new Date(forecast.date)
      return forecastDate >= tripStart && forecastDate <= tripEnd
    })

    // If we have relevant forecast data, use it; otherwise keep all forecast
    if (relevantForecast.length > 0) {
      return {
        ...weatherData,
        forecast: relevantForecast
      }
    }

    return weatherData
  }

  getCacheStats(): { size: number; locations: string[] } {
    return {
      size: this.cache.size,
      locations: Array.from(this.cache.values()).map(entry => entry.location)
    }
  }

  clearCache(): void {
    this.cache.clear()
    console.log('Weather cache cleared')
  }

  clearExpiredCache(): void {
    this.cleanExpiredCache()
    console.log('Expired weather cache entries cleared')
  }

  // Check if location has cached weather data
  hasCachedWeather(location: string): boolean {
    const cacheKey = this.getCacheKey(location)
    const entry = this.cache.get(cacheKey)
    return entry ? this.isCacheValid(entry) : false
  }

  // Get cached weather without making API call
  getCachedWeather(location: string): WeatherData | null {
    const cacheKey = this.getCacheKey(location)
    const entry = this.cache.get(cacheKey)
    
    if (entry && this.isCacheValid(entry)) {
      return entry.data
    }
    
    return null
  }
}

// Singleton instance for the application
export const weatherService = new WeatherService()
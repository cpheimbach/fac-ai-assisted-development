import { WeatherApiResponse } from '../types/weather'

export interface WeatherApiConfig {
  apiKey?: string
  baseUrl?: string
  timeout?: number
  useMockData?: boolean
}

export class WeatherApi {
  private config: WeatherApiConfig
  private requestCount: number = 0
  private lastRequestTime: number = 0
  private readonly rateLimitWindow = 60000 // 1 minute
  private readonly maxRequestsPerWindow = 10

  constructor(config: WeatherApiConfig = {}) {
    this.config = {
      baseUrl: 'https://api.weatherapi.com/v1',
      timeout: 10000,
      useMockData: true, // Default to mock for demo
      ...config
    }
  }

  private checkRateLimit(): void {
    const now = Date.now()
    
    if (now - this.lastRequestTime > this.rateLimitWindow) {
      this.requestCount = 0
      this.lastRequestTime = now
    }

    if (this.requestCount >= this.maxRequestsPerWindow) {
      const retryAfter = this.rateLimitWindow - (now - this.lastRequestTime)
      throw new Error(`Rate limit exceeded. Retry after ${Math.ceil(retryAfter / 1000)} seconds`)
    }

    this.requestCount++
  }

  private generateMockWeatherData(location: string): WeatherApiResponse {
    // Generate realistic mock data for demo purposes
    const currentTemp = Math.floor(Math.random() * 30) + 5 // 5-35°C
    const conditions = [
      { text: 'Sunny', icon: '//cdn.weatherapi.com/weather/64x64/day/113.png' },
      { text: 'Partly cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/116.png' },
      { text: 'Cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/119.png' },
      { text: 'Light rain', icon: '//cdn.weatherapi.com/weather/64x64/day/296.png' }
    ]
    
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
    
    // Generate 5-day forecast
    const forecast = Array.from({ length: 5 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() + index)
      
      return {
        date: date.toISOString().split('T')[0],
        day: {
          maxtemp_c: currentTemp + Math.floor(Math.random() * 10) - 5,
          mintemp_c: currentTemp - Math.floor(Math.random() * 15) - 5,
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          avghumidity: Math.floor(Math.random() * 40) + 40 // 40-80%
        }
      }
    })

    return {
      location,
      current: {
        temp_c: currentTemp,
        condition: randomCondition,
        humidity: Math.floor(Math.random() * 40) + 40,
        wind_kph: Math.floor(Math.random() * 20) + 5
      },
      forecast: {
        forecastday: forecast
      }
    }
  }

  async getCurrentWeather(location: string): Promise<WeatherApiResponse> {
    try {
      this.checkRateLimit()

      if (this.config.useMockData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
        
        // Simulate occasional API errors for realistic error handling testing
        if (Math.random() < 0.1) { // 10% chance of error
          throw new Error('Weather service temporarily unavailable')
        }

        return this.generateMockWeatherData(location)
      }

      // Real API implementation
      if (!this.config.apiKey) {
        throw new Error('Weather API key not configured')
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      try {
        const response = await fetch(
          `${this.config.baseUrl}/forecast.json?key=${this.config.apiKey}&q=${encodeURIComponent(location)}&days=5&aqi=no&alerts=no`,
          {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'TravelPlanningApp/1.0'
            }
          }
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Weather API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        return data as WeatherApiResponse
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (error) {
      if (error instanceof Error) {
        // Map common errors to user-friendly messages
        if (error.name === 'AbortError') {
          throw new Error('Weather request timed out. Please try again.')
        }
        if (error.message.includes('Rate limit')) {
          throw error // Re-throw rate limit errors as-is
        }
        throw new Error(`Unable to fetch weather data: ${error.message}`)
      }
      throw new Error('Unknown error occurred while fetching weather data')
    }
  }

  // Helper method to test API configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentWeather('London')
      return true
    } catch (error) {
      console.error('Weather API connection test failed:', error)
      return false
    }
  }
}

// Singleton instance for the application
export const weatherApi = new WeatherApi()
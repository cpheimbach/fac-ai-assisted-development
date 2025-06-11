import { LoaderFunctionArgs, json } from '@remix-run/node'
import { weatherService } from '~/src/domains/weather/services/weatherService'

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url)
    const location = url.searchParams.get('location')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const action = url.searchParams.get('action') // 'stats', 'clearCache', 'clearExpired'

    // Handle cache management actions
    if (action) {
      switch (action) {
        case 'stats': {
          const stats = weatherService.getCacheStats()
          return json({ stats })
        }
        case 'clearCache': {
          weatherService.clearCache()
          return json({ success: true, message: 'Cache cleared' })
        }
        case 'clearExpired': {
          weatherService.clearExpiredCache()
          return json({ success: true, message: 'Expired cache entries cleared' })
        }
        case 'checkCache': {
          if (!location) {
            return json({ error: 'Location is required for cache check' }, { status: 400 })
          }
          const hasCached = weatherService.hasCachedWeather(location)
          const cachedData = weatherService.getCachedWeather(location)
          return json({ hasCached, cachedData })
        }
        default:
          return json({ error: 'Invalid action' }, { status: 400 })
      }
    }

    // Require location for weather data requests
    if (!location) {
      return json({ error: 'Location parameter is required' }, { status: 400 })
    }

    // Handle trip-specific weather requests
    if (startDate && endDate) {
      const tripStartDate = new Date(startDate)
      const tripEndDate = new Date(endDate)
      
      // Validate dates
      if (isNaN(tripStartDate.getTime()) || isNaN(tripEndDate.getTime())) {
        return json({ error: 'Invalid date format' }, { status: 400 })
      }
      
      if (tripStartDate > tripEndDate) {
        return json({ error: 'Start date must be before or equal to end date' }, { status: 400 })
      }

      const weatherData = await weatherService.getWeatherForTrip(
        location,
        tripStartDate,
        tripEndDate
      )
      return json({ weather: weatherData })
    }

    // Handle general location weather requests
    const weatherData = await weatherService.getWeatherForLocation(location)
    return json({ weather: weatherData })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    
    // Check if it's a weather service specific error for better error handling
    if (message.includes('rate limit') || message.includes('Rate limit')) {
      return json({ 
        error: 'Weather service rate limit exceeded. Please try again later.',
        type: 'rate_limit'
      }, { status: 429 })
    }
    
    if (message.includes('network') || message.includes('Network')) {
      return json({ 
        error: 'Network error while fetching weather data. Please check your connection.',
        type: 'network'
      }, { status: 503 })
    }
    
    if (message.includes('location') || message.includes('not found')) {
      return json({ 
        error: 'Location not found. Please check the location name.',
        type: 'location'
      }, { status: 404 })
    }

    return json({ 
      error: message,
      type: 'unknown'
    }, { status: 500 })
  }
}
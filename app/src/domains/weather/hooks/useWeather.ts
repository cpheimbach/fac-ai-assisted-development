import { useState, useCallback } from 'react'

import { WeatherData } from '../types/weather'
import { weatherService } from '../services/weatherService'

interface WeatherHookState {
  weatherData: WeatherData | null
  isLoading: boolean
  error: string | null
}

interface UseWeatherReturn extends WeatherHookState {
  getWeatherForLocation: (location: string) => Promise<WeatherData>
  getWeatherForTrip: (destination: string, startDate: Date, endDate: Date) => Promise<WeatherData>
  hasCachedWeather: (location: string) => boolean
  getCachedWeather: (location: string) => WeatherData | null
  clearError: () => void
  getCacheStats: () => { size: number; locations: string[] }
  clearCache: () => void
}

export function useWeather(): UseWeatherReturn {
  const [state, setState] = useState<WeatherHookState>({
    weatherData: null,
    isLoading: false,
    error: null
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const getWeatherForLocation = useCallback(async (location: string): Promise<WeatherData> => {
    if (!location?.trim()) {
      const error = 'Location is required'
      setState(prev => ({ ...prev, error, isLoading: false }))
      throw new Error(error)
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const weatherData = await weatherService.getWeatherForLocation(location)
      setState(prev => ({
        ...prev,
        weatherData,
        isLoading: false,
        error: null
      }))
      return weatherData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather data'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  const getWeatherForTrip = useCallback(async (
    destination: string,
    startDate: Date,
    endDate: Date
  ): Promise<WeatherData> => {
    if (!destination?.trim()) {
      const error = 'Destination is required'
      setState(prev => ({ ...prev, error, isLoading: false }))
      throw new Error(error)
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const weatherData = await weatherService.getWeatherForTrip(destination, startDate, endDate)
      setState(prev => ({
        ...prev,
        weatherData,
        isLoading: false,
        error: null
      }))
      return weatherData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch trip weather data'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  const hasCachedWeather = useCallback((location: string): boolean => {
    return weatherService.hasCachedWeather(location)
  }, [])

  const getCachedWeather = useCallback((location: string): WeatherData | null => {
    return weatherService.getCachedWeather(location)
  }, [])

  const getCacheStats = useCallback(() => {
    return weatherService.getCacheStats()
  }, [])

  const clearCache = useCallback(() => {
    weatherService.clearCache()
    setState(prev => ({ ...prev, weatherData: null }))
  }, [])

  return {
    ...state,
    getWeatherForLocation,
    getWeatherForTrip,
    hasCachedWeather,
    getCachedWeather,
    clearError,
    getCacheStats,
    clearCache
  }
}
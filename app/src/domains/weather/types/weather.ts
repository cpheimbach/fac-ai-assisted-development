export interface CurrentWeather {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

export interface WeatherForecast {
  date: Date
  temperature: {
    min: number
    max: number
  }
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

export interface WeatherData {
  location: string
  current: CurrentWeather
  forecast: WeatherForecast[]
  lastUpdated: Date
}

export interface WeatherApiResponse {
  location: string
  current: {
    temp_c: number
    condition: {
      text: string
      icon: string
    }
    humidity: number
    wind_kph: number
  }
  forecast: {
    forecastday: Array<{
      date: string
      day: {
        maxtemp_c: number
        mintemp_c: number
        condition: {
          text: string
          icon: string
        }
        avghumidity: number
      }
    }>
  }
}

export interface WeatherError {
  message: string
  code?: string
  retryAfter?: number
}
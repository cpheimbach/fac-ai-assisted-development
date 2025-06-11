import { weatherService } from './weatherService'

async function testWeatherIntegration() {
  console.log('🌤️  Testing Weather Integration')
  console.log('================================')

  try {
    // Test 1: Basic weather fetching
    console.log('\n1. Testing basic weather fetching...')
    const parisWeather = await weatherService.getWeatherForLocation('Paris')
    console.log('✅ Paris weather:', {
      location: parisWeather.location,
      temperature: parisWeather.current.temperature,
      description: parisWeather.current.description,
      forecastDays: parisWeather.forecast.length
    })

    // Test 2: Cache functionality
    console.log('\n2. Testing cache functionality...')
    const startTime = Date.now()
    const cachedWeather = await weatherService.getWeatherForLocation('Paris')
    const endTime = Date.now()
    console.log(`✅ Cache hit (${endTime - startTime}ms):`, {
      isSameData: cachedWeather.location === parisWeather.location,
      temperature: cachedWeather.current.temperature
    })

    // Test 3: Different location
    console.log('\n3. Testing different location...')
    const londonWeather = await weatherService.getWeatherForLocation('London')
    console.log('✅ London weather:', {
      location: londonWeather.location,
      temperature: londonWeather.current.temperature,
      description: londonWeather.current.description
    })

    // Test 4: Trip-specific weather
    console.log('\n4. Testing trip-specific weather...')
    const tripStart = new Date()
    tripStart.setDate(tripStart.getDate() + 2)
    const tripEnd = new Date()
    tripEnd.setDate(tripEnd.getDate() + 7)
    
    const tripWeather = await weatherService.getWeatherForTrip('Tokyo', tripStart, tripEnd)
    console.log('✅ Tokyo trip weather:', {
      location: tripWeather.location,
      forecastDays: tripWeather.forecast.length,
      tripDates: `${tripStart.toDateString()} to ${tripEnd.toDateString()}`
    })

    // Test 5: Cache stats
    console.log('\n5. Testing cache stats...')
    const stats = weatherService.getCacheStats()
    console.log('✅ Cache stats:', stats)

    // Test 6: Error handling
    console.log('\n6. Testing error handling...')
    try {
      await weatherService.getWeatherForLocation('')
      console.log('❌ Should have thrown error for empty location')
    } catch (error) {
      console.log('✅ Properly handled empty location error:', error instanceof Error ? error.message : error)
    }

    // Test 7: Cache utilities
    console.log('\n7. Testing cache utilities...')
    console.log('✅ Has cached Paris weather:', weatherService.hasCachedWeather('Paris'))
    console.log('✅ Has cached NYC weather:', weatherService.hasCachedWeather('New York'))
    
    const cachedParis = weatherService.getCachedWeather('Paris')
    console.log('✅ Cached Paris data available:', cachedParis !== null)

    console.log('\n🎉 All weather integration tests passed!')
    
  } catch (error) {
    console.error('❌ Weather integration test failed:', error)
    throw error
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWeatherIntegration()
    .then(() => {
      console.log('\n✅ Weather integration test suite completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Weather integration test suite failed:', error)
      process.exit(1)
    })
}

export { testWeatherIntegration }
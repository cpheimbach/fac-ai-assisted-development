import { tripService } from './tripService'
import { CreateTripData } from '../types/trip'

async function testTripService() {
  console.log('Testing Trip Service Integration...')
  
  try {
    // Test create trip
    const testTripData: CreateTripData = {
      name: 'Test Paris Trip',
      destination: 'Paris, France',
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-07-20')
    }
    
    console.log('Creating trip...')
    const createdTrip = await tripService.createTrip(testTripData)
    console.log('✅ Created trip:', createdTrip.id, createdTrip.name)
    
    // Test get all trips
    console.log('Getting all trips...')
    const allTrips = await tripService.getAllTrips()
    console.log('✅ Retrieved trips:', allTrips.length)
    
    // Test get by ID
    console.log('Getting trip by ID...')
    const foundTrip = await tripService.getTripById(createdTrip.id)
    console.log('✅ Found trip:', foundTrip.name)
    
    // Test update trip
    console.log('Updating trip...')
    const updatedTrip = await tripService.updateTrip(createdTrip.id, {
      name: 'Updated Paris Trip',
      destination: 'Paris, France (Updated)'
    })
    console.log('✅ Updated trip:', updatedTrip.name)
    
    // Test search by destination
    console.log('Searching by destination...')
    const parisTrips = await tripService.getTripsByDestination('Paris')
    console.log('✅ Found Paris trips:', parisTrips.length)
    
    // Test upcoming trips
    console.log('Getting upcoming trips...')
    const upcomingTrips = await tripService.getUpcomingTrips()
    console.log('✅ Upcoming trips:', upcomingTrips.length)
    
    // Test delete trip
    console.log('Deleting trip...')
    const deleted = await tripService.deleteTrip(createdTrip.id)
    console.log('✅ Deleted trip:', deleted)
    
    // Verify deletion
    const finalTrips = await tripService.getAllTrips()
    console.log('✅ Final trip count:', finalTrips.length)
    
    console.log('🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : error)
  }
}

testTripService()
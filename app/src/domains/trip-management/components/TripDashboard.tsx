import { useState, useCallback, useEffect } from 'react'

import { useWeather } from '../../weather/hooks/useWeather'
import { WeatherData } from '../../weather/types/weather'
import { useTrips } from '../hooks/useTrips'
import { CreateTripData, Trip, UpdateTripData } from '../types/trip'
import { TripForm } from './TripForm'
import { TripList } from './TripList'

import styles from './TripDashboard.module.css'

export function TripDashboard() {
  const { 
    trips, 
    loading: tripsLoading, 
    createTrip, 
    updateTrip, 
    deleteTrip,
    refreshTrips 
  } = useTrips()
  
  const { 
    getWeatherForLocation, 
    weatherData, 
    error: weatherError
  } = useWeather()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [weatherDataByDestination, setWeatherDataByDestination] = useState<Map<string, WeatherData>>(new Map())
  const [weatherLoadingByDestination, setWeatherLoadingByDestination] = useState<Set<string>>(new Set())
  const [weatherErrorsByDestination, setWeatherErrorsByDestination] = useState<Map<string, string>>(new Map())
  
  // Safety mechanism: if loading takes too long, allow interactions anyway
  useEffect(() => {
    if (tripsLoading.isLoading) {
      const timer = setTimeout(() => {
        console.warn('Loading timeout reached, enabling interactions')
        setLoadingTimeout(true)
      }, 15000) // 15 seconds max loading time
      
      return () => clearTimeout(timer)
    } else {
      setLoadingTimeout(false)
    }
  }, [tripsLoading.isLoading])

  const handleCreateTrip = useCallback(async (data: CreateTripData) => {
    await createTrip(data)
    setShowCreateForm(false)
  }, [createTrip])

  const handleUpdateTrip = useCallback(async (data: UpdateTripData) => {
    if (!editingTrip) return
    
    await updateTrip(editingTrip.id, data)
    setEditingTrip(null)
  }, [updateTrip, editingTrip])

  const handleFormSubmit = useCallback(async (data: CreateTripData | UpdateTripData) => {
    if (editingTrip) {
      await handleUpdateTrip(data as UpdateTripData)
    } else {
      await handleCreateTrip(data as CreateTripData)
    }
  }, [editingTrip, handleUpdateTrip, handleCreateTrip])

  const handleEditTrip = useCallback((trip: Trip) => {
    setEditingTrip(trip)
    setShowCreateForm(false)
  }, [])

  const handleDeleteTrip = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(id)
        if (editingTrip?.id === id) {
          setEditingTrip(null)
        }
      } catch (error) {
        console.error('Failed to delete trip:', error)
      }
    }
  }, [deleteTrip, editingTrip])

  const handleCancelForm = useCallback(() => {
    setShowCreateForm(false)
    setEditingTrip(null)
  }, [])

  const handleLoadWeather = useCallback(async (destination: string) => {
    // Set loading state for this destination
    setWeatherLoadingByDestination(prev => new Set(prev).add(destination))
    setWeatherErrorsByDestination(prev => {
      const newMap = new Map(prev)
      newMap.delete(destination)
      return newMap
    })
    
    try {
      await getWeatherForLocation(destination)
      // Store the weather data by destination when successful
      if (weatherData && weatherData.location === destination) {
        setWeatherDataByDestination(prev => new Map(prev).set(destination, weatherData))
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load weather'
      setWeatherErrorsByDestination(prev => new Map(prev).set(destination, errorMessage))
    } finally {
      setWeatherLoadingByDestination(prev => {
        const newSet = new Set(prev)
        newSet.delete(destination)
        return newSet
      })
    }
  }, [getWeatherForLocation, weatherData])

  // Update weather data when the main weather hook provides new data
  useEffect(() => {
    if (weatherData && !weatherError) {
      setWeatherDataByDestination(prev => new Map(prev).set(weatherData.location, weatherData))
    }
  }, [weatherData, weatherError])

  const showForm = showCreateForm || editingTrip !== null

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Trip Dashboard</h1>
        <div className={styles.headerActions}>
          {!showForm && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className={styles.primaryButton}
              disabled={tripsLoading.isLoading && !tripsLoading.error && !loadingTimeout}
            >
              {tripsLoading.isLoading ? 'Loading...' : 'Create New Trip'}
            </button>
          )}
        </div>
      </header>

      {tripsLoading.error && (
        <div className={styles.error} role="alert">
          <p>Error loading trips: {tripsLoading.error}</p>
          <button 
            onClick={refreshTrips}
            className={styles.secondaryButton}
            style={{ marginTop: '1rem' }}
          >
            Retry Loading
          </button>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.content}>
          {showForm && (
            <section className={styles.formSection}>
              <TripForm
                trip={editingTrip || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
                isLoading={tripsLoading.isLoading}
              />
            </section>
          )}

          <section className={styles.tripsSection}>
            <div className={styles.sectionHeader}>
              <h2>Your Trips</h2>
            </div>

            <TripList
              trips={trips}
              onEditTrip={handleEditTrip}
              onDeleteTrip={handleDeleteTrip}
              isLoading={tripsLoading.isLoading && !loadingTimeout}
              emptyMessage="No trips found. Create your first trip to get started!"
              weatherData={weatherDataByDestination}
              weatherLoading={weatherLoadingByDestination}
              weatherErrors={weatherErrorsByDestination}
              onLoadWeather={handleLoadWeather}
            />
          </section>
        </div>
      </main>
    </div>
  )
}
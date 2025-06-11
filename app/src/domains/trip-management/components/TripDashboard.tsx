import { useState, useCallback } from 'react'

import { useWeather } from '../../weather/hooks/useWeather'
import { WeatherWidget } from '../../weather/components/WeatherWidget'
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
    isLoading: weatherLoading, 
    error: weatherError,
    clearError 
  } = useWeather()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [selectedTripForWeather, setSelectedTripForWeather] = useState<Trip | null>(null)

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

  const handleShowWeather = useCallback(async (trip: Trip) => {
    setSelectedTripForWeather(trip)
    clearError()
    try {
      await getWeatherForLocation(trip.destination)
    } catch (error) {
      console.error('Failed to fetch weather:', error)
    }
  }, [getWeatherForLocation, clearError])

  const handleCloseWeather = useCallback(() => {
    setSelectedTripForWeather(null)
  }, [])

  const handleRetryWeather = useCallback(async () => {
    if (selectedTripForWeather) {
      clearError()
      try {
        await getWeatherForLocation(selectedTripForWeather.destination)
      } catch (error) {
        console.error('Failed to retry weather:', error)
      }
    }
  }, [selectedTripForWeather, getWeatherForLocation, clearError])

  const showForm = showCreateForm || editingTrip !== null

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Trip Dashboard</h1>
        <div className={styles.headerActions}>
          {!showForm && (
            <button 
              onClick={() => {
                console.log('Create New Trip button clicked')
                setShowCreateForm(true)
              }}
              className={styles.primaryButton}
              disabled={tripsLoading.isLoading && !tripsLoading.error}
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
            onClick={() => {
              console.log('TripDashboard: Retry button clicked')
              refreshTrips()
            }}
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
              {trips.length > 0 && (
                <div className={styles.tripActions}>
                  <button 
                    onClick={() => setSelectedTripForWeather(null)}
                    className={styles.secondaryButton}
                  >
                    Hide Weather
                  </button>
                </div>
              )}
            </div>

            <TripList
              trips={trips}
              onEditTrip={handleEditTrip}
              onDeleteTrip={handleDeleteTrip}
              isLoading={tripsLoading.isLoading}
              emptyMessage="No trips found. Create your first trip to get started!"
            />

            {trips.length > 0 && (
              <div className={styles.weatherSection}>
                <h3>Weather Information</h3>
                <div className={styles.weatherActions}>
                  {trips.map(trip => (
                    <button
                      key={trip.id}
                      onClick={() => handleShowWeather(trip)}
                      className={`${styles.weatherButton} ${
                        selectedTripForWeather?.id === trip.id ? styles.weatherButtonActive : ''
                      }`}
                      disabled={weatherLoading}
                    >
                      {trip.destination}
                    </button>
                  ))}
                </div>

                {selectedTripForWeather && (
                  <div className={styles.weatherDisplay}>
                    <div className={styles.weatherHeader}>
                      <h4>Weather for {selectedTripForWeather.name}</h4>
                      <button 
                        onClick={handleCloseWeather}
                        className={styles.closeButton}
                        type="button"
                        aria-label="Close weather display"
                      >
                        ×
                      </button>
                    </div>
                    <WeatherWidget
                      weatherData={weatherData}
                      isLoading={weatherLoading}
                      error={weatherError}
                      onRetry={handleRetryWeather}
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
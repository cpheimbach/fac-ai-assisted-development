import type { MetaFunction } from '@remix-run/node'
import { useState } from 'react'

import { TripForm } from '~/src/domains/trip-management/components/TripForm'
import { TripList } from '~/src/domains/trip-management/components/TripList'
import { useTrips } from '~/src/domains/trip-management/hooks/useTrips'
import { CreateTripData, Trip, UpdateTripData } from '~/src/domains/trip-management/types/trip'
import styles from '~/styles/components/IndexPage.module.css'

export const meta: MetaFunction = () => {
  return [
    { title: 'Travel Planning App' },
    { name: 'description', content: 'Plan your trips and check the weather!' },
  ]
}

export default function Index() {
  const { trips, loading, createTrip, updateTrip, deleteTrip } = useTrips()
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>(undefined)
  const [showForm, setShowForm] = useState(false)

  const handleCreateTrip = async (tripData: CreateTripData) => {
    await createTrip(tripData)
    setShowForm(false)
  }

  const handleUpdateTrip = async (tripData: UpdateTripData) => {
    if (editingTrip) {
      await updateTrip(editingTrip.id, tripData)
      setEditingTrip(undefined)
    }
  }

  const handleFormSubmit = async (tripData: CreateTripData | UpdateTripData) => {
    if (editingTrip) {
      await handleUpdateTrip(tripData as UpdateTripData)
    } else {
      await handleCreateTrip(tripData as CreateTripData)
    }
  }

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip)
    setShowForm(false)
  }

  const handleCancelEdit = () => {
    setEditingTrip(undefined)
  }

  const handleDeleteTrip = async (id: string) => {
    await deleteTrip(id)
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Travel Planning App
          </h1>
          <p>Plan your trips and check the weather!</p>
        </header>

        <main>
          <div style={{ marginBottom: '2rem' }}>
            {!showForm && !editingTrip && (
              <button 
                onClick={() => setShowForm(true)}
                style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}
              >
                Create New Trip
              </button>
            )}

            {(showForm || editingTrip) && (
              <TripForm
                trip={editingTrip}
                onSubmit={handleFormSubmit}
                onCancel={editingTrip ? handleCancelEdit : () => setShowForm(false)}
                isLoading={loading.isLoading}
              />
            )}
          </div>

          {loading.error && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>
              Error: {loading.error}
            </div>
          )}

          <TripList
            trips={trips}
            onEditTrip={handleEditTrip}
            onDeleteTrip={handleDeleteTrip}
            isLoading={loading.isLoading}
          />
        </main>
      </div>
    </div>
  )
}

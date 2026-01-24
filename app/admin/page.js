// Admin dashboard - events list and creation
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { getAllEvents, deleteEvent } from '@/lib/events'
import EventCard from '@/components/EventCard'
import Navbar from '@/components/Navbar'

export default function AdminDashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        fetchEvents()
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await getAllEvents()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId)
        setEvents(events.filter((e) => e.id !== eventId))
      } catch (error) {
        alert('Error deleting event: ' + error.message)
      }
    }
  }

  const handleEdit = (eventId) => {
    router.push(`/admin/edit/${eventId}`)
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Admin Dashboard</h1>

        <button onClick={() => router.push('/admin/create')} style={styles.createBtn}>
          ➕ Create New Event
        </button>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p style={styles.noEvents}>No events found. Create one to get started!</p>
        ) : (
          <div>
            <p style={styles.count}>Total Events: {events.length}</p>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => handleEdit(event.id)}
                onDelete={() => handleDelete(event.id)}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  createBtn: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '2rem',
    fontWeight: 'bold',
  },
  noEvents: {
    textAlign: 'center',
    color: '#7f8c8d',
    padding: '2rem',
    fontSize: '1.1rem',
  },
  count: {
    color: '#7f8c8d',
    marginBottom: '1rem',
  },
}

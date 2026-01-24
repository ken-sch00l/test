// Home page
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { getAllEvents } from '@/lib/events'
import Navbar from '@/components/Navbar'
import EventCard from '@/components/EventCard'

export default function Home() {
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
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

    fetchEvents()
  }, [])

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.title}>📅 Event Reminder</h1>
          <p style={styles.subtitle}>Never miss an important event</p>

          {!user ? (
            <div style={styles.buttons}>
              <button
                onClick={() => router.push('/auth/signup')}
                style={styles.primaryBtn}
              >
                Get Started
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                style={styles.secondaryBtn}
              >
                Login
              </button>
            </div>
          ) : (
            <div style={styles.userSection}>
              <p style={styles.welcome}>Welcome, {user.email}!</p>
              <button
                onClick={() => router.push('/student')}
                style={styles.viewEventsBtn}
              >
                👉 View Events
              </button>
            </div>
          )}
        </div>

        {/* Events Section */}
        <div style={styles.eventsSection}>
          <h2 style={styles.sectionTitle}>📌 Upcoming Events</h2>

          {loading ? (
            <p style={styles.loading}>Loading events...</p>
          ) : events.length === 0 ? (
            <p style={styles.noEvents}>No events scheduled yet.</p>
          ) : (
            <div style={styles.eventsList}>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'clamp(0.5rem, 3vw, 1rem)',
    width: '100%',
    boxSizing: 'border-box',
  },
  hero: {
    textAlign: 'center',
    padding: 'clamp(1rem, 5vw, 3rem) clamp(0.5rem, 2vw, 1rem)',
  },
  title: {
    fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
    color: '#2c3e50',
    marginBottom: '0.5rem',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  subtitle: {
    fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
    color: '#7f8c8d',
    marginBottom: '2rem',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  buttons: {
    display: 'flex',
    gap: 'clamp(0.5rem, 2vw, 1rem)',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(1.5rem, 4vw, 1.875rem)',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    minHeight: '44px',
    whiteSpace: 'nowrap',
  },
  secondaryBtn: {
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    border: '2px solid #3498db',
    padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(1.4rem, 4vw, 1.75rem)',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  userSection: {
    padding: '2rem',
    backgroundColor: '#ecf0f1',
    borderRadius: '8px',
  },
  welcome: {
    fontSize: '1.1rem',
    color: '#2c3e50',
    margin: 0,
  },
  viewEventsBtn: {
    marginTop: '1rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  eventsSection: {
    marginTop: '3rem',
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    marginBottom: '2rem',
    borderBottom: '2px solid #3498db',
    paddingBottom: '0.5rem',
  },
  eventsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
    gap: '1rem',
  },
  loading: {
    textAlign: 'center',
    color: '#7f8c8d',
    padding: '2rem',
  },
  noEvents: {
    textAlign: 'center',
    color: '#7f8c8d',
    padding: '2rem',
    fontSize: '1.1rem',
  },
}

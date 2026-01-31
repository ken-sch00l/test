'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { getRemindersByUser, getAllEvents, removeReminder } from '@/lib/events'
import ReminderSettings from '@/components/ReminderSettings'

export default function RemindersPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [reminders, setReminders] = useState([])
  const [events, setEvents] = useState([])
  const [selectedReminder, setSelectedReminder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        const [remindersList, eventsList] = await Promise.all([
          getRemindersByUser(user.uid),
          getAllEvents(),
        ])

        setReminders(remindersList)
        setEvents(eventsList)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const getEventTitle = (eventId) => {
    const event = events.find((e) => e.id === eventId)
    return event?.title || 'Unknown Event'
  }

  const getEvent = (eventId) => {
    return events.find((e) => e.id === eventId)
  }

  const handleRemoveReminder = async (reminderId) => {
    if (!window.confirm('Remove this reminder?')) return

    try {
      await removeReminder(reminderId)
      setReminders((prev) => prev.filter((r) => r.id !== reminderId))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main style={styles.container}>
      <h1>My Reminders</h1>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={styles.loading}>Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p style={styles.empty}>No reminders set yet. Go to events and click &quot;Remind Me&quot;!</p>
      ) : (
        <div style={styles.remindersList}>
          {reminders.map((reminder) => (
            <div key={reminder.id} style={styles.reminderCard}>
              <div style={styles.reminderInfo}>
                <h3>{getEventTitle(reminder.eventId)}</h3>
                <p style={styles.reminderTime}>
                  🔔 Remind me <strong>{reminder.reminderTime}</strong> before the event
                </p>
              </div>

              <div style={styles.reminderActions}>
                <button
                  onClick={() => setSelectedReminder(reminder)}
                  style={styles.editBtn}
                >
                  ⚙️ Edit
                </button>
                <button
                  onClick={() => handleRemoveReminder(reminder.id)}
                  style={styles.deleteBtn}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReminder && (
        <ReminderSettings
          reminder={selectedReminder}
          event={getEvent(selectedReminder.eventId)}
          onClose={() => setSelectedReminder(null)}
          onUpdate={() => {
            // Refresh reminders list
            if (user) {
              getRemindersByUser(user.uid).then(setReminders)
            }
          }}
        />
      )}
    </main>
  )
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
  },
  error: {
    color: '#d32f2f',
    padding: '1rem',
    backgroundColor: '#ffebee',
    borderRadius: '5px',
    marginBottom: '1rem',
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    padding: '2rem',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '2rem',
    fontSize: '1.1rem',
  },
  remindersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  reminderCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '1px solid #ecf0f1',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderInfo_h3: {
    margin: '0 0 0.5rem 0',
    color: '#2c3e50',
  },
  reminderTime: {
    color: '#666',
    margin: '0',
    fontSize: '0.95rem',
  },
  reminderActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  deleteBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
}

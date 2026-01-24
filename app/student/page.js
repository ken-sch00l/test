// Student dashboard - view events and set reminders
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { getEventsByDepartment, addReminder, getRemindersByUser, removeReminder } from '@/lib/events'
import { doc, getDoc } from 'firebase/firestore'
import EventCard from '@/components/EventCard'
import Navbar from '@/components/Navbar'

const departments = ['Engineering', 'Business', 'Arts', 'Science', 'Medicine', 'Law']

export default function StudentDashboard() {
  const [events, setEvents] = useState([])
  const [userDepartment, setUserDepartment] = useState('Engineering')
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [notificationText, setNotificationText] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        // You can set user's department here (for now, default to first department)
        fetchReminders(user.uid)
        await fetchEvents('Engineering')
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchEvents = async (department) => {
    try {
      setLoading(true)
      const data = await getEventsByDepartment(department)
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReminders = async (userId) => {
    try {
      const data = await getRemindersByUser(userId)
      setReminders(data)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
  }

  const handleDepartmentChange = (dept) => {
    setUserDepartment(dept)
    fetchEvents(dept)
  }

  const handleRemind = async (eventId) => {
    // Check if already reminded
    if (reminders.some((r) => r.eventId === eventId)) {
      alert('You already have a reminder for this event!')
      return
    }

    try {
      await addReminder(user.uid, eventId)
      setNotificationText('✅ Reminder added! You will see visual highlights for upcoming events.')
      setTimeout(() => setNotificationText(''), 3000)

      // Refresh reminders
      fetchReminders(user.uid)
    } catch (error) {
      alert('Error adding reminder: ' + error.message)
    }
  }

  const handleRemoveReminder = async (reminderId) => {
    try {
      await removeReminder(reminderId)
      setReminders(reminders.filter((r) => r.id !== reminderId))
      setNotificationText('🗑️ Reminder removed')
      setTimeout(() => setNotificationText(''), 3000)
    } catch (error) {
      alert('Error removing reminder: ' + error.message)
    }
  }

  const reminderEventIds = new Set(reminders.map((r) => r.eventId))

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>My Events</h1>

        {notificationText && <div style={styles.notification}>{notificationText}</div>}

        <div style={styles.controls}>
          <label style={styles.label}>Filter by Department:</label>
          <select
            value={userDepartment}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            style={styles.select}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {user && (
          <div style={styles.remindersSection}>
            <h2>My Reminders ({reminders.length})</h2>
            {reminders.length === 0 ? (
              <p style={styles.noReminders}>No reminders yet. Click "Remind Me" on events!</p>
            ) : (
              <ul style={styles.remindersList}>
                {reminders.map((reminder) => {
                  const event = events.find((e) => e.id === reminder.eventId)
                  return (
                    <li key={reminder.id} style={styles.reminderItem}>
                      {event ? event.title : 'Event not found'}
                      <button
                        onClick={() => handleRemoveReminder(reminder.id)}
                        style={styles.removeBtn}
                      >
                        ✕
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p style={styles.noEvents}>No events for {userDepartment}</p>
        ) : (
          <div>
            <p style={styles.count}>Total Events: {events.length}</p>
            {events.map((event) => (
              <div key={event.id}>
                <EventCard
                  event={event}
                  onRemind={() => handleRemind(event.id)}
                  showActions={false}
                />
                {reminderEventIds.has(event.id) && (
                  <p style={styles.reminderBadge}>🔔 You have a reminder for this event</p>
                )}
              </div>
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
  controls: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  remindersSection: {
    backgroundColor: '#f0f8ff',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    border: '1px solid #3498db',
  },
  remindersList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  reminderItem: {
    backgroundColor: 'white',
    padding: '0.75rem 1rem',
    marginBottom: '0.5rem',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #3498db',
  },
  removeBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  noReminders: {
    color: '#7f8c8d',
    fontStyle: 'italic',
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
  reminderBadge: {
    backgroundColor: '#e8f5e9',
    color: '#27ae60',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginTop: '-0.8rem',
    marginBottom: '1rem',
  },
  notification: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #c3e6cb',
  },
}

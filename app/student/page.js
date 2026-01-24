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
import ReminderSettings from '@/components/ReminderSettings'

const departments = ['Engineering', 'Business', 'Arts', 'Science', 'Medicine', 'Law']

export default function StudentDashboard() {
  const [events, setEvents] = useState([])
  const [userDepartment, setUserDepartment] = useState('Engineering')
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [notificationText, setNotificationText] = useState('')
  const [selectedReminder, setSelectedReminder] = useState(null)
  const [pendingReminderEventId, setPendingReminderEventId] = useState(null)
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

    // Show modal to select reminder time
    setPendingReminderEventId(eventId)
    setSelectedReminder({
      id: null,
      eventId: eventId,
      reminderTime: '1 day',
    })
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

          {/* Demo Button */}
          <button
            onClick={() => {
              if (window.showDemoAlert) {
                window.showDemoAlert('🎉 Event is starting now!', 'warning', 5000)
              }
            }}
            style={styles.demoBtn}
            title="Test notification system"
          >
            🔔 Demo Alert
          </button>
        </div>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p style={styles.noEvents}>No events for {userDepartment}</p>
        ) : (
          <div>
            <p style={styles.count}>Total Events: {events.length}</p>
            {/* Sort events: un-reminded first */}
            {events
              .sort((a, b) => {
                const aReminded = reminders.some((r) => r.eventId === a.id)
                const bReminded = reminders.some((r) => r.eventId === b.id)
                return aReminded - bReminded // false (0) comes before true (1)
              })
              .map((event) => {
                const reminder = reminders.find((r) => r.eventId === event.id)
                const isShowingModal = (selectedReminder && pendingReminderEventId === event.id) || (selectedReminder?.eventId === event.id && !pendingReminderEventId)
              return (
                <div key={event.id}>
                  <div style={styles.eventWrapper}>
                    <EventCard
                      event={event}
                      onRemind={() => handleRemind(event.id)}
                      showActions={false}
                    />
                    {reminder && (
                      <div style={styles.remindedBadge}>
                        ✅ Reminded - {reminder.reminderTime} before
                        <button
                          onClick={() => setSelectedReminder(reminder)}
                          style={styles.editReminderBtn}
                        >
                          ⚙️ Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Modal appears just below the event */}
                  {isShowingModal && selectedReminder && (
                    <div style={{ marginTop: '1rem' }}>
                      <ReminderSettings
                        reminder={selectedReminder}
                        event={event}
                        onClose={() => {
                          setSelectedReminder(null)
                          setPendingReminderEventId(null)
                        }}
                        onUpdate={() => {
                          if (user) {
                            fetchReminders(user.uid)
                          }
                          setPendingReminderEventId(null)
                        }}
                        userId={user?.uid}
                        isNewReminder={pendingReminderEventId === event.id}
                      />
                    </div>
                  )}
                </div>
              )
            })}
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
    padding: 'clamp(0.5rem, 3vw, 1rem)',
    width: '100%',
    boxSizing: 'border-box',
  },
  controls: {
    backgroundColor: '#f5f5f5',
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    borderRadius: '8px',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(0.5rem, 1.5vw, 0.75rem)',
  },
  label: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  select: {
    padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    width: '100%',
    minHeight: '44px',
  },
  demoBtn: {
    padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
    backgroundColor: '#9b59b6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
    fontWeight: 'bold',
    minHeight: '44px',
    width: '100%',
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
  eventWrapper: {
    marginBottom: '1.5rem',
  },
  remindedBadge: {
    backgroundColor: '#e8f5e9',
    color: '#27ae60',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginTop: '-0.8rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '500',
  },
  reminderBadge: {
    backgroundColor: '#e8f5e9',
    color: '#27ae60',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginTop: '-0.8rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editReminderBtn: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
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

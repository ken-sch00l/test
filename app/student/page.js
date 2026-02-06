// Student dashboard - view events and set reminders
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { getEventsByDepartment, addReminder, getRemindersByUser, removeReminder, getAllEvents } from '@/lib/events'
import { doc, getDoc } from 'firebase/firestore'
import EventCard from '@/components/EventCard'
import ReminderSettings from '@/components/ReminderSettings'

const departments = ['All', 'CIT', 'CTELA', 'CCJE', 'CABM', 'COT']

export default function StudentDashboard() {
  const [events, setEvents] = useState([])
  const [userDepartment, setUserDepartment] = useState('CIT')
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [notificationText, setNotificationText] = useState('')
  const [selectedReminder, setSelectedReminder] = useState(null)
  const [pendingReminderEventId, setPendingReminderEventId] = useState(null)
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        // You can set user's department here (for now, default to first department)
        fetchReminders(user.uid)
        await fetchEvents('CIT')
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchEvents = async (department) => {
    try {
      setLoading(true)
      const data = department === 'All' 
        ? await getAllEvents()
        : await getEventsByDepartment(department)
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = event.date?.toDate?.() || new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
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
    // Scroll to events section
    setTimeout(() => scrollToSection('events-section'), 100)
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

  // Helper function to categorize events
  const categorizeEvents = (events) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return events.reduce((acc, event) => {
      const eventDate = event.date?.toDate?.() || new Date(event.date)
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

      // Check if event is today (any time today, including past events that started today)
      if (eventDateOnly.getTime() === today.getTime()) {
        acc.today.push(event)
      } else if (eventDateOnly.getTime() === tomorrow.getTime()) {
        acc.upcoming.push(event) // Tomorrow's events are now "upcoming"
      } else if (eventDateOnly < today) {
        acc.finished.push(event)
      } else {
        // Events beyond tomorrow are not categorized in the main sections
        // They can still be seen in the calendar
      }

      return acc
    }, { today: [], upcoming: [], finished: [] })
  }

  const categorizedEvents = categorizeEvents(events)

  return (
    <div style={styles.container} className="student-container">
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>🎓 College Updates</h1>
          <p style={styles.heroSubtitle}>Stay connected with the latest announcements and events from our college community</p>
          <div style={styles.heroLinks}>
            {[
              { name: 'CIT KCP', url: 'https://www.facebook.com/cit.kcp' },
              { name: 'OSA', url: 'https://www.facebook.com/profile.php?id=61581331341296' },
              { name: 'Rover Scouts', url: 'https://www.facebook.com/profile.php?id=61571772553628' },
              { name: 'Sports', url: 'https://www.facebook.com/profile.php?id=61583063666351' },
              { name: 'CCJE', url: 'https://www.facebook.com/profile.php?id=100087032413363' },
              { name: 'COT', url: 'https://www.facebook.com/profile.php?id=100091625131701' },
              { name: 'CTELA', url: 'https://www.facebook.com/profile.php?id=61563089039870' },
              { name: 'CABM', url: 'https://www.facebook.com/profile.php?id=61566353130542' },
              { name: 'The Loquitur', url: 'https://www.facebook.com/profile.php?id=100090613778075' },
              { name: 'Kings College', url: 'https://www.facebook.com/Kings.College' }
            ].map((link, index) => (
              <a 
                key={index} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.heroLink}
                className="hero-link"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.header} className="student-header">
        <div style={styles.headerContent}>
          <h1 style={styles.title}>📚 My Events Dashboard</h1>
          <p style={styles.subtitle}>Discover and set reminders for events in your department</p>
        </div>
        <div style={styles.headerDecoration} className="student-header-decoration">
          <div style={styles.floatingIcon} className="student-floating-icon">📅</div>
          <div style={styles.floatingIcon} className="student-floating-icon">🔔</div>
          <div style={styles.floatingIcon} className="student-floating-icon">🎯</div>
        </div>
      </div>

      {notificationText && <div style={styles.notification}>{notificationText}</div>}

      <div style={styles.controls} className="student-controls">
        <div style={styles.filterSection} className="student-filter-section">
          <label style={styles.label}>🎓 Filter by Department:</label>
          <div style={styles.filterButtons}>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => handleDepartmentChange(dept)}
                style={{
                  ...styles.filterBtn,
                  ...(userDepartment === dept ? styles.filterBtnActive : {})
                }}
                className={`filter-btn ${userDepartment === dept ? 'filter-btn-active' : ''}`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* My Reminders Button */}
        <button
          onClick={() => setIsRemindersModalOpen(true)}
          style={styles.remindersBtn}
          className="reminders-btn"
          title="View and manage your reminders"
        >
          🔔 My Reminders ({reminders.length})
        </button>

        {/* Demo Button */}
        <button
          onClick={() => {
            if (window.showDemoAlert) {
              window.showDemoAlert('🎉 Event is starting now!', 'warning', 5000)
            }
          }}
          style={styles.demoBtn}
          className="demo-btn"
          title="Test notification system"
        >
          🔔 Demo Alert
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>No events found</h3>
          <p>No events available for {userDepartment} department at the moment.</p>
          <p>Try selecting a different department or check back later!</p>
        </div>
      ) : (
        <div style={styles.eventsSection} className="student-events-section">
          {/* Today's Events */}
          <div style={styles.categorySection}>
            <h2 style={styles.categoryTitle}>📅 Today&apos;s Events</h2>
            {categorizedEvents.today.length === 0 ? (
              <p style={styles.noEvents}>No events today</p>
            ) : (
              <div style={styles.eventsGrid}>
                {categorizedEvents.today
                  .sort((a, b) => {
                    const aReminded = reminders.some((r) => r.eventId === a.id)
                    const bReminded = reminders.some((r) => r.eventId === b.id)
                    return aReminded - bReminded
                  })
                  .map((event) => {
                    const reminder = reminders.find((r) => r.eventId === event.id)
                    const isShowingModal = (selectedReminder && pendingReminderEventId === event.id) || (selectedReminder?.eventId === event.id && !pendingReminderEventId)
                    return (
                      <div key={event.id} style={styles.eventItem} className="event-item">
                        <div style={styles.eventWrapper}>
                          <EventCard
                            event={event}
                            onRemind={() => handleRemind(event.id)}
                            showActions={false}
                          />
                          {reminder && (
                            <div style={styles.remindedBadge} className="student-reminded-badge">
                              <span>✅ Reminded - {reminder.reminderTime} before</span>
                              <button
                                onClick={() => setSelectedReminder(reminder)}
                                style={styles.editReminderBtn}
                                className="edit-reminder-btn"
                              >
                                ⚙️ Edit
                              </button>
                            </div>
                          )}
                        </div>
                        {isShowingModal && selectedReminder && (
                          <div style={styles.modalContainer}>
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

          {/* All Events */}
          <div style={styles.categorySection}>
            <h2 style={styles.categoryTitle}>📊 All Events</h2>
            {events.length === 0 ? (
              <p style={styles.noEvents}>No events available</p>
            ) : (
              <div style={styles.eventsGrid}>
                {events
                  .sort((a, b) => {
                    const aReminded = reminders.some((r) => r.eventId === a.id)
                    const bReminded = reminders.some((r) => r.eventId === b.id)
                    return aReminded - bReminded
                  })
                  .map((event) => {
                    const reminder = reminders.find((r) => r.eventId === event.id)
                    const isShowingModal = (selectedReminder && pendingReminderEventId === event.id) || (selectedReminder?.eventId === event.id && !pendingReminderEventId)
                    return (
                      <div key={event.id} style={styles.eventItem} className="event-item">
                        <div style={styles.eventWrapper}>
                          <EventCard
                            event={event}
                            onRemind={() => handleRemind(event.id)}
                            reminder={reminder}
                            showActions={false}
                          />
                          {reminder && (
                            <div style={styles.remindedBadge} className="student-reminded-badge">
                              <span>✅ Reminded - {reminder.reminderTime} before</span>
                              <button
                                onClick={() => setSelectedReminder(reminder)}
                                style={styles.editReminderBtn}
                                className="edit-reminder-btn"
                              >
                                ⚙️ Edit
                              </button>
                            </div>
                          )}
                        </div>
                        {isShowingModal && selectedReminder && (
                          <div style={styles.modalContainer}>
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

          {/* Upcoming Events */}
          <div style={styles.categorySection}>
            <h2 style={styles.categoryTitle}>🔮 Upcoming Events</h2>
            {categorizedEvents.upcoming.length === 0 ? (
              <p style={styles.noEvents}>No upcoming events</p>
            ) : (
              <div style={styles.eventsGrid}>
                {categorizedEvents.upcoming
                  .sort((a, b) => {
                    const aReminded = reminders.some((r) => r.eventId === a.id)
                    const bReminded = reminders.some((r) => r.eventId === b.id)
                    return aReminded - bReminded
                  })
                  .map((event) => {
                    const reminder = reminders.find((r) => r.eventId === event.id)
                    const isShowingModal = (selectedReminder && pendingReminderEventId === event.id) || (selectedReminder?.eventId === event.id && !pendingReminderEventId)
                    return (
                      <div key={event.id} style={styles.eventItem} className="event-item">
                        <div style={styles.eventWrapper}>
                          <EventCard
                            event={event}
                            onRemind={() => handleRemind(event.id)}
                            showActions={false}
                          />
                          {reminder && (
                            <div style={styles.remindedBadge} className="student-reminded-badge">
                              <span>✅ Reminded - {reminder.reminderTime} before</span>
                              <button
                                onClick={() => setSelectedReminder(reminder)}
                                style={styles.editReminderBtn}
                                className="edit-reminder-btn"
                              >
                                ⚙️ Edit
                              </button>
                            </div>
                          )}
                        </div>
                        {isShowingModal && selectedReminder && (
                          <div style={styles.modalContainer}>
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

          {/* Finished Events */}
          <div style={styles.categorySection}>
            <h2 style={styles.categoryTitle}>✅ Finished Events</h2>
            {categorizedEvents.finished.length === 0 ? (
              <p style={styles.noEvents}>No finished events</p>
            ) : (
              <div style={styles.eventsGrid}>
                {categorizedEvents.finished
                  .sort((a, b) => {
                    const aReminded = reminders.some((r) => r.eventId === a.id)
                    const bReminded = reminders.some((r) => r.eventId === b.id)
                    return aReminded - bReminded
                  })
                  .map((event) => {
                    const reminder = reminders.find((r) => r.eventId === event.id)
                    return (
                      <div key={event.id} style={styles.eventItem} className="event-item">
                        <div style={styles.eventWrapper}>
                          <EventCard
                            event={event}
                            showActions={false}
                          />
                          {reminder && (
                            <div style={styles.remindedBadge} className="student-reminded-badge">
                              <span>✅ Reminded - {reminder.reminderTime} before</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reminders Modal */}
      {isRemindersModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsRemindersModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>🔔 My Reminders</h2>
              <button 
                onClick={() => setIsRemindersModalOpen(false)} 
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              {reminders.length === 0 ? (
                <div style={styles.emptyReminders}>
                  <div style={styles.emptyIcon}>🔔</div>
                  <h3>No reminders set</h3>
                  <p>You haven&apos;t set any reminders yet. Click &quot;Remind Me&quot; on events to get notified!</p>
                </div>
              ) : (
                <div style={styles.remindersList}>
                  {reminders.map((reminder) => (
                    <div key={reminder.id} style={styles.reminderItem}>
                      <div style={styles.reminderInfo}>
                        <h4>{reminder.eventTitle || 'Event'}</h4>
                        <p>Reminder: {reminder.reminderTime} before</p>
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
                          style={styles.removeBtn}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reminder Settings Modal */}
      {selectedReminder && !pendingReminderEventId && (
        <div style={styles.modalOverlay} onClick={() => setSelectedReminder(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <ReminderSettings
              reminder={selectedReminder}
              event={events.find(e => e.id === selectedReminder.eventId)}
              onClose={() => setSelectedReminder(null)}
              onUpdate={() => {
                if (user) {
                  fetchReminders(user.uid)
                }
              }}
              userId={user?.uid}
              isNewReminder={false}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    animation: 'fadeIn 0.5s ease-in',
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  heroContent: {
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '2.5rem',
    margin: '0 0 1rem 0',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    margin: '0 0 2rem 0',
    opacity: 0.9,
  },
  heroLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  heroLink: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255,255,255,0.2)',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    padding: '2rem 1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  headerDecoration: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  floatingIcon: {
    fontSize: '1.5rem',
    animation: 'float 3s ease-in-out infinite',
    opacity: 0.8,
  },
  title: {
    fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
    margin: 0,
    opacity: 0.9,
  },
  controls: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e1e5e9',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: '1',
    minWidth: '200px',
  },
  label: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '1rem',
  },
  select: {
    padding: '0.75rem',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: '#f8f9fa',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    width: '100%',
  },
  filterButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  filterBtn: {
    padding: '0.75rem 1.25rem',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '80px',
  },
  filterBtnActive: {
    backgroundColor: '#3498db',
    border: '2px solid #3498db',
    color: 'white',
    boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
  },
  demoBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#9b59b6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(155, 89, 182, 0.3)',
    whiteSpace: 'nowrap',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '2px dashed #dee2e6',
    margin: '2rem 0',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  eventsSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
    border: '1px solid #e1e5e9',
  },
  categorySection: {
    marginBottom: '3rem',
  },
  categoryTitle: {
    fontSize: '1.5rem',
    color: '#2c3e50',
    marginBottom: '1rem',
    fontWeight: 'bold',
    borderBottom: '2px solid #3498db',
    paddingBottom: '0.5rem',
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  noEvents: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    margin: '1rem 0',
  },
  eventsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f0f0f0',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  eventsTitle: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    margin: 0,
    fontWeight: 'bold',
  },
  eventCount: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  eventItem: {
    marginBottom: '2rem',
    transition: 'transform 0.2s ease',
  },
  eventWrapper: {
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  },
  remindedBadge: {
    backgroundColor: '#e8f5e9',
    color: '#27ae60',
    padding: '1rem',
    borderRadius: '0 0 8px 8px',
    fontSize: '0.95rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '500',
    borderTop: '1px solid #c8e6c9',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  editReminderBtn: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
  },
  modalContainer: {
    marginTop: '1rem',
    animation: 'slideDown 0.3s ease-out',
  },
  notification: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #c3e6cb',
    animation: 'slideIn 0.3s ease-out',
  },
  calendarSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
  },
  calendarContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  calendarTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: 0,
  },
  calendarNavBtn: {
    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  calendarDayHeader: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#7f8c8d',
    padding: '0.75rem',
    fontSize: '0.9rem',
  },
  calendarDay: {
    aspectRatio: '1',
    border: '1px solid #ecf0f1',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  calendarDayWithEvents: {
    backgroundColor: '#fff3cd',
    border: '1px solid #f39c12',
    cursor: 'pointer',
  },
  calendarDayToday: {
    backgroundColor: '#d4edda',
    border: '1px solid #27ae60',
    fontWeight: 'bold',
  },
  calendarDayNumber: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#2c3e50',
  },
  eventIndicator: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#e74c3c',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  remindersBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#9b59b6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(155, 89, 182, 0.3)',
    whiteSpace: 'nowrap',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    animation: 'modalFadeIn 0.3s ease-out',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e1e5e9',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#7f8c8d',
    padding: '0.25rem',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  modalBody: {
    padding: '1.5rem',
  },
  emptyReminders: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  remindersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  reminderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e1e5e9',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  removeBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
}

// Add CSS animations
const globalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.9) translateY(-20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .event-item:hover {
    transform: translateY(-2px);
  }
  
  .controls:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  
  .select:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    outline: none;
  }
  
  .demo-btn:hover {
    background-color: #8e44ad;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.4);
  }
  
  .edit-reminder-btn:hover {
    background-color: #1976d2;
    transform: translateY(-1px);
  }
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .student-container {
      padding: 0 0.5rem;
    }
    
    .student-controls {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
      padding: 1rem;
    }
    
    .student-filter-section {
      min-width: unset;
    }
    
    .student-events-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .student-events-section {
      padding: 1rem;
    }
    
    .student-reminded-badge {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .student-header-decoration {
      gap: 0.5rem;
    }
    
    .student-floating-icon {
      font-size: 1.2rem;
    }
  }
  
  .filter-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .filter-btn-active {
    background-color: #2980b9 !important;
    border-color: #2980b9 !important;
  }
  
  .hero-link:hover {
    background-color: rgba(255,255,255,0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  
  .calendar-nav-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  }
  
  .calendar-day:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .calendar-day-with-events:hover {
    background-color: #f39c12;
    color: white;
  }
  
  .reminders-btn:hover {
    background-color: #8e44ad;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.4);
  }
  
  .close-button:hover {
    background-color: #ecf0f1;
    color: #2c3e50;
  }
  
  .edit-btn:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
  }
  
  .remove-btn:hover {
    background-color: #c0392b;
    transform: translateY(-1px);
  }
  
  @media (max-width: 480px) {
    .student-container {
      padding: 0 0.25rem;
    }
    
    .student-controls {
      padding: 0.75rem;
    }
    
    .student-events-section {
      padding: 0.75rem;
    }
    
    .student-header {
      padding: 1.5rem 0.75rem;
      margin-bottom: 1.5rem;
    }
  }
`

// Inject global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = globalStyles
  document.head.appendChild(style)
}

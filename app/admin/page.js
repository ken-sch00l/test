// Admin dashboard - events list and creation
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { getAllEvents, deleteEvent, addEvent } from '@/lib/events'
import EventCard from '@/components/EventCard'

export default function AdminDashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  
  // Filter state
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '09:00',
    location: {
      type: 'Ebenezer Convention Center',
      customText: ''
    },
    department: 'CIT'
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const departments = ['All', 'CIT', 'CABM', 'CCJE', 'COT', 'CTELA']

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.title.trim()) {
      setFormError('Title is required')
      return
    }

    if (!formData.date) {
      setFormError('Date is required')
      return
    }

    setFormLoading(true)

    try {
      const [hours, minutes] = formData.time.split(':').map(Number)
      const eventDateTime = new Date(formData.date)
      eventDateTime.setHours(hours, minutes, 0, 0)

      const locationValue = formData.location.type === 'Others' 
        ? formData.location.customText 
        : formData.location.type

      await addEvent({
        title: formData.title,
        description: formData.description,
        location: locationValue,
        date: eventDateTime,
        time: formData.time,
        department: formData.department,
        createdBy: user.email,
      })

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '09:00',
        location: {
          type: 'Ebenezer Convention Center',
          customText: ''
        },
        department: 'CIT'
      })
      setIsCreateModalOpen(false)
      
      // Refresh events
      fetchEvents()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
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

  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Helper function to categorize events
  const categorizeEvents = (events) => {
    // Filter events by selected department
    const filteredEvents = selectedDepartment === 'All' 
      ? events 
      : events.filter(event => event.department === selectedDepartment)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return filteredEvents.reduce((acc, event) => {
      const eventDate = event.date?.toDate?.() || new Date(event.date)
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

      // Check if event is today (any time today, including past events that started today)
      if (eventDateOnly.getTime() === today.getTime()) {
        acc.today.push(event)
      } else if (eventDateOnly.getTime() === tomorrow.getTime()) {
        acc.upcoming.push(event) // Tomorrow's events are now "upcoming"
      } else if (eventDateOnly < today) {
        acc.history.push(event)
      } else {
        // Events beyond tomorrow are not categorized in the main sections
        // They can still be seen in the calendar
      }

      return acc
    }, { today: [], upcoming: [], history: [] })
  }

  const categorizedEvents = categorizeEvents(events)

  return (
    <div style={styles.container}>
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

      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>⚙️ Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage events and oversee the system</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => setIsCreateModalOpen(true)} style={styles.createBtn}>
            ➕ Create New Event
          </button>
          <button onClick={() => setIsManageModalOpen(true)} style={styles.manageBtn}>
            📋 Manage Events
          </button>
          <button onClick={() => router.push('/')} style={styles.backBtn}>
            🏠 Back to Home
          </button>
        </div>
      </div>

      {/* Department Filter */}
      <div style={styles.filterSection}>
        <label style={styles.filterLabel}>🏫 Filter by Department:</label>
        <div style={styles.filterButtons}>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              style={{
                ...styles.filterBtn,
                ...(selectedDepartment === dept ? styles.filterBtnActive : {})
              }}
              className={`filter-btn ${selectedDepartment === dept ? 'filter-btn-active' : ''}`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.stats}>
        <div style={{...styles.statCard, cursor: 'pointer'}} className="stat-card" onClick={() => scrollToSection('today-events')}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statInfo}>
            <h3>{categorizedEvents.today.length}</h3>
            <p>Today&apos;s Events</p>
          </div>
        </div>
        <div style={{...styles.statCard, cursor: 'pointer'}} className="stat-card" onClick={() => scrollToSection('upcoming-events')}>
          <div style={styles.statIcon}>🔮</div>
          <div style={styles.statInfo}>
            <h3>{categorizedEvents.upcoming.length}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>
        <div style={{...styles.statCard, cursor: 'pointer'}} className="stat-card" onClick={() => scrollToSection('event-history')}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statInfo}>
            <h3>{categorizedEvents.history.length}</h3>
            <p>Event History</p>
          </div>
        </div>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statInfo}>
            <h3>{events.length}</h3>
            <p>Total Events</p>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div style={styles.calendarSection}>
        <h2 style={styles.sectionTitle}>📅 Event Calendar</h2>
        <div style={styles.calendarContainer}>
          <div style={styles.calendarHeader}>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={styles.calendarNavBtn} className="calendar-nav-btn">
              ‹
            </button>
            <h3 style={styles.calendarTitle}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={styles.calendarNavBtn} className="calendar-nav-btn">
              ›
            </button>
          </div>
          <div style={styles.calendarGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={styles.calendarDayHeader}>{day}</div>
            ))}
            {getDaysInMonth(currentMonth).map((date, index) => (
              <div
                key={index}
                style={{
                  ...styles.calendarDay,
                  ...(date && getEventsForDate(date).length > 0 ? styles.calendarDayWithEvents : {}),
                  ...(date && date.toDateString() === new Date().toDateString() ? styles.calendarDayToday : {})
                }}
                className={date && getEventsForDate(date).length > 0 ? "calendar-day calendar-day-with-events" : "calendar-day"}
                onClick={() => date && getEventsForDate(date).length > 0 && scrollToSection(
                  date < new Date() ? 'event-history' :
                  date.toDateString() === new Date().toDateString() ? 'today-events' :
                  date.toDateString() === new Date(Date.now() + 86400000).toDateString() ? 'upcoming-events' :
                  null // Future dates beyond tomorrow don't have a specific section
                )}
              >
                {date && (
                  <>
                    <span style={styles.calendarDayNumber}>{date.getDate()}</span>
                    {getEventsForDate(date).length > 0 && (
                      <div style={styles.eventIndicator}>
                        {getEventsForDate(date).length}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.eventsSection}>
        <h2 id="today-events" style={styles.sectionTitle}>📅 Today&apos;s Events</h2>

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Loading events...</p>
          </div>
        ) : categorizedEvents.today.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3>No events for today</h3>
            <p>All caught up! Check upcoming events.</p>
          </div>
        ) : (
          <div style={styles.eventsList}>
            {categorizedEvents.today.map((event) => (
              <div key={event.id} style={styles.eventItem}>
                <EventCard
                  event={event}
                  onEdit={() => handleEdit(event.id)}
                  onDelete={() => handleDelete(event.id)}
                  showActions={true}
                />
              </div>
            ))}
          </div>
        )}

        <h2 id="upcoming-events" style={styles.sectionTitle}>🔮 Upcoming Events</h2>

        {categorizedEvents.upcoming.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3>No Upcoming Events</h3>
            <p>Schedule upcoming events to stay ahead!</p>
            <button onClick={() => setIsCreateModalOpen(true)} style={styles.createBtn}>
              ➕ Create Event
            </button>
          </div>
        ) : (
          <div style={styles.eventsList}>
            {categorizedEvents.upcoming.map((event) => (
              <div key={event.id} style={styles.eventItem}>
                <EventCard
                  event={event}
                  onEdit={() => handleEdit(event.id)}
                  onDelete={() => handleDelete(event.id)}
                  showActions={true}
                />
              </div>
            ))}
          </div>
        )}

        <h2 id="event-history" style={styles.sectionTitle}>📚 Event History</h2>

        {categorizedEvents.history.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3>No past events</h3>
            <p>Completed events will appear here.</p>
          </div>
        ) : (
          <div style={styles.eventsList}>
            {categorizedEvents.history.map((event) => (
              <div key={event.id} style={styles.eventItem}>
                <EventCard
                  event={event}
                  showActions={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Event</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>

            {formError && <div style={styles.error}>{formError}</div>}

            <form onSubmit={handleCreateEvent} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  style={styles.input}
                  placeholder="e.g., Tech Workshop"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  style={styles.textarea}
                  placeholder="Event details..."
                  rows="4"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <div style={styles.radioGroup}>
                  {['Ebenezer Convention Center', 'Function Hall', 'Founder\'s Hall', 'KCP Grounds', 'Others'].map((location) => (
                    <label key={location} style={styles.radioLabel} className="radio-label">
                      <input
                        type="radio"
                        name="location"
                        value={location}
                        checked={formData.location.type === location}
                        onChange={(e) => handleFormChange('location', { ...formData.location, type: e.target.value })}
                        style={styles.radioInput}
                      />
                      <span style={styles.radioText}>{location}</span>
                    </label>
                  ))}
                </div>
                {formData.location.type === 'Others' && (
                  <input
                    type="text"
                    value={formData.location.customText}
                    onChange={(e) => handleFormChange('location', { ...formData.location, customText: e.target.value })}
                    style={styles.input}
                    placeholder="Specify location..."
                  />
                )}
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleFormChange('time', e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <select 
                  value={formData.department} 
                  onChange={(e) => handleFormChange('department', e.target.value)} 
                  style={styles.select}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)} 
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading} 
                  style={styles.submitBtn}
                >
                  {formLoading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Events Modal */}
      {isManageModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsManageModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Manage Events</h2>
              <button 
                onClick={() => setIsManageModalOpen(false)} 
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.manageContent}>
              {loading ? (
                <div style={styles.loading}>
                  <div style={styles.spinner}></div>
                  <p>Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📭</div>
                  <h3>No events found</h3>
                  <p>Create your first event to get started!</p>
                  <button onClick={() => { setIsManageModalOpen(false); setIsCreateModalOpen(true); }} style={styles.createBtn}>
                    ➕ Create Event
                  </button>
                </div>
              ) : (
                <div style={styles.eventsList}>
                  {events.map((event) => (
                    <div key={event.id} style={styles.manageEventItem}>
                      <EventCard
                        event={event}
                        onEdit={() => handleEdit(event.id)}
                        onDelete={() => handleDelete(event.id)}
                        showActions={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1rem',
    animation: 'fadeIn 0.5s ease-in',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: '2.5rem',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontSize: '1.1rem',
    margin: 0,
    opacity: 0.9,
  },
  headerActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  createBtn: {
    background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  manageBtn: {
    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e1e5e9',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  statIcon: {
    fontSize: '2.5rem',
    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  statInfo: {
    flex: 1,
  },
  'statInfo h3': {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 0.25rem 0',
  },
  'statInfo p': {
    color: '#7f8c8d',
    margin: 0,
    fontSize: '0.9rem',
  },
  eventsSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
    border: '1px solid #e1e5e9',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    marginBottom: '1.5rem',
    fontWeight: 'bold',
    borderBottom: '2px solid #3498db',
    paddingBottom: '0.5rem',
  },
  eventsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  eventItem: {
    transition: 'transform 0.2s ease',
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
    opacity: 0.5,
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
    borderColor: '#f39c12',
    cursor: 'pointer',
  },
  calendarDayToday: {
    backgroundColor: '#d4edda',
    borderColor: '#27ae60',
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
  form: {
    padding: '1.5rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#2c3e50',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '100px',
    transition: 'border-color 0.2s ease',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    transition: 'border-color 0.2s ease',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
  },
  radioInput: {
    marginRight: '0.75rem',
    cursor: 'pointer',
  },
  radioText: {
    fontSize: '1rem',
    color: '#2c3e50',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  submitBtn: {
    flex: 1,
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.875rem 1.5rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c0392b',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    border: '1px solid #fecaca',
    fontSize: '0.9rem',
  },
  manageContent: {
    padding: '1.5rem',
    maxHeight: '70vh',
    overflow: 'auto',
  },
  manageEventItem: {
    marginBottom: '1rem',
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
  filterSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e1e5e9',
  },
  filterLabel: {
    display: 'block',
    marginBottom: '1rem',
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '1.1rem',
  },
  filterButtons: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    border: '1px solid #dee2e6',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    backgroundColor: '#3498db',
    color: 'white',
    borderColor: '#3498db',
  },
}

// Add CSS animations
const adminStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.9) translateY(-20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  
  .create-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
  }
  
  .manage-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  }
  
  .back-btn:hover {
    background-color: rgba(255,255,255,0.2);
    transform: translateY(-2px);
  }
  
  .event-item:hover {
    transform: translateY(-2px);
  }
  
  .hero-link:hover {
    background-color: rgba(255,255,255,0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  
  .filter-btn:hover {
    background-color: #e9ecef;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .filter-btn-active:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
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
  
  .close-button:hover {
    background-color: #ecf0f1;
    color: #2c3e50;
  }
  
  .submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
  }
  
  .cancel-btn:hover {
    background-color: #7f8c8d;
    transform: translateY(-1px);
  }
  
  .radio-label:hover {
    background-color: #f8f9fa;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = adminStyles
  document.head.appendChild(style)
}

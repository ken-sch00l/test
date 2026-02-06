'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { getRemindersByUser, getAllEvents } from '@/lib/events'
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore'

export default function FloatingActionButton() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [reminders, setReminders] = useState([])
  const [events, setEvents] = useState([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [userDepartment, setUserDepartment] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        // Get role from localStorage
        const savedRole = localStorage.getItem('userRole')
        // Force update by setting it after a micro task
        if (savedRole) {
          setRole(savedRole)
        }

        // Fetch user department if student
        if (savedRole === 'student') {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
            if (userDoc.exists()) {
              setUserDepartment(userDoc.data().department || null)
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
          }

          // Fetch reminders for students
          fetchReminders(currentUser.uid)
        }
      } else {
        setUser(null)
        setRole(null)
        setEvents([])
        setReminders([])
      }
    })

    return () => unsubscribe()
  }, [])

  // Real-time listener for events - depends on user and role
  useEffect(() => {
    if (user && role === 'student') {
      const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
        const eventsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setEvents(eventsList)
      }, (error) => {
        console.error('Error listening to events:', error)
      })
      return () => unsubscribe()
    }
  }, [user, role])

  // Monitor localStorage for role changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedRole = localStorage.getItem('userRole')
      if (savedRole && savedRole !== role) {
        setRole(savedRole)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [role])

  const fetchReminders = async (userId) => {
    try {
      const [remindersList, eventsList] = await Promise.all([
        getRemindersByUser(userId),
        getAllEvents(),
      ])
      setReminders(remindersList)
      setEvents(eventsList)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
  }

  const getEventTitle = (eventId) => {
    const event = events.find((e) => e.id === eventId)
    return event?.title || 'Unknown Event'
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  if (!user) return null

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/')

  const studentLinks = [
    { href: '/student', label: 'My Events', icon: '📅' },
    { href: '/student/reminders', label: 'My Reminders', icon: '🔔' },
  ]

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/create', label: 'Create Event', icon: '➕' },
    { href: '/admin/edit', label: 'Manage Events', icon: '✏️' },
  ]

  const links = role === 'admin' ? adminLinks : studentLinks

  // Helper functions for calendar
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = event.date && event.date.toDate ? event.date.toDate() : new Date(event.date)
      return eventDate.toDateString() === date.toDateString() &&
             (!userDepartment || event.department === userDepartment || event.department === 'All')
    })
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleMenu}
        style={styles.fab}
        title="Menu"
        className="fab-button"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div style={styles.overlay} onClick={closeMenu}>
          <div style={styles.menu} onClick={(e) => e.stopPropagation()}>
            <div style={styles.menuHeader}>
              <h3 style={styles.menuTitle}>Menu</h3>
              <div style={styles.userBadge}>
                <span style={styles.roleIcon}>{role === 'admin' ? '👨‍💼' : '👨‍🎓'}</span>
                <span style={styles.roleText}>{role === 'admin' ? 'Admin' : 'Student'}</span>
              </div>
            </div>

            <nav style={styles.nav}>
              {links.map((link, index) => (
                <Link key={link.href} href={link.href} onClick={closeMenu}>
                  <div
                    style={{
                      ...styles.menuItem,
                      ...(isActive(link.href) && styles.menuItemActive),
                      animationDelay: `${index * 0.1}s`,
                    }}
                    className="menu-item"
                  >
                    <span style={styles.menuIcon}>{link.icon}</span>
                    <span style={styles.menuLabel}>{link.label}</span>
                  </div>
                </Link>
              ))}
              {role === 'student' && (
                <button
                  onClick={() => setShowCalendar(true)}
                  style={{
                    ...styles.menuItem,
                    ...styles.calendarButton,
                    animationDelay: `${links.length * 0.1}s`,
                  }}
                  className="menu-item"
                >
                  <span style={styles.menuIcon}>📆</span>
                  <span style={styles.menuLabel}>Event Calendar</span>
                </button>
              )}
            </nav>

            {/* Reminders Section for Students */}
            {role === 'student' && reminders.length > 0 && (
              <div style={styles.remindersSection}>
                <h4 style={styles.sectionTitle}>📌 Your Reminders</h4>
                <div style={styles.remindersList}>
                  {reminders.slice(0, 3).map((reminder) => (
                    <Link key={reminder.id} href="/student/reminders" onClick={closeMenu}>
                      <div style={styles.reminderItem} className="reminder-item">
                        <div style={styles.reminderTitle}>{getEventTitle(reminder.eventId)}</div>
                        <div style={styles.reminderTime}>{reminder.reminderTime}</div>
                      </div>
                    </Link>
                  ))}
                  {reminders.length > 3 && (
                    <div style={styles.moreReminders}>
                      +{reminders.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={styles.menuFooter}>
              <p style={styles.userEmail}>{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div style={styles.calendarModalOverlay} onClick={() => setShowCalendar(false)}>
          <div style={styles.calendarModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.calendarModalHeader}>
              <h2 style={styles.calendarModalTitle}>📆 Event Calendar</h2>
              <button onClick={() => setShowCalendar(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.calendarModalContent}>
              <div style={styles.calendarContainer}>
                <div style={styles.calendarHeader}>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={styles.calendarNavBtn}>
                    ‹
                  </button>
                  <h3 style={styles.calendarTitle}>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={styles.calendarNavBtn}>
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
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#3498db',
    borderStyle: 'none',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(52, 152, 219, 0.4)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fabPulse 2s infinite',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.3s ease',
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '0',
    maxWidth: '320px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'menuSlideUp 0.3s ease',
  },
  menuHeader: {
    padding: '1.5rem 1.5rem 1rem 1.5rem',
    borderBottom: '1px solid #e1e5e9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8f9fa',
    padding: '0.5rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  roleIcon: {
    fontSize: '1rem',
  },
  roleText: {
    color: '#2c3e50',
  },
  nav: {
    padding: '0.5rem 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    textDecoration: 'none',
    color: '#2c3e50',
    transition: 'all 0.2s ease',
    borderStyle: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    cursor: 'pointer',
    animation: 'menuItemSlideIn 0.3s ease',
    animationFillMode: 'both',
  },
  menuItemActive: {
    backgroundColor: '#e3f2fd',
    borderLeft: '4px solid #3498db',
    color: '#1976d2',
  },
  menuIcon: {
    fontSize: '1.25rem',
    width: '24px',
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: '1rem',
    fontWeight: '500',
  },
  remindersSection: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e1e5e9',
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  remindersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  reminderItem: {
    padding: '0.75rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e1e5e9',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    color: 'inherit',
  },
  reminderTitle: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  reminderTime: {
    fontSize: '0.8rem',
    color: '#7f8c8d',
  },
  moreReminders: {
    padding: '0.5rem',
    color: '#95a5a6',
    fontSize: '0.8rem',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  menuFooter: {
    padding: '1rem 1.5rem 1.5rem 1.5rem',
    borderTop: '1px solid #e1e5e9',
    backgroundColor: '#f8f9fa',
  },
  userEmail: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#7f8c8d',
    wordBreak: 'break-word',
    textAlign: 'center',
  },
  calendarButton: {
    background: 'none',
    borderStyle: 'none',
    cursor: 'pointer',
    padding: '0.875rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    width: '100%',
    textAlign: 'left',
  },
  calendarModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  calendarModal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  calendarModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e1e5e9',
  },
  calendarModalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#2c3e50',
  },
  closeBtn: {
    background: 'none',
    borderStyle: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#7f8c8d',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  calendarModalContent: {
    padding: '2rem 1.5rem',
  },
  calendarContainer: {
    maxWidth: '100%',
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
    borderStyle: 'none',
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
    minHeight: '50px',
  },
  calendarDayWithEvents: {
    backgroundColor: '#fff3cd',
    border: '1px solid #f39c12',
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
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
}

// Add CSS animations
const fabStyles = `
  @keyframes fabPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes menuSlideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes menuItemSlideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .fab-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(52, 152, 219, 0.5);
    background-color: #2980b9;
  }

  .fab-button:active {
    transform: scale(0.95);
  }

  .menu-item:hover {
    background-color: #f5f5f5;
    transform: translateX(4px);
  }

  .reminder-item:hover {
    background-color: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .fab-button {
      bottom: 1.5rem;
      right: 1.5rem;
      width: 56px;
      height: 56px;
      font-size: 1.3rem;
    }
    
    .menu {
      width: 95%;
      max-width: 350px;
      margin: 1rem;
    }
    
    .menu-item {
      padding: 0.875rem 1.25rem;
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 480px) {
    .fab-button {
      bottom: 1rem;
      right: 1rem;
      width: 52px;
      height: 52px;
      font-size: 1.2rem;
    }
    
    .menu {
      width: 98%;
      margin: 0.5rem;
    }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = fabStyles
  document.head.appendChild(style)
}

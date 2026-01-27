'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { getRemindersByUser, getAllEvents } from '@/lib/events'

export default function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [reminders, setReminders] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        const savedRole = localStorage.getItem('userRole')
        setRole(savedRole)

        // Fetch reminders for students
        if (savedRole === 'student') {
          fetchReminders(currentUser.uid)
        }
      } else {
        setUser(null)
        setRole(null)
      }
    })

    // Check if mobile on mount and on resize
    const checkMobile = () => {
      const isThin = window.innerWidth < 768
      setIsMobile(isThin)
      // Close sidebar on thin screens, open on desktop
      setIsOpen(window.innerWidth >= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      unsubscribe()
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

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

  if (!user) return null

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/')

  const studentLinks = [
    { href: '/student', label: '📅 My Events', icon: '📅' },
    { href: '/student/reminders', label: '🔔 My Reminders', icon: '🔔' },
  ]

  const adminLinks = [
    { href: '/admin', label: '📊 Dashboard', icon: '📊' },
    { href: '/admin/create', label: '➕ Create Event', icon: '➕' },
    { href: '/admin/edit', label: '✏️ Manage Events', icon: '✏️' },
  ]

  const links = role === 'admin' ? adminLinks : studentLinks

  return (
    <>
      {/* Mobile toggle button - only show on mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={styles.toggleBtn}
          title="Toggle Sidebar"
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, ...(isOpen ? styles.sidebarOpen : styles.sidebarClosed) }}>
        <div style={styles.sidebarContent}>
          <div style={styles.header}>
            <h2 style={styles.title}>Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              style={styles.closeBtn}
              title="Close Sidebar"
            >
              ✕
            </button>
          </div>

          <nav style={styles.nav}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} style={styles.link}>
                <div
                  style={{
                    ...styles.linkContent,
                    ...(isActive(link.href) && styles.linkActive),
                  }}
                >
                  <span style={styles.icon}>{link.icon}</span>
                  <span style={styles.label}>{link.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Reminders Section for Students */}
          {role === 'student' && reminders.length > 0 && (
            <div style={styles.remindersSection}>
              <h3 style={styles.sectionTitle}>📌 Your Reminders</h3>
              <div style={styles.remindersList}>
                {reminders.slice(0, 5).map((reminder) => (
                  <Link key={reminder.id} href="/student/reminders" style={styles.link}>
                    <div style={styles.reminderItem}>
                      <div style={styles.reminderTitle}>{getEventTitle(reminder.eventId)}</div>
                      <div style={styles.reminderTime}>{reminder.reminderTime}</div>
                    </div>
                  </Link>
                ))}
                {reminders.length > 5 && (
                  <div style={styles.moreReminders}>
                    +{reminders.length - 5} more...
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={styles.footer}>
            <p style={styles.userInfo}>
              <span style={styles.roleLabel}>{role === 'admin' ? '👨‍💼 Admin' : '👨‍🎓 Student'}</span>
            </p>
            <p style={styles.email}>{user.email}</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isOpen && <div style={styles.overlay} onClick={() => setIsOpen(false)} />}
    </>
  )
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: '250px',
    backgroundColor: '#2c3e50',
    color: 'white',
    transition: 'transform 0.3s ease',
    zIndex: 999,
    overflow: 'hidden',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarClosed: {
    transform: 'translateX(-100%)',
  },
  sidebarContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '1rem 0',
  },
  header: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 'bold',
  },
  closeBtn: {
    display: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    '@media (maxWidth: 768px)': {
      display: 'block',
    },
  },
  nav: {
    flex: 1,
    padding: '1rem 0',
    overflowY: 'auto',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  linkContent: {
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'background-color 0.2s, border-left-color 0.2s',
    cursor: 'pointer',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: 'transparent',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
  },
  linkActive: {
    backgroundColor: '#3498db',
    borderLeftColor: '#fff',
  },
  icon: {
    fontSize: '1.2rem',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  remindersSection: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sectionTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  remindersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  reminderItem: {
    padding: '0.5rem',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  reminderTitle: {
    color: '#ecf0f1',
    fontWeight: '500',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  reminderTime: {
    color: '#bdc3c7',
    fontSize: '0.75rem',
  },
  moreReminders: {
    padding: '0.5rem',
    color: '#bdc3c7',
    fontSize: '0.75rem',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  userInfo: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.85rem',
  },
  roleLabel: {
    display: 'inline-block',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  email: {
    margin: 0,
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.7)',
    wordBreak: 'break-word',
  },
  toggleBtn: {
    position: 'fixed',
    left: 'clamp(0.5rem, 2vw, 1rem)',
    top: 'clamp(0.5rem, 2vw, 0.75rem)',
    backgroundColor: '#2c3e50',
    color: 'white',
    border: '2px solid white',
    borderRadius: '5px',
    padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.5rem, 2vw, 0.75rem)',
    fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
    cursor: 'pointer',
    zIndex: 1001,
    display: 'none',
    minHeight: '44px',
    minWidth: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
}

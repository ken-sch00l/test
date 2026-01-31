'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { getRemindersByUser, getAllEvents } from '@/lib/events'

export default function FloatingActionButton() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
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

    return () => unsubscribe()
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
    border: 'none',
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
    border: 'none',
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

// Navbar component for navigation
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { logout } from '@/lib/auth'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        // Get user role from localStorage (set during login)
        const savedRole = localStorage.getItem('userRole')
        setRole(savedRole)
      } else {
        setUser(null)
        setRole(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem('userRole')
      router.push('/auth/login')
    } catch (error) {
      alert('Logout failed: ' + error.message)
    }
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link href="/" style={styles.logo}>
          📅 Event Reminder
        </Link>

        <div style={styles.links}>
          {user ? (
            <>
              <span style={styles.userEmail}>{user.email}</span>
              {role === 'admin' && (
                <Link href="/admin" style={styles.link}>
                  Admin Dashboard
                </Link>
              )}
              {role === 'student' && (
                <>
                  <Link href="/student" style={styles.link}>
                    My Events
                  </Link>
                  <Link href="/student/reminders" style={styles.link}>
                    🔔 My Reminders
                  </Link>
                </>
              )}
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={styles.link}>
                Login
              </Link>
              <Link href="/auth/signup" style={styles.link}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  navbar: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1rem 0',
    marginBottom: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  logo: {
    fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: 'white',
  },
  links: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.85rem',
    padding: '0.5rem 0.75rem',
  },
  userEmail: {
    fontSize: '0.8rem',
    color: '#ecf0f1',
    padding: '0.5rem 0.75rem',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.65rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    minHeight: '44px',
  },
}

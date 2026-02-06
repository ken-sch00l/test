// Navbar component for navigation
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { logout } from '@/lib/auth'
import Logo from './Logo'

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
        <Link href={user ? (role === 'admin' ? '/admin' : '/student') : '/'} style={styles.logo} className="navbar-logo">
          <Logo variant="text" size="medium" />
        </Link>

        <div style={styles.links}>
          {user ? (
            <>
              <span style={styles.userEmail}>{user.email}</span>
              {role === 'admin' && (
                <Link href="/admin" style={styles.link} className="navbar-link">
                  Admin Dashboard
                </Link>
              )}
              {role === 'student' && (
                <>
                  <Link href="/student" style={styles.link} className="navbar-link">
                    My Events
                  </Link>
                  <Link href="/student/reminders" style={styles.link} className="navbar-link">
                    🔔 My Reminders
                  </Link>
                </>
              )}
              <button onClick={handleLogout} style={styles.logoutBtn} className="navbar-logout">
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
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)',
    color: 'white',
    padding: '1rem 0',
    marginBottom: '2rem',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(30, 58, 138, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  logo: {
    textDecoration: 'none',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  userEmail: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
}

// Add animations
const navbarStyles = `
  .navbar-link:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
  }

  .navbar-logout:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    25% { transform: translateY(-5px); }
    50% { transform: translateY(-8px); }
    75% { transform: translateY(-5px); }
  }

  .navbar-logo {
    animation: float 4s ease-in-out infinite;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = navbarStyles
  document.head.appendChild(style)
}

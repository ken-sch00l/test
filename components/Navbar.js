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
        <Link href={user ? (role === 'admin' ? '/admin' : '/student') : '/'} style={styles.logo} className="navbar-logo">
          📅 Event Reminder
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    color: 'white',
    padding: '1rem 0',
    marginBottom: '2rem',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
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
    fontSize: '1.8rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: 'white',
    background: 'linear-gradient(45deg, #fff, #f093fb, #f5576c, #4facfe)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'float 3s ease-in-out infinite',
    position: 'relative',
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
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  userEmail: {
    fontSize: '0.9rem',
    color: '#ecf0f1',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
}

// Add fun animations
const navbarStyles = `
  .navbar-link:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
  }

  .navbar-logout:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-5px) rotate(1deg); }
    50% { transform: translateY(-10px) rotate(-1deg); }
    75% { transform: translateY(-5px) rotate(0.5deg); }
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

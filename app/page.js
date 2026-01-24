// Home page
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import Navbar from '@/components/Navbar'

export default function Home() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.title}>📅 Event Reminder</h1>
          <p style={styles.subtitle}>Never miss an important event</p>

          {!user ? (
            <div style={styles.buttons}>
              <button
                onClick={() => router.push('/auth/signup')}
                style={styles.primaryBtn}
              >
                Get Started
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                style={styles.secondaryBtn}
              >
                Login
              </button>
            </div>
          ) : (
            <div style={styles.userSection}>
              <p style={styles.welcome}>Welcome, {user.email}!</p>
              <button
                onClick={() => router.push('/student')}
                style={styles.primaryBtn}
              >
                View Events
              </button>
            </div>
          )}
        </div>

        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={styles.icon}>👥</span>
            <h3>Two Roles</h3>
            <p>Admins manage events, students browse and set reminders</p>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>📅</span>
            <h3>Easy Event Management</h3>
            <p>Create, edit, and delete events with a simple interface</p>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>🔔</span>
            <h3>Smart Reminders</h3>
            <p>Visual highlights for events within 2 days</p>
          </div>
          <div style={styles.feature}>
            <span style={styles.icon}>🏢</span>
            <h3>Department Filtering</h3>
            <p>Find events relevant to your department</p>
          </div>
        </div>
      </div>
    </>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  hero: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  title: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#7f8c8d',
    marginBottom: '2rem',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  userSection: {
    padding: '2rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  welcome: {
    fontSize: '1.1rem',
    color: '#2c3e50',
    marginBottom: '1rem',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    margin: '3rem 0',
  },
  feature: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '1rem',
  },
}

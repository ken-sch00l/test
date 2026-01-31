// Home page
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { getAllEvents } from '@/lib/events'
import EventCard from '@/components/EventCard'

export default function Home() {
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
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

    fetchEvents()
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>📅 Event Reminder</h1>
          <p style={styles.subtitle}>Never miss an important event with smart notifications and easy management</p>

          {!user ? (
            <div style={styles.buttons}>
              <button
                onClick={() => router.push('/auth/signup')}
                style={styles.primaryBtn}
              >
                🚀 Get Started Free
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                style={styles.secondaryBtn}
              >
                🔐 Login
              </button>
            </div>
          ) : (
            <div style={styles.userSection}>
              <div style={styles.welcomeCard}>
                <h3 style={styles.welcomeTitle}>👋 Welcome back, {user.email?.split('@')[0]}!</h3>
                <p style={styles.welcomeText}>Ready to explore upcoming events?</p>
                <div style={styles.quickActions}>
                  <button
                    onClick={() => router.push('/student')}
                    style={styles.viewEventsBtn}
                  >
                    📚 View My Events
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => router.push('/admin')}
                      style={styles.adminBtn}
                    >
                      ⚙️ Admin Dashboard
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={styles.heroDecoration}>
          <div style={styles.floatingIcon}>📅</div>
          <div style={styles.floatingIcon}>🔔</div>
          <div style={styles.floatingIcon}>🎯</div>
        </div>
      </div>

      {/* Events Section */}
      <div style={styles.eventsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>📌 Featured Events</h2>
          <p style={styles.sectionSubtitle}>Discover what&apos;s happening around campus</p>
        </div>

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Loading amazing events...</p>
          </div>
        ) : events.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3>No events yet</h3>
            <p>Events will appear here once they&apos;re scheduled. Check back soon!</p>
          </div>
        ) : (
          <div style={styles.eventsList}>
            {events.slice(0, 6).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showActions={false}
              />
            ))}
          </div>
        )}

        {events.length > 6 && (
          <div style={styles.viewMore}>
            <button
              onClick={() => router.push('/student')}
              style={styles.viewMoreBtn}
            >
              View All Events →
            </button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <h2 style={styles.featuresTitle}>✨ Why Choose Event Reminder?</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.feature} className="feature">
            <div style={styles.featureIcon}>🔔</div>
            <h3 style={styles.featureTitle} className="feature-title">Smart Reminders</h3>
            <p style={styles.featureDesc}>Get notified at the perfect time before your events</p>
          </div>
          <div style={styles.feature} className="feature">
            <div style={styles.featureIcon}>📱</div>
            <h3 style={styles.featureTitle} className="feature-title">Easy Management</h3>
            <p style={styles.featureDesc}>Simple interface to manage all your event reminders</p>
          </div>
          <div style={styles.feature} className="feature">
            <div style={styles.featureIcon}>🎓</div>
            <h3 style={styles.featureTitle} className="feature-title">Department Focused</h3>
            <p style={styles.featureDesc}>Filter events by your department for relevant content</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1rem',
    animation: 'fadeIn 0.8s ease-out',
  },
  hero: {
    position: 'relative',
    textAlign: 'center',
    padding: '6rem 2rem 8rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '30px',
    marginBottom: '3rem',
    overflow: 'hidden',
    boxShadow: '0 15px 40px rgba(102, 126, 234, 0.4)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
  },
  title: {
    fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
    background: 'linear-gradient(45deg, #fff, #f093fb, #4facfe)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '1.5rem',
    fontWeight: '900',
    textShadow: '0 5px 15px rgba(0,0,0,0.3)',
    animation: 'fadeIn 1s ease-out',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 4vw, 1.5rem)',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: '3rem',
    maxWidth: '700px',
    margin: '0 auto 3rem',
    lineHeight: '1.7',
    fontWeight: '300',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
    animation: 'fadeIn 1s ease-out 0.3s both',
  },
  buttons: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    animation: 'fadeIn 1s ease-out 0.6s both',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #ff4757 100%)',
    color: 'white',
    border: 'none',
    padding: '18px 40px',
    fontSize: '1.2rem',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    boxShadow: '0 8px 25px rgba(255, 107, 107, 0.5)',
    transform: 'translateY(0)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Poppins, sans-serif',
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '3px solid rgba(255,255,255,0.8)',
    padding: '15px 38px',
    fontSize: '1.2rem',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    backdropFilter: 'blur(20px)',
    fontFamily: 'Poppins, sans-serif',
  },
  userSection: {
    animation: 'slideUp 0.8s ease-out 0.4s both',
  },
  welcomeCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: '2.5rem',
    borderRadius: '15px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  welcomeTitle: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: '1.1rem',
    color: '#7f8c8d',
    margin: '0 0 1.5rem 0',
  },
  quickActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  viewEventsBtn: {
    background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
  },
  adminBtn: {
    background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(155, 89, 182, 0.3)',
  },
  heroDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  eventsSection: {
    marginBottom: '4rem',
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    padding: '3rem',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e1e5e9',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  sectionTitle: {
    fontSize: '2.2rem',
    color: '#2c3e50',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: '1.1rem',
    color: '#7f8c8d',
    margin: 0,
  },
  eventsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
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
  viewMore: {
    textAlign: 'center',
    marginTop: '2rem',
  },
  viewMoreBtn: {
    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
  },
  features: {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '5rem 2rem',
    borderRadius: '25px',
    textAlign: 'center',
    marginBottom: '3rem',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  featuresTitle: {
    fontSize: 'clamp(2rem, 6vw, 3rem)',
    background: 'linear-gradient(45deg, #2c3e50, #3498db)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '3rem',
    fontWeight: '900',
    animation: 'fadeIn 1s ease-out',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  feature: {
    backgroundColor: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '20px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid #e1e5e9',
    position: 'relative',
    overflow: 'hidden',
  },
  featureIcon: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
    animation: 'fadeIn 0.8s ease-out',
    display: 'inline-block',
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '1rem',
    transition: 'color 0.3s ease',
  },
  featureDesc: {
    color: '#7f8c8d',
    lineHeight: '1.6',
    fontSize: '1rem',
  },
}

// Add CSS animations
const homeStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(5deg); }
    66% { transform: translateY(5px) rotate(-5deg); }
  }
  
  .primary-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.5);
  }
  
  .secondary-btn:hover {
    background-color: rgba(255,255,255,0.2);
    transform: translateY(-2px);
  }
  
  .view-events-btn:hover, .admin-btn:hover, .view-more-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
  }
  
  .feature:hover {
    transform: translateY(-5px);
    boxShadow: 0 15px 40px rgba(0,0,0,0.15);
  }
  
  .feature:hover .feature-title {
    color: #3498db;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = homeStyles
  document.head.appendChild(style)
}

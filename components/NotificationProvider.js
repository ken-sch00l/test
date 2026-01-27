'use client'

import { useEffect, useState } from 'react'
import { initializeMessaging, onMessageListener } from '@/lib/firebase'

export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Expose global function for demo alerts
    window.showDemoAlert = (message, type = 'info', duration = 5000) => {
      const id = Date.now()
      setNotifications((prev) => [...prev, { id, message, type }])

      // Auto-remove after duration
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, duration)
    }

    return () => {
      delete window.showDemoAlert
    }
  }, [])

  // Listen for FCM messages
  useEffect(() => {
    const setupMessaging = async () => {
      try {
        const messaging = await initializeMessaging()
        if (messaging) {
          const unsubscribe = onMessageListener()
          unsubscribe.then(() => {
            // Message listener is set up
          })

          // Also handle foreground messages
          const messageListener = async () => {
            const payload = await onMessageListener()
            if (payload) {
              const { notification, data } = payload
              const id = Date.now()
              setNotifications((prev) => [
                ...prev,
                {
                  id,
                  message: `${notification?.title || 'Notification'}: ${notification?.body || ''}`,
                  type: 'info',
                  data,
                },
              ])

              // Auto-remove after 6 seconds
              setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== id))
              }, 6000)
            }
          }

          messageListener()
        }
      } catch (error) {
        console.log('FCM setup skipped:', error.message)
      }
    }

    setupMessaging()
  }, [])

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <>
      {children}

      {/* Notifications Container */}
      <div style={styles.container}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              ...styles.notification,
              ...styles[notification.type],
            }}
          >
            <div style={styles.content}>
              {notification.type === 'success' && '✅'}
              {notification.type === 'info' && 'ℹ️'}
              {notification.type === 'warning' && '⚠️'}
              {notification.type === 'error' && '❌'}
              {' ' + notification.message}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              style={styles.closeBtn}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

const styles = {
  container: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: 5000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '400px',
  },
  notification: {
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    animation: 'slideIn 0.3s ease-out',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    fontSize: '14px',
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    marginLeft: '10px',
    opacity: 0.7,
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    borderLeft: '4px solid #28a745',
  },
  info: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    borderLeft: '4px solid #17a2b8',
  },
  warning: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderLeft: '4px solid #ffc107',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderLeft: '4px solid #f5c6cb',
  },
}

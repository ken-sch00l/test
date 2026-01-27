// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: self.registration.scope,
  projectId: 'your-project-id',
  messagingSenderId: self.registration.scope,
  appId: self.registration.scope,
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'Event Reminder'
  const notificationOptions = {
    body: payload.notification?.body || 'You have an upcoming event',
    icon: payload.notification?.icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%234F46E5" width="192" height="192"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="120" fill="white" font-family="Arial" font-weight="bold">📅</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%234F46E5" width="192" height="192"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="120" fill="white" font-family="Arial" font-weight="bold">🔔</text></svg>',
    tag: 'event-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: '👀 View Event',
      },
      {
        action: 'dismiss',
        title: '✕ Dismiss',
      },
    ],
    data: payload.data || {},
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw] Notification clicked:', event)

  if (event.action === 'dismiss') {
    event.notification.close()
    return
  }

  event.notification.close()

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/student')
      }
    })
  )
})

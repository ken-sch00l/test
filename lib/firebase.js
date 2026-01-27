// Firebase configuration
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getMessaging, isSupported, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Initialize Firebase Cloud Messaging
let messaging = null
export const initializeMessaging = async () => {
  if (typeof window !== 'undefined' && (await isSupported())) {
    try {
      messaging = getMessaging(app)
      console.log('✅ Firebase Cloud Messaging initialized')
      return messaging
    } catch (error) {
      console.error('Error initializing messaging:', error)
    }
  }
  return null
}

export const getMessagingInstance = () => messaging

export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload)
      })
    }
  })
}

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open
    console.warn('Multiple tabs detected - persistence disabled')
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support
    console.warn('Browser does not support offline persistence')
  }
})

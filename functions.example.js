/**
 * Firebase Cloud Function for Automated Event Reminders
 * 
 * Deploy this to Firebase Cloud Functions to send push notifications
 * based on reminder times.
 * 
 * Deploy command:
 * firebase deploy --only functions
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { getMessaging } = require('firebase-admin/messaging')

admin.initializeApp()
const db = admin.firestore()

/**
 * Scheduled function to check and send reminders every minute
 */
exports.sendEventReminders = functions.pubsub
  .schedule('every 1 minutes')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('[Cloud Function] Checking for reminders to send...')

    try {
      const reminders = await db.collection('reminders').get()
      const now = new Date()
      let remindersSent = 0

      for (const reminderDoc of reminders.docs) {
        const reminder = reminderDoc.data()
        const eventDoc = await db.collection('events').doc(reminder.eventId).get()

        if (!eventDoc.exists) {
          console.log(`[Warning] Event ${reminder.eventId} not found`)
          continue
        }

        const event = eventDoc.data()
        const eventTime = event.date.toDate()

        // Parse reminder time
        const reminderMinutesOffset = parseReminderTime(reminder.reminderTime)
        const reminderTime = new Date(eventTime.getTime() - reminderMinutesOffset * 60000)

        // Check if it's time to send reminder
        const timeDiff = Math.abs(now - reminderTime)
        if (timeDiff < 60000) { // Within 1 minute window
          // Get user's FCM token from user document
          const userDoc = await db.collection('users').doc(reminder.userId).get()
          
          if (userDoc.exists && userDoc.data().fcmToken) {
            const fcmToken = userDoc.data().fcmToken

            // Send push notification
            await getMessaging().send({
              token: fcmToken,
              notification: {
                title: `Reminder: ${event.title}`,
                body: `Your event starts ${reminder.reminderTime}!`,
                imageUrl: 'https://your-domain.com/event-icon.png', // Optional
              },
              data: {
                eventId: reminder.eventId,
                eventTitle: event.title,
                deeplink: `/student?event=${reminder.eventId}`,
              },
              android: {
                priority: 'high',
                notification: {
                  sound: 'default',
                  channelId: 'event-reminders',
                },
              },
              apns: {
                payload: {
                  aps: {
                    sound: 'default',
                    'mutable-content': 1,
                  },
                },
              },
              webpush: {
                fcmOptions: {
                  link: '/student',
                },
                notification: {
                  icon: 'https://your-domain.com/icon-192x192.png',
                  badge: 'https://your-domain.com/icon-96x96.png',
                  tag: `reminder-${reminder.eventId}`,
                  requireInteraction: true,
                },
              },
            })

            console.log(`[Success] Reminder sent to ${reminder.userId} for event ${event.title}`)
            remindersSent++
          } else {
            console.log(`[Warning] No FCM token for user ${reminder.userId}`)
          }
        }
      }

      console.log(`[Complete] ${remindersSent} reminders sent`)
      return null
    } catch (error) {
      console.error('[Error] Failed to process reminders:', error)
      return null
    }
  })

/**
 * Save FCM token when user grants notification permission
 * Call this from your app when user enables notifications
 */
exports.saveFcmToken = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { token } = data
  const userId = context.auth.uid

  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'FCM token is required')
  }

  try {
    await db.collection('users').doc(userId).set(
      {
        fcmToken: token,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    console.log(`[Success] FCM token saved for user ${userId}`)
    return { success: true, message: 'FCM token saved' }
  } catch (error) {
    console.error('[Error] Failed to save FCM token:', error)
    throw new functions.https.HttpsError('internal', 'Failed to save FCM token')
  }
})

/**
 * Send test notification
 * Call this to test the notification system
 */
exports.sendTestNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = context.auth.uid
  const { eventTitle = 'Test Event' } = data

  try {
    const userDoc = await db.collection('users').doc(userId).get()

    if (!userDoc.exists || !userDoc.data().fcmToken) {
      throw new functions.https.HttpsError(
        'not-found',
        'No FCM token found for user'
      )
    }

    const fcmToken = userDoc.data().fcmToken

    await getMessaging().send({
      token: fcmToken,
      notification: {
        title: '🧪 Test Notification',
        body: `Testing push notifications for: ${eventTitle}`,
      },
      data: {
        type: 'test',
      },
    })

    return { success: true, message: 'Test notification sent' }
  } catch (error) {
    console.error('[Error] Failed to send test notification:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

/**
 * Helper function to parse reminder time string
 * e.g., "1 day" → 1440 minutes, "30 minutes" → 30 minutes
 */
function parseReminderTime(reminderTimeStr) {
  const [value, unit] = reminderTimeStr.split(' ')
  const minutes = parseInt(value)

  switch (unit.toLowerCase()) {
    case 'day':
    case 'days':
      return minutes * 24 * 60
    case 'hour':
    case 'hours':
      return minutes * 60
    case 'minute':
    case 'minutes':
      return minutes
    default:
      return 60 // Default to 1 hour
  }
}

/**
 * Cleanup old reminders (optional)
 * Runs daily to remove reminders for past events
 */
exports.cleanupOldReminders = functions.pubsub
  .schedule('every day 02:00')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('[Cloud Function] Cleaning up old reminders...')

    try {
      const now = new Date()
      const reminders = await db.collection('reminders').get()
      let cleaned = 0

      for (const reminderDoc of reminders.docs) {
        const reminder = reminderDoc.data()
        const eventDoc = await db.collection('events').doc(reminder.eventId).get()

        if (!eventDoc.exists) {
          // Event deleted, remove reminder
          await reminderDoc.ref.delete()
          cleaned++
          continue
        }

        const event = eventDoc.data()
        const eventTime = event.date.toDate()

        // If event is in the past, remove reminder
        if (eventTime < now) {
          await reminderDoc.ref.delete()
          cleaned++
        }
      }

      console.log(`[Complete] Cleaned up ${cleaned} old reminders`)
      return null
    } catch (error) {
      console.error('[Error] Cleanup failed:', error)
      return null
    }
  })

// Event utility functions
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export async function addEvent(eventData) {
  try {
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      fbLink: eventData.fbLink || null,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function updateEvent(eventId, updates) {
  try {
    await updateDoc(doc(db, 'events', eventId), updates)
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function deleteEvent(eventId) {
  try {
    await deleteDoc(doc(db, 'events', eventId))
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function getEventsByDepartment(department) {
  try {
    const q = query(
      collection(db, 'events'),
      where('department', '==', department),
      orderBy('date', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function getAllEvents() {
  try {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    throw new Error(error.message)
  }
}

export function isEventUpcoming(eventDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const event = new Date(eventDate)
  event.setHours(0, 0, 0, 0)

  const diffTime = event - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= 0 && diffDays <= 1
}

export async function addReminder(userId, eventId, reminderTime = '1 day') {
  try {
    const docRef = await addDoc(collection(db, 'reminders'), {
      userId,
      eventId,
      reminderTime,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function updateReminder(reminderId, reminderTime) {
  try {
    await updateDoc(doc(db, 'reminders', reminderId), {
      reminderTime,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function getRemindersByUser(userId) {
  try {
    const q = query(collection(db, 'reminders'), where('userId', '==', userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function removeReminder(reminderId) {
  try {
    await deleteDoc(doc(db, 'reminders', reminderId))
  } catch (error) {
    throw new Error(error.message)
  }
}

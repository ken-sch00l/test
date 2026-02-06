// Edit event page
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { updateEvent } from '@/lib/events'
import { doc, getDoc } from 'firebase/firestore'

const departments = ['CIT', 'CTELA', 'CCJE', 'CABM', 'COT']

export default function EditEventPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [location, setLocation] = useState('')
  const [department, setDepartment] = useState('CIT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const eventId = params.id

  const fetchEvent = useCallback(async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId))
      if (eventDoc.exists()) {
        const data = eventDoc.data()
        setTitle(data.title)
        setDescription(data.description)
        setLocation(data.location || '')
        setDepartment(data.department)

        // Format date for input
        const eventDate = data.date?.toDate?.() || new Date(data.date)
        const formattedDate = eventDate.toISOString().split('T')[0]
        const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        setDate(formattedDate)
        setTime(formattedTime)
      }
    } catch (err) {
      setError('Error loading event: ' + err.message)
    } finally {
      setInitialLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/auth/login')
      } else {
        fetchEvent()
      }
    })

    return () => unsubscribe()
  }, [router, eventId, fetchEvent])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!date) {
      setError('Date is required')
      return
    }

    setLoading(true)

    try {
      const [hours, minutes] = time.split(':').map(Number)
      const eventDateTime = new Date(date)
      eventDateTime.setHours(hours, minutes, 0, 0)

      await updateEvent(eventId, {
        title,
        description,
        location,
        date: eventDateTime,
        time: time,
        department,
      })

      router.push('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <p>Loading...</p>

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h1>Edit Event</h1>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
                rows="4"
              />
            </div>

            <div style={styles.formGroup}>
              <label>Location:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={styles.input}
                placeholder="e.g., Room 101, Building A or Facebook Event Link"
              />
            </div>

            <div style={styles.formGroup}>
              <label>Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Time:</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Department:</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} style={styles.select}>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.actions}>
              <button type="submit" disabled={loading} style={styles.updateBtn}>
                {loading ? 'Updating...' : 'Update Event'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  formBox: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
  },
  updateBtn: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c00',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #fcc',
  },
}

// Create new event page
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { addEvent } from '@/lib/events'
import Navbar from '@/components/Navbar'
import styles from './page.module.css'

const departments = ['Engineering', 'Business', 'Arts', 'Science', 'Medicine', 'Law']

export default function CreateEventPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [location, setLocation] = useState('')
  const [fbLink, setFbLink] = useState('')
  const [department, setDepartment] = useState('Engineering')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [fbPosts, setFbPosts] = useState([])
  const [fetchingPosts, setFetchingPosts] = useState(false)
  const [showPosts, setShowPosts] = useState(false)
  const router = useRouter()
  const PAGE_ID = '61586999619228'

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchFacebookPosts = async () => {
    try {
      setError('')
      setFetchingPosts(true)
      
      const response = await fetch('/api/facebook/fetch-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: PAGE_ID })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError('Error fetching posts: ' + (data.error || 'Unknown error'))
        return
      }
      
      setFbPosts(data.posts)
      setShowPosts(true)
    } catch (err) {
      setError('Error fetching Facebook posts: ' + err.message)
    } finally {
      setFetchingPosts(false)
    }
  }

  const fillFromPost = (post) => {
    setTitle(post.message.split('\n')[0] || 'Event from Facebook')
    setDescription(post.message)
    setShowPosts(false)
    setError('')
  }

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

      await addEvent({
        title,
        description,
        location,
        fbLink,
        date: eventDateTime,
        time: time,
        department,
        createdBy: user.email,
      })

      router.push('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h1>Create New Event</h1>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={styles.input}
                placeholder="e.g., Tech Workshop"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                placeholder="Event details..."
                rows="4"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Location:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={styles.input}
                placeholder="e.g., Room 101, Building A"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Facebook Event Link (Optional):</label>
              <input
                type="url"
                value={fbLink}
                onChange={(e) => setFbLink(e.target.value)}
                className={styles.input}
                placeholder="https://www.facebook.com/events/123456789"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Time:</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Department:</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={styles.select}>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <button
                type="button"
                onClick={() => fetchFacebookPosts()}
                disabled={fetchingPosts}
                className={styles.fbPostsBtn}
              >
                {fetchingPosts ? '⏳ Loading Posts...' : '📱 Load My Facebook Posts'}
              </button>
            </div>

            {showPosts && fbPosts.length > 0 && (
              <div className={styles.postsContainer}>
                <h3>Select a post to fill the form:</h3>
                {fbPosts.map((post) => (
                  <div key={post.id} className={styles.postCard}>
                    <p className={styles.postMessage}>{post.message.substring(0, 150)}...</p>
                    <small className={styles.postDate}>{new Date(post.createdTime).toLocaleDateString()}</small>
                    <button
                      type="button"
                      onClick={() => fillFromPost(post)}
                      className={styles.selectPostBtn}
                    >
                      Use This Post
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.actions}>
              <button type="submit" disabled={loading} className={styles.createBtn}>
                {loading ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

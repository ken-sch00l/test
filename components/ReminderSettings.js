'use client'

import { useState } from 'react'
import { updateReminder, removeReminder, addReminder } from '@/lib/events'
import styles from '@/app/globals.css'

export default function ReminderSettings({ reminder, event, onClose, onUpdate, userId, isNewReminder }) {
  const [reminderTime, setReminderTime] = useState(reminder?.reminderTime || '1 day')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reminderOptions = [
    { value: '30 seconds', label: '30 seconds before' },
    { value: '15 minutes', label: '15 minutes before' },
    { value: '30 minutes', label: '30 minutes before' },
    { value: '1 hour', label: '1 hour before' },
    { value: '4 hours', label: '4 hours before' },
    { value: '1 day', label: '1 day before' },
    { value: '2 days', label: '2 days before' },
    { value: '1 week', label: '1 week before' },
  ]

  const handleUpdate = async () => {
    if (!reminder?.id) return

    setLoading(true)
    setError('')

    try {
      await updateReminder(reminder.id, reminderTime)
      onUpdate?.()
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNewReminder = async () => {
    if (!reminder?.eventId || !userId) return

    setLoading(true)
    setError('')

    try {
      await addReminder(userId, reminder.eventId, reminderTime)
      
      // Demo alert
      if (window.showDemoAlert) {
        window.showDemoAlert(
          `🔔 Reminder set for "${event?.title}" - ${reminderTime} before event`,
          'success',
          4000
        )
      }

      onUpdate?.()
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!reminder?.id) return

    if (!window.confirm('Remove this reminder?')) return

    setLoading(true)
    setError('')

    try {
      await removeReminder(reminder.id)
      onUpdate?.()
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>Edit Reminder</h3>
        {event && <p style={{ marginBottom: '10px', color: '#666' }}>{event.title}</p>}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Remind me:
          </label>
          <select
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              fontSize: '14px',
            }}
          >
            {reminderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p style={{ color: '#d32f2f', marginBottom: '10px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            disabled={loading}
          >
            Cancel
          </button>
          {!isNewReminder && (
            <button
              onClick={handleRemove}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              disabled={loading}
            >
              Remove
            </button>
          )}
          <button
            onClick={isNewReminder ? handleSaveNewReminder : handleUpdate}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Saving...' : isNewReminder ? 'Add Reminder' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

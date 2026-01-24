// Event card component
'use client'

import { isEventUpcoming } from '@/lib/events'

export default function EventCard({ event, onRemind, onEdit, onDelete, showActions = false }) {
  const isUpcoming = isEventUpcoming(event.date?.toDate?.() || event.date)
  const eventDate = event.date?.toDate?.() || new Date(event.date)
  
  const formatTime = (date) => {
    if (!date) return ''
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ ...styles.card, ...(isUpcoming && styles.cardUpcoming) }}>
      {isUpcoming && <span style={styles.upcomingBadge}>⏰ Today/Tomorrow</span>}

      <h3 style={styles.title}>{event.title}</h3>

      <p style={styles.description}>{event.description}</p>

      <div style={styles.meta}>
        <span>📅 {eventDate.toLocaleDateString()}</span>
        <span>🕐 {formatTime(eventDate)}</span>
        <span>🏢 {event.department}</span>
        {event.location && <span>📍 {event.location.substring(0, 40)}{event.location.length > 40 ? '...' : ''}</span>}
      </div>

      {event.createdBy && <p style={styles.createdBy}>by {event.createdBy}</p>}

      {event.location && event.location.startsWith('http') && (
        <a
          href={event.location}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.seeMoreLink}
        >
          🔗 See More Details
        </a>
      )}

      <div style={styles.actions}>
        {onRemind && (
          <button onClick={onRemind} style={styles.remindBtn}>
            🔔 Remind Me
          </button>
        )}
        {showActions && (
          <>
            <button onClick={onEdit} style={styles.editBtn}>
              ✏️ Edit
            </button>
            <button onClick={onDelete} style={styles.deleteBtn}>
              🗑️ Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: 'white',
    border: '1px solid #ecf0f1',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardUpcoming: {
    borderLeft: '4px solid #f39c12',
    backgroundColor: '#fffbf0',
  },
  upcomingBadge: {
    display: 'inline-block',
    backgroundColor: '#f39c12',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    marginBottom: '0.5rem',
  },
  title: {
    margin: '0.5rem 0',
    color: '#2c3e50',
    fontSize: '1.3rem',
  },
  description: {
    color: '#555',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  meta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.9rem',
    color: '#7f8c8d',
    marginBottom: '0.5rem',
  },
  createdBy: {
    fontSize: '0.85rem',
    color: '#95a5a6',
    marginBottom: '1rem',
  },
  seeMoreLink: {
    display: 'inline-block',
    color: '#3498db',
    textDecoration: 'none',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    borderBottom: '1px solid #3498db',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  remindBtn: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  editBtn: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
}

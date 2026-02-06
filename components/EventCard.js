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
    <div style={{ ...styles.card, ...(isUpcoming && styles.cardUpcoming) }} className={`event-card ${isUpcoming ? 'event-card-upcoming' : ''}`}>
      {isUpcoming && <span style={styles.upcomingBadge}>⏰ Today/Tomorrow</span>}

      <div style={styles.cardContent} className="event-card-content">
        <h3 style={styles.title}>{event.title}</h3>

        <p style={styles.description}>{event.description}</p>

        <div style={styles.meta} className="event-meta">
          <div style={styles.metaItem} className="event-meta-item">
            <span style={styles.metaIcon}>📅</span>
            <span>{eventDate.toLocaleDateString()}</span>
          </div>
          <div style={styles.metaItem} className="event-meta-item">
            <span style={styles.metaIcon}>🕐</span>
            <span>{formatTime(eventDate)}</span>
          </div>
          <div style={styles.metaItem} className="event-meta-item">
            <span style={styles.metaIcon}>🏢</span>
            <span>{event.department}</span>
          </div>
          {event.location && (
            <div style={styles.metaItem} className="event-meta-item">
              <span style={styles.metaIcon}>📍</span>
              <span>
                {typeof event.location === 'object' 
                  ? (event.location.type === 'Others' ? event.location.customText : event.location.type)
                  : event.location.substring(0, 40)}{typeof event.location === 'string' && event.location.length > 40 ? '...' : ''}
              </span>
            </div>
          )}
        </div>

        {event.createdBy && <p style={styles.createdBy}>👤 Created by {event.createdBy}</p>}

        {event.location && event.location.startsWith('http') && (
          <a
            href={event.location}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.seeMoreLink}
            className="see-more-link"
          >
            🔗 View Full Details
          </a>
        )}

        <div style={styles.actions} className="event-actions">
          {onRemind && (
            <button onClick={onRemind} style={styles.remindBtn} className="remind-btn">
              🔔 Set Reminder
            </button>
          )}
          {showActions && (
            <>
              <button onClick={onEdit} style={styles.editBtn} className="edit-btn">
                ✏️ Edit
              </button>
              <button onClick={onDelete} style={styles.deleteBtn} className="delete-btn">
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: 'white',
    border: '1px solid #ecf0f1',
    borderRadius: '12px',
    padding: '0',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '250px',
  },
  cardUpcoming: {
    borderLeft: '4px solid #f39c12',
    background: 'linear-gradient(135deg, #fffbf0 0%, #ffffff 100%)',
    boxShadow: '0 4px 15px rgba(243, 156, 18, 0.2)',
  },
  cardContent: {
    padding: '1.5rem',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  upcomingBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
    color: 'white',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    margin: '1rem 1.5rem 0 1.5rem',
    boxShadow: '0 2px 4px rgba(243, 156, 18, 0.3)',
    animation: 'pulse 2s infinite',
  },
  title: {
    margin: '0.5rem 0 0.75rem 0',
    color: '#2c3e50',
    fontSize: 'clamp(1.2rem, 4vw, 1.4rem)',
    fontWeight: 'bold',
    lineHeight: '1.3',
  },
  description: {
    color: '#555',
    marginBottom: '1.25rem',
    lineHeight: '1.6',
    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    fontSize: '0.9rem',
    marginBottom: '1rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#7f8c8d',
    backgroundColor: '#f8f9fa',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
  },
  metaIcon: {
    fontSize: '1rem',
  },
  createdBy: {
    fontSize: '0.85rem',
    color: '#95a5a6',
    marginBottom: '1rem',
    fontStyle: 'italic',
  },
  seeMoreLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#3498db',
    textDecoration: 'none',
    marginBottom: '1rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    backgroundColor: '#ecf0f1',
    transition: 'all 0.3s ease',
    border: '1px solid #bdc3c7',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.25rem',
    flexWrap: 'wrap',
  },
  remindBtn: {
    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: '1',
    justifyContent: 'center',
    minWidth: '120px',
  },
  editBtn: {
    background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: '1',
    justifyContent: 'center',
    minWidth: '100px',
  },
  deleteBtn: {
    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: '1',
    justifyContent: 'center',
    minWidth: '100px',
  },
}

// Add CSS animations
const cardStyles = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .event-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
  
  .event-card-upcoming:hover {
    box-shadow: 0 8px 25px rgba(243, 156, 18, 0.3);
  }
  
  .remind-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  }
  
  .edit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
  }
  
  .delete-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
  }
  
  .see-more-link:hover {
    background-color: #3498db;
    color: white;
    border-color: #3498db;
    transform: translateX(2px);
  }
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .event-card-content {
      padding: 1rem;
    }
    
    .event-meta {
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    
    .event-meta-item {
      padding: 0.3rem 0.6rem;
      font-size: 0.8rem;
    }
    
    .event-actions {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .remind-btn, .edit-btn, .delete-btn {
      min-width: unset;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 480px) {
    .event-card-content {
      padding: 0.75rem;
    }
    
    .event-meta {
      flex-direction: column;
      gap: 0.4rem;
    }
    
    .event-actions {
      gap: 0.4rem;
    }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = cardStyles
  document.head.appendChild(style)
}

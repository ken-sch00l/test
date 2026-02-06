'use client'

export default function Logo({ variant = 'text', size = 'medium', color = 'white' }) {
  const sizeMap = {
    small: { icon: '1.2rem', text: '0.9rem' },
    medium: { icon: '1.5rem', text: '1.1rem' },
    large: { icon: '2.5rem', text: '1.8rem' },
  }

  const currentSize = sizeMap[size]

  const logoStyles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '700',
    },
    icon: {
      fontSize: currentSize.icon,
      animation: variant === 'animated' ? 'spin 3s linear infinite' : 'none',
    },
    text: {
      fontSize: currentSize.text,
      color: color,
      textShadow: color === 'white' ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
      letterSpacing: '0.5px',
    },
  }

  return (
    <div style={logoStyles.container}>
      <div style={logoStyles.icon}>🎓</div>
      {variant !== 'icon-only' && <span style={logoStyles.text}>Academy Remind</span>}
    </div>
  )
}

// CSS for animations
const logoStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = logoStyles
  document.head.appendChild(style)
}

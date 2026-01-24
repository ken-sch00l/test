import './globals.css'

export const metadata = {
  title: 'Event Reminder App',
  description: 'A simple event reminder app with admin and student roles',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

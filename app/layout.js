import './globals.css'
import Sidebar from '@/components/Sidebar'
import NotificationProvider from '@/components/NotificationProvider'

export const metadata = {
  title: 'Event Reminder App',
  description: 'A simple event reminder app with admin and student roles',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          <Sidebar />
          <div style={{ marginLeft: '250px' }}>{children}</div>
        </NotificationProvider>
      </body>
    </html>
  )
}

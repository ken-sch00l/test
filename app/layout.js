import './globals.css'
import FloatingActionButton from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
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
          <Navbar />
          <FloatingActionButton />
          <main className="main-content">{children}</main>
        </NotificationProvider>
      </body>
    </html>
  )
}

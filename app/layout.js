import './globals.css'
import Sidebar from '@/components/Sidebar'
import NotificationProvider from '@/components/NotificationProvider'

export const metadata = {
  title: 'Event Reminder App',
  description: 'A simple event reminder app with admin and student roles',
}

export const viewport = 'width=device-width, initial-scale=1, maximum-scale=5'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          <Sidebar />
          <div style={{ marginLeft: '250px' }} className="main-content">{children}</div>
        </NotificationProvider>
        <style>{`
          @media (max-width: 768px) {
            .main-content {
              margin-left: 0 !important;
            }
          }
        `}</style>
      </body>
    </html>
  )
}

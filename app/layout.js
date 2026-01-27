import './globals.css'
import Sidebar from '@/components/Sidebar'
import NotificationProvider from '@/components/NotificationProvider'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export const metadata = {
  title: 'Event Reminder App',
  description: 'A simple event reminder app with admin and student roles',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Event Reminder',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=no, viewport-fit=cover'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%234F46E5' width='192' height='192' rx='45'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='120' fill='white' font-family='Arial' font-weight='bold'>📅</text></svg>" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ServiceWorkerRegister />
        <NotificationProvider>
          <Sidebar />
          <div style={{ marginLeft: '250px' }} className="main-content">{children}</div>
        </NotificationProvider>
        <style>{`
          @media (max-width: 767px) {
            .main-content {
              margin-left: 0 !important;
              width: 100%;
            }
          }
        `}</style>
      </body>
    </html>
  )
}

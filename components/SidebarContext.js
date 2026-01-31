'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // On mobile, start with sidebar collapsed
      if (mobile && !isCollapsed) {
        setIsCollapsed(true)
      } else if (!mobile && isCollapsed) {
        // On desktop, expand sidebar by default
        setIsCollapsed(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isCollapsed])

  useEffect(() => {
    // Update body class for styling
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed')
    } else {
      document.body.classList.remove('sidebar-collapsed')
    }
  }, [isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isMobile,
      toggleSidebar,
      closeSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
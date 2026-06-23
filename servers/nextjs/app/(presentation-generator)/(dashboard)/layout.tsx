import React from 'react'
import DashboardSidebar from './Components/DashboardSidebar'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

export default layout

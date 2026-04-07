import React from 'react'
import WikiSidebar from './WikiSidebar'

interface WikiLayoutProps {
  children: React.ReactNode
  toc?: React.ReactNode
}

export default function WikiLayout({ children, toc }: WikiLayoutProps): React.ReactElement {
  return (
    <div className="wiki-layout">
      {/* Left sidebar */}
      <aside className="sidebar-column">
        <WikiSidebar />
      </aside>

      {/* Main content */}
      <main style={{ minWidth: 0 }}>
        {children}
      </main>

      {/* Right ToC */}
      <aside className="toc-column">
        {toc}
      </aside>
    </div>
  )
}

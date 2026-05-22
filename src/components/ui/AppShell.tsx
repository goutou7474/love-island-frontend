import { useState } from 'react'
import TabBar from './TabBar'
import type { TabId } from '@/types'

interface AppShellProps {
  children: (activeTab: TabId, setTab: (t: TabId) => void) => React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>('home')

  return (
    <div className="flex flex-col h-full bg-bg overflow-hidden">
      {/* Page content — flex-1 scrolls independently per page */}
      <main className="flex-1 overflow-hidden">
        {children(activeTab, setActiveTab)}
      </main>

      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}

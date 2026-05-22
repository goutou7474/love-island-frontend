import { Home, ListChecks, Sparkles, CalendarDays, Star } from 'lucide-react'
import type { TabId } from '@/types'

interface Tab {
  id: TabId
  label: string
  Icon: React.FC<{ size?: number; strokeWidth?: number }>
}

const TABS: Tab[] = [
  { id: 'home',         label: '首页',   Icon: Home },
  { id: 'checklist',   label: '打卡',   Icon: ListChecks },
  { id: 'timeline',    label: '拾光',   Icon: Sparkles },
  { id: 'anniversary', label: '纪念日', Icon: CalendarDays },
  { id: 'wishlist',    label: '心愿',   Icon: Star },
]

interface TabBarProps {
  activeTab: TabId
  onChange: (tab: TabId) => void
}

export default function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <nav
      className="flex justify-around border-t border-primary/[0.09] bg-bg/[0.98] backdrop-blur-sm rounded-b-[39px]"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      aria-label="主导航"
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={[
              'flex flex-col items-center gap-[3px] px-3 pt-2 pb-0 min-w-[44px] min-h-[44px]',
              'transition-all duration-200 rounded-xl',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              active ? 'text-primary' : 'text-inactive',
            ].join(' ')}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              size={20}
              strokeWidth={active ? 2 : 1.75}
            />
            <span className="text-tab font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

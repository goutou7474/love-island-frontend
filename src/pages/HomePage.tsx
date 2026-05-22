import { useState } from 'react'
import { ChevronRight, BarChart2, Settings } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import type { TabId } from '@/types'

// ─── Mock data (replace with Firebase data) ───────────────────────────────────
const MOCK = {
  user1: { name: '言言', gradient: ['#A2C8C0', '#7CB4AA'] as [string, string] },
  user2: { name: '羊羊', gradient: ['#B8D6CE', '#92C2B8'] as [string, string] },
  startDate: '2023.05.12',
  daysCount: 365,
  weather: {
    local:  { city: '合肥', temp: 22, icon: '🌤' },
    remote: { city: '南昌', temp: 26, icon: '🌦' },
  },
  checklistProgress: { done: 47, total: 312 },
  nextAnniversaryDays: 32,
  unreadLetters: 3,
  latestBadges: ['旅行初心', '美食探索中'],
  secretMessage: {
    text: '你把我的每个普通日子，都变成了值得庆祝的事。',
    from: 'TA',
    time: '今天 10:23',
  },
  recentCheckins: [
    { label: '一起看日出', done: true },
    { label: '手写情书',   done: false },
  ],
}

const progressPct = Math.round((MOCK.checklistProgress.done / MOCK.checklistProgress.total) * 100)

interface HomePageProps {
  onNavigate: (tab: TabId) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [showSecret, setShowSecret] = useState(true)

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-bg">
      {/* Status bar */}
      <div
        className="flex justify-between items-center px-6 text-[11px] font-semibold text-mid"
        style={{ paddingTop: 'max(15px, env(safe-area-inset-top))' }}
      >
        <span>9:41</span>
        <span className="text-[10px] opacity-75 tracking-wide">● ● ●</span>
      </div>

      {/* Dual-city weather */}
      <div className="flex justify-between px-6 pt-1.5 text-[11px] text-primary-muted">
        <span>{MOCK.weather.local.icon} {MOCK.weather.local.city} · {MOCK.weather.local.temp}°C</span>
        <span className="opacity-55">{MOCK.weather.remote.city} · {MOCK.weather.remote.temp}°C {MOCK.weather.remote.icon}</span>
      </div>

      {/* ── Hero card ──────────────────────────────────────────────── */}
      <div className="mx-4 mt-3.5 rounded-[26px] p-5 bg-hero-gradient noise-overlay shadow-card-hover">
        {/* Avatar row */}
        <div className="flex items-center mb-5">
          <Avatar gradient={MOCK.user1.gradient} name={MOCK.user1.name} size={40} />
          <span className="mx-2.5 text-[13px] text-warm">♡</span>
          <Avatar gradient={MOCK.user2.gradient} name={MOCK.user2.name} size={40} />
          <span className="ml-auto text-[10px] text-primary-muted tracking-[0.4px]">
            {MOCK.user1.name} &amp; {MOCK.user2.name}
          </span>
        </div>

        {/* Days */}
        <div className="mb-1">
          <p className="text-2xs text-primary-muted tracking-[0.9px] mb-0.5">在一起的第</p>
          <div className="flex items-baseline">
            <span className="text-[58px] font-[200] text-deep leading-none tracking-[-3px]">
              {MOCK.daysCount}
            </span>
            <span className="text-[19px] font-[300] text-primary ml-1 translate-y-[-8px]">天</span>
          </div>
          <p className="text-2xs text-primary-muted/70 mt-1 tracking-[0.2px]">
            {MOCK.startDate} &nbsp;—&nbsp; 今天
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-2xs text-primary-muted mb-1.5 tracking-[0.3px]">
            <span>打卡进度</span>
            <span className="text-primary font-medium">
              {MOCK.checklistProgress.done} / {MOCK.checklistProgress.total} 项
            </span>
          </div>
          <div className="h-[3px] bg-white/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={MOCK.checklistProgress.done}
              aria-valuemax={MOCK.checklistProgress.total}
            />
          </div>
          <div className="flex gap-1.5 mt-2">
            {MOCK.latestBadges.map((b) => (
              <span
                key={b}
                className="text-2xs text-primary/80 bg-white/42 rounded-full px-2 py-0.5 tracking-[0.2px]"
              >
                ✦ {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Secret message card ──────────────────────────────────── */}
      {showSecret && (
        <button
          className="mx-4 mt-3 bg-surface rounded-[20px] shadow-card text-left tappable w-[calc(100%-2rem)]"
          onClick={() => onNavigate('secrets' as TabId)}
          aria-label="今日悄悄话"
        >
          <div className="px-[18px] py-[15px]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-[3px] h-3.5 rounded-sm bg-primary flex-shrink-0" />
              <span className="text-2xs text-primary tracking-[0.7px]">今日悄悄话</span>
              <span className="text-2xs text-mid-light ml-auto">{MOCK.secretMessage.from} · {MOCK.secretMessage.time}</span>
            </div>
            <p className="text-sm leading-[1.82] text-[#1A3632]">
              "{MOCK.secretMessage.text}"
            </p>
          </div>
        </button>
      )}

      {/* ── Stats mini row ───────────────────────────────────────── */}
      <div className="mx-4 mt-2.5 grid grid-cols-2 gap-2.5">
        <button
          className="bg-surface rounded-[18px] p-3.5 shadow-card-sm tappable text-left"
          onClick={() => onNavigate('anniversary')}
          aria-label={`${MOCK.nextAnniversaryDays}天后结婚纪念日`}
        >
          <p className="text-[28px] font-[250] text-primary leading-none tracking-[-0.5px]">
            {MOCK.nextAnniversaryDays}
          </p>
          <p className="text-2xs text-mid-light mt-1 tracking-[0.3px]">天后结婚纪念日</p>
        </button>
        <button
          className="bg-surface rounded-[18px] p-3.5 shadow-card-sm tappable text-left"
          aria-label={`${MOCK.unreadLetters}封未读信件`}
        >
          <p className="text-[28px] font-[250] text-warm leading-none tracking-[-0.5px]">
            {MOCK.unreadLetters}
          </p>
          <p className="text-2xs text-mid-light mt-1 tracking-[0.3px]">封未读信件</p>
        </button>
      </div>

      {/* ── Recent checkins ──────────────────────────────────────── */}
      <div className="mx-4 mt-2.5 flex gap-2">
        {MOCK.recentCheckins.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate('checklist')}
            className={[
              'flex-1 rounded-[13px] px-2.5 py-2 flex items-center gap-1.5 text-[11px] tappable',
              item.done
                ? 'bg-primary-subtle text-primary'
                : 'bg-white text-mid border border-mid-pale/50',
            ].join(' ')}
            aria-label={item.label + (item.done ? '（已完成）' : '')}
          >
            <span
              className={[
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                item.done ? 'bg-primary' : 'bg-inactive',
              ].join(' ')}
            />
            {item.label}{item.done ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {/* ── Quick entry: Stats & Settings ──────────────────────── */}
      <div className="mx-4 mt-4 flex gap-2 pb-6">
        <button
          className="flex-1 flex items-center gap-2 bg-surface rounded-2xl px-4 py-3 shadow-card-sm tappable"
          onClick={() => onNavigate('stats' as TabId)}
          aria-label="数据统计"
        >
          <BarChart2 size={16} className="text-primary" strokeWidth={1.75} />
          <span className="text-[13px] text-deep">统计</span>
          <ChevronRight size={14} className="text-inactive ml-auto" />
        </button>
        <button
          className="flex-1 flex items-center gap-2 bg-surface rounded-2xl px-4 py-3 shadow-card-sm tappable"
          onClick={() => onNavigate('settings' as TabId)}
          aria-label="设置"
        >
          <Settings size={16} className="text-primary" strokeWidth={1.75} />
          <span className="text-[13px] text-deep">设置</span>
          <ChevronRight size={14} className="text-inactive ml-auto" />
        </button>
      </div>
    </div>
  )
}

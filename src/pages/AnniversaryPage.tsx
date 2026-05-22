import { useState } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'
import AddAnniversarySheet, { type AnniversaryDraft } from '@/components/sheets/AddAnniversarySheet'
import ActionMenuSheet from '@/components/sheets/ActionMenuSheet'

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnnItem {
  id: string
  name: string
  date: string
  isAnnual: boolean
  emoji: string
  accentColor: string
  daysSince: number
  nextName: string
  nextDays: number
  repeat: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MAIN = {
  name: '在一起的那天',
  date: '2023.05.12',
  daysCount: 365,
  nextName: '2 周年纪念日',
  nextDays: 32,
  nextHint: '传统象征：棉 / 稻草',
}

// Milestone nodes — starts from 0 to show full journey
const MILESTONES = [
  { label: '0年',    pct: 0,   reached: true,  current: false },
  { label: '1年 ✓',  pct: 0.2, reached: true,  current: false },
  { label: '2年',    pct: 0.4, reached: false, current: true  },
  { label: '5年',    pct: 0.6, reached: false, current: false },
  { label: '10年',   pct: 0.8, reached: false, current: false },
  { label: '20年',   pct: 1.0, reached: false, current: false },
]

// Progress ratio for the filled track line (up to current milestone)
const TRACK_FILLED_PCT = 28   // percent of track that's filled (between 1yr and 2yr marks)

const INITIAL_OTHERS: AnnItem[] = [
  {
    id: '1',
    name: '结婚纪念日',
    date: '2025.06.18',
    isAnnual: true,
    emoji: '💍',
    accentColor: '#3A7A6E',
    daysSince: 328,
    nextName: '1 周年纪念日',
    nextDays: 37,
    repeat: '每年',
  },
  {
    id: '2',
    name: '第一次见面',
    date: '2023.03.08',
    isAnnual: true,
    emoji: '🌸',
    accentColor: '#A8CCC8',
    daysSince: 430,
    nextName: '相识 2 周年',
    nextDays: 112,
    repeat: '每年',
  },
]

const TODAY_ANN = {
  name: '她的生日',
  date: '每年 05.12',
  emoji: '🎂',
  message: '记得送上祝福，她在等你 ♡',
}

export default function AnniversaryPage() {
  const [others, setOthers] = useState<AnnItem[]>(INITIAL_OTHERS)
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<AnnItem | null>(null)
  const [actionTarget, setActionTarget] = useState<AnnItem | null>(null)
  const [showAction, setShowAction] = useState(false)

  const handleAdd = (draft: AnniversaryDraft) => {
    if (editTarget) {
      setOthers(prev => prev.map(o =>
        o.id === editTarget.id
          ? { ...o, name: draft.name, emoji: draft.emoji, date: draft.date, accentColor: draft.accentColor, repeat: draft.repeat }
          : o
      ))
      setEditTarget(null)
    } else {
      const newItem: AnnItem = {
        id: Date.now().toString(),
        name: draft.name,
        date: draft.date,
        isAnnual: draft.repeat === '每年',
        emoji: draft.emoji,
        accentColor: draft.accentColor,
        daysSince: 0,
        nextName: `首个${draft.name}`,
        nextDays: 365,
        repeat: draft.repeat,
      }
      setOthers(prev => [...prev, newItem])
    }
  }

  const handleDelete = (id: string) => {
    setOthers(prev => prev.filter(o => o.id !== id))
  }

  const openEdit = (item: AnnItem) => {
    setEditTarget(item)
    setShowAction(false)
    setTimeout(() => setShowAdd(true), 200)
  }

  const openAction = (item: AnnItem) => {
    setActionTarget(item)
    setShowAction(true)
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Status bar */}
      <div
        className="flex justify-between items-center px-6 text-[11px] font-semibold text-mid flex-shrink-0"
        style={{ paddingTop: 'max(15px, env(safe-area-inset-top))' }}
      >
        <span>9:41</span>
        <span className="text-[10px] opacity-75 tracking-wide">● ● ●</span>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-2 flex-shrink-0">
        <h1 className="text-[22px] font-[300] text-deep tracking-[-0.5px]">纪念日</h1>
        <button
          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-fab tappable"
          onClick={() => { setEditTarget(null); setShowAdd(true) }}
          aria-label="添加纪念日"
        >
          <Plus size={15} color="white" strokeWidth={2} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-2.5">

        {/* ── Main anniversary hero card ── */}
        <div className="rounded-[22px] p-[18px] bg-hero-gradient noise-overlay shadow-card-hover flex-shrink-0">
          {/* Header row */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-2xs text-primary-muted tracking-[0.8px] mb-0.5 uppercase">主纪念日</p>
              <p className="text-[14px] font-medium text-deep">{MAIN.name}</p>
              <p className="text-2xs text-mid mt-0.5">{MAIN.date}</p>
            </div>
            <span className="text-[24px] leading-none">💑</span>
          </div>

          {/* Days count */}
          <div className="mb-3">
            <p className="text-2xs text-primary-muted tracking-[0.5px] mb-0.5">在一起已经</p>
            <div className="flex items-baseline">
              <span className="text-[50px] font-[200] text-deep leading-none tracking-[-3px]">
                {MAIN.daysCount}
              </span>
              <span className="text-[16px] font-[300] text-primary ml-1.5 -translate-y-[5px]">天</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-primary/12 mb-3" />

          {/* Next anniversary countdown */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xs text-mid mb-0.5">下一个周年</p>
              <p className="text-[13px] font-medium text-deep mb-0.5">{MAIN.nextName}</p>
              <p className="text-2xs text-mid-light">{MAIN.nextHint}</p>
            </div>
            <div className="text-right">
              <p className="text-[34px] font-[200] text-primary leading-none tracking-[-1.5px]">
                {MAIN.nextDays}
              </p>
              <p className="text-2xs text-mid mt-0.5">天后</p>
            </div>
          </div>
        </div>

        {/* ── Milestone progress track ── */}
        <div className="bg-surface rounded-[18px] px-4 py-3.5 shadow-card flex-shrink-0">
          <p className="text-2xs text-mid tracking-[0.6px] mb-3.5">周年里程碑</p>
          <div className="relative">
            {/* Background track */}
            <div
              className="absolute bg-primary/10 rounded-full"
              style={{ top: '4px', left: '8px', right: '8px', height: '2px' }}
            />
            {/* Filled track */}
            <div
              className="absolute bg-primary/50 rounded-full"
              style={{ top: '4px', left: '8px', width: `${TRACK_FILLED_PCT}%`, height: '2px' }}
            />
            <div className="flex justify-between">
              {MILESTONES.map((ms, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5" style={{ width: '16.66%' }}>
                  <div
                    className={[
                      'rounded-full relative z-10 flex-shrink-0 transition-all',
                      ms.current
                        ? 'w-[12px] h-[12px] bg-primary shadow-dot border-[2px] border-white'
                        : ms.reached
                          ? 'w-[9px] h-[9px] bg-primary'
                          : 'w-[9px] h-[9px] bg-mid-pale/50 border border-mid-pale',
                    ].join(' ')}
                  />
                  <span className={[
                    'text-[8px] whitespace-nowrap text-center leading-tight',
                    ms.current  ? 'text-primary font-semibold'
                      : ms.reached ? 'text-primary/80'
                        : 'text-inactive',
                  ].join(' ')}>
                    {ms.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Today's anniversary highlight ── */}
        <div className="rounded-[18px] overflow-hidden flex border border-warm-border shadow-warm-card bg-warm-gradient flex-shrink-0">
          <div className="w-1 bg-warm flex-shrink-0" />
          <div className="flex-1 px-3.5 py-3">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-[9px] bg-[#FDEEDE] flex items-center justify-center text-[15px] flex-shrink-0">
                {TODAY_ANN.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#8A4A28]">{TODAY_ANN.name}</p>
                <p className="text-2xs text-[#C4A080] mt-0.5">{TODAY_ANN.date}</p>
              </div>
              <span className="flex items-center gap-1 bg-warm text-white text-2xs px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                🎉 就是今天
              </span>
            </div>
            <p className="text-[11px] text-[#A06040] leading-relaxed">{TODAY_ANN.message}</p>
          </div>
        </div>

        {/* ── Other anniversary cards ── */}
        {others.map((ann) => (
          <div key={ann.id} className="bg-surface rounded-[18px] overflow-hidden flex shadow-card flex-shrink-0">
            {/* Color accent bar */}
            <div className="w-[4px] flex-shrink-0" style={{ background: ann.accentColor }} />
            <div className="flex-1 px-3.5 py-3 min-w-0">
              {/* Top row */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px] flex-shrink-0"
                  style={{ background: ann.accentColor === '#3A7A6E' ? '#E8F5F1' : '#FFF8F2' }}
                >
                  {ann.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-deep truncate">{ann.name}</p>
                  <p className="text-2xs text-mid-light mt-0.5">{ann.date}</p>
                </div>
                <button
                  className="p-1.5 -mr-1 text-mid-pale tappable flex-shrink-0"
                  aria-label="更多操作"
                  onClick={() => openAction(ann)}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Days count */}
              <div className="flex items-baseline mb-2">
                <span className="text-[30px] font-[250] text-deep leading-none tracking-[-1.5px]">
                  {ann.daysSince}
                </span>
                <span className="text-[12px] font-[300] text-primary ml-0.5">天</span>
                <span className="text-2xs text-mid ml-1.5 self-end pb-0.5">
                  {ann.name.includes('结婚') ? '已结婚' : '已相识'}
                </span>
              </div>

              {/* Divider + next */}
              <div className="h-px bg-primary-subtle mb-1.5" />
              <div className="flex justify-between items-center">
                <span className="text-2xs text-mid truncate flex-1">
                  距 <span className="text-primary font-medium">{ann.nextName}</span>
                </span>
                <span className="text-[11px] text-primary font-medium flex-shrink-0 ml-2">
                  还有 {ann.nextDays} 天
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* ── Add card ── */}
        <button
          className="border-[1.5px] border-dashed border-mid-pale rounded-[18px] py-3.5 flex items-center justify-center gap-2 text-primary text-[11px] tappable flex-shrink-0"
          onClick={() => { setEditTarget(null); setShowAdd(true) }}
        >
          <Plus size={14} strokeWidth={1.75} />
          添加新纪念日
        </button>
      </div>

      {/* ── Sheets ── */}
      <AddAnniversarySheet
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditTarget(null) }}
        initial={editTarget ?? undefined}
        onSubmit={handleAdd}
      />

      <ActionMenuSheet
        open={showAction}
        onClose={() => { setShowAction(false); setActionTarget(null) }}
        title={actionTarget ? `${actionTarget.name} · ${actionTarget.date}` : ''}
        onEdit={() => actionTarget && openEdit(actionTarget)}
        onDelete={() => { actionTarget && handleDelete(actionTarget.id); setActionTarget(null) }}
      />
    </div>
  )
}

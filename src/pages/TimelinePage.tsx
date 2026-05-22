import { useState } from 'react'
import { Plus, MapPin } from 'lucide-react'
import AddMemorySheet from '@/components/sheets/AddMemorySheet'
import MemoryDetailSheet from '@/components/sheets/MemoryDetailSheet'
import type { Memory, MemoryTag } from '@/types'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const INITIAL_MEMORIES: Memory[] = [
  {
    id: '1',
    title: '一起爬泰山看日出',
    note: '凌晨两点开始爬，冻得发抖，但日出那一刻什么都值了。',
    date: '2024-03-15',
    location: '山东泰安 · 泰山顶',
    photos: ['mock'],
    tag: 'moving',
  },
  {
    id: '2',
    title: '一起跨年，在外滩倒数',
    note: '第一次一起跨年 🎆',
    date: '2024-01-01',
    location: '上海',
    tag: 'sweet',
  },
  {
    id: '3',
    title: '第一次一起旅行',
    note: '西湖边骑车，吃藕粉，住在民宿听雨声。',
    date: '2023-10-03',
    location: '浙江杭州 · 西湖',
    photos: ['mock', 'mock'],
    tag: 'travel',
  },
  {
    id: '4',
    title: '第一次见她父母',
    date: '2023-07-20',
    tag: 'moving',
  },
  {
    id: '5',
    title: '确认恋爱关系',
    note: '从这天起，我们开始了我们的故事。',
    date: '2023-05-12',
    tag: 'first',
    isSpecial: true,
  },
  {
    id: '6',
    title: '第一次见面',
    note: '图书馆，你在看《挪威的森林》。',
    date: '2023-03-08',
    tag: 'first',
  },
]

const FILTERS: { id: string; label: string; tag?: MemoryTag }[] = [
  { id: 'all',    label: '全部' },
  { id: 'travel', label: '✈️ 旅行', tag: 'travel' },
  { id: 'holiday',label: '🎉 节日', tag: 'holiday' },
  { id: 'first',  label: '💋 第一次', tag: 'first' },
  { id: 'daily',  label: '☀️ 日常', tag: 'daily' },
]

const TAG_STYLES: Record<MemoryTag, { bg: string; text: string; label: string }> = {
  sweet:   { bg: 'bg-[#FFF0F4]', text: 'text-[#C4607A]', label: '甜蜜' },
  moving:  { bg: 'bg-[#FFF3E8]', text: 'text-warm',       label: '感动' },
  first:   { bg: 'bg-primary-subtle', text: 'text-primary', label: '第一次' },
  travel:  { bg: 'bg-[#EEF4FF]', text: 'text-[#5A78C4]', label: '旅行' },
  daily:   { bg: 'bg-primary-subtle', text: 'text-primary', label: '日常' },
  holiday: { bg: 'bg-warm-bg',   text: 'text-warm',       label: '节日' },
}

function formatDateDisplay(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

function getYear(iso: string) { return new Date(iso).getFullYear() }

export default function TimelinePage() {
  const [memories,      setMemories]      = useState<Memory[]>(INITIAL_MEMORIES)
  const [activeFilter,  setActiveFilter]  = useState('all')
  const [showAdd,       setShowAdd]       = useState(false)
  const [detailMemory,  setDetailMemory]  = useState<Memory | null>(null)

  const filtered = activeFilter === 'all'
    ? memories
    : memories.filter(m => m.tag === (activeFilter as MemoryTag))

  const years = [...new Set(filtered.map(m => getYear(m.date)))].sort((a, b) => b - a)

  const handleAddMemory = (data: { title: string; note: string; date: string; location: string; tag: MemoryTag }) => {
    const isoDate = data.date.replace(/\./g, '-')
    const newMemory: Memory = {
      id: Date.now().toString(),
      title: data.title,
      note: data.note,
      date: isoDate,
      location: data.location,
      tag: data.tag,
    }
    setMemories(prev => [newMemory, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
  }

  const handleDelete = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id))
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
      <div className="flex items-center justify-between px-5 pt-3 pb-2 flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-[300] text-deep tracking-[-0.5px]">拾光</h1>
          <p className="text-2xs text-mid mt-0.5">我们走过的每一步</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs text-primary bg-primary-subtle px-2.5 py-1 rounded-full">
            {memories.length} 条
          </span>
          <button
            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-fab tappable"
            aria-label="添加记忆"
            onClick={() => setShowAdd(true)}
          >
            <Plus size={15} color="white" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Filter tags */}
      <div className="flex gap-1.5 px-5 pb-2.5 overflow-x-auto flex-shrink-0">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={[
              'flex-shrink-0 px-3 py-1 rounded-2xl text-[10.5px] tappable whitespace-nowrap',
              activeFilter === f.id
                ? 'bg-primary text-white'
                : 'bg-white/70 text-primary/80',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline list */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Today node */}
        <TimelineRow dot={<Dot type="today" />} hasLine>
          <span className="inline-block text-2xs text-warm bg-warm-bg px-2.5 py-1 rounded-full mt-[10px]">
            今天 · {new Date().toLocaleDateString('zh-CN').replace(/\//g, '.')}
          </span>
        </TimelineRow>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-3">
            <span className="text-[36px]">📷</span>
            <p className="text-[13px] text-mid">还没有记忆，去添加第一条吧</p>
          </div>
        )}

        {years.map(year => (
          <div key={year}>
            <TimelineRow dot={<Dot type="filled" />} hasLine>
              <span className="inline-block text-[11px] font-semibold text-primary bg-primary-subtle px-2.5 py-1 rounded-full mt-[10px]">
                {year}
              </span>
            </TimelineRow>

            {filtered
              .filter(m => getYear(m.date) === year)
              .map((memory, idx, arr) => {
                const tagStyle = TAG_STYLES[memory.tag]
                const isLast   = idx === arr.length - 1 && year === years[years.length - 1]

                return (
                  <TimelineRow
                    key={memory.id}
                    dot={<Dot type={memory.isSpecial ? 'special' : 'outline'} />}
                    hasLine={!isLast}
                  >
                    <button
                      className={[
                        'w-full rounded-2xl overflow-hidden shadow-card tappable mt-1.5 mb-2 text-left',
                        memory.isSpecial
                          ? 'bg-gradient-to-br from-[#F2FAF8] to-[#EAF5F2] border border-mid-pale'
                          : 'bg-surface',
                      ].join(' ')}
                      onClick={() => setDetailMemory(memory)}
                      aria-label={`查看 ${memory.title}`}
                    >
                      {/* Cover photo */}
                      {memory.photos && (
                        <div
                          className="w-full h-[80px] flex items-center justify-center text-3xl relative"
                          style={{ background: 'linear-gradient(135deg, #A4C4C0, #7CB4AA)' }}
                        >
                          🌅
                          <span className="absolute bottom-1.5 right-2 text-2xs text-white/90 bg-black/22 px-1.5 py-0.5 rounded-lg">
                            📷 {memory.photos.length * 10 + 2}
                          </span>
                        </div>
                      )}

                      <div className={memory.isSpecial ? 'p-3.5' : 'p-2.5'}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={['text-2xs', memory.isSpecial ? 'text-primary' : 'text-mid-light'].join(' ')}>
                            {formatDateDisplay(memory.date)}
                            {memory.location && !memory.isSpecial && ` · ${memory.location.split(' · ')[0]}`}
                            {memory.isSpecial && ' · 正式在一起 ♡'}
                          </span>
                          <span className={['text-2xs px-1.5 py-0.5 rounded-lg', tagStyle.bg, tagStyle.text].join(' ')}>
                            {tagStyle.label}
                          </span>
                        </div>

                        <p className={['font-medium leading-snug', memory.isSpecial ? 'text-[13px] text-deep' : 'text-[12px] text-deep'].join(' ')}>
                          {memory.title}
                        </p>

                        {memory.note && (
                          <p className={['text-[10.5px] mt-1 leading-relaxed line-clamp-2', memory.isSpecial ? 'text-primary/80' : 'text-mid'].join(' ')}>
                            {memory.note}
                          </p>
                        )}

                        {memory.location && !memory.isSpecial && (
                          <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-primary-subtle/40">
                            <MapPin size={10} className="text-mid-light" />
                            <span className="text-2xs text-mid-light">{memory.location}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  </TimelineRow>
                )
              })}
          </div>
        ))}

        <TimelineRow dot={<div className="w-6" />} hasLine={false}>
          <p className="text-[10.5px] text-mid-pale italic text-center py-1 pb-4">
            这是我们故事的起点 ↑
          </p>
        </TimelineRow>
      </div>

      {/* ── Sheets ── */}
      <AddMemorySheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAddMemory}
      />

      <MemoryDetailSheet
        memory={detailMemory}
        onClose={() => setDetailMemory(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function TimelineRow({ dot, hasLine, children }: { dot: React.ReactNode; hasLine: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-stretch">
      <div className="w-6 flex-shrink-0 flex flex-col items-center">
        <div className="w-6 flex justify-center pt-[13px] flex-shrink-0">{dot}</div>
        {hasLine && <div className="w-[1.5px] flex-1 bg-mid-pale min-h-2 mt-0.5" />}
      </div>
      <div className="flex-1 pb-1 pl-2.5 pt-1.5">{children}</div>
    </div>
  )
}

function Dot({ type }: { type: 'today' | 'filled' | 'outline' | 'special' }) {
  if (type === 'today')   return <div className="w-[9px] h-[9px] rounded-full bg-warm border-2 border-warm shadow-dot-warm" />
  if (type === 'special') return <div className="w-[11px] h-[11px] rounded-full bg-primary shadow-dot -mt-[1px]" />
  if (type === 'filled')  return <div className="w-[9px] h-[9px] rounded-full bg-primary" />
  return <div className="w-[9px] h-[9px] rounded-full bg-white border-2 border-primary" />
}

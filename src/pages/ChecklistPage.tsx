import { useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import CheckinSheet from '@/components/sheets/CheckinSheet'
import AddChecklistItemSheet from '@/components/sheets/AddChecklistItemSheet'
import type { ChecklistCategory, ChecklistItem } from '@/types'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const INITIAL_CATEGORIES: ChecklistCategory[] = [
  {
    id: 'first',
    name: '感情阶段第一次',
    emoji: '💋',
    items: [
      { id: '1', title: '第一次单独约会',         categoryId: 'first', completedAt: '2023.05.12', location: '西湖边' },
      { id: '2', title: '第一次牵手',             categoryId: 'first', completedAt: '2023.05.12' },
      { id: '3', title: '第一次正式确认恋爱关系', categoryId: 'first', completedAt: '2023.05.12' },
      { id: '4', title: '第一次见对方父母',       categoryId: 'first' },
      { id: '5', title: '第一次一起旅行',         categoryId: 'first' },
    ],
  },
  { id: 'travel',      name: '旅行与探索',       emoji: '✈️', items: Array.from({length: 45}, (_, i) => ({ id: `t${i}`, title: i === 0 ? '去北海道看雪' : i === 1 ? '在巴黎铁塔下拍照' : i === 2 ? '去京都赏枫叶' : `旅行项目 ${i+1}`, categoryId: 'travel', ...(i < 8 ? { completedAt: '2024.01.01' } : {}) })) },
  { id: 'daily',       name: '日常生活仪式感',   emoji: '🍳', items: Array.from({length: 40}, (_, i) => ({ id: `d${i}`, title: i === 0 ? '一起做早餐' : i === 1 ? '一起看日出' : `日常项目 ${i+1}`, categoryId: 'daily', ...(i < 12 ? { completedAt: '2024.01.01' } : {}) })) },
  { id: 'holiday',     name: '节日 & 特殊日子', emoji: '🎌', items: Array.from({length: 22}, (_, i) => ({ id: `h${i}`, title: i === 0 ? '一起跨年' : i === 1 ? '一起过七夕' : `节日项目 ${i+1}`, categoryId: 'holiday', ...(i < 6 ? { completedAt: '2024.01.01' } : {}) })) },
  { id: 'culture',     name: '文化娱乐体验',     emoji: '🎭', items: Array.from({length: 30}, (_, i) => ({ id: `c${i}`, title: i === 0 ? '看一场话剧' : `文化项目 ${i+1}`, categoryId: 'culture', ...(i < 3 ? { completedAt: '2024.01.01' } : {}) })) },
  { id: 'sport',       name: '运动与户外挑战',   emoji: '🏄', items: Array.from({length: 20}, (_, i) => ({ id: `s${i}`, title: i === 0 ? '一起爬山' : `运动项目 ${i+1}`, categoryId: 'sport' })) },
  { id: 'emotion',     name: '情感表达与记录',   emoji: '💌', items: Array.from({length: 28}, (_, i) => ({ id: `e${i}`, title: i === 0 ? '手写一封情书' : `情感项目 ${i+1}`, categoryId: 'emotion' })) },
  { id: 'family',      name: '家庭与人生里程碑', emoji: '👨‍👩‍👧', items: Array.from({length: 35}, (_, i) => ({ id: `f${i}`, title: i === 0 ? '一起买第一套房' : `家庭项目 ${i+1}`, categoryId: 'family' })) },
  { id: 'growth',      name: '共同成长',         emoji: '📈', items: Array.from({length: 22}, (_, i) => ({ id: `g${i}`, title: i === 0 ? '一起学一门外语' : `成长项目 ${i+1}`, categoryId: 'growth' })) },
  { id: 'anniversary', name: '周年纪念里程碑',   emoji: '📅', items: Array.from({length: 18}, (_, i) => ({ id: `a${i}`, title: i === 0 ? '拍周年纪念写真' : `周年项目 ${i+1}`, categoryId: 'anniversary' })) },
  { id: 'ritual',      name: '仪式感小习惯',     emoji: '🌙', items: Array.from({length: 13}, (_, i) => ({ id: `r${i}`, title: i === 0 ? '每周末一起做饭' : `仪式项目 ${i+1}`, categoryId: 'ritual' })) },
  { id: 'final',       name: '人生终章',         emoji: '🏁', items: Array.from({length: 9},  (_, i) => ({ id: `fi${i}`, title: i === 0 ? '一起看老了之后的夕阳' : `终章项目 ${i+1}`, categoryId: 'final' })) },
]

export default function ChecklistPage() {
  const [categories,    setCategories]    = useState<ChecklistCategory[]>(INITIAL_CATEGORIES)
  const [expandedId,    setExpandedId]    = useState<string | null>('first')
  const [selectedItem,  setSelectedItem]  = useState<ChecklistItem | null>(null)
  const [justDoneId,    setJustDoneId]    = useState<string | null>(null)
  const [showAddItem,   setShowAddItem]   = useState(false)

  const totalDone  = categories.reduce((s, c) => s + c.items.filter(i => i.completedAt).length, 0)
  const totalItems = categories.reduce((s, c) => s + c.items.length, 0)
  const progressPct = Math.round((totalDone / totalItems) * 100)

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id)

  const handleCheckin = (data: { note: string; location: string }) => {
    if (!selectedItem) return
    const id = selectedItem.id
    const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')

    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item =>
        item.id === id
          ? { ...item, completedAt: today, location: data.location, note: data.note }
          : item
      ),
    })))

    setJustDoneId(id)
    setTimeout(() => setJustDoneId(null), 1200)
    setSelectedItem(null)
  }

  const handleAddItem = ({ title, categoryId }: { title: string; categoryId: string }) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, items: [...cat.items, { id: `new-${Date.now()}`, title, categoryId }] }
        : cat
    ))
    setExpandedId(categoryId)
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
      <div className="flex items-end justify-between px-4 pt-3 pb-2 flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-[300] text-deep tracking-[-0.5px]">打卡清单</h1>
          <p className="text-2xs text-mid mt-0.5">一生要做的 {totalItems} 件事</p>
        </div>
        <button
          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-fab tappable"
          aria-label="添加打卡项"
          onClick={() => setShowAddItem(true)}
        >
          <Plus size={16} color="white" strokeWidth={2} />
        </button>
      </div>

      {/* Progress card */}
      <div className="mx-4 mb-3 bg-surface rounded-2xl px-3.5 py-3 flex items-center gap-3 shadow-card flex-shrink-0">
        <span className="text-[40px] font-[200] text-primary leading-none tracking-[-2px]">
          {totalDone}
        </span>
        <div className="flex-1">
          <p className="text-2xs text-mid mb-1.5">已完成 / 共 {totalItems} 项</p>
          <div className="h-[3px] bg-primary-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={totalDone}
              aria-valuemax={totalItems}
            />
          </div>
          <span className="inline-block mt-1.5 text-2xs text-primary/80 bg-primary-subtle px-2 py-0.5 rounded-lg">
            ✦ {progressPct}% 完成 · 继续加油 ♡
          </span>
        </div>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-1.5">
        {categories.map((cat) => {
          const done   = cat.items.filter(i => i.completedAt).length
          const isOpen = expandedId === cat.id
          const preview = cat.items.slice(0, 5)

          return (
            <div key={cat.id}>
              {/* Section header */}
              <button
                className={[
                  'w-full flex items-center gap-1.5 px-3 py-2.5 bg-surface',
                  'shadow-card-sm transition-all duration-200',
                  isOpen
                    ? 'rounded-t-[12px] rounded-b-none border-b border-primary-subtle'
                    : 'rounded-[12px]',
                ].join(' ')}
                onClick={() => toggle(cat.id)}
                aria-expanded={isOpen}
              >
                <span className="text-[13px] w-[18px] text-center flex-shrink-0">{cat.emoji}</span>
                <span className="flex-1 text-left text-[11px] font-medium text-deep">{cat.name}</span>
                <span className="text-2xs text-mid-light mr-0.5">
                  <span className="text-primary font-semibold">{done}</span>/{cat.items.length}
                </span>
                <ChevronRight
                  size={13}
                  className={[
                    'text-mid-pale transition-transform duration-200 flex-shrink-0',
                    isOpen ? 'rotate-90 text-primary' : '',
                  ].join(' ')}
                />
              </button>

              {/* Expanded items */}
              {isOpen && (
                <div className="bg-surface rounded-b-[12px] overflow-hidden shadow-card-sm">
                  {preview.map((item, idx) => {
                    const isJustDone = justDoneId === item.id
                    return (
                      <button
                        key={item.id}
                        className={[
                          'w-full flex items-center gap-2.5 px-3 py-2 tappable transition-colors duration-200',
                          idx < preview.length - 1 || cat.items.length > 5
                            ? 'border-b border-primary-subtle/30'
                            : '',
                          isJustDone ? 'bg-primary-subtle/60' : '',
                        ].join(' ')}
                        onClick={() => !item.completedAt && setSelectedItem(item)}
                        disabled={!!item.completedAt}
                        aria-label={item.title + (item.completedAt ? '（已完成）' : '')}
                      >
                        {/* Checkbox with animation */}
                        <div
                          className={[
                            'w-[18px] h-[18px] rounded-[5px] flex-shrink-0 flex items-center justify-center text-[11px]',
                            'transition-all duration-300',
                            item.completedAt
                              ? 'bg-primary text-white'
                              : 'bg-primary-subtle border-[1.5px] border-mid-pale',
                            isJustDone ? 'scale-125' : 'scale-100',
                          ].join(' ')}
                          aria-hidden
                        >
                          {item.completedAt && '✓'}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className={[
                            'text-[11px] leading-[1.35]',
                            item.completedAt ? 'text-mid-light line-through' : 'text-deep',
                          ].join(' ')}>
                            {item.title}
                          </p>
                          {item.completedAt && (
                            <p className="text-2xs text-inactive mt-0.5">
                              {item.completedAt}{item.location ? ` · ${item.location}` : ''}
                            </p>
                          )}
                        </div>
                        {!item.completedAt && (
                          <span className="text-2xs text-primary-muted flex-shrink-0">打卡</span>
                        )}
                      </button>
                    )
                  })}

                  {cat.items.length > 5 && (
                    <button className="w-full text-center py-2 text-2xs text-primary border-t border-primary-subtle/30 tappable">
                      还有 {cat.items.length - 5} 项 ›
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Sheets ── */}
      <CheckinSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSubmit={handleCheckin}
      />

      <AddChecklistItemSheet
        open={showAddItem}
        onClose={() => setShowAddItem(false)}
        onSubmit={handleAddItem}
      />
    </div>
  )
}

import { useState } from 'react'
import { Plus, MoreHorizontal, ChevronRight } from 'lucide-react'
import AddWishSheet from '@/components/sheets/AddWishSheet'
import ActionMenuSheet from '@/components/sheets/ActionMenuSheet'
import Sheet from '@/components/ui/Sheet'
import type { Wish, WishCategory, WishPriority } from '@/types'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const INITIAL_WISHES: Wish[] = [
  { id: '1', title: '一起去北海道看雪',           category: 'place',    priority: 3, addedBy: '她',   note: '冬天去，穿和服拍照' },
  { id: '2', title: '一起吃北京烤鸭（正宗的）',   category: 'food',     priority: 0, addedBy: '他' },
  { id: '3', title: '一起学做寿司',               category: 'activity', priority: 2, addedBy: '一起', note: '找个周末报班' },
  { id: '4', title: '一起学吉他，弹一首歌给对方', category: 'learn',    priority: 0, addedBy: '她' },
  { id: '5', title: '给她买一条喜欢的项链',       category: 'buy',      priority: 1, addedBy: '他' },
  { id: '6', title: '一起看日出',                 category: 'place',    priority: 3, addedBy: '他', completedAt: '2024.03.15', note: '泰山，凌晨四点爬上去的 🌅' },
]

const FILTERS: { id: string; label: string; cat?: WishCategory }[] = [
  { id: 'all',      label: '全部' },
  { id: 'place',    label: '📍 想去',  cat: 'place' },
  { id: 'food',     label: '🍜 想吃',  cat: 'food' },
  { id: 'activity', label: '🎯 想做',  cat: 'activity' },
  { id: 'buy',      label: '🛍 想买',  cat: 'buy' },
  { id: 'learn',    label: '📚 想学',  cat: 'learn' },
]

const CAT_STYLES: Record<WishCategory, { label: string; bg: string; text: string }> = {
  place:    { label: '📍 想去', bg: 'bg-primary-subtle', text: 'text-primary' },
  food:     { label: '🍜 想吃', bg: 'bg-warm-bg',       text: 'text-warm' },
  activity: { label: '🎯 想做', bg: 'bg-[#F0EEFF]',    text: 'text-[#7A6AB0]' },
  buy:      { label: '🛍 想买', bg: 'bg-[#FFF8E8]',    text: 'text-[#B0946A]' },
  learn:    { label: '📚 想学', bg: 'bg-[#E8F0FF]',    text: 'text-[#5A7AB0]' },
}

const CATEGORIES_OPTS: { id: WishCategory; label: string; bg: string; text: string }[] = [
  { id: 'place',    label: '📍 想去', bg: 'bg-primary-subtle', text: 'text-primary' },
  { id: 'food',     label: '🍜 想吃', bg: 'bg-warm-bg',       text: 'text-warm' },
  { id: 'activity', label: '🎯 想做', bg: 'bg-[#F0EEFF]',    text: 'text-[#7A6AB0]' },
  { id: 'buy',      label: '🛍 想买', bg: 'bg-[#FFF8E8]',    text: 'text-[#B0946A]' },
  { id: 'learn',    label: '📚 想学', bg: 'bg-[#E8F0FF]',    text: 'text-[#5A7AB0]' },
]

function Stars({ count }: { count: number }) {
  if (count === 0) return null
  return <span className="text-[11px] text-[#F0C060]">{'★'.repeat(count)}</span>
}

export default function WishlistPage() {
  const [wishes,         setWishes]         = useState<Wish[]>(INITIAL_WISHES)
  const [activeFilter,   setActiveFilter]   = useState('all')
  const [showCompleted,  setShowCompleted]  = useState(false)
  const [showAdd,        setShowAdd]        = useState(false)
  const [actionWish,     setActionWish]     = useState<Wish | null>(null)
  const [editWish,       setEditWish]       = useState<Wish | null>(null)
  const [completeWishId, setCompleteWishId] = useState<string | null>(null)

  const activeWishes    = wishes.filter(w => !w.completedAt)
  const completedWishes = wishes.filter(w => w.completedAt)

  const filtered = activeFilter === 'all'
    ? activeWishes
    : activeWishes.filter(w => w.category === activeFilter)

  const handleAdd = (data: { title: string; category: WishCategory; priority: WishPriority; note: string }) => {
    const newWish: Wish = {
      id: Date.now().toString(),
      title: data.title,
      category: data.category,
      priority: data.priority,
      addedBy: '我',
      note: data.note,
    }
    setWishes(prev => [newWish, ...prev])
  }

  const handleComplete = (id: string) => {
    const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
    setCompleteWishId(id)
    setTimeout(() => {
      setWishes(prev => prev.map(w => w.id === id ? { ...w, completedAt: today } : w))
      setCompleteWishId(null)
    }, 500)
  }

  const handleDelete = (id: string) => {
    setWishes(prev => prev.filter(w => w.id !== id))
    setActionWish(null)
  }

  const handleEditSave = (data: { title: string; category: WishCategory; priority: WishPriority; note: string }) => {
    if (!editWish) return
    setWishes(prev => prev.map(w => w.id === editWish.id ? { ...w, ...data } : w))
    setEditWish(null)
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
      <div className="flex items-end justify-between px-5 pt-3 pb-2 flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-[300] text-deep tracking-[-0.5px]">心愿</h1>
          <p className="text-2xs text-mid mt-0.5">一起勾掉这些事 ♡</p>
        </div>
        <button
          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-fab tappable"
          aria-label="添加心愿"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={15} color="white" strokeWidth={2} />
        </button>
      </div>

      {/* Filter tags */}
      <div className="flex gap-1.5 px-5 pb-2.5 overflow-x-auto flex-shrink-0">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={[
              'flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] tappable whitespace-nowrap',
              activeFilter === f.id
                ? 'bg-primary text-white'
                : 'bg-primary-subtle text-primary/80',
            ].join(' ')}
          >
            {f.id === 'all' ? `全部 ${activeWishes.length}` : f.label}
          </button>
        ))}
      </div>

      {/* Completed toggle */}
      <button
        className="mx-5 mb-2.5 bg-surface rounded-[12px] px-3.5 py-2.5 flex items-center justify-between shadow-card-sm tappable flex-shrink-0"
        onClick={() => setShowCompleted(v => !v)}
        aria-expanded={showCompleted}
      >
        <div className="flex items-center gap-1.5 text-[11px] text-deep">
          <span>🎉</span>
          <span>已实现心愿</span>
          <span className="text-2xs text-primary bg-primary-subtle px-2 py-0.5 rounded-full">
            {completedWishes.length} 个
          </span>
        </div>
        <ChevronRight
          size={14}
          className={['text-inactive transition-transform duration-200', showCompleted ? 'rotate-90' : ''].join(' ')}
        />
      </button>

      {/* Wish list */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-3">
            <span className="text-[36px]">✨</span>
            <p className="text-[13px] text-mid">还没有心愿，去添加第一个吧</p>
          </div>
        )}

        {filtered.map((wish) => (
          <WishCard
            key={wish.id}
            wish={wish}
            isCompleting={completeWishId === wish.id}
            onComplete={() => handleComplete(wish.id)}
            onMore={() => { setActionWish(wish); }}
          />
        ))}

        {showCompleted && completedWishes.map(wish => (
          <WishCard key={wish.id} wish={wish} completed />
        ))}
      </div>

      {/* ── Add Wish Sheet ── */}
      <AddWishSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
      />

      {/* ── Edit Wish Sheet ── */}
      {editWish && (
        <AddWishSheet
          open={!!editWish}
          onClose={() => setEditWish(null)}
          onSubmit={handleEditSave}
        />
      )}

      {/* ── Action Menu ── */}
      <ActionMenuSheet
        open={!!actionWish}
        onClose={() => setActionWish(null)}
        title={actionWish ? `${actionWish.title}` : ''}
        onEdit={() => { setEditWish(actionWish); setActionWish(null) }}
        onDelete={() => actionWish && handleDelete(actionWish.id)}
      />

      {/* ── Complete Confirm Sheet ── */}
      <CompleteConfirmSheet
        wish={completeWishId ? wishes.find(w => w.id === completeWishId) ?? null : null}
        onClose={() => setCompleteWishId(null)}
        onConfirm={() => completeWishId && handleComplete(completeWishId)}
      />
    </div>
  )
}

// ─── WishCard ─────────────────────────────────────────────────────────────────
function WishCard({
  wish,
  completed = false,
  isCompleting = false,
  onComplete,
  onMore,
}: {
  wish: Wish
  completed?: boolean
  isCompleting?: boolean
  onComplete?: () => void
  onMore?: () => void
}) {
  const cat = CAT_STYLES[wish.category]

  return (
    <div
      className={[
        'bg-surface rounded-2xl px-3.5 py-3 flex items-start gap-2.5 shadow-card transition-all duration-300',
        completed ? 'opacity-65' : '',
        isCompleting ? 'scale-[0.97] opacity-70' : '',
      ].join(' ')}
    >
      {/* Checkbox */}
      <button
        className={[
          'w-5 h-5 rounded-[6px] flex-shrink-0 mt-0.5 flex items-center justify-center text-[11px] transition-all duration-200',
          completed ? 'bg-primary text-white' : 'bg-primary-subtle border-[1.5px] border-mid-pale tappable',
          isCompleting ? 'scale-110 bg-primary/70' : '',
        ].join(' ')}
        onClick={!completed ? onComplete : undefined}
        aria-label={completed ? '已完成' : '标记为完成'}
        disabled={completed}
      >
        {(completed || isCompleting) && '✓'}
      </button>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className={['text-2xs px-1.5 py-0.5 rounded-lg font-medium', cat.bg, cat.text].join(' ')}>
            {cat.label}
          </span>
          {wish.priority > 0 && <Stars count={wish.priority} />}
          <span className="text-2xs text-mid-light ml-auto flex-shrink-0">
            {completed ? wish.completedAt : `${wish.addedBy}加的`}
          </span>
        </div>
        <p className={['text-[13px] text-deep leading-snug', completed ? 'line-through text-mid-light' : ''].join(' ')}>
          {wish.title}
        </p>
        {wish.note && (
          <p className="text-[10.5px] text-mid-light mt-1">{wish.note}</p>
        )}
      </div>

      {!completed && (
        <button
          className="text-mid-pale tappable p-0.5 -mr-1 flex-shrink-0"
          aria-label="更多操作"
          onClick={onMore}
        >
          <MoreHorizontal size={16} />
        </button>
      )}
    </div>
  )
}

// ─── Complete Confirm Sheet ───────────────────────────────────────────────────
function CompleteConfirmSheet({
  wish,
  onClose,
  onConfirm,
}: {
  wish: Wish | null
  onClose: () => void
  onConfirm: () => void
}) {
  const [noting, setNoting] = useState('')

  return (
    <Sheet open={!!wish} onClose={onClose}>
      <div className="px-5 py-3 pb-4">
        <div className="flex flex-col items-center py-3 mb-4">
          <span className="text-[44px] mb-2">🎉</span>
          <p className="text-[17px] font-medium text-deep mb-1">完成了这个心愿！</p>
          <p className="text-[12px] text-mid text-center leading-relaxed">
            {wish?.title}
          </p>
        </div>
        <div className="bg-[#F7FAF9] rounded-[14px] p-3 mb-4">
          <textarea
            value={noting}
            onChange={e => setNoting(e.target.value)}
            placeholder="记录一下这个时刻… (选填)"
            rows={3}
            className="w-full bg-transparent outline-none text-[13px] text-deep placeholder:text-inactive resize-none leading-relaxed"
          />
        </div>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className="w-full rounded-2xl py-3.5 text-sm font-medium text-white bg-btn-gradient shadow-btn tappable mb-2.5"
        >
          ✓ 确认完成
        </button>
        <button onClick={onClose} className="w-full rounded-2xl py-3 text-sm text-mid bg-[#F7FAF9] tappable">
          取消
        </button>
      </div>
    </Sheet>
  )
}

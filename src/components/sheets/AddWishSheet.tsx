import { useState } from 'react'
import Sheet from '@/components/ui/Sheet'
import type { WishCategory, WishPriority } from '@/types'

const CATEGORIES: { id: WishCategory; label: string; bg: string; text: string }[] = [
  { id: 'place',    label: '📍 想去', bg: 'bg-primary-subtle', text: 'text-primary' },
  { id: 'food',     label: '🍜 想吃', bg: 'bg-warm-bg',       text: 'text-warm' },
  { id: 'activity', label: '🎯 想做', bg: 'bg-[#F0EEFF]',    text: 'text-[#7A6AB0]' },
  { id: 'buy',      label: '🛍 想买', bg: 'bg-[#FFF8E8]',    text: 'text-[#B0946A]' },
  { id: 'learn',    label: '📚 想学', bg: 'bg-[#E8F0FF]',    text: 'text-[#5A7AB0]' },
]

interface AddWishSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { title: string; category: WishCategory; priority: WishPriority; note: string }) => void
}

export default function AddWishSheet({ open, onClose, onSubmit }: AddWishSheetProps) {
  const [title,    setTitle]    = useState('')
  const [note,     setNote]     = useState('')
  const [category, setCategory] = useState<WishCategory>('place')
  const [priority, setPriority] = useState<WishPriority>(0)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    onSubmit({ title, category, priority, note })
    setTitle(''); setNote(''); setPriority(0)
    setSubmitting(false)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-[18px] pt-2 pb-1">
        <h2 className="text-[17px] font-medium text-deep mb-4">添加心愿</h2>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="我们想一起做的事…"
          className="w-full text-[15px] text-deep placeholder:text-inactive bg-transparent outline-none border-b border-primary-subtle/60 pb-2 mb-4 leading-relaxed"
          autoFocus
        />

        {/* Category */}
        <div className="mb-4">
          <p className="text-2xs text-mid mb-2">分类</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={[
                  'text-[11px] px-3 py-1.5 rounded-full tappable border transition-all duration-150',
                  category === c.id
                    ? [c.bg, c.text, 'border-current'].join(' ')
                    : 'bg-transparent text-mid border-mid-pale',
                ].join(' ')}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="mb-4">
          <p className="text-2xs text-mid mb-2">优先级</p>
          <div className="flex gap-1.5">
            {([0, 1, 2, 3] as WishPriority[]).map(p => (
              <button
                key={p}
                onClick={() => setPriority(p === priority ? 0 : p)}
                className={[
                  'flex-1 py-2 rounded-xl text-sm tappable border transition-all duration-150',
                  priority >= p && p > 0
                    ? 'text-[#F0C060] bg-[#FFF8E8] border-[#F0C060]/30'
                    : 'text-mid border-mid-pale',
                ].join(' ')}
                aria-label={p === 0 ? '无优先级' : `${p}星优先级`}
              >
                {p === 0 ? '不限' : '★'.repeat(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-4">
          <p className="text-2xs text-mid mb-1.5">备注（选填）</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="更多想法…"
            rows={2}
            className="w-full bg-primary-subtle/50 rounded-[10px] px-3 py-2.5 text-[11px] text-deep placeholder:text-inactive outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="px-[18px] pt-1 pb-2">
        <button
          disabled={!title.trim() || submitting}
          onClick={handleSubmit}
          className={[
            'w-full rounded-2xl py-3.5 text-sm font-medium text-white',
            'bg-btn-gradient shadow-btn transition-all duration-200',
            'hover:shadow-btn-hover active:scale-[0.98] active:opacity-90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          ].join(' ')}
        >
          {submitting ? '保存中…' : '✓  加入心愿单'}
        </button>
      </div>
    </Sheet>
  )
}

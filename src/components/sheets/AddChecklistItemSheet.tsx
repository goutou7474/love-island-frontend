import { useState } from 'react'
import Sheet from '@/components/ui/Sheet'

const CATEGORIES = [
  { id: 'first',       label: '💋 感情第一次' },
  { id: 'travel',      label: '✈️ 旅行与探索' },
  { id: 'daily',       label: '🍳 日常仪式感' },
  { id: 'holiday',     label: '🎌 节日特殊日' },
  { id: 'culture',     label: '🎭 文化娱乐' },
  { id: 'sport',       label: '🏄 运动挑战' },
  { id: 'emotion',     label: '💌 情感表达' },
  { id: 'family',      label: '👨‍👩‍👧 家庭里程碑' },
  { id: 'growth',      label: '📈 共同成长' },
  { id: 'anniversary', label: '📅 周年纪念' },
  { id: 'ritual',      label: '🌙 仪式习惯' },
  { id: 'final',       label: '🏁 人生终章' },
]

interface AddChecklistItemSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { title: string; categoryId: string }) => void
}

export default function AddChecklistItemSheet({ open, onClose, onSubmit }: AddChecklistItemSheetProps) {
  const [title,    setTitle]    = useState('')
  const [catId,    setCatId]    = useState('first')
  const [saving,   setSaving]   = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    onSubmit({ title: title.trim(), categoryId: catId })
    setTitle('')
    setSaving(false)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-5 py-2 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-medium text-deep">添加打卡项</h2>
          <button onClick={onClose} className="text-[13px] text-mid tappable">取消</button>
        </div>

        {/* Item name */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="想一起做的事…"
          className="w-full text-[15px] text-deep placeholder:text-inactive bg-transparent outline-none border-b border-primary-subtle/60 pb-2.5 mb-4 leading-relaxed"
        />

        {/* Category */}
        <p className="text-2xs text-mid mb-2">加到哪个分类</p>
        <div className="flex flex-wrap gap-1.5 mb-5 max-h-[110px] overflow-y-auto">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCatId(c.id)}
              className={[
                'text-[11px] px-2.5 py-1.5 rounded-full border tappable transition-all duration-150 whitespace-nowrap',
                catId === c.id
                  ? 'bg-primary text-white border-primary'
                  : 'text-mid border-mid-pale bg-transparent',
              ].join(' ')}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          disabled={!title.trim() || saving}
          onClick={handleSave}
          className={[
            'w-full rounded-2xl py-3.5 text-sm font-medium text-white',
            'bg-btn-gradient shadow-btn transition-all duration-200',
            'active:scale-[0.98] active:opacity-90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {saving ? '添加中…' : '✓  添加'}
        </button>
      </div>
    </Sheet>
  )
}

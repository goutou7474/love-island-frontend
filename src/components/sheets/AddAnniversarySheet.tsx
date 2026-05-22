import { useState } from 'react'
import { PenLine, Calendar, RefreshCw } from 'lucide-react'
import Sheet from '@/components/ui/Sheet'

const ICON_OPTS = ['🎂', '💍', '🌸', '✈️', '🏠', '🎓', '⭐️', '🎁', '🐾', '🎵']

const COLOR_OPTS = [
  '#3A7A6E',
  '#A8CCC8',
  '#C48A6A',
  '#C4607A',
  '#7A8AC4',
  '#A0B89A',
]

const REPEAT_OPTS = ['每年', '每月', '不重复']

export interface AnniversaryDraft {
  emoji: string
  name: string
  date: string
  repeat: string
  accentColor: string
}

interface AddAnniversarySheetProps {
  open: boolean
  onClose: () => void
  initial?: Partial<AnniversaryDraft>
  onSubmit: (data: AnniversaryDraft) => void
}

export default function AddAnniversarySheet({
  open, onClose, initial, onSubmit,
}: AddAnniversarySheetProps) {
  const [emoji,       setEmoji]       = useState(initial?.emoji       ?? '🎂')
  const [name,        setName]        = useState(initial?.name        ?? '')
  const [date,        setDate]        = useState(initial?.date        ?? '')
  const [repeat,      setRepeat]      = useState(initial?.repeat      ?? '每年')
  const [accentColor, setAccentColor] = useState(initial?.accentColor ?? '#3A7A6E')
  const [submitting,  setSubmitting]  = useState(false)

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '.')

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    onSubmit({ emoji, name, date: date || today, repeat, accentColor })
    setName(''); setDate('')
    setSubmitting(false)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-5 py-2 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-medium text-deep">
            {initial?.name ? '编辑纪念日' : '添加纪念日'}
          </h2>
          <button onClick={onClose} className="text-[13px] text-mid tappable">取消</button>
        </div>

        {/* Icon picker */}
        <p className="text-2xs text-mid mb-2">选择图标</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {ICON_OPTS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={[
                'w-9 h-9 rounded-[10px] text-[18px] flex items-center justify-center tappable border-[1.5px] transition-all duration-150',
                emoji === e
                  ? 'border-primary bg-primary-subtle'
                  : 'border-transparent bg-[#F7FAF9]',
              ].join(' ')}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="bg-[#F7FAF9] rounded-[14px] overflow-hidden mb-4">
          {/* Name */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-subtle/40">
            <PenLine size={15} className="text-mid flex-shrink-0" />
            <span className="text-2xs text-mid w-8 flex-shrink-0">名称</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="给这个日子取个名字…"
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
              autoFocus
            />
          </div>

          {/* Date */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-subtle/40">
            <Calendar size={15} className="text-mid flex-shrink-0" />
            <span className="text-2xs text-mid w-8 flex-shrink-0">日期</span>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder={today}
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
            />
            <span className="text-mid-pale text-sm">›</span>
          </div>

          {/* Repeat */}
          <div className="flex items-center gap-3 px-4 py-3">
            <RefreshCw size={15} className="text-mid flex-shrink-0" />
            <span className="text-2xs text-mid w-8 flex-shrink-0">重复</span>
            <div className="flex gap-2 flex-1 flex-wrap">
              {REPEAT_OPTS.map(r => (
                <button
                  key={r}
                  onClick={() => setRepeat(r)}
                  className={[
                    'text-[11px] px-2.5 py-1 rounded-full border tappable transition-all duration-150',
                    repeat === r
                      ? 'bg-primary text-white border-primary'
                      : 'text-mid border-mid-pale',
                  ].join(' ')}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color picker */}
        <p className="text-2xs text-mid mb-2">标签颜色</p>
        <div className="flex gap-2.5 mb-5">
          {COLOR_OPTS.map(c => (
            <button
              key={c}
              onClick={() => setAccentColor(c)}
              className={[
                'w-7 h-7 rounded-full tappable transition-all duration-150 flex items-center justify-center',
                accentColor === c ? 'ring-2 ring-offset-2 ring-primary/60' : '',
              ].join(' ')}
              style={{ background: c }}
              aria-label={`颜色 ${c}`}
            >
              {accentColor === c && <span className="text-white text-[11px] font-bold">✓</span>}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          disabled={!name.trim() || submitting}
          onClick={handleSubmit}
          className={[
            'w-full rounded-2xl py-3.5 text-sm font-medium text-white',
            'bg-btn-gradient shadow-btn transition-all duration-200',
            'active:scale-[0.98] active:opacity-90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {submitting ? '保存中…' : '✓  保存纪念日'}
        </button>
      </div>
    </Sheet>
  )
}

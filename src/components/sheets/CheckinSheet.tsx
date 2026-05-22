import { useState } from 'react'
import { Calendar, MapPin, Camera, PenLine } from 'lucide-react'
import Sheet from '@/components/ui/Sheet'
import type { ChecklistItem } from '@/types'

interface CheckinData {
  itemId: string
  date: string
  location?: string
  note?: string
  photos?: File[]
}

interface CheckinSheetProps {
  item: ChecklistItem | null
  onClose: () => void
  onSubmit: (data: CheckinData) => void
}

export default function CheckinSheet({ item, onClose, onSubmit }: CheckinSheetProps) {
  const [date]      = useState(() => new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'))
  const [location, setLocation] = useState('')
  const [note, setNote]         = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!item) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600)) // simulate API
    onSubmit({ itemId: item.id, date, location: location || undefined, note: note || undefined })
    setSubmitting(false)
  }

  return (
    <Sheet open={!!item} onClose={onClose}>
      {item && (
        <div>
          <div className="px-[18px] pt-3.5">
            {/* Category badge */}
            <div className="inline-flex items-center gap-1 text-2xs text-primary bg-primary-subtle px-2.5 py-1 rounded-full mb-2">
              💋 感情阶段第一次
            </div>

            {/* Title */}
            <h2 className="text-[17px] font-medium text-deep mb-4 leading-snug">
              {item.title}
            </h2>

            {/* Date */}
            <FieldRow icon={<Calendar size={15} className="text-mid" />} label="完成日期">
              <span className="text-sm text-deep">{date}</span>
              <ChevronRight />
            </FieldRow>

            {/* Location */}
            <FieldRow icon={<MapPin size={15} className="text-mid" />} label="在哪里">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="添加地点（选填）"
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-inactive text-deep"
              />
            </FieldRow>

            {/* Photos */}
            <div className="py-3 border-b border-primary-subtle/40">
              <p className="flex items-center gap-1.5 text-[11px] text-mid mb-2">
                <Camera size={14} className="text-mid" /> 上传照片（选填）
              </p>
              <div className="flex gap-1.5">
                {/* Mock existing thumb */}
                <div
                  className="w-[52px] h-[52px] rounded-[10px] flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #A4C4C0, #7CB4AA)' }}
                />
                {/* Add button */}
                <button
                  className="w-[52px] h-[52px] rounded-[10px] border-[1.5px] border-dashed border-mid-pale flex flex-col items-center justify-center gap-0.5 text-primary flex-shrink-0 tappable"
                  aria-label="添加照片"
                >
                  <span className="text-lg leading-none">+</span>
                  <span className="text-[8px] text-mid">添加</span>
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="py-3">
              <p className="flex items-center gap-1.5 text-[11px] text-mid mb-1.5">
                <PenLine size={14} className="text-mid" /> 写点什么…
              </p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="记录这一刻…"
                rows={3}
                className="w-full bg-primary-subtle/50 rounded-[10px] px-3 py-2.5 text-[11px] text-deep placeholder:text-inactive outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="px-[18px] pt-2">
            <button
              disabled={submitting}
              onClick={handleSubmit}
              className={[
                'w-full rounded-2xl py-3.5 text-sm font-medium text-white text-center',
                'bg-btn-gradient shadow-btn transition-all duration-200',
                'hover:shadow-btn-hover active:scale-[0.98] active:opacity-90',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              ].join(' ')}
            >
              {submitting ? '保存中…' : '✓  标记完成'}
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FieldRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 py-3 border-b border-primary-subtle/40">
      <span className="w-5 flex justify-center flex-shrink-0">{icon}</span>
      <span className="text-[11px] text-mid w-[54px] flex-shrink-0">{label}</span>
      <div className="flex items-center flex-1 gap-1">{children}</div>
    </div>
  )
}

function ChevronRight() {
  return <span className="text-mid-pale text-sm ml-auto flex-shrink-0">›</span>
}

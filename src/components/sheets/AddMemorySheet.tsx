import { useState } from 'react'
import { Calendar, MapPin, Camera, Tag, PenLine } from 'lucide-react'
import Sheet from '@/components/ui/Sheet'
import type { MemoryTag } from '@/types'

const TAGS: { id: MemoryTag; label: string; bg: string; text: string }[] = [
  { id: 'sweet',   label: '甜蜜', bg: 'bg-[#FFF0F4]', text: 'text-[#C4607A]' },
  { id: 'moving',  label: '感动', bg: 'bg-warm-bg',   text: 'text-warm' },
  { id: 'first',   label: '第一次', bg: 'bg-primary-subtle', text: 'text-primary' },
  { id: 'travel',  label: '旅行', bg: 'bg-[#EEF4FF]', text: 'text-[#5A78C4]' },
  { id: 'daily',   label: '日常', bg: 'bg-primary-subtle', text: 'text-primary' },
  { id: 'holiday', label: '节日', bg: 'bg-warm-bg',   text: 'text-warm' },
]

interface AddMemorySheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { title: string; note: string; date: string; location: string; tag: MemoryTag }) => void
}

export default function AddMemorySheet({ open, onClose, onSubmit }: AddMemorySheetProps) {
  const [title,    setTitle]    = useState('')
  const [note,     setNote]     = useState('')
  const [location, setLocation] = useState('')
  const [selectedTag, setSelectedTag] = useState<MemoryTag>('sweet')
  const [submitting, setSubmitting]   = useState(false)

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\//g, '.')

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    onSubmit({ title, note, date: today, location, tag: selectedTag })
    setTitle(''); setNote(''); setLocation('')
    setSubmitting(false)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-[18px] pt-2 pb-1">
        <h2 className="text-[17px] font-medium text-deep mb-4">添加回忆</h2>

        {/* Title */}
        <div className="mb-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="记录这一刻的名字…"
            className="w-full text-[15px] text-deep placeholder:text-inactive bg-transparent outline-none border-b border-primary-subtle/60 pb-2 leading-relaxed"
            autoFocus
          />
        </div>

        {/* Date */}
        <FieldRow icon={<Calendar size={15} className="text-mid" />} label="日期">
          <span className="text-sm text-deep">{today}</span>
          <span className="text-mid-pale text-sm ml-auto">›</span>
        </FieldRow>

        {/* Location */}
        <FieldRow icon={<MapPin size={15} className="text-mid" />} label="地点">
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="在哪里（选填）"
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-inactive text-deep"
          />
        </FieldRow>

        {/* Tag */}
        <FieldRow icon={<Tag size={15} className="text-mid" />} label="情绪">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {TAGS.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTag(t.id)}
                className={[
                  'text-2xs px-2 py-1 rounded-lg tappable border transition-all duration-150',
                  selectedTag === t.id
                    ? [t.bg, t.text, 'border-current'].join(' ')
                    : 'bg-transparent text-mid border-mid-pale',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </FieldRow>

        {/* Photos */}
        <div className="py-3 border-b border-primary-subtle/40">
          <p className="flex items-center gap-1.5 text-2xs text-mid mb-2">
            <Camera size={13} /> 添加照片（选填）
          </p>
          <div className="flex gap-1.5">
            <button
              className="w-[52px] h-[52px] rounded-[10px] border-[1.5px] border-dashed border-mid-pale flex flex-col items-center justify-center gap-0.5 text-primary flex-shrink-0 tappable"
              aria-label="添加照片"
            >
              <span className="text-lg leading-none">+</span>
              <span className="text-[8px] text-mid">选择</span>
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="py-3">
          <p className="flex items-center gap-1.5 text-2xs text-mid mb-1.5">
            <PenLine size={13} /> 写点什么…
          </p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="记录这一刻的感受…"
            rows={3}
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
          {submitting ? '保存中…' : '✓  保存回忆'}
        </button>
      </div>
    </Sheet>
  )
}

function FieldRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-primary-subtle/40">
      <span className="w-5 flex justify-center flex-shrink-0 pt-0.5">{icon}</span>
      <span className="text-2xs text-mid w-10 flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex items-center flex-1 gap-1 flex-wrap">{children}</div>
    </div>
  )
}

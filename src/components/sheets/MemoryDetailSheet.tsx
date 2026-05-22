import { MapPin, Trash2 } from 'lucide-react'
import Sheet from '@/components/ui/Sheet'
import type { Memory } from '@/types'

const TAG_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  sweet:   { bg: 'bg-[#FFF0F4]', text: 'text-[#C4607A]', label: '甜蜜' },
  moving:  { bg: 'bg-[#FFF3E8]', text: 'text-warm',       label: '感动' },
  first:   { bg: 'bg-primary-subtle', text: 'text-primary', label: '第一次' },
  travel:  { bg: 'bg-[#EEF4FF]', text: 'text-[#5A78C4]', label: '旅行' },
  daily:   { bg: 'bg-primary-subtle', text: 'text-primary', label: '日常' },
  holiday: { bg: 'bg-warm-bg',   text: 'text-warm',       label: '节日' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

interface MemoryDetailSheetProps {
  memory: Memory | null
  onClose: () => void
  onDelete: (id: string) => void
}

export default function MemoryDetailSheet({ memory, onClose, onDelete }: MemoryDetailSheetProps) {
  if (!memory) return null
  const tag = TAG_STYLES[memory.tag] ?? TAG_STYLES.daily

  const handleDelete = () => {
    onDelete(memory.id)
    onClose()
  }

  return (
    <Sheet open={!!memory} onClose={onClose}>
      <div className="px-5 py-2 pb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={['text-2xs px-2 py-0.5 rounded-full font-medium', tag.bg, tag.text].join(' ')}>
              {tag.label}
            </span>
            <span className="text-2xs text-mid-light">{formatDate(memory.date)}</span>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-2xs text-danger tappable px-2 py-1 rounded-lg bg-danger-bg"
            aria-label="删除这条记忆"
          >
            <Trash2 size={11} />
            删除
          </button>
        </div>

        {/* Photo placeholder */}
        {memory.photos && memory.photos.length > 0 && (
          <div
            className="w-full h-[140px] rounded-[14px] flex items-center justify-center text-4xl mb-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #A4C4C0, #7CB4AA)' }}
          >
            🌅
            <span className="absolute bottom-2 right-3 text-2xs text-white/90 bg-black/25 px-2 py-0.5 rounded-lg">
              📷 {memory.photos.length * 10 + 2} 张
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-[17px] font-medium text-deep leading-snug mb-2">
          {memory.title}
        </h3>

        {/* Location */}
        {memory.location && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <MapPin size={12} className="text-mid-light flex-shrink-0" />
            <span className="text-[12px] text-mid">{memory.location}</span>
          </div>
        )}

        {/* Note */}
        {memory.note && (
          <div className="bg-[#F7FAF9] rounded-[12px] px-3.5 py-3 mb-4">
            <p className="text-[13px] text-deep leading-relaxed whitespace-pre-line">
              {memory.note}
            </p>
          </div>
        )}

        {!memory.note && <div className="mb-4" />}

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full rounded-2xl py-3 text-sm font-medium text-primary bg-primary-subtle tappable"
        >
          关闭
        </button>
      </div>
    </Sheet>
  )
}

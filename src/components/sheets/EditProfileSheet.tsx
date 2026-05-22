import { useState } from 'react'
import { User, Calendar, Heart } from 'lucide-react'
import Sheet from '@/components/ui/Sheet'

export interface ProfileDraft {
  name1: string
  name2: string
  startDate: string
  spaceName: string
}

interface EditProfileSheetProps {
  open: boolean
  onClose: () => void
  initial: ProfileDraft
  onSubmit: (data: ProfileDraft) => void
}

export default function EditProfileSheet({ open, onClose, initial, onSubmit }: EditProfileSheetProps) {
  const [name1,     setName1]     = useState(initial.name1)
  const [name2,     setName2]     = useState(initial.name2)
  const [startDate, setStartDate] = useState(initial.startDate)
  const [spaceName, setSpaceName] = useState(initial.spaceName)
  const [saving,    setSaving]    = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    onSubmit({ name1, name2, startDate, spaceName })
    setSaving(false)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-5 py-2 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-medium text-deep">编辑档案</h2>
          <button onClick={onClose} className="text-[13px] text-mid tappable">取消</button>
        </div>

        {/* Fields */}
        <div className="bg-[#F7FAF9] rounded-[16px] overflow-hidden mb-4">
          {/* Name 1 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-subtle/40">
            <User size={15} className="text-mid flex-shrink-0" />
            <span className="text-2xs text-mid w-12 flex-shrink-0">TA 的名字</span>
            <input
              type="text"
              value={name1}
              onChange={e => setName1(e.target.value)}
              placeholder="言言"
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
            />
          </div>

          {/* Name 2 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-subtle/40">
            <User size={15} className="text-primary flex-shrink-0" />
            <span className="text-2xs text-mid w-12 flex-shrink-0">我的名字</span>
            <input
              type="text"
              value={name2}
              onChange={e => setName2(e.target.value)}
              placeholder="羊羊"
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
            />
          </div>

          {/* Start date */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-subtle/40">
            <Calendar size={15} className="text-mid flex-shrink-0" />
            <span className="text-2xs text-mid w-12 flex-shrink-0">在一起</span>
            <input
              type="text"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              placeholder="2023.05.12"
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
            />
            <span className="text-mid-pale text-sm">›</span>
          </div>

          {/* Space name */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Heart size={15} className="text-warm flex-shrink-0" />
            <span className="text-2xs text-mid w-12 flex-shrink-0">空间名</span>
            <input
              type="text"
              value={spaceName}
              onChange={e => setSpaceName(e.target.value)}
              placeholder="言言羊羊"
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
            />
          </div>
        </div>

        {/* Hint */}
        <p className="text-2xs text-mid-light text-center mb-4">
          修改后两人均可看到新信息
        </p>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!name1.trim() || !name2.trim() || saving}
          className={[
            'w-full rounded-2xl py-3.5 text-sm font-medium text-white',
            'bg-btn-gradient shadow-btn transition-all duration-200',
            'active:scale-[0.98] active:opacity-90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {saving ? '保存中…' : '✓  保存'}
        </button>
      </div>
    </Sheet>
  )
}

import { useEffect, useState } from 'react'
import { Pencil, Trash2, AlertTriangle } from 'lucide-react'
import Sheet from '@/components/ui/Sheet'

interface ActionMenuSheetProps {
  open: boolean
  onClose: () => void
  title: string
  onEdit: () => void
  onDelete: () => void
}

export default function ActionMenuSheet({
  open, onClose, title, onEdit, onDelete,
}: ActionMenuSheetProps) {
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!open) setConfirming(false)
  }, [open])

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-4 pb-4">
        {!confirming ? (
          <>
            {/* Title */}
            <p className="text-center text-2xs text-mid mb-3 px-2 leading-relaxed">{title}</p>

            {/* Action group */}
            <div className="bg-[#F7FAF9] rounded-[16px] overflow-hidden mb-2.5">
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 tappable text-left"
                onClick={() => { onEdit(); onClose() }}
              >
                <Pencil size={16} className="text-primary" strokeWidth={1.75} />
                <span className="text-[15px] text-deep">编辑纪念日</span>
              </button>
              <div className="h-px bg-primary-subtle/60 mx-4" />
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 tappable text-left"
                onClick={() => setConfirming(true)}
              >
                <Trash2 size={16} className="text-danger" strokeWidth={1.75} />
                <span className="text-[15px] text-danger">删除</span>
              </button>
            </div>

            {/* Cancel */}
            <button
              className="w-full rounded-[16px] py-3.5 text-[15px] font-medium text-mid bg-[#F7FAF9] tappable"
              onClick={onClose}
            >
              取消
            </button>
          </>
        ) : (
          <>
            {/* Delete confirmation */}
            <div className="flex flex-col items-center py-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-danger-bg flex items-center justify-center mb-3">
                <AlertTriangle size={22} className="text-danger" strokeWidth={1.75} />
              </div>
              <p className="text-[16px] font-medium text-deep mb-1">确认删除？</p>
              <p className="text-[12px] text-mid text-center leading-relaxed">
                删除后将无法恢复，<br />该纪念日的所有记录将清空。
              </p>
            </div>

            <button
              className="w-full rounded-[16px] py-3.5 text-[15px] font-medium text-white bg-danger shadow-sm tappable mb-2.5"
              onClick={() => { onDelete(); onClose() }}
            >
              确认删除
            </button>
            <button
              className="w-full rounded-[16px] py-3.5 text-[15px] text-mid bg-[#F7FAF9] tappable"
              onClick={() => setConfirming(false)}
            >
              取消
            </button>
          </>
        )}
      </div>
    </Sheet>
  )
}

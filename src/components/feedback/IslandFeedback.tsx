import { Button, Icon as AnimalIcon, Modal } from 'animal-island-ui'
import { AlertTriangle, Check, CloudOff, Loader2, Sprout } from 'lucide-react'
import type { ToastState } from '@/types/love'

interface StateBlockProps {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'soft' | 'danger' | 'offline'
}

export function IslandStateBlock({ title, message, actionLabel, onAction, tone = 'soft' }: StateBlockProps) {
  const Icon = tone === 'danger' ? AlertTriangle : tone === 'offline' ? CloudOff : Sprout

  return (
    <div className="section">
      <div className="state-card text-center">
        <div className="state-illustration">
          <AnimalIcon name={tone === 'offline' ? 'icon-map' : tone === 'danger' ? 'icon-miles' : 'icon-diy'} size={46} bounce />
        </div>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f9f6] text-[#0f8178]">
          <Icon size={30} strokeWidth={2.2} />
        </div>
        <h2 className="m-0 text-[22px] font-black text-[#725d42]">{title}</h2>
        <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-6 text-[#9f927d]">{message}</p>
        {actionLabel && onAction ? (
          <div className="mt-5">
            <Button type="primary" onClick={onAction}>{actionLabel}</Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function LoadingScreen() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div>
        <Loader2 className="mx-auto animate-spin text-[#19c8b9]" size={34} />
        <p className="mt-4 text-sm font-black text-[#725d42]">小岛正在同步你们的回忆...</p>
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ open, title, message, confirmText = '确认', danger, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={(
        <div className="flex justify-end gap-3">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" danger={danger} onClick={onConfirm}>{confirmText}</Button>
        </div>
      )}
      typewriter={false}
    >
      <p className="m-0 text-[14px] leading-7 text-[#725d42]">{message}</p>
    </Modal>
  )
}

export function ToastBubble({ toast }: { toast: ToastState | null }) {
  if (!toast) return null

  const isError = toast.kind === 'error'

  return (
    <div className="pointer-events-none absolute left-1/2 top-[74px] z-50 w-[calc(100%-48px)] -translate-x-1/2">
      <div className={[
        'mx-auto flex max-w-[320px] items-center gap-2 rounded-[999px] border-2 px-4 py-3 text-[13px] font-black shadow-lg',
        isError
          ? 'border-[#f0b0a8] bg-[#fff2ef] text-[#c94444]'
          : 'border-[#bce9df] bg-[#ecfbf8] text-[#0f8178]',
      ].join(' ')}
      >
        {isError ? <AlertTriangle size={16} /> : <Check size={16} />}
        <span>{toast.message}</span>
      </div>
    </div>
  )
}

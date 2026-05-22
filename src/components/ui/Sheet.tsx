import { useEffect, useRef } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export default function Sheet({ open, onClose, children }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Trap body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on backdrop tap
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className={[
        'absolute inset-0 z-50 flex flex-col justify-end',
        'transition-all duration-300',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      {/* Scrim */}
      <div
        className={[
          'absolute inset-0 bg-black/30 backdrop-blur-[1px]',
          'transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

      {/* Sheet panel — inert when closed prevents focus/autoFocus on hidden inputs */}
      <div
        ref={sheetRef}
        className={[
          'relative bg-surface rounded-t-[24px] shadow-[0_-4px_32px_rgba(30,80,72,0.12)]',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
        style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
        {...(!open && { inert: '' })}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-black/15" />
        </div>

        {children}
      </div>
    </div>
  )
}

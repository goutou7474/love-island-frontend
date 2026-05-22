interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export default function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={e => { e.stopPropagation(); onChange(!checked) }}
      className={[
        'relative w-[38px] h-[22px] rounded-full flex-shrink-0 p-[3px] flex items-center',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        checked ? 'bg-primary' : 'bg-mid-pale',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'block w-4 h-4 rounded-full bg-white',
          'shadow-[0_1px_3px_rgba(0,0,0,0.22)]',
          'transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-[16px]' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

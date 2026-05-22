interface AvatarProps {
  src?: string
  gradient?: [string, string]   // e.g. ['#A2C8C0', '#7CB4AA']
  name?: string
  size?: number
  className?: string
}

export default function Avatar({ src, gradient, name, size = 40, className = '' }: AvatarProps) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    ...(gradient && !src
      ? { background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }
      : {}),
  }

  return (
    <div
      className={[
        'rounded-full border-[2.5px] border-white/82 shadow-avatar overflow-hidden',
        className,
      ].join(' ')}
      style={style}
      aria-label={name ? `${name}的头像` : '头像'}
      role="img"
    >
      {src && (
        <img
          src={src}
          alt={name ?? '头像'}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  )
}

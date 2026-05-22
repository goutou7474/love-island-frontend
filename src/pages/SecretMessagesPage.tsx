import { useState } from 'react'
import { PenLine, Send } from 'lucide-react'
import Sheet from '@/components/ui/Sheet'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const TYPE_OPTS = [
  { id: 'love',    label: '💌 情书' },
  { id: 'thanks',  label: '🙏 感谢信' },
  { id: 'sorry',   label: '🫂 道歉信' },
  { id: 'wish',    label: '⭐️ 心愿' },
  { id: 'secret',  label: '🤫 秘密' },
]

const TIMING_OPTS = [
  { id: 'now',   icon: '⚡️', label: '立即发送', sub: '' },
  { id: 'date',  icon: '📅', label: '指定日期打开', sub: '选择一个特别的日子' },
  { id: 'ann',   icon: '🎊', label: '下次纪念日打开', sub: '在一起 2 周年 · 2027.05.12' },
]

const MOCK_RECEIVED = [
  {
    id: '1',
    type: '💌 情书',
    from: '羊羊',
    time: '今天 10:23',
    preview: '你把我的每个普通日子，都变成了值得庆祝的事。',
    content: '你把我的每个普通日子，都变成了值得庆祝的事。我不知道怎么用语言表达，只是想让你知道，每天醒来看到你的消息，心里都是暖的。',
    opened: true,
  },
  {
    id: '2',
    type: '🙏 感谢信',
    from: '羊羊',
    time: '3 天前',
    preview: '谢谢你那天陪我去医院，什么都没说，就一直在…',
    content: '谢谢你那天陪我去医院，什么都没说，就一直在。你不知道那对我意味着什么。',
    opened: false,
  },
  {
    id: '3',
    type: '🤫 秘密',
    from: '羊羊',
    time: '1 周前',
    preview: '（需要在 2 周年纪念日才能打开）',
    content: '',
    opened: false,
    locked: true,
    unlockHint: '在一起 2 周年 · 2027.05.12 可解锁',
  },
]

export default function SecretMessagesPage() {
  const [tab, setTab]                 = useState<'received' | 'sent'>('received')
  const [openMsg, setOpenMsg]         = useState<string | null>(null)
  const [showWrite, setShowWrite]     = useState(false)
  const [writeType, setWriteType]     = useState('love')
  const [timing, setTiming]           = useState('now')
  const [content, setContent]         = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [sent, setSent]               = useState(false)

  const handleSend = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 700))
    setSubmitting(false)
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setContent('')
      setShowWrite(false)
    }, 1200)
  }

  const msg = MOCK_RECEIVED.find(m => m.id === openMsg)

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Status bar */}
      <div
        className="flex justify-between items-center px-6 text-[11px] font-semibold text-mid"
        style={{ paddingTop: 'max(15px, env(safe-area-inset-top))' }}
      >
        <span>9:41</span>
        <span className="text-[10px] opacity-75 tracking-wide">● ● ●</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <h1 className="text-[22px] font-[300] text-deep tracking-[-0.5px]">悄悄话</h1>
        <button
          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-fab tappable"
          onClick={() => setShowWrite(true)}
          aria-label="写悄悄话"
        >
          <PenLine size={15} color="white" strokeWidth={2} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-5 mb-3 gap-4">
        {(['received', 'sent'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'text-[13px] pb-1 border-b-[2px] transition-all duration-150',
              tab === t
                ? 'text-primary border-primary font-medium'
                : 'text-inactive border-transparent',
            ].join(' ')}
          >
            {t === 'received' ? '收到的' : '发出的'}
          </button>
        ))}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-3">
        {tab === 'received' ? (
          MOCK_RECEIVED.map(m => (
            <button
              key={m.id}
              className="bg-surface rounded-[18px] shadow-card text-left tappable w-full"
              onClick={() => !m.locked && setOpenMsg(m.id)}
            >
              <div className="px-4 py-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-primary bg-primary-subtle px-2 py-0.5 rounded-full">
                    {m.type}
                  </span>
                  {!m.opened && !m.locked && (
                    <span className="text-[10px] text-warm bg-warm-bg px-1.5 py-0.5 rounded-full">未读</span>
                  )}
                  {m.locked && (
                    <span className="text-[10px] text-mid bg-primary-subtle/40 px-1.5 py-0.5 rounded-full">🔒 未解锁</span>
                  )}
                  <span className="ml-auto text-2xs text-mid-light">{m.time}</span>
                </div>
                <p className={[
                  'text-[13px] leading-relaxed line-clamp-2',
                  m.locked ? 'text-inactive italic' : 'text-deep',
                ].join(' ')}>
                  {m.locked ? m.unlockHint : m.preview}
                </p>
                {!m.locked && (
                  <p className="text-2xs text-mid-light mt-1.5">来自 {m.from} · 点击阅读全文 ›</p>
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-[40px]">💌</span>
            <p className="text-[13px] text-mid">还没有发出的悄悄话</p>
            <button
              className="text-[13px] text-primary font-medium bg-primary-subtle px-4 py-2 rounded-full tappable"
              onClick={() => setShowWrite(true)}
            >
              写第一封 →
            </button>
          </div>
        )}
      </div>

      {/* ── Message detail sheet ── */}
      <Sheet open={!!openMsg} onClose={() => setOpenMsg(null)}>
        {msg && (
          <div className="px-5 py-2 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[12px] text-primary bg-primary-subtle px-2.5 py-1 rounded-full">
                {msg.type}
              </span>
              <span className="text-2xs text-mid-light ml-auto">来自 {msg.from} · {msg.time}</span>
            </div>
            <div className="bg-[#F7FAF9] rounded-[14px] px-4 py-4 mb-4">
              <p className="text-[14px] text-deep leading-[1.9] whitespace-pre-line">
                "{msg.content}"
              </p>
            </div>
            <button
              onClick={() => setOpenMsg(null)}
              className="w-full rounded-2xl py-3 text-sm font-medium text-primary bg-primary-subtle tappable"
            >
              关闭
            </button>
          </div>
        )}
      </Sheet>

      {/* ── Write secret sheet ── */}
      <Sheet open={showWrite} onClose={() => setShowWrite(false)}>
        <div className="px-5 py-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-medium text-deep">写给 TA</h2>
            <button
              onClick={() => setShowWrite(false)}
              className="text-[13px] text-mid tappable"
            >
              取消
            </button>
          </div>

          {/* Type chips */}
          <p className="text-2xs text-mid mb-2">这封信是</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {TYPE_OPTS.map(t => (
              <button
                key={t.id}
                onClick={() => setWriteType(t.id)}
                className={[
                  'text-[12px] px-3 py-1.5 rounded-full border tappable transition-all duration-150',
                  writeType === t.id
                    ? 'bg-primary text-white border-primary'
                    : 'text-mid border-mid-pale bg-transparent',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Text area */}
          <div className="bg-[#F7FAF9] rounded-[14px] p-3 mb-1 relative">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value.slice(0, 500))}
              placeholder="写下想对 TA 说的话…"
              rows={5}
              className="w-full bg-transparent outline-none text-[13px] text-deep placeholder:text-inactive resize-none leading-relaxed"
            />
            <p className="text-right text-[10px] text-inactive">{content.length} / 500</p>
          </div>

          {/* Timing */}
          <p className="text-2xs text-mid mb-2">什么时候 TA 可以打开</p>
          <div className="bg-surface rounded-[14px] overflow-hidden mb-4 border border-primary-subtle/30">
            {TIMING_OPTS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setTiming(t.id)}
                className={[
                  'w-full flex items-center gap-3 px-4 py-3 tappable text-left',
                  i > 0 ? 'border-t border-primary-subtle/30' : '',
                ].join(' ')}
              >
                <div className={[
                  'w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0',
                  timing === t.id ? 'border-primary' : 'border-mid-pale',
                ].join(' ')}>
                  {timing === t.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="text-[16px] flex-shrink-0">{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-deep">{t.label}</p>
                  {t.sub && <p className="text-2xs text-mid">{t.sub}</p>}
                </div>
              </button>
            ))}
          </div>

          {/* Send button */}
          <button
            disabled={!content.trim() || submitting || sent}
            onClick={handleSend}
            className={[
              'w-full rounded-2xl py-3.5 text-sm font-medium text-white flex items-center justify-center gap-2',
              'bg-btn-gradient shadow-btn transition-all duration-200',
              'active:scale-[0.98] active:opacity-90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            {sent ? (
              '✓ 已发送'
            ) : submitting ? (
              '发送中…'
            ) : (
              <><Send size={15} strokeWidth={2} /> 发送悄悄话</>
            )}
          </button>
        </div>
      </Sheet>
    </div>
  )
}

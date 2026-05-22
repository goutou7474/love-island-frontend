import { useState } from 'react'
import { Heart, ChevronRight, Eye, EyeOff } from 'lucide-react'
import Sheet from '@/components/ui/Sheet'

type Step = 'home' | 'create' | 'join'

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [step, setStep]             = useState<Step>('home')
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin,   setShowJoin]   = useState(false)

  return (
    <div className="flex flex-col h-full bg-bg relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% -10%, #C8E4E0 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 90% 80%, #FFF3E8 0%, transparent 60%)',
        }}
      />

      {/* Status bar */}
      <div
        className="flex justify-between items-center px-6 text-[11px] font-semibold text-mid relative z-10 flex-shrink-0"
        style={{ paddingTop: 'max(15px, env(safe-area-inset-top))' }}
      >
        <span>9:41</span>
        <span className="text-[10px] opacity-75 tracking-wide">● ● ●</span>
      </div>

      {/* Hero area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 pb-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          {/* Icon cluster */}
          <div className="relative w-[100px] h-[100px]">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#DFF0EB] to-[#C8E4DF] shadow-[0_8px_30px_rgba(58,122,110,0.15)]" />
            {/* Couple emoji */}
            <div className="absolute inset-0 flex items-center justify-center text-[46px]">
              💑
            </div>
            {/* Small heart badge */}
            <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#E8F5F1] border-2 border-white shadow-sm flex items-center justify-center">
              <Heart size={12} className="text-primary" fill="#3A7A6E" />
            </div>
          </div>

          {/* App name */}
          <div className="text-center">
            <h1 className="text-[28px] font-[250] text-deep tracking-[-0.5px] leading-none mb-1">
              言言羊羊
            </h1>
            <p className="text-[12px] text-primary-muted tracking-[0.3px]">
              记录我们每一天的爱
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['📅 纪念日提醒', '📸 共同相册', '💌 专属悄悄话', '✅ 打卡清单'].map(f => (
            <span
              key={f}
              className="text-2xs text-primary/80 bg-white/60 border border-primary/10 px-2.5 py-1 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* Primary CTA */}
          <button
            className="w-full py-4 rounded-[20px] text-[15px] font-medium text-white bg-btn-gradient shadow-btn tappable flex items-center justify-center gap-2"
            onClick={() => setShowCreate(true)}
          >
            <Heart size={16} fill="white" strokeWidth={0} />
            创建情侣空间
          </button>

          {/* Secondary */}
          <button
            className="w-full py-3.5 rounded-[20px] text-[14px] font-medium text-primary bg-primary-subtle tappable flex items-center justify-center gap-1.5"
            onClick={() => setShowJoin(true)}
          >
            已有邀请码？加入 TA 的空间
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Social login */}
        <div className="mt-5 w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-mid-pale/60" />
            <span className="text-2xs text-inactive">或通过以下方式登录</span>
            <div className="flex-1 h-px bg-mid-pale/60" />
          </div>
          <div className="flex justify-center gap-4">
            {[
              { emoji: '🍎', label: 'Apple' },
              { emoji: '📱', label: '微信' },
              { emoji: '🔍', label: 'Google' },
            ].map(s => (
              <button
                key={s.label}
                className="w-12 h-12 rounded-full bg-white shadow-card flex items-center justify-center text-[20px] tappable"
                aria-label={`使用 ${s.label} 登录`}
                onClick={onLogin}
              >
                {s.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Terms */}
      <p className="text-center text-[10px] text-inactive pb-6 px-8 relative z-10 flex-shrink-0 leading-relaxed">
        登录即代表同意《服务条款》和《隐私政策》
      </p>

      {/* ── Create Space Sheet ── */}
      <CreateSpaceSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={onLogin}
      />

      {/* ── Join Sheet ── */}
      <JoinSpaceSheet
        open={showJoin}
        onClose={() => setShowJoin(false)}
        onSuccess={onLogin}
      />
    </div>
  )
}

// ─── Create Space Sheet ───────────────────────────────────────────────────────
function CreateSpaceSheet({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [myName,     setMyName]     = useState('')
  const [partName,   setPartName]   = useState('')
  const [startDate,  setStartDate]  = useState('')
  const [loading,    setLoading]    = useState(false)

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '.')

  const handleCreate = async () => {
    if (!myName.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onSuccess()
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-5 py-2 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-medium text-deep">创建情侣空间</h2>
          <button onClick={onClose} className="text-[13px] text-mid tappable">取消</button>
        </div>

        <div className="bg-[#F7FAF9] rounded-[16px] overflow-hidden mb-4">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-subtle/40">
            <span className="text-[16px] flex-shrink-0">👤</span>
            <span className="text-2xs text-mid w-14 flex-shrink-0">我的名字</span>
            <input
              type="text"
              value={myName}
              onChange={e => setMyName(e.target.value)}
              placeholder="比如：言言"
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-subtle/40">
            <span className="text-[16px] flex-shrink-0">💑</span>
            <span className="text-2xs text-mid w-14 flex-shrink-0">TA 的名字</span>
            <input
              type="text"
              value={partName}
              onChange={e => setPartName(e.target.value)}
              placeholder="比如：羊羊（可选）"
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-[16px] flex-shrink-0">💕</span>
            <span className="text-2xs text-mid w-14 flex-shrink-0">在一起</span>
            <input
              type="text"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              placeholder={today}
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
            />
            <span className="text-mid-pale text-sm">›</span>
          </div>
        </div>

        <p className="text-2xs text-mid-light text-center mb-5 leading-relaxed">
          创建后会生成一个邀请码，<br />发给 TA 即可一起使用 ♡
        </p>

        <button
          onClick={handleCreate}
          disabled={!myName.trim() || loading}
          className={[
            'w-full rounded-2xl py-3.5 text-[15px] font-medium text-white',
            'bg-btn-gradient shadow-btn tappable',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {loading ? '创建中…' : '✓  创建我们的空间'}
        </button>
      </div>
    </Sheet>
  )
}

// ─── Join Space Sheet ─────────────────────────────────────────────────────────
function JoinSpaceSheet({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [code,    setCode]    = useState('')
  const [myName,  setMyName]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  const handleJoin = async () => {
    if (!code.trim() || !myName.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onSuccess()
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-5 py-2 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-medium text-deep">加入情侣空间</h2>
          <button onClick={onClose} className="text-[13px] text-mid tappable">取消</button>
        </div>

        <div className="bg-[#F7FAF9] rounded-[16px] overflow-hidden mb-4">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-subtle/40">
            <span className="text-[16px] flex-shrink-0">🔑</span>
            <span className="text-2xs text-mid w-14 flex-shrink-0">邀请码</span>
            <input
              type={showPw ? 'text' : 'password'}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="输入 TA 的邀请码"
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
            />
            <button
              className="text-mid-pale tappable"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? '隐藏' : '显示'}
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-[16px] flex-shrink-0">👤</span>
            <span className="text-2xs text-mid w-14 flex-shrink-0">我的名字</span>
            <input
              type="text"
              value={myName}
              onChange={e => setMyName(e.target.value)}
              placeholder="比如：羊羊"
              className="flex-1 text-[13px] text-deep bg-transparent outline-none placeholder:text-inactive"
            />
          </div>
        </div>

        <button
          onClick={handleJoin}
          disabled={!code.trim() || !myName.trim() || loading}
          className={[
            'w-full rounded-2xl py-3.5 text-[15px] font-medium text-white',
            'bg-btn-gradient shadow-btn tappable',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {loading ? '加入中…' : '加入 TA 的空间 →'}
        </button>
      </div>
    </Sheet>
  )
}

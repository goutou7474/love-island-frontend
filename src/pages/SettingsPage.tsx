import { useState } from 'react'
import {
  Bell, Sparkles, MessageCircle, Palette, Moon,
  Cloud, Upload, Lock, User, LogOut, ChevronRight, Pencil,
} from 'lucide-react'
import Toggle from '@/components/ui/Toggle'
import Avatar from '@/components/ui/Avatar'
import EditProfileSheet, { type ProfileDraft } from '@/components/sheets/EditProfileSheet'
import ActionMenuSheet from '@/components/sheets/ActionMenuSheet'
import type { AppSettings } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  anniversaryReminder: true,
  dailyMessagePush: true,
  partnerActivityNotify: false,
  darkMode: false,
  appLock: true,
  theme: 'celadon',
}

export default function SettingsPage() {
  const [settings, setSettings]       = useState<AppSettings>(DEFAULT_SETTINGS)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [profile, setProfile] = useState<ProfileDraft>({
    name1: '言言',
    name2: '羊羊',
    startDate: '2023.05.12',
    spaceName: '言言羊羊',
  })

  const set = (key: keyof AppSettings, value: boolean) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Status bar */}
      <div
        className="flex justify-between items-center px-6 text-[11px] font-semibold text-mid flex-shrink-0"
        style={{ paddingTop: 'max(15px, env(safe-area-inset-top))' }}
      >
        <span>9:41</span>
        <span className="text-[10px] opacity-75 tracking-wide">● ● ●</span>
      </div>

      <h1 className="text-[22px] font-[300] text-deep tracking-[-0.5px] px-5 pt-3 pb-2 flex-shrink-0">设置</h1>

      <div className="flex-1 overflow-y-auto px-4 pb-6">

        {/* ── Profile card ── */}
        <div className="rounded-[20px] p-[18px] bg-hero-gradient noise-overlay shadow-card-hover mb-5">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="relative">
              <Avatar gradient={['#A4C4C0', '#7CB4AA']} name={profile.name1} size={52} />
              <button
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary border-[1.5px] border-white flex items-center justify-center shadow-sm tappable"
                aria-label={`更换${profile.name1}头像`}
              >
                <Pencil size={9} color="white" />
              </button>
            </div>
            <span className="text-[20px] text-warm">♡</span>
            <div className="relative">
              <Avatar gradient={['#C4D8B0', '#8CB488']} name={profile.name2} size={52} />
              <button
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary border-[1.5px] border-white flex items-center justify-center shadow-sm tappable"
                aria-label={`更换${profile.name2}头像`}
              >
                <Pencil size={9} color="white" />
              </button>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[14px] font-medium text-deep mb-0.5">
              {profile.name1} &amp; {profile.name2}
            </p>
            <p className="text-[10px] text-primary-muted mb-3">
              在一起 365 天 · {profile.startDate} 起
            </p>
            <button
              className="text-2xs text-primary bg-white/55 px-4 py-1.5 rounded-[12px] tappable"
              onClick={() => setShowEditProfile(true)}
            >
              编辑档案
            </button>
          </div>
        </div>

        {/* ── 通知 ── */}
        <SectionLabel>通知</SectionLabel>
        <div className="bg-surface rounded-2xl overflow-hidden shadow-card mb-4">
          <ToggleRow
            icon={<Bell size={15} className="text-primary" />}
            iconBg="bg-primary-subtle"
            label="纪念日提醒"
            sub="提前 3 天通知"
            checked={settings.anniversaryReminder}
            onChange={v => set('anniversaryReminder', v)}
          />
          <ToggleRow
            icon={<Sparkles size={15} className="text-primary" />}
            iconBg="bg-primary-subtle"
            label="每日情话推送"
            sub="每天早上 8:00"
            checked={settings.dailyMessagePush}
            onChange={v => set('dailyMessagePush', v)}
          />
          <ToggleRow
            icon={<MessageCircle size={15} className="text-primary" />}
            iconBg="bg-primary-subtle"
            label="对方有新记录时通知"
            checked={settings.partnerActivityNotify}
            onChange={v => set('partnerActivityNotify', v)}
            last
          />
        </div>

        {/* ── 外观 ── */}
        <SectionLabel>外观</SectionLabel>
        <div className="bg-surface rounded-2xl overflow-hidden shadow-card mb-4">
          <NavRow
            icon={<Palette size={15} className="text-primary" />}
            iconBg="bg-primary-subtle"
            label="主题色"
            sub="冷青瓷"
            right={
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_1px_4px_rgba(0,0,0,0.15)]" />
                <ChevronRight size={14} className="text-inactive" />
              </div>
            }
          />
          <ToggleRow
            icon={<Moon size={15} className="text-primary" />}
            iconBg="bg-primary-subtle"
            label="深色模式"
            checked={settings.darkMode}
            onChange={v => set('darkMode', v)}
            last
          />
        </div>

        {/* ── 数据 ── */}
        <SectionLabel>数据</SectionLabel>
        <div className="bg-surface rounded-2xl overflow-hidden shadow-card mb-4">
          <NavRow
            icon={<Cloud size={15} className="text-primary" />}
            iconBg="bg-primary-subtle"
            label="数据同步"
            sub="上次同步 2 分钟前"
            right={<span className="text-2xs text-primary bg-primary-subtle px-2 py-0.5 rounded-lg">正常</span>}
          />
          <NavRow
            icon={<Upload size={15} className="text-primary" />}
            iconBg="bg-primary-subtle"
            label="导出纪念册"
            sub="生成 PDF 保存到相册"
            right={<ChevronRight size={14} className="text-inactive" />}
            last
          />
        </div>

        {/* ── 账户与安全 ── */}
        <SectionLabel>账户与安全</SectionLabel>
        <div className="bg-surface rounded-2xl overflow-hidden shadow-card mb-4">
          <ToggleRow
            icon={<Lock size={15} className="text-primary" />}
            iconBg="bg-primary-subtle"
            label="App 锁定"
            sub="打开时 Face ID 验证"
            checked={settings.appLock}
            onChange={v => set('appLock', v)}
          />
          <NavRow
            icon={<User size={15} className="text-primary" />}
            iconBg="bg-primary-subtle"
            label="当前账号"
            sub="yanyan@gmail.com"
            right={<ChevronRight size={14} className="text-inactive" />}
          />
          <NavRow
            icon={<LogOut size={15} className="text-danger" />}
            iconBg="bg-danger-bg"
            label="退出登录"
            labelColor="text-danger"
            right={<ChevronRight size={14} className="text-danger/40" />}
            onClick={() => setShowLogoutConfirm(true)}
            last
          />
        </div>

        {/* Version */}
        <p className="text-center text-[10px] text-inactive mt-2 pb-2">
          言言羊羊 v1.0.0 · 用心记录，相伴一生 ♡
        </p>
      </div>

      {/* ── Edit Profile Sheet ── */}
      <EditProfileSheet
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        initial={profile}
        onSubmit={data => setProfile(data)}
      />

      {/* ── Logout confirm ── */}
      <ActionMenuSheet
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="确认退出登录？退出后需重新登录才能访问数据。"
        onEdit={() => {}}
        onDelete={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}

// ─── Row components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-2xs text-mid tracking-[0.8px] px-1 pb-1.5">{children}</p>
}

interface ToggleRowProps {
  icon: React.ReactNode
  iconBg?: string
  label: string
  sub?: string
  checked: boolean
  onChange: (v: boolean) => void
  last?: boolean
}
function ToggleRow({ icon, iconBg = 'bg-primary-subtle', label, sub, checked, onChange, last }: ToggleRowProps) {
  return (
    <div
      className={[
        'flex items-center px-3.5 h-[50px]',
        !last ? 'border-b border-primary-subtle/40' : '',
      ].join(' ')}
    >
      <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 mr-2.5 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] text-deep leading-none">{label}</p>
        {sub && <p className="text-2xs text-mid-light mt-0.5">{sub}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  )
}

interface NavRowProps {
  icon: React.ReactNode
  iconBg?: string
  label: string
  labelColor?: string
  sub?: string
  right: React.ReactNode
  onClick?: () => void
  last?: boolean
}
function NavRow({ icon, iconBg = 'bg-primary-subtle', label, labelColor = 'text-deep', sub, right, onClick, last }: NavRowProps) {
  return (
    <button
      className={[
        'w-full flex items-center px-3.5 h-[50px]',
        'transition-colors duration-150 active:bg-primary-subtle/30',
        !last ? 'border-b border-primary-subtle/40' : '',
        onClick ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
      onClick={onClick}
    >
      <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 mr-2.5 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`text-[12.5px] leading-none ${labelColor}`}>{label}</p>
        {sub && <p className="text-2xs text-mid-light mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center flex-shrink-0 ml-2">{right}</div>
    </button>
  )
}

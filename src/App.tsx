import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Button, Card, Cursor, Divider, Icon, Modal, Switch, Tabs } from 'animal-island-ui'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  ArrowLeftRightIcon,
  BirthdayCakeIcon,
  CakeSliceIcon,
  CalendarLove02Icon,
  DiamondIcon,
  InLoveIcon,
  WeddingIcon,
} from '@hugeicons/core-free-icons'
import {
  BarChart3,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Gift,
  Heart,
  Home,
  ImagePlus,
  KeyRound,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  Plus,
  RotateCcw,
  Settings,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  WifiOff,
} from 'lucide-react'
import { ConfirmDialog, IslandStateBlock, LoadingScreen, ToastBubble } from '@/components/feedback/IslandFeedback'
import { backendApi, type BackendAnniversary, type BackendCheckinCompletion, type BackendMemory, type BackendSecretMessage, type BackendUser, type BackendWish } from '@/services/backendApi'
import { mockLoveAppApi, type LoveAppSnapshot } from '@/services/loveApi'
import type {
  Anniversary,
  AppSettings,
  AppView,
  ChecklistCategory,
  ChecklistItem,
  MainTab,
  Memory,
  SecretMessage,
  ToastState,
  Wish,
  WishCategory,
} from '@/types/love'

type Dialog =
  | 'createSpace'
  | 'joinSpace'
  | 'invite'
  | 'addChecklist'
  | 'checkin'
  | 'addMemory'
  | 'memoryDetail'
  | 'addAnniversary'
  | 'addWish'
  | 'completeWish'
  | 'writeSecret'
  | 'editProfile'
  | 'avatar'
  | 'annualReport'
  | null

type ConfirmDeleteTarget =
  | { kind: 'memory' | 'wish' | 'anniversary' | 'checklistItem' | 'checkinCompletion'; id: string }
  | null

const tabItems: Array<{ id: MainTab; label: string; icon: typeof Home }> = [
  { id: 'home', label: '小屋', icon: Home },
  { id: 'checklist', label: '打卡', icon: ListChecks },
  { id: 'timeline', label: '拾光', icon: Sparkles },
  { id: 'anniversary', label: '纪念日', icon: CalendarDays },
  { id: 'wishlist', label: '心愿', icon: Star },
]

const wishCategoryLabels: Record<WishCategory, string> = {
  place: '想去',
  food: '想吃',
  activity: '想做',
  gift: '想买',
  learn: '想学',
}

const today = '2026-05-22'
const mobileModalWidth = 'min(360px, calc(100vw - 32px))'
const authTokenKey = 'love-island-auth-token'
const hiddenChecklistItemsKey = 'love-island-hidden-checklist-items'
const backendColorMap: Record<string, string> = {
  rose: '#ee8c7c',
  pink: '#f49aaa',
  blue: '#8297f4',
  mint: '#82d5bb',
}

const dayDiff = (from: string, to = today) => {
  const start = new Date(from).getTime()
  const end = new Date(to).getTime()
  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1)
}

function nextAnnualDays(date: string) {
  const now = new Date(today)
  const base = new Date(date)
  const next = new Date(now.getFullYear(), base.getMonth(), base.getDate())
  if (next.getTime() < now.getTime()) next.setFullYear(now.getFullYear() + 1)
  return Math.ceil((next.getTime() - now.getTime()) / 86_400_000)
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

function mapBackendAnniversary(item: BackendAnniversary): Anniversary {
  return {
    id: item.id,
    name: item.name,
    date: item.date,
    repeat: item.repeat,
    icon: item.icon,
    color: backendColorMap[item.color] ?? item.color,
    isMain: item.isMain,
    kind: item.kind === 'proposal' || item.kind === 'engagement' ? 'custom' : item.kind,
    lunarDate: item.lunarDate ?? undefined,
    owner: item.owner === 'partner' ? 'yangyang' : item.owner === 'owner' ? 'yanyan' : 'both',
  }
}

function mapBackendMemory(item: BackendMemory): Memory {
  return {
    id: item.id,
    title: item.title,
    date: item.date,
    location: item.location,
    mood: item.mood,
    note: item.note,
    photos: item.photos,
  }
}

function mapBackendWish(item: BackendWish): Wish {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    priority: item.priority,
    note: item.note,
    addedBy: item.addedByUserId,
    completedAt: item.completedAt ?? undefined,
  }
}

function mapBackendSecret(item: BackendSecretMessage, currentUserId: string): SecretMessage {
  return {
    id: item.id,
    direction: item.fromUserId === currentUserId ? 'sent' : 'received',
    title: item.title,
    content: item.content,
    from: item.fromDisplayName,
    createdAt: formatSecretCreatedAt(item.createdAt),
    openMode: item.openMode,
    openAt: item.openAt ?? undefined,
    isOpened: Boolean(item.openedAt),
    canOpen: item.canOpen,
  }
}

function formatSecretCreatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function mergeBackendCheckinCompletions(
  categories: ChecklistCategory[],
  completions: BackendCheckinCompletion[],
): ChecklistCategory[] {
  const completionByItemId = new Map(completions.map((completion) => [completion.itemId, completion]))

  return categories.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      const completion = completionByItemId.get(item.id)
      const baseItem = resetCheckinCompletion(item)

      if (!completion) {
        return baseItem
      }

      return {
        ...baseItem,
        completedAt: completion.completedAt,
        completedBy: completion.completedByUserId,
        location: completion.location ?? undefined,
        note: completion.note ?? undefined,
      }
    }),
  }))
}

function resetCheckinCompletion(item: ChecklistItem): ChecklistItem {
  return {
    id: item.id,
    categoryId: item.categoryId,
    title: item.title,
    description: item.description,
  }
}

function readHiddenChecklistItemIds() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(hiddenChecklistItemsKey) ?? '[]') as string[])
  } catch {
    return new Set<string>()
  }
}

function writeHiddenChecklistItemIds(ids: Set<string>) {
  window.localStorage.setItem(hiddenChecklistItemsKey, JSON.stringify(Array.from(ids)))
}

function hideChecklistItems(categories: ChecklistCategory[], hiddenIds: Set<string>): ChecklistCategory[] {
  return categories.map((category) => ({
    ...category,
    items: category.items.filter((item) => !hiddenIds.has(item.id)),
  }))
}

function removeChecklistItem(categories: ChecklistCategory[], itemId: string): ChecklistCategory[] {
  return categories.map((category) => ({
    ...category,
    items: category.items.filter((item) => item.id !== itemId),
  }))
}

function cancelChecklistCompletion(categories: ChecklistCategory[], itemId: string): ChecklistCategory[] {
  return categories.map((category) => ({
    ...category,
    items: category.items.map((item) => item.id === itemId ? resetCheckinCompletion(item) : item),
  }))
}

function confirmDeleteCopy(target: ConfirmDeleteTarget) {
  if (target?.kind === 'checkinCompletion') {
    return {
      title: '取消完成记录',
      message: '这只会撤销这一次成功打卡，打卡项还会留在清单里，适合防止误触。',
      confirmText: '确认撤销',
      danger: false,
    }
  }

  if (target?.kind === 'checklistItem') {
    return {
      title: '删除打卡项',
      message: '删除后这个打卡项会从当前清单隐藏；如果它已经完成，也会先撤销后端完成记录。',
      confirmText: '删除',
      danger: true,
    }
  }

  return {
    title: '确认删除',
    message: '删除后当前原型会立即从列表移除。',
    confirmText: '删除',
    danger: true,
  }
}

export default function App() {
  const [snapshot, setSnapshot] = useState<LoveAppSnapshot | null>(null)
  const [view, setView] = useState<AppView>('login')
  const [authChecking, setAuthChecking] = useState(true)
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null)
  const [activeTab, setActiveTab] = useState<MainTab>('home')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<ChecklistItem | null>(null)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteTarget>(null)

  const [checklistCategories, setChecklistCategories] = useState<ChecklistCategory[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [wishes, setWishes] = useState<Wish[]>([])
  const [secrets, setSecrets] = useState<SecretMessage[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)

  const [checklistForm, setChecklistForm] = useState({ categoryId: 'first', title: '' })
  const [checkinForm, setCheckinForm] = useState({ date: today, location: '', note: '' })
  const [memoryForm, setMemoryForm] = useState({ title: '', date: today, location: '', mood: 'sweet' as Memory['mood'], note: '' })
  const [anniversaryForm, setAnniversaryForm] = useState({ name: '', date: today, repeat: 'yearly' as Anniversary['repeat'], icon: '♡' })
  const [wishForm, setWishForm] = useState({ title: '', category: 'place' as WishCategory, priority: 2 as Wish['priority'], note: '' })
  const [secretForm, setSecretForm] = useState({ title: '', content: '', openMode: 'now' as SecretMessage['openMode'], openAt: '' })
  const [joinCode, setJoinCode] = useState('YY-0521')

  const showToast = (kind: ToastState['kind'], message: string) => setToast({ kind, message })

  useEffect(() => {
    let cancelled = false

    async function bootstrapApp() {
      const data = await mockLoveAppApi.getSnapshot()

      if (cancelled) return
      const visibleChecklistCategories = hideChecklistItems(data.checklistCategories, readHiddenChecklistItemIds())

      setSnapshot(data)
      setChecklistCategories(mergeBackendCheckinCompletions(visibleChecklistCategories, []))
      setMemories(data.memories)
      setAnniversaries(data.anniversaries)
      setWishes(data.wishes)
      setSecrets(data.secrets)
      setSettings(data.settings)

      const token = window.localStorage.getItem(authTokenKey)

      if (!token) {
        setAuthChecking(false)
        return
      }

      try {
        const session = await backendApi.me(token)
        const [anniversaryResult, checkinResult, memoryResult, wishResult, secretResult] = await Promise.all([
          backendApi.listAnniversaries(token),
          backendApi.listCheckinCompletions(token),
          backendApi.listMemories(token),
          backendApi.listWishes(token),
          backendApi.listSecrets(token),
        ])

        if (cancelled) return

        setCurrentUser(session.user)
        setAnniversaries(anniversaryResult.anniversaries.map(mapBackendAnniversary))
        setChecklistCategories(mergeBackendCheckinCompletions(visibleChecklistCategories, checkinResult.completions))
        if (memoryResult.memories.length > 0) {
          setMemories(memoryResult.memories.map(mapBackendMemory))
        }
        if (wishResult.wishes.length > 0) {
          setWishes(wishResult.wishes.map(mapBackendWish))
        }
        if (secretResult.secrets.length > 0) {
          setSecrets(secretResult.secrets.map((secret) => mapBackendSecret(secret, session.user.id)))
        }
        setView('home')
        setActiveTab('home')
        showToast('success', `欢迎回来，${session.user.displayName}`)
      } catch {
        window.localStorage.removeItem(authTokenKey)
        setCurrentUser(null)
      } finally {
        if (!cancelled) {
          setAuthChecking(false)
        }
      }
    }

    void bootstrapApp()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const couple = snapshot?.couple
  const stats = snapshot?.stats
  const completedCount = useMemo(
    () => checklistCategories.flatMap((category) => category.items).filter((item) => item.completedAt).length,
    [checklistCategories],
  )
  const totalChecklist = useMemo(
    () => checklistCategories.reduce((sum, category) => sum + category.items.length, 0),
    [checklistCategories],
  )
  const nextAnniversary = useMemo(
    () => anniversaries.map((item) => ({ ...item, days: item.repeat === 'yearly' ? nextAnnualDays(item.date) : dayDiff(today, item.date) })).sort((a, b) => a.days - b.days)[0],
    [anniversaries],
  )

  if (!snapshot || !settings || !couple || !stats || authChecking) {
    return (
      <div className="island-stage">
        <div className="phone-frame">
          <div className="phone-screen">
            <LoadingScreen />
          </div>
        </div>
      </div>
    )
  }

  const loadBackendAnniversaries = async (token: string) => {
    const result = await backendApi.listAnniversaries(token)
    setAnniversaries(result.anniversaries.map(mapBackendAnniversary))
  }

  const loadBackendCheckins = async (token: string) => {
    const result = await backendApi.listCheckinCompletions(token)
    setChecklistCategories((current) => mergeBackendCheckinCompletions(current, result.completions))
  }

  const loadBackendMemories = async (token: string) => {
    const result = await backendApi.listMemories(token)
    if (result.memories.length > 0) {
      setMemories(result.memories.map(mapBackendMemory))
    }
  }

  const loadBackendWishes = async (token: string) => {
    const result = await backendApi.listWishes(token)
    if (result.wishes.length > 0) {
      setWishes(result.wishes.map(mapBackendWish))
    }
  }

  const loadBackendSecrets = async (token: string, currentUserId: string) => {
    const result = await backendApi.listSecrets(token)
    if (result.secrets.length > 0) {
      setSecrets(result.secrets.map((secret) => mapBackendSecret(secret, currentUserId)))
    }
  }

  const openMainTab = (tab: MainTab) => {
    setActiveTab(tab)
    setView(tab)
  }

  const runSaving = async (task: () => Promise<void>, success: string) => {
    try {
      setSaving(true)
      await task()
      showToast('success', success)
      setDialog(null)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '操作失败，请稍后再试')
    } finally {
      setSaving(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthSubmitting(true)
      const login = await backendApi.login(email, password)
      window.localStorage.setItem(authTokenKey, login.token)
      const session = await backendApi.me(login.token)
      setCurrentUser(session.user)
      await Promise.all([
        loadBackendAnniversaries(login.token),
        loadBackendCheckins(login.token),
        loadBackendMemories(login.token),
        loadBackendWishes(login.token),
        loadBackendSecrets(login.token, session.user.id),
      ])
      setView('home')
      setActiveTab('home')
      showToast('success', `欢迎回来，${session.user.displayName}`)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '登录失败，请检查账号密码')
      throw error
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem(authTokenKey)
    setCurrentUser(null)
    setView('login')
    setActiveTab('home')
    showToast('info', '已经退出小岛')
  }

  const submitJoin = (event: FormEvent) => {
    event.preventDefault()
    runSaving(async () => {
      await mockLoveAppApi.joinSpace(joinCode)
      setView('home')
      setActiveTab('home')
    }, '加入成功，空间已经同步')
  }

  const submitChecklist = (event: FormEvent) => {
    event.preventDefault()
    if (!checklistForm.title.trim()) {
      showToast('error', '请写一个打卡标题')
      return
    }
    runSaving(async () => {
      await mockLoveAppApi.saveChecklistItem(checklistForm)
      setChecklistCategories((current) => current.map((category) => (
        category.id === checklistForm.categoryId
          ? {
            ...category,
            items: [
              { id: makeId('c'), categoryId: category.id, title: checklistForm.title, description: '新加入的小岛任务，等后端接入后会同步给两个人' },
              ...category.items,
            ],
          }
          : category
      )))
      setChecklistForm({ categoryId: checklistCategories[0]?.id ?? 'first', title: '' })
    }, '新的打卡项已经放进清单')
  }

  const submitCheckin = (event: FormEvent) => {
    event.preventDefault()
    if (!selectedChecklistItem) return
    runSaving(async () => {
      const token = window.localStorage.getItem(authTokenKey)
      if (!token) {
        throw new Error('请先登录后再完成打卡')
      }

      const result = await backendApi.upsertCheckinCompletion(token, selectedChecklistItem.id, {
        categoryId: selectedChecklistItem.categoryId,
        title: selectedChecklistItem.title,
        completedAt: checkinForm.date,
        location: checkinForm.location.trim() || null,
        note: checkinForm.note.trim() || null,
      })
      setChecklistCategories((current) => current.map((category) => ({
        ...category,
        items: category.items.map((item) => item.id === selectedChecklistItem.id
          ? {
            ...item,
            completedAt: result.completion.completedAt,
            completedBy: result.completion.completedByUserId,
            location: result.completion.location ?? undefined,
            note: result.completion.note ?? undefined,
          }
          : item),
      })))
    }, '打卡完成，今天又多了一点可爱')
  }

  const deleteChecklistItem = async (itemId: string) => {
    const target = checklistCategories.flatMap((category) => category.items).find((item) => item.id === itemId)
    const token = window.localStorage.getItem(authTokenKey)

    if (target?.completedAt && token) {
      await backendApi.deleteCheckinCompletion(token, itemId)
    }

    const hiddenIds = readHiddenChecklistItemIds()
    hiddenIds.add(itemId)
    writeHiddenChecklistItemIds(hiddenIds)
    setChecklistCategories((current) => removeChecklistItem(current, itemId))
  }

  const cancelCheckinCompletion = async (itemId: string) => {
    const token = window.localStorage.getItem(authTokenKey)
    if (!token) {
      throw new Error('请先登录后再撤销打卡')
    }

    await backendApi.deleteCheckinCompletion(token, itemId)
    setChecklistCategories((current) => cancelChecklistCompletion(current, itemId))
  }

  const submitMemory = (event: FormEvent) => {
    event.preventDefault()
    if (!memoryForm.title.trim()) {
      showToast('error', '请给回忆起一个名字')
      return
    }
    runSaving(async () => {
      const token = window.localStorage.getItem(authTokenKey)
      if (!token) {
        throw new Error('请先登录后再保存拾光')
      }

      const result = await backendApi.createMemory(token, {
        ...memoryForm,
        photos: [],
      })
      setMemories((current) => [mapBackendMemory(result.memory), ...current])
      setMemoryForm({ title: '', date: today, location: '', mood: 'sweet', note: '' })
    }, '回忆已经存进拾光册')
  }

  const submitAnniversary = (event: FormEvent) => {
    event.preventDefault()
    if (!anniversaryForm.name.trim()) {
      showToast('error', '请写纪念日名称')
      return
    }
    runSaving(async () => {
      const token = window.localStorage.getItem(authTokenKey)
      if (!token) {
        throw new Error('请先登录后再记录纪念日')
      }

      const result = await backendApi.createAnniversary(token, {
        ...anniversaryForm,
        calendar: 'solar',
        kind: 'custom',
        owner: 'both',
        color: 'mint',
        isMain: false,
        note: null,
      })
      setAnniversaries((current) => [mapBackendAnniversary(result.anniversary), ...current])
      setAnniversaryForm({ name: '', date: today, repeat: 'yearly', icon: '♡' })
    }, '纪念日已经记好')
  }

  const submitWish = (event: FormEvent) => {
    event.preventDefault()
    if (!wishForm.title.trim()) {
      showToast('error', '请写一个心愿')
      return
    }
    runSaving(async () => {
      const token = window.localStorage.getItem(authTokenKey)
      if (!token) {
        throw new Error('请先登录后再保存心愿')
      }

      const result = await backendApi.createWish(token, wishForm)
      setWishes((current) => [mapBackendWish(result.wish), ...current])
      setWishForm({ title: '', category: 'place', priority: 2, note: '' })
    }, '心愿已经挂到小岛树上')
  }

  const submitSecret = (event: FormEvent) => {
    event.preventDefault()
    if (!secretForm.content.trim()) {
      showToast('error', '悄悄话不能为空')
      return
    }
    if (secretForm.openMode === 'date' && !secretForm.openAt) {
      showToast('error', '请选择打开日期')
      return
    }
    runSaving(async () => {
      const token = window.localStorage.getItem(authTokenKey)
      if (!token || !currentUser) {
        throw new Error('请先登录后再寄出悄悄话')
      }

      const result = await backendApi.sendSecret(token, {
        title: secretForm.title,
        content: secretForm.content,
        openMode: secretForm.openMode,
        openAt: secretForm.openMode === 'date' ? secretForm.openAt : null,
      })
      setSecrets((current) => [mapBackendSecret(result.secret, currentUser.id), ...current])
      setSecretForm({ title: '', content: '', openMode: 'now', openAt: '' })
    }, '悄悄话已经寄出')
  }

  const openSecret = (message: SecretMessage) => {
    runSaving(async () => {
      const token = window.localStorage.getItem(authTokenKey)
      if (!token || !currentUser) {
        throw new Error('请先登录后再打开悄悄话')
      }

      const result = await backendApi.openSecret(token, message.id)
      setSecrets((current) => current.map((secret) => (
        secret.id === message.id ? mapBackendSecret(result.secret, currentUser.id) : secret
      )))
    }, '悄悄话已经打开')
  }

  const completeWish = () => {
    if (!selectedWish) return
    runSaving(async () => {
      const token = window.localStorage.getItem(authTokenKey)
      if (!token) {
        throw new Error('请先登录后再完成心愿')
      }

      const result = await backendApi.completeWish(token, selectedWish.id, { completedAt: today })
      setWishes((current) => current.map((wish) => wish.id === selectedWish.id ? mapBackendWish(result.wish) : wish))
      setSelectedWish(null)
    }, '这个心愿达成啦')
  }

  const toggleSetting = (key: keyof AppSettings, value: boolean) => {
    setSettings((current) => current ? { ...current, [key]: value } : current)
    mockLoveAppApi.updateSettings({ [key]: value }).then(() => showToast('success', '设置已保存'))
  }

  const deleteSelected = () => {
    if (!confirmDelete) return
    if (confirmDelete.kind === 'checklistItem') {
      runSaving(async () => {
        await deleteChecklistItem(confirmDelete.id)
        setConfirmDelete(null)
      }, '打卡项已经移除')
      return
    }
    if (confirmDelete.kind === 'checkinCompletion') {
      runSaving(async () => {
        await cancelCheckinCompletion(confirmDelete.id)
        setConfirmDelete(null)
      }, '已取消这次完成记录')
      return
    }
    if (confirmDelete.kind === 'memory') {
      runSaving(async () => {
        const token = window.localStorage.getItem(authTokenKey)
        if (!token) {
          throw new Error('请先登录后再删除拾光')
        }

        await backendApi.deleteMemory(token, confirmDelete.id)
        setMemories((current) => current.filter((item) => item.id !== confirmDelete.id))
        setConfirmDelete(null)
        setSelectedMemory(null)
      }, '拾光已经删除')
      return
    }
    if (confirmDelete.kind === 'wish') {
      runSaving(async () => {
        const token = window.localStorage.getItem(authTokenKey)
        if (!token) {
          throw new Error('请先登录后再删除心愿')
        }

        await backendApi.deleteWish(token, confirmDelete.id)
        setWishes((current) => current.filter((item) => item.id !== confirmDelete.id))
        setConfirmDelete(null)
        setSelectedWish(null)
      }, '心愿已经删除')
      return
    }
    if (confirmDelete.kind === 'anniversary') setAnniversaries((current) => current.filter((item) => item.id !== confirmDelete.id))
    setConfirmDelete(null)
    showToast('success', '已经删除')
  }

  const renderMainView = () => {
    if (view === 'login') {
      return <LoginPage loading={authSubmitting} onLogin={handleLogin} />
    }
    if (view === 'invite') return <InvitePage inviteCode={couple.inviteCode} onBack={() => setView('settings')} />
    if (view === 'secrets') return <SecretsPage secrets={secrets} onBack={() => setView('home')} onWrite={() => setDialog('writeSecret')} onOpen={openSecret} />
    if (view === 'stats') return <StatsPage stats={stats} onBack={() => setView('home')} onReport={() => setDialog('annualReport')} />
    if (view === 'settings') {
      return (
        <SettingsPage
          settings={settings}
          couple={couple}
          onBack={() => setView('home')}
          onToggle={toggleSetting}
          onInvite={() => setDialog('invite')}
          onEditProfile={() => setDialog('editProfile')}
          onAvatar={() => setDialog('avatar')}
          onShowState={setView}
          onLogout={handleLogout}
        />
      )
    }
    if (view === 'offline') {
      return <UtilityPage tone="offline" title="暂时离线" message="网络回来后，小岛会继续同步照片、打卡和悄悄话。" onBack={() => setView('settings')} />
    }
    if (view === 'forbidden') {
      return <UtilityPage tone="danger" title="没有权限" message="这个空间需要正确的邀请码或登录身份。" onBack={() => setView('settings')} />
    }
    if (view === 'notFound') {
      return <UtilityPage title="这条小路还没修好" message="页面不存在，可能是链接过期或后端路由尚未接入。" onBack={() => setView('settings')} />
    }

    if (activeTab === 'checklist') {
      return (
        <ChecklistPage
          categories={checklistCategories}
          completedCount={completedCount}
          total={totalChecklist}
          onAdd={() => setDialog('addChecklist')}
          onCancelCheckin={(item) => setConfirmDelete({ kind: 'checkinCompletion', id: item.id })}
          onCheckin={(item) => {
            setSelectedChecklistItem(item)
            setCheckinForm({ date: today, location: item.location ?? '', note: item.note ?? '' })
            setDialog('checkin')
          }}
          onDelete={(item) => setConfirmDelete({ kind: 'checklistItem', id: item.id })}
        />
      )
    }
    if (activeTab === 'timeline') {
      return (
        <TimelinePage
          memories={memories}
          onAdd={() => setDialog('addMemory')}
          onOpen={(memory) => {
            setSelectedMemory(memory)
            setDialog('memoryDetail')
          }}
        />
      )
    }
    if (activeTab === 'anniversary') {
      return (
        <AnniversaryPage
          anniversaries={anniversaries}
          onAdd={() => setDialog('addAnniversary')}
          onDelete={(id) => setConfirmDelete({ kind: 'anniversary', id })}
        />
      )
    }
    if (activeTab === 'wishlist') {
      return (
        <WishlistPage
          wishes={wishes}
          onAdd={() => setDialog('addWish')}
          onComplete={(wish) => {
            setSelectedWish(wish)
            setDialog('completeWish')
          }}
          onDelete={(id) => setConfirmDelete({ kind: 'wish', id })}
        />
      )
    }

    return (
      <HomePage
        snapshot={snapshot}
        checklistDone={completedCount}
        checklistTotal={totalChecklist}
        nextAnniversary={nextAnniversary}
        onNavigate={openMainTab}
        onExtra={setView}
        onWriteSecret={() => setDialog('writeSecret')}
      />
    )
  }

  const mainNavVisible = view !== 'login'

  return (
    <Cursor>
      <div className="island-stage">
        <div className="phone-frame">
          <div className="phone-screen">
            <ToastBubble toast={toast} />
            {renderMainView()}
            {mainNavVisible ? <BottomNav active={activeTab} onChange={openMainTab} /> : null}
          </div>
        </div>
      </div>

      <Modal open={dialog === 'createSpace'} title="创建你们的小岛" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <form className="form-stack" onSubmit={(event) => {
          event.preventDefault()
          runSaving(async () => {
            await mockLoveAppApi.createSpace({ name: '言言', partnerName: '羊羊', startDate: couple.startDate })
            setView('home')
          }, '情侣空间创建成功')
        }}
        >
          <Field label="你的昵称"><input className="plain-input" defaultValue="言言" /></Field>
          <Field label="TA 的昵称"><input className="plain-input" defaultValue="羊羊" /></Field>
          <Field label="在一起日期"><input className="plain-input" type="date" defaultValue={couple.startDate} /></Field>
          <Button type="primary" htmlType="submit" block loading={saving}>创建小岛</Button>
        </form>
      </Modal>

      <Modal open={dialog === 'joinSpace'} title="加入情侣空间" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <form className="form-stack" onSubmit={submitJoin}>
          <Field label="邀请码"><input className="plain-input" value={joinCode} onChange={(event) => setJoinCode(event.target.value)} /></Field>
          <p className="m-0 text-[13px] leading-6 text-[#9f927d]">原型中可用邀请码：{couple.inviteCode}</p>
          <Button type="primary" htmlType="submit" block loading={saving}>加入空间</Button>
        </form>
      </Modal>

      <Modal open={dialog === 'invite'} title="邀请 TA 来小岛" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <div className="text-center">
          <div className="mx-auto mb-4 rounded-[26px] bg-[#e6f9f6] px-6 py-5 text-[30px] font-black tracking-[0.12em] text-[#0f8178]">{couple.inviteCode}</div>
          <p className="text-[13px] leading-6 text-[#9f927d]">后续接入后端时，这里会由 API 返回一次性邀请码和过期时间。</p>
          <Button type="primary" block onClick={() => showToast('success', '邀请码已复制')}>复制邀请码</Button>
        </div>
      </Modal>

      <Modal open={dialog === 'addChecklist'} title="添加打卡项" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <form className="form-stack" onSubmit={submitChecklist}>
          <Field label="打卡标题"><input className="plain-input" value={checklistForm.title} onChange={(event) => setChecklistForm({ ...checklistForm, title: event.target.value })} placeholder="例如：一起去花店买花" /></Field>
          <Field label="放进哪个分类">
            <select className="plain-select" value={checklistForm.categoryId} onChange={(event) => setChecklistForm({ ...checklistForm, categoryId: event.target.value })}>
              {checklistCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
          <Button type="primary" htmlType="submit" block loading={saving}>放进清单</Button>
        </form>
      </Modal>

      <Modal open={dialog === 'checkin'} title={selectedChecklistItem?.title ?? '完成打卡'} width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <form className="form-stack" onSubmit={submitCheckin}>
          <Field label="完成日期"><input className="plain-input" type="date" value={checkinForm.date} onChange={(event) => setCheckinForm({ ...checkinForm, date: event.target.value })} /></Field>
          <Field label="地点"><input className="plain-input" value={checkinForm.location} onChange={(event) => setCheckinForm({ ...checkinForm, location: event.target.value })} placeholder="在哪里完成的" /></Field>
          <PhotoPlaceholder compact />
          <Field label="备注"><textarea className="plain-textarea" value={checkinForm.note} onChange={(event) => setCheckinForm({ ...checkinForm, note: event.target.value })} placeholder="写一点今天的小细节" /></Field>
          <Button type="primary" htmlType="submit" block loading={saving}>保存打卡</Button>
        </form>
      </Modal>

      <Modal open={dialog === 'addMemory'} title="添加拾光回忆" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <form className="form-stack" onSubmit={submitMemory}>
          <Field label="标题"><input className="plain-input" value={memoryForm.title} onChange={(event) => setMemoryForm({ ...memoryForm, title: event.target.value })} /></Field>
          <div className="grid-2">
            <Field label="日期"><input className="plain-input" type="date" value={memoryForm.date} onChange={(event) => setMemoryForm({ ...memoryForm, date: event.target.value })} /></Field>
            <Field label="心情">
              <select className="plain-select" value={memoryForm.mood} onChange={(event) => setMemoryForm({ ...memoryForm, mood: event.target.value as Memory['mood'] })}>
                <option value="sweet">甜甜的</option>
                <option value="travel">旅行</option>
                <option value="daily">日常</option>
                <option value="first">第一次</option>
                <option value="moving">感动</option>
              </select>
            </Field>
          </div>
          <Field label="地点"><input className="plain-input" value={memoryForm.location} onChange={(event) => setMemoryForm({ ...memoryForm, location: event.target.value })} /></Field>
          <PhotoPlaceholder compact />
          <Field label="正文"><textarea className="plain-textarea" value={memoryForm.note} onChange={(event) => setMemoryForm({ ...memoryForm, note: event.target.value })} /></Field>
          <Button type="primary" htmlType="submit" block loading={saving}>存进拾光册</Button>
        </form>
      </Modal>

      <Modal open={dialog === 'memoryDetail'} title={selectedMemory?.title ?? '回忆详情'} width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        {selectedMemory ? (
          <div className="form-stack">
            <p className="m-0 text-[13px] font-black text-[#9f927d]">{selectedMemory.date} · {selectedMemory.location}</p>
            <div className="rounded-[24px] bg-[#f7f3df] p-4 text-[14px] leading-7 text-[#725d42]">{selectedMemory.note}</div>
            <PhotoPlaceholder compact />
            <div className="grid-2">
              <Button onClick={() => showToast('info', '编辑表单已预留，后续接后端时复用添加表单')}>编辑</Button>
              <Button danger onClick={() => setConfirmDelete({ kind: 'memory', id: selectedMemory.id })}>删除</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={dialog === 'addAnniversary'} title="添加纪念日" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <form className="form-stack" onSubmit={submitAnniversary}>
          <Field label="名称"><input className="plain-input" value={anniversaryForm.name} onChange={(event) => setAnniversaryForm({ ...anniversaryForm, name: event.target.value })} /></Field>
          <div className="grid-2">
            <Field label="日期"><input className="plain-input" type="date" value={anniversaryForm.date} onChange={(event) => setAnniversaryForm({ ...anniversaryForm, date: event.target.value })} /></Field>
            <Field label="重复">
              <select className="plain-select" value={anniversaryForm.repeat} onChange={(event) => setAnniversaryForm({ ...anniversaryForm, repeat: event.target.value as Anniversary['repeat'] })}>
                <option value="yearly">每年</option>
                <option value="none">仅一次</option>
              </select>
            </Field>
          </div>
          <Field label="小图标"><input className="plain-input" value={anniversaryForm.icon} onChange={(event) => setAnniversaryForm({ ...anniversaryForm, icon: event.target.value })} maxLength={2} /></Field>
          <Button type="primary" htmlType="submit" block loading={saving}>记住这一天</Button>
        </form>
      </Modal>

      <Modal open={dialog === 'addWish'} title="添加心愿" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <form className="form-stack" onSubmit={submitWish}>
          <Field label="心愿"><input className="plain-input" value={wishForm.title} onChange={(event) => setWishForm({ ...wishForm, title: event.target.value })} /></Field>
          <div className="grid-2">
            <Field label="分类">
              <select className="plain-select" value={wishForm.category} onChange={(event) => setWishForm({ ...wishForm, category: event.target.value as WishCategory })}>
                {Object.entries(wishCategoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </Field>
            <Field label="优先级">
              <select className="plain-select" value={wishForm.priority} onChange={(event) => setWishForm({ ...wishForm, priority: Number(event.target.value) as Wish['priority'] })}>
                <option value={1}>轻轻期待</option>
                <option value={2}>很想实现</option>
                <option value={3}>超级想要</option>
              </select>
            </Field>
          </div>
          <Field label="备注"><textarea className="plain-textarea" value={wishForm.note} onChange={(event) => setWishForm({ ...wishForm, note: event.target.value })} /></Field>
          <Button type="primary" htmlType="submit" block loading={saving}>挂上心愿</Button>
        </form>
      </Modal>

      <Modal open={dialog === 'completeWish'} title="确认完成心愿" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <div className="form-stack">
          <p className="m-0 text-[14px] leading-7 text-[#725d42]">要把「{selectedWish?.title}」移动到已实现区域吗？后续可以在这里补完成照片和备注。</p>
          <PhotoPlaceholder compact />
          <Button type="primary" block loading={saving} onClick={completeWish}>完成啦</Button>
        </div>
      </Modal>

      <Modal open={dialog === 'writeSecret'} title="写一封悄悄话" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <form className="form-stack" onSubmit={submitSecret}>
          <Field label="标题"><input className="plain-input" value={secretForm.title} onChange={(event) => setSecretForm({ ...secretForm, title: event.target.value })} /></Field>
          <Field label="正文"><textarea className="plain-textarea" value={secretForm.content} onChange={(event) => setSecretForm({ ...secretForm, content: event.target.value })} /></Field>
          <Field label="什么时候打开">
            <select className="plain-select" value={secretForm.openMode} onChange={(event) => setSecretForm({ ...secretForm, openMode: event.target.value as SecretMessage['openMode'] })}>
              <option value="now">立即送达</option>
              <option value="date">指定日期</option>
              <option value="anniversary">下个纪念日</option>
            </select>
          </Field>
          {secretForm.openMode === 'date' ? <Field label="打开日期"><input className="plain-input" type="date" value={secretForm.openAt} onChange={(event) => setSecretForm({ ...secretForm, openAt: event.target.value })} /></Field> : null}
          <Button type="primary" htmlType="submit" block loading={saving}>寄出悄悄话</Button>
        </form>
      </Modal>

      <Modal open={dialog === 'editProfile'} title="编辑情侣档案" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <form className="form-stack" onSubmit={(event) => {
          event.preventDefault()
          showToast('success', '档案保存入口已接好')
          setDialog(null)
        }}
        >
          <Field label="空间名"><input className="plain-input" defaultValue={couple.spaceName} /></Field>
          <div className="grid-2">
            <Field label="你"><input className="plain-input" defaultValue={couple.users[0].name} /></Field>
            <Field label="TA"><input className="plain-input" defaultValue={couple.users[1].name} /></Field>
          </div>
          <Field label="在一起日期"><input className="plain-input" type="date" defaultValue={couple.startDate} /></Field>
          <Button type="primary" htmlType="submit" block>保存档案</Button>
        </form>
      </Modal>

      <Modal open={dialog === 'avatar'} title="更换头像" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <div className="form-stack">
          <PhotoPlaceholder compact label="选择头像图片" />
          <p className="m-0 text-[13px] leading-6 text-[#9f927d]">当前原型保留上传入口。接入后端时会上传 Firebase Storage，并把 URL 写入用户档案。</p>
          <Button type="primary" block onClick={() => {
            showToast('success', '头像上传入口已预留')
            setDialog(null)
          }}
          >
            保存头像
          </Button>
        </div>
      </Modal>

      <Modal open={dialog === 'annualReport'} title="年度爱情报告" width={mobileModalWidth} onClose={() => setDialog(null)} typewriter={false} footer={null}>
        <div className="form-stack">
          <div className="soft-card p-4">
            <p className="m-0 text-[13px] leading-7 text-[#725d42]">今年你们完成了 {stats.checklistDone} 个打卡，留下 {stats.memoriesCount} 条回忆，实现 {stats.wishesDone} 个心愿。正式版会由后端聚合生成可分享报告。</p>
          </div>
          <Button type="primary" block onClick={() => showToast('info', '报告页面会在后续版本展开')}>知道啦</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={confirmDeleteCopy(confirmDelete).title}
        message={confirmDeleteCopy(confirmDelete).message}
        confirmText={confirmDeleteCopy(confirmDelete).confirmText}
        danger={confirmDeleteCopy(confirmDelete).danger}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={deleteSelected}
      />
    </Cursor>
  )
}

function LoginPage({
  loading,
  onLogin,
}: {
  loading: boolean
  onLogin: (email: string, password: string) => Promise<void>
}) {
  const [email, setEmail] = useState('owner@example.com')
  const [password, setPassword] = useState('owner-password-123')
  const [error, setError] = useState('')

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    try {
      await onLogin(email, password)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '登录失败，请检查账号密码')
    }
  }

  const fillAccount = (nextEmail: string, nextPassword: string) => {
    setEmail(nextEmail)
    setPassword(nextPassword)
    setError('')
  }

  return (
    <div className="screen-scroll">
      <StatusBar />
      <div className="px-6 pt-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[34px] border border-[#d7ece7] bg-[#eaf9f5] text-[#0f8178] shadow-[0_16px_35px_rgba(101,85,61,0.14)]">
          <div className="relative">
            <Heart size={42} fill="currentColor" />
            <span className="absolute -right-3 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#fff8df] text-[13px] shadow-sm">钥</span>
          </div>
        </div>
        <p className="mt-5 text-[12px] font-black uppercase tracking-[0.16em] text-[#9f927d]">Private Island</p>
        <h1 className="mt-2 text-[31px] font-black leading-tight text-[#725d42]">回到你们的小岛</h1>
        <p className="mx-auto mt-3 max-w-[286px] text-[14px] leading-7 text-[#9f927d]">这里只给两个人用。输入预置账号后，天气、纪念日和小愿望才会亮起来。</p>
      </div>

      <form className="section mt-5 grid gap-3" onSubmit={submitLogin}>
        <div className="login-panel">
          <Field label="邮箱">
            <div className="login-input-row">
              <Mail size={17} />
              <input
                className="login-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="owner@example.com"
              />
            </div>
          </Field>
          <Field label="密码">
            <div className="login-input-row">
              <Lock size={17} />
              <input
                className="login-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="输入预置密码"
              />
            </div>
          </Field>
          {error ? <p className="login-error" role="alert">{error}</p> : null}
        </div>

        <Button type="primary" size="large" block htmlType="submit" loading={loading}>登录小岛</Button>
      </form>

      <div className="section mt-3">
        <div className="login-account-switch">
          <button type="button" onClick={() => fillAccount('owner@example.com', 'owner-password-123')}>
            <span>言言账号</span>
            <small>owner@example.com</small>
          </button>
          <button type="button" onClick={() => fillAccount('partner@example.com', 'partner-password-123')}>
            <span>羊羊账号</span>
            <small>partner@example.com</small>
          </button>
        </div>
      </div>

      <div className="section">
        <Card type="dashed">
          <div className="flex items-center gap-3">
            <ShieldAlert className="shrink-0 text-[#19c8b9]" size={22} />
            <p className="m-0 text-[12px] leading-5 text-[#725d42]">公开注册已经关闭。正式部署时账号会由服务器初始化脚本创建。</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function HomePage({
  snapshot,
  checklistDone,
  checklistTotal,
  nextAnniversary,
  onNavigate,
  onExtra,
  onWriteSecret,
}: {
  snapshot: LoveAppSnapshot
  checklistDone: number
  checklistTotal: number
  nextAnniversary?: Anniversary & { days: number }
  onNavigate: (tab: MainTab) => void
  onExtra: (view: AppView) => void
  onWriteSecret: () => void
}) {
  const days = dayDiff(snapshot.couple.startDate)
  const latestSecret = snapshot.secrets[0]
  const progress = Math.round((checklistDone / Math.max(1, checklistTotal)) * 100)

  return (
    <div className="screen-scroll">
      <StatusBar />
      <section className="home-hero">
        <div className="split">
          <div>
            <span className="kicker">{snapshot.couple.spaceName}</span>
            <h1 className="home-title">小屋亮着灯</h1>
            <p className="page-subtitle">想念、天气和约定，都在这里。</p>
          </div>
          <div className="date-ticket" aria-label="今天日期">
            <span>FRI</span>
            <strong>5.22</strong>
          </div>
        </div>
        <div className="island-scene" aria-hidden="true">
          <div className="sun-dot" />
          <div className="cloud cloud-a" />
          <div className="cloud cloud-b" />
          <div className="island-hill" />
          <div className="tiny-house">
            <span className="roof" />
            <span className="body" />
            <span className="door" />
          </div>
          <div className="tree tree-a" />
          <div className="tree tree-b" />
        </div>
        <Card color="app-teal">
          <div className="home-days-card">
            <div>
              <p className="m-0 text-[12px] font-black opacity-80">在一起的第</p>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-[62px] font-black leading-none">{days}</span>
                <span className="mb-2 text-[18px] font-black">天</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/45">
                <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, progress)}%` }} />
              </div>
            </div>
            <div className="home-avatar-stack">
              {snapshot.couple.users.map((user) => <AvatarBubble key={user.id} label={user.avatar} color={user.color} />)}
              <span className="heart-pin">♡</span>
            </div>
          </div>
        </Card>
      </section>

      <div className="section grid-2">
        {snapshot.weather.map((item) => (
          <div className="weather-card tap-card" key={item.city}>
            <div className="split">
              <Icon name="icon-map" size={24} />
              <span className="text-[22px] font-black text-[#725d42]">{item.temp}°</span>
            </div>
            <p className="m-0 mt-2 text-[13px] font-black text-[#725d42]">{item.city}</p>
            <p className="m-0 mt-1 text-[11px] font-bold text-[#9f927d]">{item.condition}</p>
          </div>
        ))}
      </div>

      <div className="section">
        <button className="secret-card tap-card w-full text-left" onClick={() => onExtra('secrets')}>
          <div className="split">
            <div className="row">
              <Icon name="icon-chat" size={24} bounce />
              <span className="font-black text-[#725d42]">今日悄悄话</span>
            </div>
            <ChevronRight className="text-[#c4b89e]" size={18} />
          </div>
          <p className="m-0 mt-3 text-[14px] leading-7 text-[#725d42]">"{latestSecret?.content}"</p>
        </button>
      </div>

      <div className="section grid-2">
        <ActionCard animalIcon="icon-diy" icon={ListChecks} title={`${checklistDone}/${checklistTotal}`} caption={`打卡进度 ${progress}%`} onClick={() => onNavigate('checklist')} />
        <ActionCard animalIcon="icon-miles" icon={CalendarDays} title={`${nextAnniversary?.days ?? 0} 天`} caption={nextAnniversary?.name ?? '下个纪念日'} onClick={() => onNavigate('anniversary')} />
      </div>

      <div className="section quick-dock">
        <Button type="primary" block icon={<Mail size={16} />} onClick={onWriteSecret}>写悄悄话</Button>
        <Button block icon={<BarChart3 size={16} />} onClick={() => onExtra('stats')}>看统计</Button>
        <Button block icon={<Settings size={16} />} onClick={() => onExtra('settings')}>设置</Button>
        <Button type="dashed" block icon={<Gift size={16} />} onClick={() => onNavigate('wishlist')}>心愿树</Button>
      </div>
    </div>
  )
}

function ChecklistPage({
  categories,
  completedCount,
  total,
  onAdd,
  onCancelCheckin,
  onCheckin,
  onDelete,
}: {
  categories: ChecklistCategory[]
  completedCount: number
  total: number
  onAdd: () => void
  onCancelCheckin: (item: ChecklistItem) => void
  onCheckin: (item: ChecklistItem) => void
  onDelete: (item: ChecklistItem) => void
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? '')
  const progress = Math.round((completedCount / Math.max(1, total)) * 100)
  const featured = categories[0]?.items.find((item) => !item.completedAt) ?? categories[0]?.items[0]
  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0]
  const activeItems = activeCategory?.items ?? []

  return (
    <div className="screen-scroll">
      <StatusBar />
      <Header kicker="CHECKLIST" title="恋爱打卡收集册" subtitle={`${completedCount}/${total} 项完成，完整清单已接入。`} action={onAdd} />
      <div className="section">
        <div className="checklist-hero">
          <div>
            <span className="leaf-chip is-active">今日推荐</span>
            <h2>{featured?.title ?? '挑一个小任务'}</h2>
            <p>{featured?.description ?? '把普通日子变成可以收藏的纪念。'}</p>
          </div>
          <div className="checklist-stamp">
            <Icon name="icon-diy" size={34} bounce />
            <strong>{progress}%</strong>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="checklist-progress-card">
          <div className="split">
            <div>
              <p className="m-0 text-[13px] font-black text-[#725d42]">小岛收集进度</p>
              <p className="m-0 mt-1 text-[12px] leading-5 text-[#9f927d]">{categories.length} 个主题，慢慢完成不着急。</p>
            </div>
            <Button onClick={onAdd}>添加</Button>
          </div>
          <div className="checklist-progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>
      </div>
      <div className="section">
        <div className="checklist-category-grid">
          {categories.map((category) => {
            const done = category.items.filter((item) => item.completedAt).length
            return (
              <button
                key={category.id}
                className={`category-tile tap-card ${activeCategory?.id === category.id ? 'is-active' : ''}`}
                onClick={() => setActiveCategoryId(category.id)}
              >
                <span className="category-tile-icon">{category.icon}</span>
                <span className="category-tile-title">{category.name}</span>
                <span className="category-tile-count">{done}/{category.items.length}</span>
              </button>
            )
          })}
        </div>
      </div>
      {activeCategory ? (
        <div className="section checklist-section">
          <Card color={activeCategory.color as never}>
            <div className="split">
              <div className="row">
                <span className="checklist-category-icon">{activeCategory.icon}</span>
                <h2 className="m-0 text-[17px] font-black">{activeCategory.name}</h2>
              </div>
              <span className="text-[12px] font-black">{activeCategory.items.filter((item) => item.completedAt).length}/{activeCategory.items.length}</span>
            </div>
          </Card>
          <div className="checklist-items">
            {activeItems.map((item) => (
              <div className={`checkin-item-card tap-card ${item.completedAt ? 'is-done' : ''}`} key={item.id}>
                <button className="checkin-main-action" onClick={() => onCheckin(item)}>
                  <div className="split">
                    <div className="row min-w-0">
                      <span className="checkin-check"><CheckCircle2 size={18} /></span>
                      <div className="min-w-0">
                        <p className="m-0 text-[14px] font-black text-[#725d42]">{item.title}</p>
                        <p className="m-0 mt-1 text-[11px] leading-5 text-[#9f927d]">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="shrink-0 text-[#c4b89e]" size={18} />
                  </div>
                </button>
                <div className="checkin-item-actions">
                  {item.completedAt ? (
                    <button className="checkin-mini-action" onClick={() => onCancelCheckin(item)} title="取消完成">
                      <RotateCcw size={14} />
                      <span>取消完成</span>
                    </button>
                  ) : null}
                  <button className="checkin-mini-action is-danger" onClick={() => onDelete(item)} title="删除打卡项">
                    <Trash2 size={14} />
                    <span>删除</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function TimelinePage({ memories, onAdd, onOpen }: { memories: Memory[]; onAdd: () => void; onOpen: (memory: Memory) => void }) {
  const [activeMood, setActiveMood] = useState<Memory['mood'] | 'all'>('all')
  const filters: Array<{ key: Memory['mood'] | 'all'; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'sweet', label: '甜甜的' },
    { key: 'travel', label: '旅行' },
    { key: 'daily', label: '日常' },
    { key: 'first', label: '第一次' },
    { key: 'moving', label: '感动' },
  ]
  const filteredMemories = activeMood === 'all' ? memories : memories.filter((item) => item.mood === activeMood)

  return (
    <div className="screen-scroll">
      <StatusBar />
      <Header kicker="MEMORIES" title="拾光时间线" subtitle="像翻相册一样，把照片、地点和那天的心情串起来。" action={onAdd} />
      <div className="section">
        <div className="timeline-feature">
          <div>
            <span className="leaf-chip is-active">本月新收录</span>
            <p className="m-0 mt-3 text-[22px] font-black text-[#725d42]">{memories.length} 条小回忆</p>
            <p className="m-0 mt-1 text-[12px] leading-5 text-[#9f927d]">点击任意卡片查看完整文字、照片和后续编辑入口。</p>
          </div>
          <Icon name="icon-camera" size={48} bounce />
        </div>
      </div>
      <div className="section">
        <div className="memory-filter-bar">
          {filters.map((filter) => (
            <button
              className={`leaf-chip filter-chip ${activeMood === filter.key ? 'is-active' : ''}`}
              key={filter.key}
              onClick={() => setActiveMood(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <MemoryList memories={filteredMemories} onOpen={onOpen} />
      </div>
    </div>
  )
}

function MemoryList({ memories, onOpen }: { memories: Memory[]; onOpen: (memory: Memory) => void }) {
  if (memories.length === 0) {
    return <IslandStateBlock title="还没有这一类回忆" message="添加第一条回忆后，它会出现在这里。" />
  }

  return (
    <div className="memory-timeline">
      {memories.map((memory, index) => (
        <div className="timeline-row" key={memory.id}>
          <div className="timeline-rail">
            <span className="timeline-dot">{index + 1}</span>
          </div>
          <button className="memory-card tap-card w-full text-left" onClick={() => onOpen(memory)}>
            <div className={`memory-photo-carousel mood-${memory.mood}`}>
              {(memory.photos.length ? memory.photos : ['placeholder']).slice(0, 3).map((photo, photoIndex) => (
                <span className={`memory-slide slide-${photoIndex}`} key={photo}>
                  <Icon name={memory.mood === 'travel' ? 'icon-helicopter' : memory.mood === 'daily' ? 'icon-chat' : 'icon-camera'} size={28} />
                </span>
              ))}
              <div className="memory-photo-label">
                <span>{memory.mood === 'travel' ? '旅行相册' : memory.mood === 'daily' ? '日常相册' : memory.mood === 'moving' ? '感动瞬间' : '甜蜜相册'}</span>
                <i>{Math.max(1, memory.photos.length)} 张</i>
              </div>
            </div>
            <div className="memory-content">
              <div className="split">
                <span className="leaf-chip is-active">{memory.date.slice(5).replace('-', '.')}</span>
                <span className="memory-location"><MapPinIcon />{memory.location}</span>
              </div>
              <p className="m-0 mt-3 text-[16px] font-black text-[#725d42]">{memory.title}</p>
              <p className="m-0 mt-2 text-[13px] leading-6 text-[#725d42]">{memory.note}</p>
              <Divider type="wave-yellow" className="mt-3" />
            </div>
          </button>
        </div>
      ))}
    </div>
  )
}

function AnniversaryPage({ anniversaries, onAdd, onDelete }: { anniversaries: Anniversary[]; onAdd: () => void; onDelete: (id: string) => void }) {
  const decorated = anniversaries
    .map((item) => ({ ...item, days: item.repeat === 'yearly' ? nextAnnualDays(item.date) : dayDiff(today, item.date) }))
    .sort((a, b) => a.days - b.days)
  const loveAnniversary = anniversaries.find((item) => item.kind === 'love' || item.isMain) ?? anniversaries[0]
  const birthdayItems = anniversaries.filter((item) => item.kind === 'birthday')
  const otherItems = decorated.filter((item) => item.kind !== 'love' && item.kind !== 'birthday' && !item.isMain)
  const loveDate = loveAnniversary?.date ?? today
  const loveStart = new Date(loveDate).getTime()
  const todayMs = new Date(today).getTime()
  const relationDays = Math.floor((todayMs - loveStart) / 86_400_000) + 1
  const loveCountdown = nextAnnualDays(loveDate)
  const milestones: Array<{ label: string; caption: string; active: boolean; icon: IconSvgElement }> = [
    { label: '开始恋爱', caption: loveDate, active: relationDays >= 1, icon: InLoveIcon },
    { label: '一周年', caption: '1 year', active: relationDays >= 365, icon: CalendarLove02Icon },
    { label: '二周年', caption: '2 years', active: relationDays >= 730, icon: CalendarLove02Icon },
    { label: '三周年', caption: '3 years', active: relationDays >= 1095, icon: CalendarLove02Icon },
    { label: '五周年', caption: '5 years', active: relationDays >= 1825, icon: CalendarLove02Icon },
    { label: '求婚', caption: 'future', active: false, icon: DiamondIcon },
    { label: '订婚', caption: 'future', active: false, icon: DiamondIcon },
    { label: '结婚', caption: 'future', active: false, icon: WeddingIcon },
    { label: '10年', caption: '10 years', active: false, icon: CalendarLove02Icon },
    { label: '20年', caption: '20 years', active: false, icon: CalendarLove02Icon },
    { label: '30年', caption: '30 years', active: false, icon: CalendarLove02Icon },
  ]

  return (
    <div className="screen-scroll">
      <StatusBar />
      <Header kicker="DATES" title="纪念日地图" subtitle="恋爱纪念日和生日会被小岛特别照顾。" action={onAdd} />
      <div className="section">
        <div className="love-anniversary-hero">
          <div className="moon-ring">
            <HugeiconsIcon icon={CalendarLove02Icon} size={42} strokeWidth={1.7} />
          </div>
          <div>
            <span className="leaf-chip">最重要</span>
            <h2>{loveAnniversary?.name ?? '恋爱纪念日'}</h2>
            <p>{relationDays > 0 ? <>已经恋爱 <strong>{relationDays}</strong> 天</> : <>还有 <strong>{Math.abs(relationDays) + 1}</strong> 天开始</>}，距下次纪念日还有 {loveCountdown} 天。</p>
          </div>
          <div className="star-path" aria-hidden="true"><i /><i /><i /><i /></div>
        </div>
      </div>
      <div className="section">
        <div className="love-milestone-card">
          <div className="split">
            <div>
              <span className="kicker">LOVE ROAD</span>
              <p className="m-0 mt-1 text-[18px] font-black text-[#725d42]">恋爱时间轴</p>
            </div>
            <span className="scroll-hint"><HugeiconsIcon icon={ArrowLeftRightIcon} size={18} strokeWidth={2} />左右滑动</span>
          </div>
          <div className="milestone-track-shell">
            <div className="milestone-track">
              {milestones.map((item) => (
                <div className={`milestone-node ${item.active ? 'is-active' : ''}`} key={item.label}>
                  <span><HugeiconsIcon icon={item.icon} size={18} strokeWidth={2} /></span>
                  <strong>{item.label}</strong>
                  <em>{item.caption}</em>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="section birthday-grid">
        {birthdayItems.map((item) => (
          <div className={`birthday-card ${item.owner === 'yangyang' ? 'is-her' : 'is-him'}`} key={item.id}>
            <div className="birthday-orb" style={{ background: item.color }}>
              <HugeiconsIcon icon={item.owner === 'yangyang' ? BirthdayCakeIcon : CakeSliceIcon} size={34} strokeWidth={1.7} />
            </div>
            <div>
              <span className="leaf-chip">{item.owner === 'yangyang' ? '她的生日' : '我的生日'}</span>
              <h3>{item.name}</h3>
              <p>{item.lunarDate ?? item.date}</p>
              <p>每年提醒 · 还有 {nextAnnualDays(item.date)} 天</p>
            </div>
          </div>
        ))}
      </div>
      <div className="section">
        <div className="anniversary-map compact">
          {otherItems.map((item, index) => (
            <div className={`anniversary-stop ${index % 2 ? 'is-right' : ''}`} key={item.id}>
              <div className="stop-badge" style={{ background: item.color }}>{item.icon}</div>
              <div className="stop-card">
                <div className="split">
                  <span className="leaf-chip is-active">{item.days} 天</span>
                  <button aria-label="删除纪念日" onClick={() => onDelete(item.id)}><Trash2 size={16} className="text-[#c94444]" /></button>
                </div>
                <p className="m-0 mt-3 text-[16px] font-black text-[#725d42]">{item.name}</p>
                <p className="m-0 mt-1 text-[12px] font-bold text-[#9f927d]">{item.date} · {item.repeat === 'yearly' ? '每年提醒' : '仅一次'}</p>
              </div>
            </div>
          ))}
          {otherItems.length === 0 ? (
            <div className="future-anniversary-card">
              <span className="future-icon"><HugeiconsIcon icon={WeddingIcon} size={30} strokeWidth={1.8} /></span>
              <div>
                <p className="m-0 text-[15px] font-black text-[#725d42]">预留结婚纪念日</p>
                <p className="m-0 mt-1 text-[12px] leading-5 text-[#9f927d]">以后可以添加求婚、订婚、结婚和更多重要日子。</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function WishlistPage({ wishes, onAdd, onComplete, onDelete }: { wishes: Wish[]; onAdd: () => void; onComplete: (wish: Wish) => void; onDelete: (id: string) => void }) {
  const [activeFilter, setActiveFilter] = useState<WishCategory | 'all'>('all')
  const active = wishes.filter((wish) => !wish.completedAt)
  const filteredActive = activeFilter === 'all' ? active : active.filter((wish) => wish.category === activeFilter)
  const done = wishes.filter((wish) => wish.completedAt)
  const filters: Array<{ key: WishCategory | 'all'; label: string }> = [
    { key: 'all', label: '全部' },
    ...Object.entries(wishCategoryLabels).map(([key, label]) => ({ key: key as WishCategory, label })),
  ]

  return (
    <div className="screen-scroll">
      <StatusBar />
      <Header kicker="WISH TREE" title="心愿树" subtitle="想去、想吃、想买、想学，都挂成树上的小果子。" action={onAdd} />
      <div className="section">
        <div className="wish-tree-hero">
          <div className="wish-tree-art" aria-hidden="true">
            {active.slice(0, 5).map((wish, index) => <span key={wish.id} className={`wish-fruit fruit-${index}`} />)}
            <i className="tree-trunk" />
          </div>
          <div>
            <span className="leaf-chip is-active">还想实现</span>
            <h2>{active.length} 个心愿果子</h2>
            <p>已经摘下 {done.length} 个，剩下的慢慢安排。</p>
          </div>
        </div>
      </div>
      <div className="section wish-filter-row">
        {filters.map((filter) => (
          <button
            className={`leaf-chip filter-chip ${activeFilter === filter.key ? 'is-active' : ''}`}
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="section wish-grid">
        {filteredActive.map((wish, index) => (
          <div className={`wish-card fruit-tone-${index % 5}`} key={wish.id}>
            <div className="split">
              <span className="wish-category-pill">{wishCategoryLabels[wish.category]} · {'★'.repeat(wish.priority)}</span>
              <Icon name={wish.category === 'place' ? 'icon-map' : wish.category === 'food' ? 'icon-shopping' : 'icon-variant'} size={26} bounce />
            </div>
            <p className="m-0 mt-3 text-[17px] font-black text-[#725d42]">{wish.title}</p>
            <p className="m-0 mt-2 text-[12px] leading-5 text-[#9f927d]">{wish.note}</p>
            <div className="wish-actions">
              <Button type="primary" onClick={() => onComplete(wish)}>摘下</Button>
              <Button danger ghost onClick={() => onDelete(wish.id)}>删除</Button>
            </div>
          </div>
        ))}
        {filteredActive.length === 0 ? <IslandStateBlock title="这一类还没有果子" message="换个分类看看，或者添加一个新的小心愿。" /> : null}
      </div>
      <div className="section">
        <div className="wish-done-card">
          <div className="split">
            <div>
              <span className="kicker">ACHIEVED</span>
              <p className="m-0 mt-1 text-[18px] font-black text-[#725d42]">已实现心愿</p>
            </div>
            <Icon name="icon-miles" size={32} />
          </div>
          <div className="mt-3 grid gap-2">
            {done.map((wish) => (
              <div className="done-wish-row" key={wish.id}>
                <CheckCircle2 size={16} />
                <div>
                  <p className="m-0 text-[13px] font-black text-[#725d42]">{wish.title}</p>
                  <p className="m-0 mt-1 text-[11px] text-[#9f927d]">完成于 {wish.completedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SecretsPage({ secrets, onBack, onWrite, onOpen }: { secrets: SecretMessage[]; onBack: () => void; onWrite: () => void; onOpen: (message: SecretMessage) => void }) {
  const received = secrets.filter((item) => item.direction === 'received')
  const sent = secrets.filter((item) => item.direction === 'sent')
  const renderMessages = (items: SecretMessage[]) => (
    <div className="secret-message-list">
      {items.map((message) => (
        <div className={`secret-message-card ${message.isOpened ? 'is-opened' : 'is-locked'}`} key={message.id}>
          <div className="split">
            <div className="row">
              <span className="secret-icon">{message.isOpened ? <Icon name="icon-chat" size={26} /> : <Lock size={22} />}</span>
              <div>
                <p className="m-0 text-[15px] font-black text-[#725d42]">{message.title || '没有标题的小纸条'}</p>
                <p className="m-0 mt-1 text-[11px] font-bold text-[#9f927d]">{message.from} · {message.createdAt}</p>
              </div>
            </div>
            <span className="leaf-chip">{message.openMode === 'now' ? '已送达' : '定时'}</span>
          </div>
          <p className="m-0 mt-3 text-[13px] leading-6 text-[#725d42]">{message.isOpened ? message.content : `将在 ${message.openAt ?? '下个纪念日'} 打开`}</p>
          {!message.isOpened && message.direction === 'received' ? (
            <Button className="mt-3" block disabled={!message.canOpen} onClick={() => onOpen(message)}>
              打开信封
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  )

  return (
    <div className="screen-scroll">
      <StatusBar />
      <Header kicker="SECRET" title="悄悄话邮箱" subtitle="可以立即送达，也可以让小岛保管到某一天。" back={onBack} action={onWrite} />
      <div className="section">
        <div className="letterbox-hero">
          <Icon name="icon-chat" size={54} bounce />
          <div>
            <span className="leaf-chip is-active">信箱状态</span>
            <h2>{received.length} 封收到的纸条</h2>
            <p>锁住的信会在约定时间慢慢打开。</p>
          </div>
        </div>
      </div>
      <div className="section">
        <Tabs items={[
          { key: 'received', label: '收到的', children: renderMessages(received) },
          { key: 'sent', label: '发出的', children: renderMessages(sent) },
        ]}
        />
      </div>
    </div>
  )
}

function StatsPage({ stats, onBack, onReport }: { stats: LoveAppSnapshot['stats']; onBack: () => void; onReport: () => void }) {
  return (
    <div className="screen-scroll">
      <StatusBar />
      <Header kicker="REPORT" title="爱情数据报告" subtitle="给真实后端预留聚合统计入口。" back={onBack} action={onReport} actionIcon={BarChart3} />
      <div className="section">
        <div className="report-hero">
          <div>
            <span className="leaf-chip is-active">小岛报告</span>
            <h2>{stats.daysTogether} 天</h2>
            <p>打卡、心愿、回忆会在这里汇成一份温柔的年报。</p>
          </div>
          <Icon name="icon-miles" size={54} bounce />
        </div>
      </div>
      <div className="section grid-2">
        <MetricCard label="在一起" value={`${stats.daysTogether}`} suffix="天" />
        <MetricCard label="完成打卡" value={`${stats.checklistDone}`} suffix="项" />
        <MetricCard label="实现心愿" value={`${stats.wishesDone}`} suffix="个" />
        <MetricCard label="拾光回忆" value={`${stats.memoriesCount}`} suffix="条" />
      </div>
      <div className="section">
        <div className="heatmap-card">
          <p className="m-0 text-[15px] font-black text-[#725d42]">打卡热力图</p>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {stats.heatmap.map((day, index) => (
              <div
                key={`${day.date}-${index}`}
                className="aspect-square rounded-[8px]"
                style={{ background: ['#f0e8d8', '#dff4ed', '#aee6d7', '#19c8b9'][day.count] }}
                title={day.date}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="section grid gap-3">
        {stats.participation.map((item) => (
          <div className="participation-card" key={item.userId}>
            <div className="split text-[13px] font-black text-[#725d42]">
              <span>{item.name}</span>
              <span>{item.percent}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#f0e8d8]">
              <div className="h-full rounded-full" style={{ width: `${item.percent}%`, background: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPage({
  settings,
  couple,
  onBack,
  onToggle,
  onInvite,
  onEditProfile,
  onAvatar,
  onShowState,
  onLogout,
}: {
  settings: AppSettings
  couple: LoveAppSnapshot['couple']
  onBack: () => void
  onToggle: (key: keyof AppSettings, value: boolean) => void
  onInvite: () => void
  onEditProfile: () => void
  onAvatar: () => void
  onShowState: (view: AppView) => void
  onLogout: () => void
}) {
  return (
    <div className="screen-scroll">
      <StatusBar />
      <Header kicker="SETTINGS" title="小岛设置" subtitle="档案、通知、邀请码和异常页面都在这里。" back={onBack} />
      <div className="section">
        <div className="settings-profile-card">
          <div className="split">
            <div className="row">
              {couple.users.map((user) => <AvatarBubble key={user.id} label={user.avatar} color={user.color} small />)}
              <div>
                <p className="m-0 text-[15px] font-black text-[#725d42]">{couple.spaceName}</p>
                <p className="m-0 mt-1 text-[12px] text-[#9f927d]">邀请码 {couple.inviteCode}</p>
              </div>
            </div>
            <Button onClick={onEditProfile}>编辑</Button>
          </div>
          <div className="mt-3 grid-2">
            <Button icon={<ImagePlus size={16} />} onClick={onAvatar}>头像</Button>
            <Button icon={<KeyRound size={16} />} onClick={onInvite}>邀请</Button>
          </div>
        </div>
      </div>
      <div className="section grid gap-3">
        <SettingRow icon={Bell} label="纪念日提醒" checked={settings.anniversaryReminder} onChange={(value) => onToggle('anniversaryReminder', value)} />
        <SettingRow icon={Mail} label="每日情话推送" checked={settings.dailyMessagePush} onChange={(value) => onToggle('dailyMessagePush', value)} />
        <SettingRow icon={Sparkles} label="对方活动通知" checked={settings.partnerActivityNotify} onChange={(value) => onToggle('partnerActivityNotify', value)} />
        <SettingRow icon={Lock} label="App 锁定" checked={settings.appLock} onChange={(value) => onToggle('appLock', value)} />
      </div>
      <div className="section grid gap-2">
        <Button block icon={<WifiOff size={16} />} onClick={() => onShowState('offline')}>查看离线页</Button>
        <Button block icon={<ShieldAlert size={16} />} onClick={() => onShowState('forbidden')}>查看无权限页</Button>
        <Button block icon={<RotateCcw size={16} />} onClick={() => onShowState('notFound')}>查看 404 页</Button>
        <Button danger block onClick={onLogout}>退出登录</Button>
      </div>
    </div>
  )
}

function UtilityPage({ title, message, tone, onBack }: { title: string; message: string; tone?: 'soft' | 'danger' | 'offline'; onBack: () => void }) {
  return (
    <div className="screen-scroll">
      <StatusBar />
      <Header kicker="STATE" title="状态页面" subtitle="后端接入后用于错误、无权限和离线提示。" back={onBack} />
      <IslandStateBlock title={title} message={message} tone={tone} actionLabel="返回设置" onAction={onBack} />
    </div>
  )
}

function InvitePage({ inviteCode, onBack }: { inviteCode: string; onBack: () => void }) {
  return (
    <div className="screen-scroll">
      <StatusBar />
      <Header kicker="INVITE" title="邀请 TA 登岛" subtitle="正式版会显示二维码、过期时间和分享入口。" back={onBack} />
      <div className="section">
        <div className="invite-card">
          <Icon name="icon-helicopter" size={58} bounce />
          <p className="m-0 mt-4 text-[12px] font-black opacity-80">情侣空间邀请码</p>
          <p className="m-0 mt-2 text-center text-[42px] font-black tracking-[0.12em]">{inviteCode}</p>
          <Divider type="wave-yellow" className="mt-4" />
        </div>
      </div>
    </div>
  )
}

function Header({ kicker, title, subtitle, action, back, actionIcon: ActionIcon = Plus }: { kicker: string; title: string; subtitle: string; action?: () => void; back?: () => void; actionIcon?: typeof Plus }) {
  return (
    <header className="island-header">
      <div className="split">
        <div>
          <span className="kicker">{kicker}</span>
          <h1 className="page-title">{title}</h1>
        </div>
        {back ? <Button icon={<ChevronRight className="rotate-180" size={16} />} onClick={back}>返回</Button> : null}
        {action ? <Button type="primary" icon={<ActionIcon size={16} />} onClick={action}>添加</Button> : null}
      </div>
      <p className="page-subtitle">{subtitle}</p>
    </header>
  )
}

function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <span>小岛同步中</span>
    </div>
  )
}

function BottomNav({ active, onChange }: { active: MainTab; onChange: (tab: MainTab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {tabItems.map((item) => {
        const Icon = item.icon
        return (
          <button key={item.id} className={`nav-item ${active === item.id ? 'is-active' : ''}`} onClick={() => onChange(item.id)}>
            <Icon size={19} strokeWidth={2.4} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="form-label">
      <span>{label}</span>
      {children}
    </label>
  )
}

function PhotoPlaceholder({ compact, label = '添加照片' }: { compact?: boolean; label?: string }) {
  return (
    <button type="button" className={`photo-upload ${compact ? 'photo-upload-compact' : ''}`}>
      <Camera size={20} />
      <span className="text-[13px] font-black">{label}</span>
    </button>
  )
}

function AvatarBubble({ label, color, small }: { label: string; color: string; small?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full border-2 border-white font-black text-white shadow-md ${small ? 'h-10 w-10 text-[15px]' : 'h-14 w-14 text-[20px]'}`}
      style={{ background: color }}
    >
      {label}
    </div>
  )
}

function ActionCard({ icon: FallbackIcon, animalIcon, title, caption, onClick }: { icon: typeof Home; animalIcon?: 'icon-diy' | 'icon-miles' | 'icon-map' | 'icon-chat'; title: string; caption: string; onClick: () => void }) {
  return (
    <button className="action-card tap-card text-left" onClick={onClick}>
      {animalIcon ? <Icon name={animalIcon} size={28} bounce /> : <FallbackIcon className="text-[#19c8b9]" size={22} />}
      <p className="m-0 mt-3 text-[22px] font-black text-[#725d42]">{title}</p>
      <p className="m-0 mt-1 text-[12px] font-bold text-[#9f927d]">{caption}</p>
    </button>
  )
}

function MapPinIcon() {
  return <MapPin size={12} strokeWidth={3} />
}

function MetricCard({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div className="metric-card">
      <p className="m-0 text-[12px] font-black text-[#9f927d]">{label}</p>
      <p className="m-0 mt-2 text-[28px] font-black text-[#725d42]">{value}<span className="text-[13px]">{suffix}</span></p>
    </div>
  )
}

function SettingRow({ icon: Icon, label, checked, onChange }: { icon: typeof Home; label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="setting-row split">
      <div className="row">
        <Icon className="text-[#19c8b9]" size={20} />
        <span className="text-[14px] font-black text-[#725d42]">{label}</span>
      </div>
      <Switch checked={checked} onChange={onChange} checkedChildren="开" unCheckedChildren="关" />
    </div>
  )
}

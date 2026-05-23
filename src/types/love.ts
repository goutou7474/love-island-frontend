export type MainTab = 'home' | 'checklist' | 'timeline' | 'anniversary' | 'wishlist'
export type ExtraView = 'login' | 'invite' | 'secrets' | 'stats' | 'settings' | 'offline' | 'notFound' | 'forbidden'
export type AppView = MainTab | ExtraView

export interface UserProfile {
  id: string
  name: string
  city: string
  avatar: string
  color: string
}

export interface CoupleProfile {
  id: string
  spaceName: string
  inviteCode: string
  startDate: string
  users: [UserProfile, UserProfile]
}

export interface WeatherInfo {
  city: string
  temp: number
  condition: string
  accent: string
}

export interface ChecklistItem {
  id: string
  categoryId: string
  title: string
  description: string
  completedAt?: string
  completedBy?: string
  location?: string
  note?: string
}

export interface ChecklistCategory {
  id: string
  name: string
  icon: string
  color: string
  items: ChecklistItem[]
}

export type MemoryMood = 'sweet' | 'travel' | 'daily' | 'first' | 'moving'

export interface Memory {
  id: string
  title: string
  date: string
  location: string
  mood: MemoryMood
  note: string
  photos: string[]
}

export interface Anniversary {
  id: string
  name: string
  date: string
  repeat: 'none' | 'yearly'
  icon: string
  color: string
  isMain?: boolean
  kind?: 'love' | 'birthday' | 'wedding' | 'custom'
  lunarDate?: string
  owner?: 'yanyan' | 'yangyang' | 'both'
}

export type WishCategory = 'place' | 'food' | 'activity' | 'gift' | 'learn'

export interface Wish {
  id: string
  title: string
  category: WishCategory
  priority: 1 | 2 | 3
  addedBy: string
  note: string
  completedAt?: string
}

export type SecretOpenMode = 'now' | 'date' | 'anniversary'

export interface SecretMessage {
  id: string
  direction: 'received' | 'sent'
  title: string
  content: string
  from: string
  createdAt: string
  openMode: SecretOpenMode
  openAt?: string
  isOpened: boolean
  canOpen?: boolean
}

export interface AppSettings {
  anniversaryReminder: boolean
  dailyMessagePush: boolean
  partnerActivityNotify: boolean
  appLock: boolean
  softTheme: boolean
}

export interface AppStats {
  daysTogether: number
  checklistDone: number
  wishesDone: number
  memoriesCount: number
  heatmap: Array<{ date: string; count: number }>
  participation: Array<{ userId: string; name: string; percent: number; color: string }>
}

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastState {
  kind: ToastKind
  message: string
}

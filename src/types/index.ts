// ─── Navigation ───────────────────────────────────────────────────────────────
export type TabId = 'home' | 'checklist' | 'timeline' | 'anniversary' | 'wishlist'

// ─── User / Profile ───────────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  name: string
  avatarUrl?: string
  avatarGradient?: [string, string]
}

export interface CoupleProfile {
  user1: UserProfile
  user2: UserProfile
  startDate: string        // ISO date string e.g. "2023-05-12"
  coupleId: string
}

// ─── Weather ──────────────────────────────────────────────────────────────────
export interface WeatherInfo {
  city: string
  temp: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'partly-cloudy'
}

// ─── Checklist ────────────────────────────────────────────────────────────────
export interface ChecklistItem {
  id: string
  title: string
  categoryId: string
  completedAt?: string     // ISO date string
  completedBy?: string     // userId
  location?: string
  note?: string
  photos?: string[]
}

export interface ChecklistCategory {
  id: string
  name: string
  emoji: string
  items: ChecklistItem[]
}

// ─── Memory / Timeline ────────────────────────────────────────────────────────
export type MemoryTag = 'sweet' | 'moving' | 'first' | 'travel' | 'daily' | 'holiday'

export interface Memory {
  id: string
  title: string
  note?: string
  date: string             // ISO date string
  location?: string
  photos?: string[]
  tag: MemoryTag
  isSpecial?: boolean
}

// ─── Anniversary ──────────────────────────────────────────────────────────────
export interface Anniversary {
  id: string
  name: string
  date: string             // ISO date string (or "MM-DD" for annual)
  isAnnual: boolean
  isMain?: boolean
  emoji?: string
  accentColor?: string
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export type WishCategory = 'place' | 'food' | 'activity' | 'buy' | 'learn'
export type WishPriority = 0 | 1 | 2 | 3   // 0=none, 1-3 stars

export interface Wish {
  id: string
  title: string
  category: WishCategory
  priority: WishPriority
  addedBy: string          // userId
  note?: string
  completedAt?: string     // ISO date string
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface StatsOverview {
  daysTogther: number
  checklistCompleted: number
  wishesAchieved: number
  memoriesCount: number
}

export interface ParticipationData {
  userId: string
  userName: string
  avatarGradient: [string, string]
  percentage: number
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface AppSettings {
  anniversaryReminder: boolean
  dailyMessagePush: boolean
  partnerActivityNotify: boolean
  darkMode: boolean
  appLock: boolean
  theme: 'celadon'
}

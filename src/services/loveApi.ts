import {
  anniversaries,
  checklistCategories,
  couple,
  memories,
  secrets,
  settings,
  stats,
  weather,
  wishes,
} from '@/data/mock/loveMock'
import type {
  Anniversary,
  AppSettings,
  AppStats,
  ChecklistCategory,
  CoupleProfile,
  Memory,
  SecretMessage,
  WeatherInfo,
  Wish,
} from '@/types/love'

export interface LoveAppSnapshot {
  couple: CoupleProfile
  weather: WeatherInfo[]
  checklistCategories: ChecklistCategory[]
  memories: Memory[]
  anniversaries: Anniversary[]
  wishes: Wish[]
  secrets: SecretMessage[]
  settings: AppSettings
  stats: AppStats
}

export interface LoveAppApi {
  getSnapshot: () => Promise<LoveAppSnapshot>
  createSpace: (payload: { name: string; partnerName: string; startDate: string }) => Promise<CoupleProfile>
  joinSpace: (inviteCode: string) => Promise<CoupleProfile>
  saveChecklistItem: (payload: { categoryId: string; title: string }) => Promise<void>
  completeChecklistItem: (itemId: string, payload: { date: string; location: string; note: string }) => Promise<void>
  saveMemory: (payload: Pick<Memory, 'title' | 'date' | 'location' | 'mood' | 'note'>) => Promise<void>
  saveAnniversary: (payload: Pick<Anniversary, 'name' | 'date' | 'repeat' | 'icon'>) => Promise<void>
  saveWish: (payload: Pick<Wish, 'title' | 'category' | 'priority' | 'note'>) => Promise<void>
  sendSecret: (payload: Pick<SecretMessage, 'title' | 'content' | 'openMode' | 'openAt'>) => Promise<void>
  updateSettings: (payload: Partial<AppSettings>) => Promise<void>
}

const wait = async () => new Promise((resolve) => window.setTimeout(resolve, 260))

export const mockLoveAppApi: LoveAppApi = {
  async getSnapshot() {
    await wait()
    return {
      couple,
      weather,
      checklistCategories,
      memories,
      anniversaries,
      wishes,
      secrets,
      settings,
      stats,
    }
  },
  async createSpace() {
    await wait()
    return couple
  },
  async joinSpace(inviteCode) {
    await wait()
    if (inviteCode.trim().toUpperCase() !== couple.inviteCode) {
      throw new Error('邀请码不正确或已经过期')
    }
    return couple
  },
  async saveChecklistItem() {
    await wait()
  },
  async completeChecklistItem() {
    await wait()
  },
  async saveMemory() {
    await wait()
  },
  async saveAnniversary() {
    await wait()
  },
  async saveWish() {
    await wait()
  },
  async sendSecret() {
    await wait()
  },
  async updateSettings() {
    await wait()
  },
}

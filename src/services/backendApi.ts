export interface BackendUser {
  id: string
  email: string
  displayName: string
  createdAt: string
}

export interface BackendCouple {
  id: string
  name: string
  ownerUserId: string
  memberCount: number
  createdAt: string
}

export interface LoginResponse {
  token: string
  user: BackendUser
}

export interface MeResponse {
  user: BackendUser
  couple: BackendCouple | null
}

export type BackendAnniversaryCalendar = 'solar' | 'lunar'
export type BackendAnniversaryRepeat = 'none' | 'yearly'
export type BackendAnniversaryKind = 'love' | 'birthday' | 'wedding' | 'proposal' | 'engagement' | 'custom'
export type BackendAnniversaryOwner = 'owner' | 'partner' | 'both'

export interface BackendAnniversary {
  id: string
  coupleId: string
  name: string
  date: string
  calendar: BackendAnniversaryCalendar
  lunarDate: string | null
  repeat: BackendAnniversaryRepeat
  kind: BackendAnniversaryKind
  owner: BackendAnniversaryOwner
  icon: string
  color: string
  isMain: boolean
  note: string | null
  createdAt: string
}

export interface AnniversaryListResponse {
  anniversaries: BackendAnniversary[]
}

export type CreateAnniversaryPayload = Pick<
  BackendAnniversary,
  'name' | 'date' | 'calendar' | 'repeat' | 'kind' | 'owner' | 'icon' | 'color' | 'isMain'
> & {
  lunarDate?: string | null
  note?: string | null
}

export interface BackendCheckinCompletion {
  id: string
  coupleId: string
  itemId: string
  categoryId: string
  title: string
  completedAt: string
  completedByUserId: string
  location: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface CheckinCompletionListResponse {
  completions: BackendCheckinCompletion[]
}

export type UpsertCheckinCompletionPayload = Pick<
  BackendCheckinCompletion,
  'categoryId' | 'title' | 'completedAt'
> & {
  location?: string | null
  note?: string | null
}

export type BackendMemoryMood = 'sweet' | 'travel' | 'daily' | 'first' | 'moving'

export interface BackendMemory {
  id: string
  coupleId: string
  title: string
  date: string
  location: string
  mood: BackendMemoryMood
  note: string
  photos: string[]
  createdByUserId: string
  createdAt: string
  updatedAt: string
}

export interface MemoryListResponse {
  memories: BackendMemory[]
}

export type CreateMemoryPayload = Pick<
  BackendMemory,
  'title' | 'date' | 'location' | 'mood' | 'note' | 'photos'
>

export type BackendWishCategory = 'place' | 'food' | 'activity' | 'gift' | 'learn'
export type BackendWishPriority = 1 | 2 | 3

export interface BackendWish {
  id: string
  coupleId: string
  title: string
  category: BackendWishCategory
  priority: BackendWishPriority
  note: string
  addedByUserId: string
  completedAt: string | null
  completedByUserId: string | null
  createdAt: string
  updatedAt: string
}

export interface WishListResponse {
  wishes: BackendWish[]
}

export type CreateWishPayload = Pick<BackendWish, 'title' | 'category' | 'priority' | 'note'>

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000'

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return null as T
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error?.message ?? data?.message ?? `小岛暂时连不上，请稍后再试 (${response.status})`
    throw new Error(message)
  }

  return data as T
}

export const backendApi = {
  login(email: string, password: string) {
    return requestJson<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  me(token: string) {
    return requestJson<MeResponse>('/me', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  },
  listAnniversaries(token: string) {
    return requestJson<AnniversaryListResponse>('/anniversaries', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  },
  createAnniversary(token: string, payload: CreateAnniversaryPayload) {
    return requestJson<{ anniversary: BackendAnniversary }>('/anniversaries', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  },
  listCheckinCompletions(token: string) {
    return requestJson<CheckinCompletionListResponse>('/checkins/completions', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  },
  upsertCheckinCompletion(token: string, itemId: string, payload: UpsertCheckinCompletionPayload) {
    return requestJson<{ completion: BackendCheckinCompletion }>(`/checkins/completions/${itemId}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  },
  deleteCheckinCompletion(token: string, itemId: string) {
    return requestJson<null>(`/checkins/completions/${itemId}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  },
  listMemories(token: string) {
    return requestJson<MemoryListResponse>('/memories', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  },
  createMemory(token: string, payload: CreateMemoryPayload) {
    return requestJson<{ memory: BackendMemory }>('/memories', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  },
  deleteMemory(token: string, memoryId: string) {
    return requestJson<null>(`/memories/${memoryId}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  },
  listWishes(token: string) {
    return requestJson<WishListResponse>('/wishes', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  },
  createWish(token: string, payload: CreateWishPayload) {
    return requestJson<{ wish: BackendWish }>('/wishes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  },
  completeWish(token: string, wishId: string, payload: { completedAt: string }) {
    return requestJson<{ wish: BackendWish }>(`/wishes/${wishId}/complete`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  },
  deleteWish(token: string, wishId: string) {
    return requestJson<null>(`/wishes/${wishId}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  },
}

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000'

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error?.message ?? '小岛暂时连不上，请稍后再试'
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
}

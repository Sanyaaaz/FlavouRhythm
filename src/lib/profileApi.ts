const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export type UserProfile = {
  id: number
  user_id: number
  age: number
  height: number | null
  weight: number | null
  activity_level: string
  pcos_concerns: string[]
  goal: string
  allergies: string[]
  custom_allergy: string | null
  deficiencies: string[]
  custom_deficiency: string | null
  dietary_preferences: string
  preferred_cuisines: string[]
  disliked_ingredients: string | null
  protein_focus: boolean
  carb_sensitivity: string
  meal_style: string
  created_at: string
  updated_at: string
}

export type UserProfilePayload = Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string }
    if (typeof body.detail === 'string' && body.detail.trim()) {
      return body.detail
    }
  } catch {
    // Ignore parsing errors and fall back to status text.
  }
  return response.statusText || 'Request failed'
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return (await response.json()) as T
}

export async function getProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return (await response.json()) as UserProfile
}

export async function createProfile(token: string, payload: UserProfilePayload): Promise<UserProfile> {
  return requestJson<UserProfile>('/profile/me', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function updateProfile(token: string, payload: UserProfilePayload): Promise<UserProfile> {
  return requestJson<UserProfile>('/profile/me', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

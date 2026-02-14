export type AuthUser = {
  id: number
  email: string
  full_name: string | null
  created_at: string
}

export type AuthTokenResponse = {
  access_token: string
  token_type: string
  user: AuthUser
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

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

export async function signup(payload: { email: string; password: string; full_name?: string }): Promise<AuthTokenResponse> {
  return requestJson<AuthTokenResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(payload: { email: string; password: string }): Promise<AuthTokenResponse> {
  return requestJson<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function me(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return (await response.json()) as AuthUser
}

const FALLBACK_BASE_URL = 'http://127.0.0.1:8000'

function sanitizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

export function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (!configured || !configured.trim()) {
    return FALLBACK_BASE_URL
  }

  const sanitized = sanitizeBaseUrl(configured)
  const lowered = sanitized.toLowerCase()

  // Frontend must call FastAPI wrapper, not RecipeDB directly.
  if (lowered.includes('cosylab.iiitd.edu')) {
    return FALLBACK_BASE_URL
  }

  return sanitized
}

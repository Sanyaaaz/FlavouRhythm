import { resolveApiBaseUrl } from './apiBaseUrl'

const API_BASE_URL = resolveApiBaseUrl()
const SWEET_TOKENS = ['sweet', 'chocolate', 'cake', 'dessert', 'cookie', 'pastry', 'ice cream', 'sugar']
const CUISINE_TO_REGION: Record<string, string> = {
  indian: 'Indian',
  mexican: 'Mexican',
  italian: 'Italian',
  chinese: 'Chinese',
  thai: 'Thai',
  japanese: 'Japanese',
  korean: 'Korean',
  mediterranean: 'Mediterranean',
  'south indian': 'South Indian',
}

type RawRecipe = Record<string, unknown>

export type DayPeriod = 'morning' | 'afternoon' | 'night'
export type MealType = 'quick_snack' | 'full_meal'
export type DietType = 'veg' | 'non_veg' | 'egg'
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unsure'

export type AssistantPreferences = {
  mealType: MealType | null
  dietType: DietType | null
  avoidDairyGluten: boolean | null
  cyclePhase: CyclePhase | null
}

export type CravingHistoryItem = {
  craving: string
  timestamp: string
}

export type WeeklyTrend = {
  top: Array<{ craving: string; count: number }>
  repeatedSweetCount: number
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function toSingular(value: string): string {
  if (value.endsWith('ies')) return `${value.slice(0, -3)}y`
  if (value.endsWith('es')) return value.slice(0, -2)
  if (value.endsWith('s')) return value.slice(0, -1)
  return value
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function getRecipeArray(body: unknown): RawRecipe[] {
  if (Array.isArray(body)) return body as RawRecipe[]
  if (!body || typeof body !== 'object') return []
  const asRecord = body as Record<string, unknown>
  if (asRecord.payload && typeof asRecord.payload === 'object') {
    const payload = asRecord.payload as Record<string, unknown>
    if (Array.isArray(payload.data)) return payload.data as RawRecipe[]
    if (payload.data && typeof payload.data === 'object') return [payload.data as RawRecipe]
    if (Array.isArray(payload.recipes)) return payload.recipes as RawRecipe[]
  }
  if (Array.isArray(asRecord.data)) return asRecord.data as RawRecipe[]
  if (asRecord.data && typeof asRecord.data === 'object') return [asRecord.data as RawRecipe]
  return []
}

function extractRecipeTitles(recipes: RawRecipe[]): string[] {
  return unique(
    recipes
      .map((item) => {
        const title = item.Recipe_title ?? item.recipe_title ?? item.title
        return typeof title === 'string' ? title.trim() : ''
      })
      .filter(Boolean),
  )
}

function extractStringsDeep(value: unknown, output: string[] = []): string[] {
  if (typeof value === 'string') {
    const cleaned = value.trim()
    if (cleaned.length > 1 && cleaned.length < 80) output.push(cleaned)
    return output
  }
  if (Array.isArray(value)) {
    value.forEach((item) => extractStringsDeep(item, output))
    return output
  }
  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((nested) => extractStringsDeep(nested, output))
  }
  return output
}

function findLikelyFoods(body: unknown): string[] {
  const strings = extractStringsDeep(body)
  const filtered = strings.filter((item) => {
    const lowered = item.toLowerCase()
    if (lowered.includes('http')) return false
    if (lowered.includes('error')) return false
    if (lowered.includes('token')) return false
    return /^[a-z][a-z\s\-&,]{2,}$/i.test(item)
  })
  return unique(filtered).slice(0, 12)
}

async function request(path: string, query?: Record<string, string>): Promise<unknown> {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value.trim()) url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    let detail = 'Request failed'
    try {
      const body = (await response.json()) as { detail?: unknown }
      if (typeof body.detail === 'string') detail = body.detail
      else if (body.detail && typeof body.detail === 'object') {
        const record = body.detail as Record<string, unknown>
        const message = record.message ?? record.error
        if (typeof message === 'string' && message.trim()) detail = message
      }
    } catch {
      // fallback detail
    }
    throw new Error(detail)
  }

  return (await response.json()) as unknown
}

function buildRecipeQueries(craving: string, period: DayPeriod, prefs: AssistantPreferences): string[] {
  const normalized = normalizeText(craving)
  const terms = [normalized, toSingular(normalized)]

  if (period === 'morning') terms.push('breakfast')
  if (period === 'afternoon') terms.push('lunch')
  if (period === 'night') terms.push('snack')

  if (prefs.mealType === 'quick_snack') terms.push('snack')
  if (prefs.mealType === 'full_meal') terms.push('meal')

  if (prefs.dietType === 'veg') terms.push('vegetarian')
  if (prefs.dietType === 'egg') terms.push('egg')
  if (prefs.dietType === 'non_veg') terms.push('protein')

  if (prefs.avoidDairyGluten) terms.push('dairy free', 'gluten free')
  return unique(terms).slice(0, 6)
}

function mapRegionFromCraving(craving: string): string | null {
  const normalized = normalizeText(craving)
  for (const [token, region] of Object.entries(CUISINE_TO_REGION)) {
    if (normalized.includes(token)) return region
  }
  return null
}

export async function fetchCravingRecipes(
  craving: string,
  period: DayPeriod,
  prefs: AssistantPreferences,
): Promise<string[]> {
  const queries = buildRecipeQueries(craving, period, prefs)
  const allTitles: string[] = []

  for (const query of queries) {
    const byFlavor = await request('/recipe2-api/recipe/recipebyingredientsflavor', { flavor: query }).catch(() => null)
    allTitles.push(...extractRecipeTitles(getRecipeArray(byFlavor)))

    const byTitle = await request('/recipe2-api/recipe/recipebytitle', { title: query }).catch(() => null)
    allTitles.push(...extractRecipeTitles(getRecipeArray(byTitle)))
  }

  const region = mapRegionFromCraving(craving)
  if (region) {
    const byRegion = await request('/recipe2-api/recipe/recipebyregiondiet', { region_diet: region }).catch(() => null)
    allTitles.push(...extractRecipeTitles(getRecipeArray(byRegion)))
  }

  return unique(allTitles).slice(0, 8)
}

export async function fetchFlavorAlternatives(craving: string): Promise<string[]> {
  const normalized = normalizeText(craving)
  if (!normalized) return []

  const aliasResp = await request('/flavordb/food/by-alias', { food_pair: normalized }).catch(() => null)
  const aliasOptions = findLikelyFoods(aliasResp)
  if (aliasOptions.length) return aliasOptions.slice(0, 8)

  const entityResp = await request('/flavordb/entities/by-readable-name', {
    entity_alias_readable: normalized,
    page: '0',
    size: '20',
  }).catch(() => null)
  return findLikelyFoods(entityResp).slice(0, 8)
}

export function getPcosFriendlyFallbacks(craving: string, period: DayPeriod, prefs: AssistantPreferences): string[] {
  const normalized = normalizeText(craving)
  const base = normalized.includes('chocolate')
    ? ['roasted almonds', 'walnuts', 'dark chocolate (70%+)', 'cocoa chia pudding', 'peanut butter oats']
    : normalized.includes('sweet')
      ? ['nuts and seeds mix', 'greek yogurt with berries', 'apple with peanut butter', 'dates with nuts']
      : normalized.includes('salty')
        ? ['roasted chana', 'makhana', 'hummus with veggies', 'paneer tikka bites']
        : ['roasted nuts', 'seed mix', 'greek yogurt bowl', 'fruit + protein snack']

  if (period === 'night') base.push('low-GI bedtime snack: chia + yogurt bowl')
  if (prefs.avoidDairyGluten) {
    return base
      .map((item) => item.replace(/greek yogurt/gi, 'coconut yogurt').replace(/yogurt/gi, 'dairy-free yogurt'))
      .filter((item) => !item.toLowerCase().includes('oats'))
      .slice(0, 6)
  }
  return unique(base).slice(0, 6)
}

export function getDayPeriod(now = new Date()): DayPeriod {
  const hour = now.getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'night'
}

export function getWhyCravingHint(craving: string, period: DayPeriod, cyclePhase: CyclePhase | null): string {
  const normalized = normalizeText(craving)
  const isSweet = SWEET_TOKENS.some((token) => normalized.includes(token))

  if (isSweet && period === 'night') {
    return 'Sweet cravings at night can be linked to blood sugar dips and stress hormones. Add protein + fiber with your treat.'
  }
  if (isSweet) {
    return 'Sweet cravings can increase with insulin swings. Pair the craving with protein/fiber to avoid a crash.'
  }
  if (cyclePhase === 'luteal') {
    return 'In luteal phase, cravings can spike due to hormonal shifts. Balanced carbs + protein can help.'
  }
  if (cyclePhase === 'menstrual') {
    return 'During period days, energy dips can increase comfort-food cravings. Iron-rich options can help.'
  }
  return 'Cravings are normal in PCOS. The goal is satisfying taste while keeping glucose steadier.'
}

export function getTimeBasedSuggestion(period: DayPeriod): string {
  if (period === 'morning') return 'Morning tip: start with protein + fiber to reduce later cravings.'
  if (period === 'afternoon') return 'Afternoon tip: choose balanced meals to avoid evening sugar cravings.'
  return 'Night tip: prefer low-GI snacks with protein/fiber for better overnight stability.'
}

export function getCyclePhaseSuggestion(phase: CyclePhase | null): string {
  if (!phase || phase === 'unsure') return 'Cycle-phase tip: track phase to get more precise craving guidance.'
  if (phase === 'menstrual') return 'Menstrual phase: focus on iron-rich and anti-inflammatory choices.'
  if (phase === 'follicular') return 'Follicular phase: energy usually rises, good time for higher-protein meals.'
  if (phase === 'ovulation') return 'Ovulation phase: keep meals light but protein-adequate to stay stable.'
  return 'Luteal phase: cravings are common, pair carbs with protein/fiber.'
}

export function recordCraving(history: CravingHistoryItem[], craving: string, now = new Date()): CravingHistoryItem[] {
  const next = [{ craving: normalizeText(craving), timestamp: now.toISOString() }, ...history]
  return next.slice(0, 200)
}

export function getWeeklyCravingTrends(history: CravingHistoryItem[], now = new Date()): WeeklyTrend {
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const weekly = history.filter((item) => new Date(item.timestamp) >= weekAgo)
  const counter = new Map<string, number>()
  let repeatedSweetCount = 0

  for (const item of weekly) {
    counter.set(item.craving, (counter.get(item.craving) ?? 0) + 1)
    if (SWEET_TOKENS.some((token) => item.craving.includes(token))) repeatedSweetCount += 1
  }

  const top = Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([craving, count]) => ({ craving, count }))

  return { top, repeatedSweetCount }
}

export function getNutrientLinkedNudge(deficiencies: string[], craving: string, repeatedSweetCount: number): string | null {
  const normalizedCraving = normalizeText(craving)
  const normalizedDefs = deficiencies.map((item) => normalizeText(item))
  const isSweet = SWEET_TOKENS.some((token) => normalizedCraving.includes(token))

  if (normalizedDefs.some((item) => item.includes('iron')) && isSweet && repeatedSweetCount >= 2) {
    return 'Nudge: Since you report iron deficiency and repeated sweet cravings, try iron-rich sweet-compatible options (dates + nuts, sesame laddoo with low sugar).'
  }
  if (normalizedDefs.some((item) => item.includes('vitamin d')) && isSweet) {
    return 'Nudge: Add Vitamin D supportive foods with your craving meal and include protein/fat for better satiety.'
  }
  if (normalizedDefs.some((item) => item.includes('b12')) && isSweet) {
    return 'Nudge: Pair sweet cravings with B12/protein-rich choices to reduce energy dips.'
  }
  return null
}

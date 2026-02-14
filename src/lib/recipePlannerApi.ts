import { resolveApiBaseUrl } from './apiBaseUrl'

type PlannerProfile = {
  region: string
  focus: string
  dietaryRestrictions: string[]
  allergyNotes: string
}

type PlannerInput = {
  desire: string
  useHomeIngredients: boolean
  homeIngredients: string[]
}

type RawRecipe = Record<string, unknown>

export type AdaptedRecipe = {
  id: number
  name: string
  description: string
  calories: number | null
  protein: number | null
  carbs: number | null
  prepTime: number | null
  cookTime: number | null
  totalTime: number | null
  region: string
  instructions: string[]
  flavorSatisfaction: number
  pcosSafety: number
  tags: string[]
}

export type RecipeChanges = {
  originalItems: string[]
  adaptedItems: string[]
  triggersAddressed: string[]
  whyItWorks: string
}

export type AdaptRecipeResult = {
  recipe: AdaptedRecipe
  changes: RecipeChanges
}

export type MicroMealPlanDay = {
  day: string
  meals: string[]
}

const API_BASE_URL = resolveApiBaseUrl()
const STOPWORDS = new Set([
  'craving',
  'want',
  'wants',
  'wanting',
  'recipe',
  'dish',
  'food',
  'something',
  'like',
  'with',
  'and',
  'the',
  'for',
  'from',
  'into',
  'that',
  'this',
  'have',
  'has',
  'had',
  'you',
  'your',
  'at',
  'home',
])
const FLAVOR_KEYWORDS = new Set([
  'sweet',
  'spicy',
  'sour',
  'salty',
  'tangy',
  'cheesy',
  'creamy',
  'savory',
  'smoky',
  'minty',
  'garlicky',
  'chocolaty',
  'chocolate',
])
const CUISINE_TO_REGION: Record<string, string> = {
  indian: 'Indian',
  'south indian': 'South Indian',
  'north indian': 'North Indian',
  punjabi: 'Punjabi',
  gujarati: 'Gujarati',
  bengali: 'Bengali',
  italian: 'Italian',
  mexican: 'Mexican',
  chinese: 'Chinese',
  thai: 'Thai',
  japanese: 'Japanese',
  korean: 'Korean',
  mediterranean: 'Mediterranean',
  middleeastern: 'Middle Eastern',
  'middle eastern': 'Middle Eastern',
  continental: 'Continental',
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function normalizeQuery(value: string): string {
  return value.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildSearchSignals(desire: string): {
  titleQueries: string[]
  keywordQueries: string[]
  flavorQueries: string[]
  regionQueries: string[]
} {
  const raw = desire.trim()
  const normalized = normalizeQuery(desire)
  if (!normalized) {
    return { titleQueries: [], keywordQueries: [], flavorQueries: [], regionQueries: [] }
  }

  const terms = normalized.split(' ').filter((term) => !STOPWORDS.has(term))
  const titleQueries = unique([raw, normalized, terms.join(' '), ...terms.filter((term) => term.length >= 4)]).slice(0, 5)
  const keywordQueries = unique([raw, normalized, ...terms.filter((term) => term.length >= 4)]).slice(0, 5)

  const flavorQueries = unique(
    terms.filter((term) => FLAVOR_KEYWORDS.has(term) || (term.endsWith('y') && term.length >= 5)),
  )

  const regionQueries: string[] = []
  for (const [keyword, region] of Object.entries(CUISINE_TO_REGION)) {
    if (normalized.includes(keyword)) {
      regionQueries.push(region)
    }
  }

  return {
    titleQueries,
    keywordQueries,
    flavorQueries,
    regionQueries: unique(regionQueries),
  }
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
    if (payload.recipe && typeof payload.recipe === 'object') return [payload.recipe as RawRecipe]
  }
  if (Array.isArray(asRecord.data)) return asRecord.data as RawRecipe[]
  if (asRecord.data && typeof asRecord.data === 'object') return [asRecord.data as RawRecipe]
  if (asRecord.recipe && typeof asRecord.recipe === 'object') return [asRecord.recipe as RawRecipe]
  return []
}

function getInstructionList(body: unknown): string[] {
  if (!body || typeof body !== 'object') return []
  const asRecord = body as Record<string, unknown>

  const payload = asRecord.payload && typeof asRecord.payload === 'object' ? (asRecord.payload as Record<string, unknown>) : null
  const source = payload ?? asRecord

  const directKeys = ['instructions', 'steps', 'method']
  for (const key of directKeys) {
    const value = source[key]
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
        .filter((item) => item.trim().length > 0)
    }
  }

  return []
}

function normalizeRecipe(raw: RawRecipe): AdaptedRecipe {
  const id = toNumber(raw.Recipe_id ?? raw.recipe_id ?? raw.id) ?? 0
  const name = String(raw.Recipe_title ?? raw.recipe_title ?? raw.title ?? 'PCOS-friendly recipe')
  const calories = toNumber(raw.Calories ?? raw.calories ?? raw['Energy (kcal)'])
  const protein = toNumber(raw['Protein (g)'] ?? raw.protein)
  const carbs = toNumber(raw['Carbohydrate, by difference (g)'] ?? raw.carbs ?? raw.carbohydrates)
  const prepTime = toNumber(raw.prep_time)
  const cookTime = toNumber(raw.cook_time)
  const totalTime = toNumber(raw.total_time)
  const region = String(raw.Region ?? raw.region ?? 'Global')

  const summary = raw.summary ?? raw.Description ?? raw.description
  const summaryText = typeof summary === 'string' ? summary : ''

  return {
    id,
    name,
    description:
      summaryText ||
      'Adapted for cravings while supporting stable energy, better satiety, and PCOS-friendly balance.',
    calories,
    protein,
    carbs,
    prepTime,
    cookTime,
    totalTime,
    region,
    instructions: [],
    flavorSatisfaction: 82,
    pcosSafety: 85,
    tags: [region, 'PCOS Friendly'],
  }
}

function calcPantryMatchScore(recipe: RawRecipe, pantry: string[]): number {
  if (!pantry.length) return 0
  const ingredientText = JSON.stringify(recipe).toLowerCase()
  return pantry.reduce((score, item) => (ingredientText.includes(item.toLowerCase()) ? score + 1 : score), 0)
}

function titleWordMatchCount(title: string, query: string): number {
  const titleWords = normalizeQuery(title).split(' ').filter(Boolean)
  const queryWords = normalizeQuery(query)
    .split(' ')
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word))
  if (!titleWords.length || !queryWords.length) return 0

  let matches = 0
  for (const queryWord of queryWords) {
    if (titleWords.some((titleWord) => titleWord.includes(queryWord) || queryWord.includes(titleWord))) {
      matches += 1
    }
  }
  return matches
}

function scoreRecipe(recipe: AdaptedRecipe, pantryMatch: number, desire: string): number {
  let score = 0
  score += pantryMatch * 12
  score += titleWordMatchCount(recipe.name, desire) * 30
  if (recipe.protein !== null) score += Math.min(recipe.protein, 35)
  if (recipe.carbs !== null) score -= Math.max(recipe.carbs - 45, 0) * 0.5
  if (recipe.calories !== null) score -= Math.max(recipe.calories - 550, 0) * 0.03
  return score
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
    let detail = 'Failed to fetch recipe data'
    try {
      const body = (await response.json()) as { detail?: unknown }
      if (typeof body.detail === 'string') {
        if (body.detail.toLowerCase().includes('cannot get')) {
          detail = 'Recipe endpoint is unavailable right now. Retrying with alternatives.'
        } else {
          detail = body.detail
        }
      } else if (body.detail && typeof body.detail === 'object') {
        const errorRecord = body.detail as Record<string, unknown>
        const message = errorRecord.message ?? errorRecord.error
        if (typeof message === 'string' && message.trim()) {
          detail = message
        }
      }
    } catch {
      // keep fallback
    }
    throw new Error(detail)
  }
  return (await response.json()) as unknown
}

async function requestPost(path: string, body: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    let detail = 'Failed to fetch recipe data'
    try {
      const parsed = (await response.json()) as { detail?: unknown }
      if (typeof parsed.detail === 'string') detail = parsed.detail
      else if (parsed.detail && typeof parsed.detail === 'object') {
        const errorRecord = parsed.detail as Record<string, unknown>
        const message = errorRecord.message ?? errorRecord.error
        if (typeof message === 'string' && message.trim()) {
          detail = message
        }
      }
    } catch {
      // keep fallback
    }
    throw new Error(detail)
  }
  return (await response.json()) as unknown
}

async function tryList(path: string, query?: Record<string, string>): Promise<RawRecipe[]> {
  const response = await request(path, query).catch(() => null)
  return getRecipeArray(response)
}

async function fetchCandidateRecipes(input: PlannerInput, profile: PlannerProfile): Promise<RawRecipe[]> {
  const desire = input.desire.trim()
  const pantryText = input.homeIngredients.join(',')
  const signals = buildSearchSignals(desire)

  if (input.useHomeIngredients && input.homeIngredients.length) {
    const pantryFlavors = unique([desire, ...signals.flavorQueries]).filter(Boolean)
    for (const flavor of pantryFlavors) {
      const list = await tryList('/recipe2-api/recipe/recipebyingredientsflavor', {
        ingredients: pantryText,
        flavor,
      })
      if (list.length) return list
    }
    const pantryOnly = await tryList('/recipe2-api/recipe/recipebyingredientsflavor', {
      ingredients: pantryText,
    })
    if (pantryOnly.length) return pantryOnly
  }

  for (const titleQuery of signals.titleQueries) {
    const list = await tryList('/recipe2-api/recipe/recipebytitle', { title: titleQuery })
    if (list.length) return list
  }

  for (const keywordQuery of signals.keywordQueries) {
    const list = await tryList('/recipe2-api/recipe/recipebyingredientsflavor', { flavor: keywordQuery })
    if (list.length) return list
  }

  for (const flavorQuery of signals.flavorQueries) {
    const list = await tryList('/recipe2-api/recipe/recipebyingredientsflavor', { flavor: flavorQuery })
    if (list.length) return list
  }

  const regionsToTry = unique([...signals.regionQueries, profile.region])
  for (const region of regionsToTry) {
    const list = await tryList('/recipe2-api/recipe/recipebyregiondiet', { region_diet: region })
    if (list.length) return list
  }

  const recipeOfDay = await request('/recipe2-api/recipe/recipeofday').catch(() => null)
  return getRecipeArray(recipeOfDay)
}

function buildChanges(input: PlannerInput, profile: PlannerProfile, recipe: AdaptedRecipe): RecipeChanges {
  const originalItems = [
    `[CRAVE] ${input.desire || 'General craving'}`,
    input.useHomeIngredients ? '[PANTRY] Limited to available home ingredients' : '[PANTRY] No pantry constraint',
    profile.allergyNotes ? `[ALLERGY] ${profile.allergyNotes}` : '[ALLERGY] No specific allergy notes',
  ]

  const adaptedItems = [
    `[RECIPE] ${recipe.name}`,
    recipe.protein !== null ? `[PROTEIN] ~${Math.round(recipe.protein)}g protein supported` : '[PROTEIN] Protein-balanced choice',
    recipe.carbs !== null ? `[CARBS] ~${Math.round(recipe.carbs)}g carbs managed` : '[CARBS] Carb-conscious choice',
  ]

  const triggersAddressed: string[] = []
  if (recipe.carbs !== null && recipe.carbs > 45) triggersAddressed.push('Reduced high glycemic load')
  else triggersAddressed.push('Better glucose response support')
  if (recipe.protein !== null && recipe.protein < 20) triggersAddressed.push('Protein quality improved')
  else triggersAddressed.push('Improved satiety and protein balance')
  triggersAddressed.push('Inflammation-aware ingredient emphasis')

  return {
    originalItems,
    adaptedItems,
    triggersAddressed,
    whyItWorks:
      'This adaptation prioritizes steadier carbs, higher satiety, and practical ingredient swaps to better align with PCOS needs.',
  }
}

export async function adaptRecipeForPcos(input: PlannerInput, profile: PlannerProfile): Promise<AdaptRecipeResult> {
  const candidates = await fetchCandidateRecipes(input, profile)
  if (!candidates.length) {
    throw new Error('No recipe found for this craving. Try a broader input.')
  }

  const normalized = candidates.map((item) => normalizeRecipe(item))
  const scored = normalized
    .map((recipe, index) => ({
      recipe,
      score: scoreRecipe(recipe, calcPantryMatchScore(candidates[index], input.homeIngredients), input.desire),
    }))
    .sort((a, b) => b.score - a.score)

  const selected = scored[0]?.recipe
  if (!selected) throw new Error('Unable to adapt recipe right now.')

  if (selected.id > 0) {
    const [detailBody, nutritionBody, instructionsBody] = await Promise.all([
      request('/recipe2-api/recipe/recipebyid', { recipe_id: String(selected.id) }).catch(() => null),
      request('/recipe2-api/recipe/recipenutritioninfo', { recipe_id: String(selected.id) }).catch(() => null),
      request('/recipe2-api/recipe/recipeinstructions', { recipe_id: String(selected.id) }).catch(() => null),
    ])

    const detailList = getRecipeArray(detailBody)
    const detail = detailList.length ? detailList[0] : null
    if (detail) {
      const hydrated = normalizeRecipe(detail)
      selected.description = hydrated.description || selected.description
      selected.prepTime = selected.prepTime ?? hydrated.prepTime
      selected.cookTime = selected.cookTime ?? hydrated.cookTime
      selected.totalTime = selected.totalTime ?? hydrated.totalTime
      selected.region = hydrated.region || selected.region
    }

    if (nutritionBody && typeof nutritionBody === 'object') {
      const nutrition = (nutritionBody as Record<string, unknown>).payload ?? nutritionBody
      if (nutrition && typeof nutrition === 'object') {
        const info = nutrition as Record<string, unknown>
        selected.calories = selected.calories ?? toNumber(info.Calories ?? info.calories ?? info['Energy (kcal)'])
        selected.protein = selected.protein ?? toNumber(info['Protein (g)'] ?? info.protein)
        selected.carbs = selected.carbs ?? toNumber(info['Carbohydrate, by difference (g)'] ?? info.carbs)
      }
    }

    selected.instructions = getInstructionList(instructionsBody)
  }

  const carbsPenalty = selected.carbs !== null ? Math.max(selected.carbs - 45, 0) : 0
  const proteinBonus = selected.protein !== null ? Math.min(selected.protein, 30) : 15
  selected.pcosSafety = Math.max(55, Math.min(98, Math.round(80 + proteinBonus * 0.4 - carbsPenalty * 0.35)))
  selected.flavorSatisfaction = Math.max(70, Math.min(96, Math.round(82 + (input.desire ? 6 : 0))))

  if (profile.dietaryRestrictions.length) {
    selected.tags.push(...profile.dietaryRestrictions.slice(0, 2))
  }
  if (input.useHomeIngredients) {
    selected.tags.push('Pantry-based')
  }

  return {
    recipe: selected,
    changes: buildChanges(input, profile, selected),
  }
}

function flattenMealPlan(payload: unknown): MicroMealPlanDay[] {
  if (!payload || typeof payload !== 'object') return []
  const root = payload as Record<string, unknown>
  const data = (root.payload && typeof root.payload === 'object' ? root.payload : root) as Record<string, unknown>
  const days = Object.entries(data).filter(([key]) => key.toLowerCase().startsWith('day'))

  return days.map(([day, value]) => {
    const meals: string[] = []
    if (value && typeof value === 'object') {
      const dayRecord = value as Record<string, unknown>
      for (const mealValue of Object.values(dayRecord)) {
        if (mealValue && typeof mealValue === 'object') {
          const mealObj = mealValue as Record<string, unknown>
          const title = mealObj.Recipe_title ?? mealObj.recipe_title ?? mealObj.title
          if (typeof title === 'string' && title.trim()) meals.push(title.trim())
        }
      }
    }
    return { day, meals }
  })
}

export async function fetchMicroMealPlan(input: PlannerInput, profile: PlannerProfile): Promise<MicroMealPlanDay[]> {
  const payload = {
    craving: input.desire,
    region_diet: profile.region,
    recipe_diet: profile.dietaryRestrictions.join(','),
    pantry: input.homeIngredients,
    preference: profile.focus,
    days: 2,
  }
  const response = await requestPost('/recipe2-api/recipe/recipemealplan', payload).catch(() => null)
  if (!response) return []
  return flattenMealPlan(response)
}

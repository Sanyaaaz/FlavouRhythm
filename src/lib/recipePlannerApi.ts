import { resolveApiBaseUrl } from './apiBaseUrl'

type PlannerProfile = {
  region: string
  focus: string
  dietaryRestrictions: string[]
  allergyNotes: string
  deficiencies: string[]
}

type PlannerInput = {
  desire: string
  selectedIntent: string
  useHomeIngredients: boolean
  homeIngredients: string[]
  minCalories: number | null
  maxCalories: number | null
  minProtein: number | null
  maxProtein: number | null
  symptomFocus: SymptomFocus | null
}

type RawRecipe = Record<string, unknown>

export type MicronutrientEntry = {
  name: string
  value: number
  unit: string
}

export type NutrientHighlight = {
  nutrient: string
  value: number | null
  unit: string
  remark: string
}

export type AdaptedRecipe = {
  id: number
  name: string
  description: string
  imageUrl: string | null
  calories: number | null
  protein: number | null
  carbs: number | null
  prepTime: number | null
  cookTime: number | null
  totalTime: number | null
  region: string
  instructions: string[]
  micronutrients: MicronutrientEntry[]
  nutrientHighlight: NutrientHighlight | null
  glycemicLoadBand: 'Low GL' | 'Moderate GL' | 'High GL'
  glycemicLoadNote: string
  swapSuggestions: SwapSuggestion[]
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

export type RecipeRefinementResult = {
  recipe: AdaptedRecipe
  reply: string
}

export type MicroMealPlanDay = {
  day: string
  meals: string[]
}

type FlavorSwapSuggestion = {
  from: string
  to: string
  reason: string
}

export type SwapSuggestion = FlavorSwapSuggestion
export type SymptomFocus =
  | 'none'
  | 'insulin_spike'
  | 'bloating'
  | 'fatigue'
  | 'acne'
  | 'period_cramps'
  | 'sugar_cravings'

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

const INTENT_KEYWORDS: Record<string, string[]> = {
  sweet: ['sweet', 'dessert', 'cake', 'cookie', 'chocolate', 'brownie', 'halwa', 'kheer', 'pastry'],
  cheesy: ['cheese', 'cheesy', 'mozzarella', 'cheddar', 'paneer'],
  pizza: ['pizza', 'flatbread', 'margherita', 'neapolitan'],
  burger: ['burger', 'patty', 'bun', 'sliders'],
  'south indian': ['south indian', 'idli', 'dosa', 'uttapam', 'upma', 'sambar', 'rasam'],
  mexican: ['mexican', 'taco', 'burrito', 'quesadilla', 'enchilada', 'salsa'],
}

const DEFICIENCY_NUTRIENT_TOKENS: Record<string, string[]> = {
  iron: ['iron'],
  'vitamin d': ['vitamin d', 'cholecalciferol'],
  'vitamin b12': ['vitamin b12', 'cobalamin', 'b12'],
  folate: ['folate', 'folic acid', 'vitamin b9', 'b9'],
  calcium: ['calcium'],
  magnesium: ['magnesium'],
  protein: ['protein'],
  anemia: ['iron', 'folate', 'vitamin b12'],
}

const SYMPTOM_CONFIG: Record<
  Exclude<SymptomFocus, 'none'>,
  {
    label: string
    searchTerms: string[]
    titleTokens: string[]
    maxCarbs?: number
    minProtein?: number
  }
> = {
  insulin_spike: {
    label: 'Insulin Spike Support',
    searchTerms: ['low carb', 'high protein', 'fiber'],
    titleTokens: ['millet', 'oats', 'chickpea', 'lentil', 'salad', 'grilled'],
    maxCarbs: 30,
    minProtein: 18,
  },
  bloating: {
    label: 'Bloating Relief Support',
    searchTerms: ['light', 'soup', 'easy digest'],
    titleTokens: ['soup', 'stew', 'grilled', 'steamed', 'sauteed'],
    maxCarbs: 45,
  },
  fatigue: {
    label: 'Fatigue Support',
    searchTerms: ['high protein', 'iron', 'energy'],
    titleTokens: ['egg', 'paneer', 'chickpea', 'lentil', 'beans', 'spinach'],
    minProtein: 20,
  },
  acne: {
    label: 'Acne-safe Support',
    searchTerms: ['anti inflammatory', 'low sugar', 'omega'],
    titleTokens: ['salad', 'bowl', 'grilled', 'seeds', 'nuts'],
    maxCarbs: 40,
  },
  period_cramps: {
    label: 'Period Cramp Support',
    searchTerms: ['iron rich', 'magnesium', 'anti inflammatory'],
    titleTokens: ['spinach', 'sesame', 'lentil', 'beans', 'nuts'],
  },
  sugar_cravings: {
    label: 'Sugar Craving Balance',
    searchTerms: ['high protein snack', 'low gi', 'sweet healthy'],
    titleTokens: ['dark chocolate', 'chia', 'yogurt', 'nuts', 'berries'],
    maxCarbs: 35,
    minProtein: 15,
  },
}

const MICRONUTRIENT_KEYWORDS = [
  'iron',
  'calcium',
  'magnesium',
  'zinc',
  'selenium',
  'copper',
  'manganese',
  'phosphorus',
  'potassium',
  'sodium',
  'folate',
  'vitamin',
  'thiamin',
  'riboflavin',
  'niacin',
  'cobalamin',
  'b12',
  'b6',
  'iodine',
]

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

function normalizeDeficiency(deficiency: string): string {
  const normalized = normalizeQuery(deficiency)
  if (!normalized || normalized === 'none') return ''
  if (normalized.includes('iron')) return 'iron'
  if (normalized.includes('vitamin d')) return 'vitamin d'
  if (normalized.includes('vitamin b12') || normalized.includes('b12')) return 'vitamin b12'
  if (normalized.includes('folate') || normalized.includes('folic')) return 'folate'
  if (normalized.includes('calcium')) return 'calcium'
  if (normalized.includes('magnesium')) return 'magnesium'
  if (normalized.includes('protein')) return 'protein'
  if (normalized.includes('anemia') || normalized.includes('anaemia')) return 'anemia'
  return normalized
}

function normalizeSymptomFocus(value: SymptomFocus | null): Exclude<SymptomFocus, 'none'> | null {
  if (!value || value === 'none') return null
  return value
}

function getSymptomConfig(value: SymptomFocus | null) {
  const normalized = normalizeSymptomFocus(value)
  return normalized ? SYMPTOM_CONFIG[normalized] : null
}

function getDeficiencyTargets(deficiencies: string[]): string[] {
  return unique(deficiencies.map(normalizeDeficiency).filter(Boolean))
}

function getIntentTerms(input: PlannerInput): string[] {
  const explicit = normalizeQuery(input.selectedIntent)
  const desire = normalizeQuery(input.desire)
  const terms = new Set<string>()

  if (explicit && INTENT_KEYWORDS[explicit]) {
    for (const term of INTENT_KEYWORDS[explicit]) terms.add(term)
  }

  for (const [intent, words] of Object.entries(INTENT_KEYWORDS)) {
    if (desire.includes(intent) || words.some((word) => desire.includes(word))) {
      for (const term of words) terms.add(term)
    }
  }

  return Array.from(terms)
}

function recipeMatchesIntent(raw: RawRecipe, intentTerms: string[]): boolean {
  if (!intentTerms.length) return true
  const title = String(raw.Recipe_title ?? raw.recipe_title ?? raw.title ?? '')
  const haystack = `${title} ${JSON.stringify(raw)}`.toLowerCase()
  return intentTerms.some((term) => haystack.includes(term))
}

function filterByIntent(rawRecipes: RawRecipe[], intentTerms: string[]): RawRecipe[] {
  if (!intentTerms.length) return rawRecipes
  return rawRecipes.filter((recipe) => recipeMatchesIntent(recipe, intentTerms))
}

function recipeMatchesSymptom(raw: RawRecipe, symptomValue: SymptomFocus | null): boolean {
  const symptom = getSymptomConfig(symptomValue)
  if (!symptom) return true
  const haystack = JSON.stringify(raw).toLowerCase()
  return symptom.titleTokens.some((token) => haystack.includes(token))
}

function filterBySymptom(rawRecipes: RawRecipe[], symptomValue: SymptomFocus | null): RawRecipe[] {
  const symptom = getSymptomConfig(symptomValue)
  if (!symptom) return rawRecipes
  const matches = rawRecipes.filter((recipe) => recipeMatchesSymptom(recipe, symptomValue))
  return matches.length ? matches : rawRecipes
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
  const imageSource = raw.img_url ?? raw.image_url ?? raw.imageUrl
  const imageUrl = typeof imageSource === 'string' && imageSource.trim() ? imageSource : null

  return {
    id,
    name,
    description:
      summaryText ||
      'Adapted for cravings while supporting stable energy, better satiety, and PCOS-friendly balance.',
    imageUrl,
    calories,
    protein,
    carbs,
    prepTime,
    cookTime,
    totalTime,
    region,
    instructions: [],
    micronutrients: [],
    nutrientHighlight: null,
    glycemicLoadBand: 'Moderate GL',
    glycemicLoadNote: 'Balanced carbs and protein target a moderate glycemic response.',
    swapSuggestions: [],
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

function getRawMetric(recipe: RawRecipe, keys: string[]): number | null {
  for (const key of keys) {
    if (key in recipe) {
      const parsed = toNumber(recipe[key])
      if (parsed !== null) return parsed
    }
  }
  return null
}

function passesNutritionFilter(recipe: RawRecipe, input: PlannerInput): boolean {
  const calories = getRawMetric(recipe, ['Calories', 'calories', 'Energy (kcal)'])
  const protein = getRawMetric(recipe, ['Protein (g)', 'protein'])

  if (input.minCalories !== null && calories !== null && calories < input.minCalories) return false
  if (input.maxCalories !== null && calories !== null && calories > input.maxCalories) return false
  if (input.minProtein !== null && protein !== null && protein < input.minProtein) return false
  if (input.maxProtein !== null && protein !== null && protein > input.maxProtein) return false
  return true
}

function applyNutritionFilters(recipes: RawRecipe[], input: PlannerInput): RawRecipe[] {
  if (
    input.minCalories === null &&
    input.maxCalories === null &&
    input.minProtein === null &&
    input.maxProtein === null
  ) {
    return recipes
  }
  return recipes.filter((recipe) => passesNutritionFilter(recipe, input))
}

function dedupeRecipes(recipes: RawRecipe[]): RawRecipe[] {
  const seen = new Set<string>()
  const output: RawRecipe[] = []
  for (const recipe of recipes) {
    const key = String(recipe.Recipe_id ?? recipe.recipe_id ?? recipe.id ?? recipe.Recipe_title ?? recipe.recipe_title ?? '')
    if (!key || seen.has(key)) continue
    seen.add(key)
    output.push(recipe)
  }
  return output
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

function scoreRecipe(
  recipe: AdaptedRecipe,
  pantryMatch: number,
  desire: string,
  intentTerms: string[],
  symptomValue: SymptomFocus | null,
): number {
  let score = 0
  score += pantryMatch * 12
  score += titleWordMatchCount(recipe.name, desire) * 30
  const loweredName = recipe.name.toLowerCase()
  const intentHits = intentTerms.reduce((count, term) => (loweredName.includes(term) ? count + 1 : count), 0)
  score += intentHits * 40
  if (recipe.protein !== null) score += Math.min(recipe.protein, 35)
  if (recipe.carbs !== null) score -= Math.max(recipe.carbs - 45, 0) * 0.5
  if (recipe.calories !== null) score -= Math.max(recipe.calories - 550, 0) * 0.03

  const symptom = getSymptomConfig(symptomValue)
  if (symptom) {
    const symptomHits = symptom.titleTokens.reduce((count, token) => (loweredName.includes(token) ? count + 1 : count), 0)
    score += symptomHits * 14
    if (recipe.carbs !== null && symptom.maxCarbs !== undefined) {
      score += recipe.carbs <= symptom.maxCarbs ? 24 : -24
    }
    if (recipe.protein !== null && symptom.minProtein !== undefined) {
      score += recipe.protein >= symptom.minProtein ? 18 : -12
    }
  }

  return score
}

function estimateGlycemicLoad(
  carbs: number | null,
  protein: number | null,
): { band: AdaptedRecipe['glycemicLoadBand']; note: string } {
  if (carbs === null) {
    return {
      band: 'Moderate GL',
      note: 'Carbs were unavailable, so glycemic load is estimated as moderate.',
    }
  }

  const proteinGuard = protein ?? 0
  const adjustedCarbLoad = Math.max(0, carbs - proteinGuard * 0.35)

  if (adjustedCarbLoad <= 20) {
    return {
      band: 'Low GL',
      note: 'Lower adjusted carb load with protein support favors steadier glucose response.',
    }
  }

  if (adjustedCarbLoad <= 35) {
    return {
      band: 'Moderate GL',
      note: 'Moderate adjusted carb load; pair with fiber/protein for better stability.',
    }
  }

  return {
    band: 'High GL',
    note: 'Higher adjusted carb load. Portion control and extra protein/fiber are recommended.',
  }
}

function collectNumericFields(value: unknown, prefix = ''): Array<{ key: string; value: number }> {
  if (value === null || value === undefined) return []
  if (typeof value !== 'object') return []
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectNumericFields(item, `${prefix}[${index}]`))
  }
  const output: Array<{ key: string; value: number }> = []
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    const fullKey = `${prefix} ${key}`.trim().toLowerCase()
    const numeric = toNumber(nested)
    if (numeric !== null) {
      output.push({ key: fullKey, value: numeric })
      continue
    }
    output.push(...collectNumericFields(nested, fullKey))
  }
  return output
}

function getMicronutrientScore(microData: unknown, deficiencyTargets: string[]): number {
  if (!deficiencyTargets.length) return 0
  const nutrients = collectNumericFields(microData)
  if (!nutrients.length) return 0

  let score = 0
  for (const target of deficiencyTargets) {
    const tokens = DEFICIENCY_NUTRIENT_TOKENS[target] ?? [target]
    for (const token of tokens) {
      for (const nutrient of nutrients) {
        if (nutrient.key.includes(token)) {
          score += nutrient.value
        }
      }
    }
  }
  return score
}

function toTitleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function cleanMicronutrientName(rawKey: string): string {
  const cleaned = rawKey
    .replace(/[_.]/g, ' ')
    .replace(/\b(payload|data|items|item|result|results|recipe|micronutrition|nutrients?)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return toTitleCase(cleaned || rawKey)
}

function extractMicronutrientEntries(microData: unknown): MicronutrientEntry[] {
  const numericFields = collectNumericFields(microData)
  if (!numericFields.length) return []

  const filtered = numericFields
    .filter((entry) => {
      const key = entry.key.toLowerCase()
      if (entry.value <= 0) return false
      if (key.includes('page') || key.includes('size') || key.includes('id')) return false
      return MICRONUTRIENT_KEYWORDS.some((keyword) => key.includes(keyword))
    })
    .map((entry) => {
      const unitMatch = entry.key.match(/\(([^)]+)\)/)
      const unit = unitMatch?.[1]?.trim() ?? ''
      return {
        name: cleanMicronutrientName(entry.key.replace(/\(([^)]+)\)/g, '').trim()),
        value: entry.value,
        unit,
      }
    })

  const deduped = new Map<string, MicronutrientEntry>()
  for (const item of filtered) {
    const current = deduped.get(item.name)
    if (!current || item.value > current.value) {
      deduped.set(item.name, item)
    }
  }

  return Array.from(deduped.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
}

function toNutrientLabel(target: string): string {
  if (target === 'vitamin d') return 'Vitamin D'
  if (target === 'vitamin b12') return 'Vitamin B12'
  if (target === 'anemia') return 'Iron / Folate / Vitamin B12'
  return toTitleCase(target)
}

function buildNutrientHighlight(
  entries: MicronutrientEntry[],
  deficiencyTargets: string[],
): NutrientHighlight | null {
  if (!deficiencyTargets.length) return null
  const primaryTarget = deficiencyTargets[0]
  const label = toNutrientLabel(primaryTarget)
  const tokens = DEFICIENCY_NUTRIENT_TOKENS[primaryTarget] ?? [primaryTarget]

  const match = [...entries]
    .filter((entry) => {
      const lowered = entry.name.toLowerCase()
      return tokens.some((token) => lowered.includes(token))
    })
    .sort((a, b) => b.value - a.value)[0]

  if (match) {
    return {
      nutrient: label,
      value: match.value,
      unit: match.unit,
      remark: `High ${label} content`,
    }
  }

  return {
    nutrient: label,
    value: null,
    unit: '',
    remark: `Prioritizing recipes with high ${label} content`,
  }
}

async function getRecipeMicronutrition(recipeId: number): Promise<unknown | null> {
  if (!Number.isFinite(recipeId) || recipeId <= 0) return null
  return request('/recipe2-api/recipe/recipemicronutritioninfo', { recipe_id: String(recipeId) }).catch(() => null)
}

async function getFlavorSwapSuggestions(input: PlannerInput, recipeName: string): Promise<FlavorSwapSuggestion[]> {
  const base = normalizeQuery(input.desire || recipeName)
  const seed = base.split(' ').find((word) => word.length >= 4 && !STOPWORDS.has(word))
  if (!seed) return []

  const flavorBody = await request('/flavordb/food/by-alias', { food_pair: seed }).catch(() => null)
  if (!flavorBody || typeof flavorBody !== 'object') return []

  const pairText = JSON.stringify(flavorBody).toLowerCase()
  const suggestions: FlavorSwapSuggestion[] = []

  const pushSuggestion = (from: string, to: string, reason: string) => {
    if (pairText.includes(to.toLowerCase())) {
      suggestions.push({ from, to, reason })
    }
  }

  pushSuggestion('cream', 'hung curd', 'similar creamy mouthfeel with lower glycemic impact')
  pushSuggestion('mayonnaise', 'greek yogurt', 'keeps tangy profile while improving protein density')
  pushSuggestion('refined flour', 'whole wheat flour', 'retains structure with slower glucose response')
  pushSuggestion('sugar', 'date paste', 'maintains sweetness with better micronutrient profile')
  pushSuggestion('white rice', 'millet', 'keeps neutral taste while improving fiber and minerals')
  pushSuggestion('paneer deep-fry', 'grilled paneer', 'retains savory profile with lower inflammatory load')

  return suggestions.slice(0, 3)
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
  const intentTerms = getIntentTerms(input)
  const symptom = getSymptomConfig(input.symptomFocus)
  const symptomTerms = symptom ? unique([...symptom.searchTerms, ...symptom.titleTokens]) : []
  const titleQueries = unique([...signals.titleQueries, ...symptomTerms]).slice(0, 8)
  const keywordQueries = unique([...signals.keywordQueries, ...signals.flavorQueries, ...symptomTerms]).slice(0, 8)
  const hasCaloriesFilter = input.minCalories !== null || input.maxCalories !== null
  const hasProteinFilter = input.minProtein !== null || input.maxProtein !== null

  if (hasCaloriesFilter || hasProteinFilter) {
    const nutritionCandidates: RawRecipe[] = []

    if (hasCaloriesFilter) {
      nutritionCandidates.push(
        ...(await tryList('/recipe2-api/recipe/recipebycalories', {
          min_calories: input.minCalories !== null ? String(input.minCalories) : '',
          max_calories: input.maxCalories !== null ? String(input.maxCalories) : '',
        })),
      )
    }

    if (hasProteinFilter) {
      nutritionCandidates.push(
        ...(await tryList('/recipe2-api/recipe/recipebyproteinrange', {
          min_protein: input.minProtein !== null ? String(input.minProtein) : '',
          max_protein: input.maxProtein !== null ? String(input.maxProtein) : '',
        })),
      )
    }

    const filteredNutritionCandidates = filterBySymptom(applyNutritionFilters(dedupeRecipes(nutritionCandidates), input), input.symptomFocus)
    if (filteredNutritionCandidates.length) {
      if (desire) {
        const titleMatched = filteredNutritionCandidates.filter((recipe) =>
          titleWordMatchCount(String(recipe.Recipe_title ?? recipe.recipe_title ?? recipe.title ?? ''), desire) > 0,
        )
        if (titleMatched.length) return titleMatched
      }
      return filteredNutritionCandidates
    }
  }

  if (symptom?.maxCarbs !== undefined) {
    const lowCarbCandidates = applyNutritionFilters(
      await tryList('/recipe2-api/recipe/recipebycarbs', { max_carbs: String(symptom.maxCarbs) }),
      input,
    )
    const symptomScoped = filterBySymptom(filterByIntent(lowCarbCandidates, intentTerms), input.symptomFocus)
    if (symptomScoped.length) return symptomScoped
  }

  if (input.useHomeIngredients && input.homeIngredients.length) {
    const pantryFlavors = unique([desire, ...signals.flavorQueries, ...symptomTerms]).filter(Boolean)
    for (const flavor of pantryFlavors) {
      const list = applyNutritionFilters(await tryList('/recipe2-api/recipe/recipebyingredientsflavor', {
        ingredients: pantryText,
        flavor,
      }), input)
      const intentList = filterBySymptom(filterByIntent(list, intentTerms), input.symptomFocus)
      if (intentList.length) return intentList
    }
    const pantryOnly = applyNutritionFilters(await tryList('/recipe2-api/recipe/recipebyingredientsflavor', {
      ingredients: pantryText,
    }), input)
    const pantryIntent = filterBySymptom(filterByIntent(pantryOnly, intentTerms), input.symptomFocus)
    if (pantryIntent.length) return pantryIntent
  }

  for (const titleQuery of titleQueries) {
    const list = applyNutritionFilters(await tryList('/recipe2-api/recipe/recipebytitle', { title: titleQuery }), input)
    const intentList = filterBySymptom(filterByIntent(list, intentTerms), input.symptomFocus)
    if (intentList.length) return intentList
  }

  for (const keywordQuery of keywordQueries) {
    const list = applyNutritionFilters(await tryList('/recipe2-api/recipe/recipebyingredientsflavor', { flavor: keywordQuery }), input)
    const intentList = filterBySymptom(filterByIntent(list, intentTerms), input.symptomFocus)
    if (intentList.length) return intentList
  }

  for (const flavorQuery of unique([...signals.flavorQueries, ...symptomTerms])) {
    const list = applyNutritionFilters(await tryList('/recipe2-api/recipe/recipebyingredientsflavor', { flavor: flavorQuery }), input)
    const intentList = filterBySymptom(filterByIntent(list, intentTerms), input.symptomFocus)
    if (intentList.length) return intentList
  }

  const regionsToTry = unique([...signals.regionQueries, profile.region])
  for (const region of regionsToTry) {
    const list = applyNutritionFilters(await tryList('/recipe2-api/recipe/recipebyregiondiet', { region_diet: region }), input)
    const intentList = filterBySymptom(filterByIntent(list, intentTerms), input.symptomFocus)
    if (intentList.length) return intentList
  }

  if (intentTerms.length) {
    return []
  }

  const recipeOfDay = await request('/recipe2-api/recipe/recipeofday').catch(() => null)
  return filterBySymptom(applyNutritionFilters(getRecipeArray(recipeOfDay), input), input.symptomFocus)
}

async function buildChanges(
  input: PlannerInput,
  profile: PlannerProfile,
  recipe: AdaptedRecipe,
  flavorSwaps: FlavorSwapSuggestion[],
): Promise<RecipeChanges> {
  const deficiencyTargets = getDeficiencyTargets(profile.deficiencies)
  const symptom = getSymptomConfig(input.symptomFocus)

  const originalItems = [
    `[CRAVE] ${input.desire || 'General craving'}`,
    input.useHomeIngredients ? '[PANTRY] Limited to available home ingredients' : '[PANTRY] No pantry constraint',
    profile.allergyNotes ? `[ALLERGY] ${profile.allergyNotes}` : '[ALLERGY] No specific allergy notes',
    deficiencyTargets.length ? `[DEFICIENCIES] ${deficiencyTargets.join(', ')}` : '[DEFICIENCIES] None selected',
    input.minCalories !== null || input.maxCalories !== null
      ? `[CALORIES] ${input.minCalories ?? 0} - ${input.maxCalories ?? 'any'} kcal target`
      : '[CALORIES] No calorie target',
    input.minProtein !== null || input.maxProtein !== null
      ? `[PROTEIN TARGET] ${input.minProtein ?? 0} - ${input.maxProtein ?? 'any'} g`
      : '[PROTEIN TARGET] No protein target',
    symptom ? `[SYMPTOM MODE] ${symptom.label}` : '[SYMPTOM MODE] Off',
  ]

  const adaptedItems = [
    `[RECIPE] ${recipe.name}`,
    recipe.protein !== null ? `[PROTEIN] ~${Math.round(recipe.protein)}g protein supported` : '[PROTEIN] Protein-balanced choice',
    recipe.carbs !== null ? `[CARBS] ~${Math.round(recipe.carbs)}g carbs managed` : '[CARBS] Carb-conscious choice',
  ]
  if (deficiencyTargets.length) {
    adaptedItems.push(`[NUTRIENT PRIORITY] Prioritized higher ${deficiencyTargets.join(', ')} support`)
  }
  adaptedItems.push(`[GL BADGE] ${recipe.glycemicLoadBand}`)
  if (flavorSwaps.length) {
    adaptedItems.push(...flavorSwaps.map((swap) => `[FLAVOR SWAP] ${swap.from} -> ${swap.to} (${swap.reason})`))
  }

  const triggersAddressed: string[] = []
  if (recipe.carbs !== null && recipe.carbs > 45) triggersAddressed.push('Reduced high glycemic load')
  else triggersAddressed.push('Better glucose response support')
  if (recipe.protein !== null && recipe.protein < 20) triggersAddressed.push('Protein quality improved')
  else triggersAddressed.push('Improved satiety and protein balance')
  triggersAddressed.push('Inflammation-aware ingredient emphasis')
  if (deficiencyTargets.length) triggersAddressed.push(`Micronutrient focus: ${deficiencyTargets.join(', ')}`)
  if (symptom) triggersAddressed.push(`Symptom-aware filtering: ${symptom.label}`)
  if (flavorSwaps.length) triggersAddressed.push('Taste-preserving swaps based on FlavorDB pairing signals')

  return {
    originalItems,
    adaptedItems,
    triggersAddressed,
    whyItWorks:
      deficiencyTargets.length
        ? `This adaptation prioritizes steadier carbs and satiety while explicitly giving higher ${deficiencyTargets.join(', ')} support for your selected deficiencies.`
        : 'This adaptation prioritizes steadier carbs, higher satiety, and practical ingredient swaps to better align with PCOS needs.',
  }
}

export async function adaptRecipeForPcos(input: PlannerInput, profile: PlannerProfile): Promise<AdaptRecipeResult> {
  const intentTerms = getIntentTerms(input)
  const deficiencyTargets = getDeficiencyTargets(profile.deficiencies)
  const candidates = await fetchCandidateRecipes(input, profile)
  if (!candidates.length) {
    throw new Error('No matching recipe found for this craving or intent. Try a related keyword.')
  }

  const intentCandidates = filterByIntent(candidates, intentTerms)
  const finalCandidates = intentCandidates.length ? intentCandidates : candidates
  const normalized = finalCandidates.map((item) => normalizeRecipe(item))
  const baseScored = normalized
    .map((recipe, index) => ({
      recipe,
      score: scoreRecipe(
        recipe,
        calcPantryMatchScore(finalCandidates[index], input.homeIngredients),
        input.desire,
        intentTerms,
        input.symptomFocus,
      ),
    }))
    .sort((a, b) => b.score - a.score)
  const scored = [...baseScored]

  if (deficiencyTargets.length) {
    const topForNutrients = scored.slice(0, 10)
    const nutrientScores = await Promise.all(
      topForNutrients.map(async ({ recipe }) => {
        const micro = await getRecipeMicronutrition(recipe.id)
        const rawScore = getMicronutrientScore(micro, deficiencyTargets)
        return { id: recipe.id, rawScore }
      }),
    )

    const rankedNutrients = nutrientScores
      .filter((item) => Number.isFinite(item.rawScore) && item.rawScore > 0)
      .sort((a, b) => b.rawScore - a.rawScore)

    if (rankedNutrients.length) {
      const boostById = new Map<number, number>()
      const maxRank = rankedNutrients.length
      rankedNutrients.forEach((item, rank) => {
        boostById.set(item.id, (maxRank - rank) * 18)
      })

      scored.sort((a, b) => {
        const aBoost = boostById.get(a.recipe.id) ?? 0
        const bBoost = boostById.get(b.recipe.id) ?? 0
        return b.score + bBoost - (a.score + aBoost)
      })
    }
  }

  const selected = scored[0]?.recipe
  if (!selected) throw new Error('Unable to adapt recipe right now.')

  if (selected.id > 0) {
    const [detailBody, nutritionBody, instructionsBody, micronutritionBody] = await Promise.all([
      request('/recipe2-api/recipe/recipebyid', { recipe_id: String(selected.id) }).catch(() => null),
      request('/recipe2-api/recipe/recipenutritioninfo', { recipe_id: String(selected.id) }).catch(() => null),
      request('/recipe2-api/recipe/recipeinstructions', { recipe_id: String(selected.id) }).catch(() => null),
      getRecipeMicronutrition(selected.id),
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
    selected.micronutrients = extractMicronutrientEntries(micronutritionBody)
  }
  selected.nutrientHighlight = buildNutrientHighlight(selected.micronutrients, deficiencyTargets)

  const carbsPenalty = selected.carbs !== null ? Math.max(selected.carbs - 45, 0) : 0
  const proteinBonus = selected.protein !== null ? Math.min(selected.protein, 30) : 15
  selected.pcosSafety = Math.max(55, Math.min(98, Math.round(80 + proteinBonus * 0.4 - carbsPenalty * 0.35)))
  selected.flavorSatisfaction = Math.max(70, Math.min(96, Math.round(82 + (input.desire ? 6 : 0))))
  const glycemic = estimateGlycemicLoad(selected.carbs, selected.protein)
  selected.glycemicLoadBand = glycemic.band
  selected.glycemicLoadNote = glycemic.note

  if (profile.dietaryRestrictions.length) {
    selected.tags.push(...profile.dietaryRestrictions.slice(0, 2))
  }
  if (input.useHomeIngredients) {
    selected.tags.push('Pantry-based')
  }
  if (deficiencyTargets.length) {
    selected.tags.push(`High ${toNutrientLabel(deficiencyTargets[0])} support`)
  }
  const symptom = getSymptomConfig(input.symptomFocus)
  if (symptom) {
    selected.tags.push(symptom.label)
  }

  const flavorSwaps = await getFlavorSwapSuggestions(input, selected.name)
  selected.swapSuggestions = flavorSwaps

  const changes = await buildChanges(input, profile, selected, flavorSwaps)
  return {
    recipe: selected,
    changes,
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

function buildFallbackMealPlanFromTitles(titles: string[]): MicroMealPlanDay[] {
  if (!titles.length) return []
  const safeTitles = [...titles]
  while (safeTitles.length < 6) {
    safeTitles.push(safeTitles[safeTitles.length % titles.length])
  }
  return [
    { day: 'Day 1', meals: safeTitles.slice(0, 3) },
    { day: 'Day 2', meals: safeTitles.slice(3, 6) },
  ]
}

async function fetchMealPlanCandidates(input: PlannerInput, profile: PlannerProfile): Promise<string[]> {
  const titles: string[] = []
  const signals = buildSearchSignals(input.desire)
  const intentTerms = getIntentTerms(input)
  const symptom = getSymptomConfig(input.symptomFocus)
  const symptomTerms = symptom ? unique([...symptom.searchTerms, ...symptom.titleTokens]) : []

  const titleQueries = unique([input.desire, ...signals.titleQueries, ...signals.keywordQueries, ...symptomTerms]).slice(0, 6)
  for (const title of titleQueries) {
    const byTitle = await tryList('/recipe2-api/recipe/recipebytitle', { title })
    titles.push(...extractRecipeTitles(filterBySymptom(filterByIntent(byTitle, intentTerms), input.symptomFocus)).slice(0, 6))
  }

  const flavorQueries = unique([input.selectedIntent, ...signals.flavorQueries, input.desire, ...symptomTerms]).filter(Boolean).slice(0, 5)
  for (const flavor of flavorQueries) {
    const byFlavor = await tryList('/recipe2-api/recipe/recipebyingredientsflavor', { flavor })
    titles.push(...extractRecipeTitles(filterBySymptom(filterByIntent(byFlavor, intentTerms), input.symptomFocus)).slice(0, 6))
  }

  if (symptom?.maxCarbs !== undefined) {
    const byCarbs = await tryList('/recipe2-api/recipe/recipebycarbs', { max_carbs: String(symptom.maxCarbs) })
    titles.push(...extractRecipeTitles(filterBySymptom(filterByIntent(byCarbs, intentTerms), input.symptomFocus)).slice(0, 8))
  }

  const regionRecipes = await tryList('/recipe2-api/recipe/recipebyregiondiet', { region_diet: profile.region })
  titles.push(...extractRecipeTitles(filterBySymptom(filterByIntent(regionRecipes, intentTerms), input.symptomFocus)).slice(0, 8))

  for (const region of signals.regionQueries) {
    const regionByInput = await tryList('/recipe2-api/recipe/recipebyregiondiet', { region_diet: region })
    titles.push(...extractRecipeTitles(filterBySymptom(filterByIntent(regionByInput, intentTerms), input.symptomFocus)).slice(0, 8))
  }

  if (profile.dietaryRestrictions.length) {
    const primaryDiet = profile.dietaryRestrictions[0]
    const dietRecipes = await tryList('/recipe2-api/recipe/recipebyrecipediet', { recipe_diet: primaryDiet })
    titles.push(...extractRecipeTitles(filterBySymptom(filterByIntent(dietRecipes, intentTerms), input.symptomFocus)).slice(0, 8))
  }

  const recipeOfDay = await request('/recipe2-api/recipe/recipeofday').catch(() => null)
  titles.push(...extractRecipeTitles(getRecipeArray(recipeOfDay)).slice(0, 4))

  return unique(titles)
}

export async function fetchMicroMealPlan(input: PlannerInput, profile: PlannerProfile): Promise<MicroMealPlanDay[]> {
  const symptom = getSymptomConfig(input.symptomFocus)
  const payload = {
    craving: input.desire,
    region_diet: profile.region,
    recipe_diet: profile.dietaryRestrictions.join(','),
    pantry: input.homeIngredients,
    preference: symptom ? `${profile.focus}; ${symptom.label}` : profile.focus,
    symptom_focus: input.symptomFocus ?? '',
    days: 2,
  }
  const response = await requestPost('/recipe2-api/recipe/recipemealplan', payload).catch(() => null)
  const directPlan = response ? flattenMealPlan(response) : []
  if (directPlan.length) return directPlan

  const fallbackTitles = await fetchMealPlanCandidates(input, profile)
  return buildFallbackMealPlanFromTitles(fallbackTitles)
}

function withTag(tags: string[], tag: string): string[] {
  if (tags.includes(tag)) return tags
  return [...tags, tag]
}

export function refineRecipeWithChat(recipe: AdaptedRecipe, userMessage: string): RecipeRefinementResult {
  const message = userMessage.trim()
  const text = message.toLowerCase()
  const next: AdaptedRecipe = {
    ...recipe,
    tags: [...recipe.tags],
    instructions: [...recipe.instructions],
  }
  const notes: string[] = []
  const suggestions: string[] = []

  const substitutionMap: Record<string, string[]> = {
    chicken: ['tofu', 'paneer', 'chickpeas', 'soy chunks'],
    egg: ['tofu scramble', 'chickpea flour batter', 'greek yogurt'],
    fish: ['tofu', 'tempeh', 'mushrooms', 'paneer'],
    mutton: ['soy chunks', 'jackfruit', 'mushrooms', 'tofu'],
    beef: ['soy chunks', 'mushrooms', 'lentils', 'tempeh'],
    pork: ['tofu', 'mushrooms', 'beans', 'paneer'],
    shrimp: ['tofu', 'mushrooms', 'paneer', 'chickpeas'],
    prawn: ['tofu', 'mushrooms', 'paneer', 'chickpeas'],
    milk: ['almond milk', 'soy milk', 'oat milk'],
    cheese: ['hung curd', 'tofu', 'nutritional yeast', 'vegan cheese'],
    butter: ['olive oil', 'ghee (small amount)', 'avocado oil'],
    cream: ['hung curd', 'cashew cream', 'greek yogurt'],
    rice: ['millet', 'quinoa', 'brown rice', 'cauliflower rice'],
    sugar: ['stevia', 'erythritol', 'date puree (small amount)'],
    maida: ['whole wheat flour', 'oat flour', 'almond flour'],
  }

  const substitutionRegex =
    /(substitute|replace|swap)(?:\s+\w+){0,2}\s+(?:for\s+)?([a-z][a-z\s]{2,30})|(?:substitute|replacement)\s+for\s+([a-z][a-z\s]{2,30})/
  const substitutionMatch = text.match(substitutionRegex)
  const rawTarget = (substitutionMatch?.[2] ?? substitutionMatch?.[3] ?? '').trim()
  if (rawTarget) {
    let target = rawTarget
    const stopWords = new Set(['in', 'this', 'recipe', 'my', 'the', 'a', 'an'])
    target = target
      .split(' ')
      .filter((word) => word && !stopWords.has(word))
      .join(' ')
      .trim()

    let bestKey = ''
    for (const key of Object.keys(substitutionMap)) {
      if (target.includes(key) || key.includes(target)) {
        bestKey = key
        break
      }
    }
    if (!bestKey && target.includes('chicken')) bestKey = 'chicken'

    if (bestKey) {
      const options = substitutionMap[bestKey].slice(0, 3)
      suggestions.push(`For ${bestKey}, try: ${options.join(', ')}`)
      next.tags = withTag(next.tags, `Swap ${bestKey}`)
      notes.push(`added substitution options for ${bestKey}`)
    } else {
      suggestions.push(`I can suggest high-protein swaps: tofu, paneer, chickpeas, soy chunks.`)
    }
  }

  const servingsMatch = text.match(/(\d+)\s*(servings|people|persons|person)/)
  if (servingsMatch) {
    const servings = Number.parseInt(servingsMatch[1], 10)
    if (Number.isFinite(servings) && servings > 0) {
      next.tags = withTag(next.tags, `Serves ${servings}`)
      notes.push(`set servings target to ${servings}`)
    }
  }

  if (text.includes('more protein') || text.includes('high protein') || text.includes('increase protein')) {
    next.protein = (next.protein ?? 18) + 8
    next.pcosSafety = Math.min(98, next.pcosSafety + 4)
    next.tags = withTag(next.tags, 'High Protein')
    notes.push('increased protein focus')
  }

  if (
    text.includes('low carb') ||
    text.includes('less carb') ||
    text.includes('reduce carbs') ||
    text.includes('fewer carbs')
  ) {
    next.carbs = Math.max(5, (next.carbs ?? 35) - 10)
    next.pcosSafety = Math.min(98, next.pcosSafety + 4)
    next.tags = withTag(next.tags, 'Low Carb')
    notes.push('reduced carb load')
  }

  if (text.includes('dairy free') || text.includes('lactose') || text.includes('without dairy')) {
    next.tags = withTag(next.tags, 'Dairy Free')
    if (next.instructions.length) {
      next.instructions = next.instructions.map((step) =>
        step
          .replace(/yogurt/gi, 'dairy-free yogurt')
          .replace(/milk/gi, 'almond milk')
          .replace(/cheese/gi, 'vegan cheese'),
      )
    }
    notes.push('added dairy-free substitutions')
    suggestions.push('Dairy-free options: almond milk, soy milk, coconut yogurt, tofu-based curd.')
  }

  if (text.includes('vegetarian') || text.includes('veg only')) {
    next.tags = withTag(next.tags, 'Vegetarian')
    notes.push('set vegetarian preference')
  }

  if (text.includes('vegan')) {
    next.tags = withTag(next.tags, 'Vegan')
    notes.push('set vegan preference')
  }

  if (text.includes('spicy')) {
    next.flavorSatisfaction = Math.min(96, next.flavorSatisfaction + 2)
    next.tags = withTag(next.tags, 'Spicy')
    notes.push('increased spice profile')
  }

  if (text.includes('mild') || text.includes('less spicy')) {
    next.flavorSatisfaction = Math.max(70, next.flavorSatisfaction - 1)
    next.tags = withTag(next.tags, 'Mild')
    notes.push('reduced spice profile')
  }

  const withoutMatch = text.match(/without\s+([a-z ]{3,30})/)
  if (withoutMatch) {
    const ingredient = withoutMatch[1].trim()
    next.tags = withTag(next.tags, `No ${ingredient}`)
    notes.push(`excluded ${ingredient}`)
  }

  if (!notes.length) {
    return {
      recipe: next,
      reply:
        'I can help with substitutions and tweaks. Try: "substitute chicken", "make it low carb", or "dairy free".',
    }
  }

  return {
    recipe: next,
    reply: `Done. I ${notes.join(', ')} for "${recipe.name}".${suggestions.length ? ` ${suggestions.join(' ')}` : ''}`,
  }
}

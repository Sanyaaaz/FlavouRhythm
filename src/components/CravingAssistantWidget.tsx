import { useMemo, useState } from 'react'
import type { UserProfilePayload } from '../lib/profileApi'
import {
  fetchCravingRecipes,
  fetchFlavorAlternatives,
  getCyclePhaseSuggestion,
  getDayPeriod,
  getNutrientLinkedNudge,
  getPcosFriendlyFallbacks,
  getTimeBasedSuggestion,
  getWeeklyCravingTrends,
  getWhyCravingHint,
  recordCraving,
  type AssistantPreferences,
  type CravingHistoryItem,
  type CyclePhase,
  type DayPeriod,
  type DietType,
  type MealType,
} from '../lib/cravingAssistantApi'

type ChatRole = 'assistant' | 'user'
type ActionType =
  | 'set_meal_quick'
  | 'set_meal_full'
  | 'set_diet_veg'
  | 'set_diet_non_veg'
  | 'set_diet_egg'
  | 'set_avoid_yes'
  | 'set_avoid_no'
  | 'set_phase_menstrual'
  | 'set_phase_follicular'
  | 'set_phase_ovulation'
  | 'set_phase_luteal'
  | 'set_phase_unsure'
  | 'show_recipes'
  | 'show_alternatives'

type Action = {
  type: ActionType
  label: string
}

type Message = {
  id: string
  role: ChatRole
  text: string
  actions?: Action[]
}

const HISTORY_KEY = 'flavour_rhythm_craving_history'

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function loadHistory(): CravingHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CravingHistoryItem[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => typeof item?.craving === 'string' && typeof item?.timestamp === 'string')
  } catch {
    return []
  }
}

function saveHistory(history: CravingHistoryItem[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

function defaultPrefs(): AssistantPreferences {
  return {
    mealType: null,
    dietType: null,
    avoidDairyGluten: null,
    cyclePhase: null,
  }
}

function mealActions(craving: string): Action[] {
  return [
    { type: 'set_meal_quick', label: `Quick snack for ${craving}` },
    { type: 'set_meal_full', label: `Full meal for ${craving}` },
  ]
}

function dietActions(): Action[] {
  return [
    { type: 'set_diet_veg', label: 'Veg' },
    { type: 'set_diet_non_veg', label: 'Non-veg' },
    { type: 'set_diet_egg', label: 'Egg' },
  ]
}

function avoidActions(): Action[] {
  return [
    { type: 'set_avoid_yes', label: 'Avoid dairy/gluten: Yes' },
    { type: 'set_avoid_no', label: 'Avoid dairy/gluten: No' },
  ]
}

function phaseActions(): Action[] {
  return [
    { type: 'set_phase_menstrual', label: 'Menstrual' },
    { type: 'set_phase_follicular', label: 'Follicular' },
    { type: 'set_phase_ovulation', label: 'Ovulation' },
    { type: 'set_phase_luteal', label: 'Luteal' },
    { type: 'set_phase_unsure', label: 'Not sure' },
  ]
}

function recipeChoiceActions(craving: string): Action[] {
  return [
    { type: 'show_recipes', label: `Show ${craving} recipes` },
    { type: 'show_alternatives', label: 'Give alternatives' },
  ]
}

function mapMealType(action: ActionType): MealType | null {
  if (action === 'set_meal_quick') return 'quick_snack'
  if (action === 'set_meal_full') return 'full_meal'
  return null
}

function mapDietType(action: ActionType): DietType | null {
  if (action === 'set_diet_veg') return 'veg'
  if (action === 'set_diet_non_veg') return 'non_veg'
  if (action === 'set_diet_egg') return 'egg'
  return null
}

function mapCyclePhase(action: ActionType): CyclePhase | null {
  if (action === 'set_phase_menstrual') return 'menstrual'
  if (action === 'set_phase_follicular') return 'follicular'
  if (action === 'set_phase_ovulation') return 'ovulation'
  if (action === 'set_phase_luteal') return 'luteal'
  if (action === 'set_phase_unsure') return 'unsure'
  return null
}

type CravingAssistantWidgetProps = {
  profile: UserProfilePayload
}

export default function CravingAssistantWidget({ profile }: CravingAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [latestCraving, setLatestCraving] = useState('')
  const [latestRecipes, setLatestRecipes] = useState<string[]>([])
  const [period, setPeriod] = useState<DayPeriod>('night')
  const [prefs, setPrefs] = useState<AssistantPreferences>(defaultPrefs())
  const [history, setHistory] = useState<CravingHistoryItem[]>(() => loadHistory())

  const starterMessage = useMemo<Message>(
    () => ({
      id: makeId(),
      role: 'assistant',
      text: 'What are you craving today?',
    }),
    [],
  )

  const addMessage = (message: Message) => {
    setMessages((current) => [...current, message])
  }

  const openWidget = () => {
    setIsOpen(true)
    setMessages((current) => (current.length ? current : [starterMessage]))
  }

  const handleCravingSubmit = async () => {
    const craving = input.trim()
    if (!craving || isLoading) return

    const nowPeriod = getDayPeriod()
    setPeriod(nowPeriod)
    setPrefs(defaultPrefs())
    setLatestRecipes([])
    setInput('')

    addMessage({ id: makeId(), role: 'user', text: craving })
    setLatestCraving(craving)

    const updatedHistory = recordCraving(history, craving)
    setHistory(updatedHistory)
    saveHistory(updatedHistory)

    const trends = getWeeklyCravingTrends(updatedHistory)
    const hint = getWhyCravingHint(craving, nowPeriod, null)
    const timeSuggestion = getTimeBasedSuggestion(nowPeriod)
    const phaseSuggestion = getCyclePhaseSuggestion(null)
    const nudge = getNutrientLinkedNudge(profile.deficiencies, craving, trends.repeatedSweetCount)
    const trendText = trends.top.length
      ? `This week top cravings: ${trends.top.map((item) => `${item.craving} (${item.count})`).join(', ')}`
      : 'No weekly craving pattern yet.'

    addMessage({
      id: makeId(),
      role: 'assistant',
      text: `${hint}\n${timeSuggestion}\n${phaseSuggestion}\n${trendText}${nudge ? `\n${nudge}` : ''}\nDo you want a quick snack (<10 min) or full meal?`,
      actions: mealActions(craving),
    })
  }

  const promptRecipeChoice = async (currentCraving: string, currentPeriod: DayPeriod, currentPrefs: AssistantPreferences) => {
    setIsLoading(true)
    const recipes = await fetchCravingRecipes(currentCraving, currentPeriod, currentPrefs).catch(() => [])
    setLatestRecipes(recipes)
    addMessage({
      id: makeId(),
      role: 'assistant',
      text: recipes.length
        ? `I found ${recipes.length} recipe options for your context. Do you want a direct ${currentCraving} recipe or alternatives?`
        : `I understood the context for ${currentCraving}. Do you want direct recipe suggestions or alternatives?`,
      actions: recipeChoiceActions(currentCraving),
    })
    setIsLoading(false)
  }

  const handleAction = async (actionType: ActionType) => {
    if (!latestCraving || isLoading) return

    const meal = mapMealType(actionType)
    if (meal) {
      const nextPrefs = { ...prefs, mealType: meal }
      setPrefs(nextPrefs)
      addMessage({
        id: makeId(),
        role: 'assistant',
        text: 'Do you want Veg / Non-veg / Egg?',
        actions: dietActions(),
      })
      return
    }

    const diet = mapDietType(actionType)
    if (diet) {
      const nextPrefs = { ...prefs, dietType: diet }
      setPrefs(nextPrefs)
      addMessage({
        id: makeId(),
        role: 'assistant',
        text: 'Avoid dairy/gluten today?',
        actions: avoidActions(),
      })
      return
    }

    if (actionType === 'set_avoid_yes' || actionType === 'set_avoid_no') {
      const nextPrefs = { ...prefs, avoidDairyGluten: actionType === 'set_avoid_yes' }
      setPrefs(nextPrefs)
      addMessage({
        id: makeId(),
        role: 'assistant',
        text: 'Which cycle phase are you in?',
        actions: phaseActions(),
      })
      return
    }

    const phase = mapCyclePhase(actionType)
    if (phase) {
      const nextPrefs = { ...prefs, cyclePhase: phase }
      setPrefs(nextPrefs)
      addMessage({
        id: makeId(),
        role: 'assistant',
        text: getCyclePhaseSuggestion(phase),
      })
      await promptRecipeChoice(latestCraving, period, nextPrefs)
      return
    }

    if (actionType === 'show_recipes') {
      setIsLoading(true)
      const recipes = latestRecipes.length ? latestRecipes : await fetchCravingRecipes(latestCraving, period, prefs).catch(() => [])
      setLatestRecipes(recipes)
      addMessage({
        id: makeId(),
        role: 'assistant',
        text: recipes.length
          ? `Try these ${latestCraving}-related recipes:\n${recipes.slice(0, 5).map((item) => `- ${item}`).join('\n')}`
          : `I could not find exact ${latestCraving} recipes right now. Try a broader craving term.`,
      })
      setIsLoading(false)
      return
    }

    if (actionType === 'show_alternatives') {
      setIsLoading(true)
      const flavorOptions = await fetchFlavorAlternatives(latestCraving).catch(() => [])
      const fallback = getPcosFriendlyFallbacks(latestCraving, period, prefs)
      const combined = Array.from(new Set([...flavorOptions, ...fallback])).slice(0, 6)
      addMessage({
        id: makeId(),
        role: 'assistant',
        text: `PCOS-friendly alternatives for ${latestCraving}:\n${combined.map((item) => `- ${item}`).join('\n')}\nThese keep craving satisfaction higher with steadier glucose response.`,
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <button
          onClick={openWidget}
          className="rounded-full border-2 border-[#7e3f55] bg-[#ff9fbc] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#3f1725] shadow-[3px_3px_0px_#7e3f55]"
        >
          What are you craving today?
        </button>
      ) : (
        <div className="w-[360px] rounded-xl border-[3px] border-[#7e3f55] bg-[#fff0f5] shadow-[6px_6px_0px_#7e3f55]">
          <div className="flex items-center justify-between border-b-2 border-[#d69aae] px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7e3f55]">Craving Assistant</p>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded border border-[#b46a83] bg-[#ffe3ec] px-2 py-1 text-xs font-semibold text-[#6b374b]"
            >
              Close
            </button>
          </div>

          <div className="max-h-[340px] space-y-2 overflow-y-auto px-3 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-md border px-2 py-2 text-xs whitespace-pre-line ${
                  message.role === 'assistant'
                    ? 'border-[#d6a0b4] bg-[#fff8fb] text-[#5d2b3a]'
                    : 'border-[#b58498] bg-[#ffe3ec] text-[#4b1d2f]'
                }`}
              >
                {message.text}
                {message.actions?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <button
                        key={`${message.id}-${action.type}`}
                        onClick={() => {
                          void handleAction(action.type)
                        }}
                        className="rounded border border-[#b46a83] bg-[#fff0f5] px-2 py-1 text-[11px] font-semibold text-[#6b374b]"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {isLoading ? (
              <div className="rounded-md border border-[#d6a0b4] bg-[#fff8fb] px-2 py-2 text-xs text-[#5d2b3a]">Thinking...</div>
            ) : null}
          </div>

          <div className="flex gap-2 border-t-2 border-[#d69aae] p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleCravingSubmit()
                }
              }}
              placeholder="Type a craving..."
              className="flex-1 rounded-md border-2 border-[#c8849c] bg-white px-2 py-2 text-xs text-[#5d2b3a] outline-none"
            />
            <button
              onClick={() => {
                void handleCravingSubmit()
              }}
              className="rounded-md border-2 border-[#7e3f55] bg-[#ff9fbc] px-3 py-2 text-xs font-bold text-[#3f1725]"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

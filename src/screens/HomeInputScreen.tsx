import { useState } from 'react'
import { PixelButton, PixelCard, PixelShell } from '../components/PixelPrimitives'

const quickSelections = [
  { label: 'Sweet', icon: '[CAKE]' },
  { label: 'Cheesy', icon: '[CHEESE]' },
  { label: 'Pizza', icon: '[PIZZA]' },
  { label: 'Burger', icon: '[BURGR]' },
  { label: 'South Indian', icon: '[DOSA]' },
  { label: 'Mexican', icon: '[TACO]' },
]

type HomeInputScreenProps = {
  onAdapt: (payload: {
    desire: string
    selectedIntent: string
    useHomeIngredients: boolean
    homeIngredients: string[]
    minCalories: number | null
    maxCalories: number | null
    minProtein: number | null
    maxProtein: number | null
  }) => Promise<void> | void
  isLoading?: boolean
  error?: string
}

export default function HomeInputScreen({ onAdapt, isLoading = false, error = '' }: HomeInputScreenProps) {
  const [query, setQuery] = useState('')
  const [selectedChip, setSelectedChip] = useState('')
  const [useHomeIngredients, setUseHomeIngredients] = useState(false)
  const [homeIngredientsText, setHomeIngredientsText] = useState('')
  const [minCalories, setMinCalories] = useState('')
  const [maxCalories, setMaxCalories] = useState('')
  const [minProtein, setMinProtein] = useState('')
  const [maxProtein, setMaxProtein] = useState('')

  const toOptionalNumber = (value: string): number | null => {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  const handleAdapt = async () => {
    const homeIngredients = useHomeIngredients
      ? homeIngredientsText
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter(Boolean)
      : []

    await onAdapt({
      desire: query.trim() || selectedChip,
      selectedIntent: selectedChip,
      useHomeIngredients,
      homeIngredients,
      minCalories: toOptionalNumber(minCalories),
      maxCalories: toOptionalNumber(maxCalories),
      minProtein: toOptionalNumber(minProtein),
      maxProtein: toOptionalNumber(maxProtein),
    })
  }

  return (
    <PixelShell title="What do you want to eat?" subtitle="Describe a dish, craving, or cuisine and adapt it for PCOS.">
      <PixelCard className="space-y-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try: creamy pasta, pizza craving, or South Indian breakfast"
          className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#ad7d8d] focus:border-[#8d4560]"
        />

        <div className="flex flex-wrap gap-2">
          {quickSelections.map((item) => {
            const active = selectedChip === item.label
            return (
              <button
                key={item.label}
                onClick={() => setSelectedChip(item.label)}
                className={`rounded-md border-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                  active
                    ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                    : 'border-[#c8849c] bg-[#ffeef3] text-[#7e3f55]'
                }`}
              >
                {item.icon} {item.label}
              </button>
            )
          })}
        </div>

        <label className="flex items-center justify-between rounded-lg border-2 border-[#ca8aa2] bg-[#fff1f6] px-3 py-3 text-sm">
          <span>Use ingredients I have at home</span>
          <input
            type="checkbox"
            checked={useHomeIngredients}
            onChange={() => setUseHomeIngredients((prev) => !prev)}
            className="h-5 w-5 accent-[#ff8fb1]"
          />
        </label>

        {useHomeIngredients ? (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7e3f55]">[PANTRY] Available Ingredients</p>
            <textarea
              value={homeIngredientsText}
              onChange={(event) => setHomeIngredientsText(event.target.value)}
              placeholder="Example: eggs, spinach, paneer, oats"
              className="min-h-24 w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#ad7d8d] focus:border-[#8d4560]"
            />
            <p className="text-xs text-[#7e3f55]">Tip: separate items with commas or new lines.</p>
          </div>
        ) : null}

        <div className="space-y-2 rounded-lg border-2 border-[#ca8aa2] bg-[#fff1f6] p-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7e3f55]">[NUTRITION] Optional Targets</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="number"
              min={0}
              value={minCalories}
              onChange={(event) => setMinCalories(event.target.value)}
              placeholder="Min calories"
              className="w-full rounded-md border-2 border-[#c8849c] bg-white px-3 py-2 text-sm outline-none focus:border-[#8d4560]"
            />
            <input
              type="number"
              min={0}
              value={maxCalories}
              onChange={(event) => setMaxCalories(event.target.value)}
              placeholder="Max calories"
              className="w-full rounded-md border-2 border-[#c8849c] bg-white px-3 py-2 text-sm outline-none focus:border-[#8d4560]"
            />
            <input
              type="number"
              min={0}
              value={minProtein}
              onChange={(event) => setMinProtein(event.target.value)}
              placeholder="Min protein (g)"
              className="w-full rounded-md border-2 border-[#c8849c] bg-white px-3 py-2 text-sm outline-none focus:border-[#8d4560]"
            />
            <input
              type="number"
              min={0}
              value={maxProtein}
              onChange={(event) => setMaxProtein(event.target.value)}
              placeholder="Max protein (g)"
              className="w-full rounded-md border-2 border-[#c8849c] bg-white px-3 py-2 text-sm outline-none focus:border-[#8d4560]"
            />
          </div>
          <p className="text-xs text-[#7e3f55]">Leave blank to keep nutrition filters off.</p>
        </div>

        {error ? <p className="text-sm font-semibold text-[#8c1d40]">{error}</p> : null}

        <PixelButton
          className={`w-full py-4 text-base ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
          onClick={() => {
            if (!isLoading) {
              void handleAdapt()
            }
          }}
        >
          {isLoading ? 'Adapting recipe...' : 'Adapt for PCOS'}
        </PixelButton>
      </PixelCard>
    </PixelShell>
  )
}

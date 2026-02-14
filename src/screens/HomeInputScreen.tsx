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
    useHomeIngredients: boolean
    homeIngredients: string[]
  }) => void
}

export default function HomeInputScreen({ onAdapt }: HomeInputScreenProps) {
  const [query, setQuery] = useState('')
  const [selectedChip, setSelectedChip] = useState('')
  const [useHomeIngredients, setUseHomeIngredients] = useState(false)
  const [homeIngredientsText, setHomeIngredientsText] = useState('')

  const handleAdapt = () => {
    const homeIngredients = useHomeIngredients
      ? homeIngredientsText
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter(Boolean)
      : []

    onAdapt({
      desire: query.trim() || selectedChip,
      useHomeIngredients,
      homeIngredients,
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

        <PixelButton className="w-full py-4 text-base" onClick={handleAdapt}>
          Adapt for PCOS
        </PixelButton>
      </PixelCard>
    </PixelShell>
  )
}

import { useState } from 'react'
import { PixelButton, PixelCard, PixelProgress, PixelShell } from '../components/PixelPrimitives'

const recipe = {
  name: 'Millet Veggie Tacos with Yogurt Salsa',
  imageUrl:
    'https://images.unsplash.com/photo-1604467715878-83e57e8bc129?auto=format&fit=crop&w=900&q=80',
  prepTime: '20 min',
  cookTime: '18 min',
  calories: '410 kcal',
  dietType: 'Vegetarian',
  serves: '2 people',
  description:
    'Fiber-forward tacos with millet, colorful vegetables, and cooling yogurt salsa to support stable energy.',
  commonInfo: [
    'Primary protein: Greek yogurt + millet',
    'Flavor profile: savory, tangy, mild heat',
    'Best for: lunch or light dinner',
  ],
  steps: [
    'Rinse millet and cook in water until fluffy, then let it cool slightly.',
    'Heat a pan with olive oil, saute onion, bell pepper, and zucchini until tender.',
    'Add cooked millet, cumin, paprika, salt, and pepper; cook for 2 to 3 minutes.',
    'Mix yogurt, lemon juice, chopped cilantro, and a pinch of salt to make the salsa.',
    'Warm taco shells, fill with millet-veggie mix, and top with yogurt salsa.',
    'Finish with shredded lettuce and optional chili flakes before serving.',
  ],
  flavorSatisfaction: 88,
  pcosSafety: 94,
}

type ResultScreenProps = {
  onWhatChanged: () => void
  onRefine: () => void
}

export default function ResultScreen({ onWhatChanged, onRefine }: ResultScreenProps) {
  const [showRecipeModal, setShowRecipeModal] = useState(false)

  const toShortTime = (value: string) => {
    const normalized = value.trim().toLowerCase()
    if (normalized.endsWith('min')) {
      return `${normalized.replace('min', '').trim()}m`
    }
    if (normalized.endsWith('hour') || normalized.endsWith('hours') || normalized.endsWith('hr')) {
      return `${normalized.replace('hours', '').replace('hour', '').replace('hr', '').trim()}h`
    }
    return value
  }

  const getDietIcon = (dietType: string) => {
    const normalized = dietType.toLowerCase()
    if (normalized.includes('vegan')) {
      return <span className="text-base leading-none text-[#2f8d46]">🍃</span>
    }
    if (normalized.includes('non') || normalized.includes('meat')) {
      return (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-[#b24d67] bg-[#fff2f6]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d24747]" />
        </span>
      )
    }
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-[#4a8c5f] bg-[#f4fff7]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#42a35d]" />
      </span>
    )
  }

  const quickFacts = [
    { key: 'prep', text: `Prep Time: ${recipe.prepTime}`, value: toShortTime(recipe.prepTime), icon: '⏱' },
    { key: 'cook', text: `Cook Time: ${recipe.cookTime}`, value: toShortTime(recipe.cookTime), icon: '🍳' },
    { key: 'calories', text: `Calories: ${recipe.calories}`, value: recipe.calories.replace(' kcal', ''), icon: '🔥' },
    { key: 'diet', text: `Type: ${recipe.dietType}`, value: recipe.dietType, icon: getDietIcon(recipe.dietType) },
    { key: 'serves', text: `Serves: ${recipe.serves}`, value: recipe.serves.replace(' people', 'p'), icon: '👥' },
  ]

  const renderFactChip = (fact: (typeof quickFacts)[number], keyPrefix = '') => (
    <span key={`${keyPrefix}${fact.key}`} className="group relative inline-flex">
      <span className="inline-flex min-w-10 items-center justify-center gap-1 rounded-md border-2 border-[#d09ab0] bg-[#dfccd4] px-2 py-1 text-xs font-bold text-[#6b374b]">
        <span>{fact.icon}</span>
        {fact.key === 'diet' ? null : <span>{fact.value}</span>}
      </span>
      <span className="pointer-events-none absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-[#c8849c] bg-[#ffe4ec] px-2 py-1 text-sm font-semibold text-[#5a2c3f] opacity-0 shadow-[2px_2px_0px_#b46a83] transition-opacity group-hover:opacity-100">
        {fact.text}
      </span>
    </span>
  )

  return (
    <>
      <PixelShell title="Your PCOS-adapted result" subtitle="Balanced for cravings, blood sugar, and inflammation.">
        <PixelCard className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border-2 border-[#c8849c] bg-[#fff2f6] px-2 py-1 text-xs font-bold">
              [PIZZA]
            </span>
            <span className="rounded-md border-2 border-[#c8849c] bg-[#fff2f6] px-2 py-1 text-xs font-bold">[TACO]</span>
            <span className="rounded-md border-2 border-[#c8849c] bg-[#fff2f6] px-2 py-1 text-xs font-bold">[BOWL]</span>
          </div>
          <div className="rounded-lg bg-[#fff2f7] p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]">Recommended Recipe</p>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-2xl font-bold leading-tight text-[#4a1f31]">{recipe.name}</h2>
              <PixelButton className="px-3 py-2 text-xs" onClick={() => setShowRecipeModal(true)}>
                View Recipe
              </PixelButton>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {quickFacts.map((fact) => renderFactChip(fact))}
            </div>
          </div>

          <div className="space-y-4">
            <PixelProgress label="[FLAVOR] Flavor Satisfaction" value={recipe.flavorSatisfaction} />
            <PixelProgress label="[SHIELD] PCOS Safety Score" value={recipe.pcosSafety} />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <PixelButton className="w-full" onClick={onWhatChanged}>
              What changed?
            </PixelButton>
            <PixelButton className="w-full bg-[#ffd3df]" onClick={onRefine}>
              Skip to refine
            </PixelButton>
          </div>
        </PixelCard>
      </PixelShell>

      {showRecipeModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f1725]/40 px-4 py-6"
          onClick={() => setShowRecipeModal(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border-[3px] border-[#7e3f55] bg-[#fff0f5] p-4 shadow-[6px_6px_0px_#7e3f55] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8f4c66]">Recipe Details</p>
                <h3 className="text-2xl font-bold text-[#4a1f31]">{recipe.name}</h3>
              </div>
              <PixelButton className="px-3 py-2 text-xs" onClick={() => setShowRecipeModal(false)}>
                Close
              </PixelButton>
            </div>

            <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="h-64 w-full rounded-lg border-2 border-[#b46a83] object-cover"
              />
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-[#5a2c3f]">{recipe.description}</p>
                <div className="flex flex-wrap items-center gap-2 border-y-2 border-[#e5b8c7] py-2">
                  {quickFacts.map((fact) => renderFactChip(fact, 'modal-'))}
                </div>
                <div className="rounded-md border-2 border-[#d69aae] bg-[#fff6f9] p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8f4c66]">Common Info</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#5a2c3f]">
                    {recipe.commonInfo.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-md border-2 border-[#d69aae] bg-[#fff6f9] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8f4c66]">Step-by-Step Recipe</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#4f2235]">
                {recipe.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

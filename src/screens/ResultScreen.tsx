import { useState } from 'react'
import { PixelButton, PixelCard, PixelProgress, PixelShell } from '../components/PixelPrimitives'
import type { AdaptedRecipe } from '../lib/recipePlannerApi'

type ResultScreenProps = {
  recipe: AdaptedRecipe | null
  onWhatChanged: () => void
  onRefine: () => void
}

export default function ResultScreen({ recipe, onWhatChanged, onRefine }: ResultScreenProps) {
  const [showRecipeModal, setShowRecipeModal] = useState(false)

  if (!recipe) {
    return (
      <PixelShell title="Your PCOS-adapted result" subtitle="Create an adaptation from Food Input to view the result.">
        <PixelCard>
          <p className="text-sm text-[#6b374b]">No adapted recipe found yet.</p>
        </PixelCard>
      </PixelShell>
    )
  }

  const prepMinutes = recipe.prepTime ?? 0
  const cookMinutes = recipe.cookTime ?? 0
  const calories = recipe.calories ? `${Math.round(recipe.calories)} kcal` : 'n/a'
  const dietType = recipe.tags.find((tag) => /veg|vegan|non.?veg|pesc/i.test(tag)) ?? 'Balanced'
  const serves = '2 people'
  const toShortTime = (minutes: number) => `${Math.max(0, Math.round(minutes))}m`

  const getDietIcon = (dietLabel: string) => {
    const normalized = dietLabel.toLowerCase()
    if (normalized.includes('vegan') || normalized.includes('veg')) {
      return <span className="text-base leading-none text-[#2f8d46]">V</span>
    }
    if (normalized.includes('non')) {
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
    { key: 'prep', text: `Prep Time: ${prepMinutes} min`, value: toShortTime(prepMinutes), icon: 'P' },
    { key: 'cook', text: `Cook Time: ${cookMinutes} min`, value: toShortTime(cookMinutes), icon: 'C' },
    { key: 'calories', text: `Calories: ${calories}`, value: calories.replace(' kcal', ''), icon: 'K' },
    { key: 'diet', text: `Type: ${dietType}`, value: dietType, icon: getDietIcon(dietType) },
    { key: 'serves', text: `Serves: ${serves}`, value: serves.replace(' people', 'p'), icon: 'S' },
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
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md border-2 border-[#c8849c] bg-[#fff2f6] px-2 py-1 text-xs font-bold">
                [{tag.toUpperCase()}]
              </span>
            ))}
          </div>
          <div className="rounded-lg bg-[#fff2f7] p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]">Recommended Recipe</p>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-2xl font-bold leading-tight text-[#4a1f31]">{recipe.name}</h2>
              <PixelButton className="px-3 py-2 text-xs" onClick={() => setShowRecipeModal(true)}>
                View Recipe
              </PixelButton>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">{quickFacts.map((fact) => renderFactChip(fact))}</div>
            <p className="mt-3 text-sm text-[#5a2c3f]">{recipe.description}</p>
          </div>

          <div className="space-y-4">
            <PixelProgress label="[FLAVOR] Flavor Satisfaction" value={recipe.flavorSatisfaction} />
            <PixelProgress label="[SHIELD] PCOS Safety Score" value={recipe.pcosSafety} />
          </div>

          {recipe.nutrientHighlight ? (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7e3f55]">[MICRO] Nutrient Priority</p>
              <div className="rounded-md border-2 border-[#ca8aa2] bg-[#fff3f7] px-3 py-3 text-xs">
                <p className="font-bold text-[#5d2b3a]">{recipe.nutrientHighlight.remark}</p>
                {recipe.nutrientHighlight.value !== null ? (
                  <p className="mt-1 text-[#7e3f55]">
                    {recipe.nutrientHighlight.nutrient}: {recipe.nutrientHighlight.value.toFixed(2)} {recipe.nutrientHighlight.unit}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

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

            <div className={`grid gap-5 ${recipe.imageUrl ? 'md:grid-cols-[1.1fr_1fr]' : ''}`}>
              {recipe.imageUrl ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  className="h-64 w-full rounded-lg border-2 border-[#b46a83] object-cover"
                />
              ) : null}
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-[#5a2c3f]">{recipe.description}</p>
                <div className="flex flex-wrap items-center gap-2 border-y-2 border-[#e5b8c7] py-2">
                  {quickFacts.map((fact) => renderFactChip(fact, 'modal-'))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-md border-2 border-[#d69aae] bg-[#fff6f9] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8f4c66]">Step-by-Step Recipe</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#4f2235]">
                {(recipe.instructions.length ? recipe.instructions : ['No instructions available']).map((step) => (
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

import { PixelButton, PixelCard, PixelProgress, PixelShell } from '../components/PixelPrimitives'
import type { AdaptedRecipe } from '../lib/recipePlannerApi'

type ResultScreenProps = {
  recipe: AdaptedRecipe | null
  onWhatChanged: () => void
  onRefine: () => void
}

export default function ResultScreen({ recipe, onWhatChanged, onRefine }: ResultScreenProps) {
  if (!recipe) {
    return (
      <PixelShell title="Your PCOS-adapted result" subtitle="Create an adaptation from Food Input to view the result.">
        <PixelCard>
          <p className="text-sm text-[#6b374b]">No adapted recipe found yet.</p>
        </PixelCard>
      </PixelShell>
    )
  }

  return (
    <PixelShell title="Your PCOS-adapted result" subtitle="Balanced for cravings, blood sugar, and inflammation.">
      <PixelCard className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md border-2 border-[#c8849c] bg-[#fff2f6] px-2 py-1 text-xs font-bold">
              [{tag.toUpperCase()}]
            </span>
          ))}
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]">Recommended Recipe</p>
          <h2 className="text-xl font-bold">{recipe.name}</h2>
          <p className="mt-2 text-sm text-[#6b374b]">{recipe.description}</p>
          <p className="mt-2 text-xs font-semibold text-[#7e3f55]">
            [INFO] {recipe.totalTime ? `${Math.round(recipe.totalTime)} min total` : 'Time unavailable'} |{' '}
            {recipe.calories ? `${Math.round(recipe.calories)} kcal` : 'Calories unavailable'}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#7e3f55]">
            [MACROS] {recipe.protein ? `${Math.round(recipe.protein)}g protein` : 'Protein n/a'} |{' '}
            {recipe.carbs ? `${Math.round(recipe.carbs)}g carbs` : 'Carbs n/a'}
          </p>
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
  )
}

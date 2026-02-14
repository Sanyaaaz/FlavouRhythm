import { PixelButton, PixelCard, PixelProgress, PixelShell } from '../components/PixelPrimitives'

const recipe = {
  name: 'Millet Veggie Tacos with Yogurt Salsa',
  description:
    'A fiber-forward Mexican-style plate with slow carbs, protein, and anti-inflammatory toppings for stable energy.',
  flavorSatisfaction: 88,
  pcosSafety: 94,
}

type ResultScreenProps = {
  onWhatChanged: () => void
  onRefine: () => void
}

export default function ResultScreen({ onWhatChanged, onRefine }: ResultScreenProps) {
  return (
    <PixelShell title="Your PCOS-adapted result" subtitle="Balanced for cravings, blood sugar, and inflammation.">
      <PixelCard className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border-2 border-[#c8849c] bg-[#fff2f6] px-2 py-1 text-xs font-bold">[PIZZA]</span>
          <span className="rounded-md border-2 border-[#c8849c] bg-[#fff2f6] px-2 py-1 text-xs font-bold">[TACO]</span>
          <span className="rounded-md border-2 border-[#c8849c] bg-[#fff2f6] px-2 py-1 text-xs font-bold">[BOWL]</span>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]">Recommended Recipe</p>
          <h2 className="text-xl font-bold">{recipe.name}</h2>
          <p className="mt-2 text-sm text-[#6b374b]">{recipe.description}</p>
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

import { PixelCard, PixelShell } from '../components/PixelPrimitives'
import type { MicroMealPlanDay } from '../lib/recipePlannerApi'

type CravingAwareMealsScreenProps = {
  mealPlan: MicroMealPlanDay[]
}

export default function CravingAwareMealsScreen({ mealPlan }: CravingAwareMealsScreenProps) {
  return (
    <PixelShell title="Craving-aware micro meal guidance" subtitle="Short horizon meal support for the next 1-2 days.">
      {mealPlan.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {mealPlan.map((plan) => (
            <PixelCard key={plan.day} className="space-y-3 bg-[#ffe8ef]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{plan.day}</h2>
                <span className="rounded-md border-2 border-[#c8849c] bg-[#fff2f6] px-2 py-1 text-xs font-bold">[PLAN]</span>
              </div>
              <ul className="space-y-2 text-sm">
                {plan.meals.map((meal) => (
                  <li key={meal} className="rounded-md border-2 border-[#ca8aa2] bg-[#fff4f7] px-3 py-2">
                    [MEAL] {meal}
                  </li>
                ))}
              </ul>
            </PixelCard>
          ))}
        </div>
      ) : (
        <PixelCard>
          <p className="text-sm text-[#6b374b]">Meal plan unavailable right now. Try again after adapting a recipe.</p>
        </PixelCard>
      )}
    </PixelShell>
  )
}

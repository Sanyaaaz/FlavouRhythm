import { PixelCard, PixelShell } from '../components/PixelPrimitives'

const mealPlan = [
  {
    day: 'Day 1',
    icon: '[BENTO-1]',
    meals: ['[OATS] Savory oats with egg scramble', '[BOWL] Lentil quinoa bowl', '[CUP] Cinnamon chia yogurt cup'],
  },
  {
    day: 'Day 2',
    icon: '[BENTO-2]',
    meals: ['[ROLL] Besan veggie chilla roll', '[PLATE] Herbed tofu pita plate', '[BITES] Dark cacao nut bites'],
  },
]

export default function CravingAwareMealsScreen() {
  return (
    <PixelShell title="Craving-aware micro meal guidance" subtitle="Short horizon meal support for the next 1-2 days.">
      <div className="grid gap-4 sm:grid-cols-2">
        {mealPlan.map((plan) => (
          <PixelCard key={plan.day} className="space-y-3 bg-[#ffe8ef]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{plan.day}</h2>
              <span className="rounded-md border-2 border-[#c8849c] bg-[#fff2f6] px-2 py-1 text-xs font-bold">{plan.icon}</span>
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
    </PixelShell>
  )
}

import { useState } from 'react'
import { PixelButton, PixelCard, PixelShell } from '../components/PixelPrimitives'

const cuisines = [
  { name: 'North Indian', icon: '[THALI]' },
  { name: 'South Indian', icon: '[DOSA]' },
  { name: 'Mexican', icon: '[TACO]' },
  { name: 'Italian', icon: '[PASTA]' },
  { name: 'Mediterranean', icon: '[HUMUS]' },
]

export default function CuisineSelectionScreen() {
  const [selectedCuisine, setSelectedCuisine] = useState('South Indian')

  return (
    <PixelShell title="Choose a cuisine" subtitle="Pick the flavor lane and we will optimize it for hormones and cravings.">
      <PixelCard>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cuisines.map((cuisine) => {
            const active = selectedCuisine === cuisine.name
            return (
              <button
                key={cuisine.name}
                onClick={() => setSelectedCuisine(cuisine.name)}
                className={`rounded-lg border-[3px] p-4 text-left ${
                  active
                    ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                    : 'border-[#c8849c] bg-[#fff1f6] text-[#6b374b]'
                }`}
              >
                <div className="mb-2 text-xs font-bold">{cuisine.icon}</div>
                <div className="text-sm font-semibold">{cuisine.name}</div>
              </button>
            )
          })}
        </div>

        <PixelButton className="mt-5 w-full">Continue</PixelButton>
      </PixelCard>
    </PixelShell>
  )
}

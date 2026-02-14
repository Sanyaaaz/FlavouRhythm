import { PixelButton, PixelCard, PixelShell } from '../components/PixelPrimitives'

const originalItems = ['[WRAP] Refined flour wrap', '[SYRUP] High sugar sauce', '[FRY] Deep-fried filling']
const adaptedItems = ['[MILLET] Millet-chickpea wrap', '[YOGURT] Yogurt herb drizzle', '[SAUTE] Air-seared protein + veggies']
const triggersAddressed = ['Blood sugar spike', 'Inflammatory oils', 'Low fiber fullness gap']

type WhatChangedScreenProps = {
  onContinue: () => void
}

export default function WhatChangedScreen({ onContinue }: WhatChangedScreenProps) {
  return (
    <PixelShell title="What changed" subtitle="See the exact swaps between your original craving and the adapted version.">
      <div className="grid gap-4 sm:grid-cols-2">
        <PixelCard>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em]">[ORIG] Original</p>
          <ul className="space-y-2 text-sm">
            {originalItems.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </PixelCard>

        <PixelCard>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em]">[ADAPT] Adapted</p>
          <ul className="space-y-2 text-sm">
            {adaptedItems.map((item) => (
              <li key={item}>+ {item}</li>
            ))}
          </ul>
        </PixelCard>
      </div>

      <PixelCard className="mt-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em]">Triggers Addressed</p>
        <ul className="mb-4 grid gap-2 text-sm sm:grid-cols-3">
          {triggersAddressed.map((trigger) => (
            <li key={trigger} className="rounded-md border-2 border-[#ca8aa2] bg-[#fff3f7] px-3 py-2">
              {trigger}
            </li>
          ))}
        </ul>

        <div className="rounded-lg border-[3px] border-[#b46a83] bg-[#ffdfe8] p-3 text-sm">
          <p className="font-bold">Why this works for PCOS</p>
          <p className="mt-1 text-[#6b374b]">
            This version increases protein, adds fiber, and reduces high-glycemic elements to support insulin sensitivity.
          </p>
        </div>

        <PixelButton className="mt-4 w-full" onClick={onContinue}>
          Continue to refinement
        </PixelButton>
      </PixelCard>
    </PixelShell>
  )
}

import { PixelButton, PixelCard, PixelShell } from '../components/PixelPrimitives'
import type { RecipeChanges } from '../lib/recipePlannerApi'

type WhatChangedScreenProps = {
  changes: RecipeChanges | null
  onContinue: () => void
}

export default function WhatChangedScreen({ changes, onContinue }: WhatChangedScreenProps) {
  const originalItems = changes?.originalItems ?? []
  const adaptedItems = changes?.adaptedItems ?? []
  const triggersAddressed = changes?.triggersAddressed ?? []

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
          <p className="mt-1 text-[#6b374b]">{changes?.whyItWorks ?? 'Create an adaptation to see swap rationale.'}</p>
        </div>

        <PixelButton className="mt-4 w-full" onClick={onContinue}>
          Continue to refinement
        </PixelButton>
      </PixelCard>
    </PixelShell>
  )
}

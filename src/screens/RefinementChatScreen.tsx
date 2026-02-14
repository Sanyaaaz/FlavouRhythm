import { useState } from 'react'
import { PixelButton, PixelCard, PixelShell } from '../components/PixelPrimitives'

const starterOptions = [
  '[MILK] Swap dairy for lactose-light options',
  '[PROTEIN] Increase protein for dinner',
  '[VEGGIE] Make this fully vegetarian',
]

type RefinementChatScreenProps = {
  onContinue: () => void
}

export default function RefinementChatScreen({ onContinue }: RefinementChatScreenProps) {
  const [message, setMessage] = useState('')
  const [notes, setNotes] = useState<string[]>(['[YOGURT] Can I replace yogurt with tofu curd?'])

  const handleSend = () => {
    if (!message.trim()) {
      return
    }
    setNotes((prev) => [...prev, message.trim()])
    setMessage('')
  }

  return (
    <PixelShell title="Refine your plan" subtitle="Ask follow-up questions about substitutions and timing.">
      <PixelCard className="space-y-4">
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask about substitutions"
            className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#ad7d8d] focus:border-[#8d4560]"
          />
          <PixelButton onClick={handleSend} className="shrink-0 px-4">
            Send
          </PixelButton>
        </div>

        <div className="space-y-2">
          {notes.map((note, index) => (
            <p key={`${note}-${index}`} className="rounded-md border-2 border-[#ca8aa2] bg-[#fff3f7] px-3 py-2 text-sm">
              [CHAT] {note}
            </p>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]">Refinement Options</p>
          <div className="flex flex-wrap gap-2">
            {starterOptions.map((option) => (
              <button
                key={option}
                className="rounded-md border-2 border-[#c8849c] bg-[#ffeef3] px-3 py-2 text-xs font-semibold text-[#7e3f55]"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <PixelButton className="w-full" onClick={onContinue}>
          View 1-2 day micro meals
        </PixelButton>
      </PixelCard>
    </PixelShell>
  )
}

import { useState } from 'react'
import { PixelButton, PixelCard, PixelShell } from '../components/PixelPrimitives'
import type { AdaptedRecipe } from '../lib/recipePlannerApi'

const starterOptions = [
  '[MILK] Swap dairy for lactose-light options',
  '[PROTEIN] Increase protein for dinner',
  '[VEGGIE] Make this fully vegetarian',
]

type RefinementChatScreenProps = {
  recipe: AdaptedRecipe | null
  onContinue: () => void
}

type ChatMessage = {
  role: 'assistant' | 'user'
  text: string
}

export default function RefinementChatScreen({ recipe, onContinue }: RefinementChatScreenProps) {
  const [message, setMessage] = useState('')
  const [notes, setNotes] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Tell me what to change. Example: "make it low carb and dairy free".',
    },
  ])

  const getSuggestionReply = (text: string): string => {
    const lower = text.toLowerCase()
    if (lower.includes('chicken')) {
      return 'For chicken, try tofu, paneer, chickpeas, or soy chunks.'
    }
    if (lower.includes('milk') || lower.includes('dairy') || lower.includes('lactose')) {
      return 'For dairy swaps, use almond milk, soy milk, coconut yogurt, or tofu curd.'
    }
    if (lower.includes('rice')) {
      return 'For rice, try millet, quinoa, brown rice, or cauliflower rice.'
    }
    if (lower.includes('sugar')) {
      return 'For sugar, try stevia, erythritol, or a small amount of date puree.'
    }
    if (lower.includes('vegetarian') || lower.includes('vegan')) {
      return 'Vegetarian options: tofu, paneer, chickpeas, lentils, mushrooms, soy chunks.'
    }
    if (lower.includes('low carb') || lower.includes('carb')) {
      return 'For lower carbs: reduce flour/rice portion, add more protein and non-starchy veggies.'
    }
    if (lower.includes('protein')) {
      return 'To increase protein: add tofu/paneer, greek yogurt, eggs, lentils, or chickpeas.'
    }
    return 'Try specific asks like: "substitute chicken", "make it low carb", or "dairy free swap".'
  }

  const handleSend = () => {
    if (!message.trim()) {
      return
    }
    const userText = message.trim()
    if (!recipe) {
      setNotes((prev) => [
        ...prev,
        { role: 'user', text: userText },
        { role: 'assistant', text: 'Create a recipe first, then refine it.' },
      ])
      setMessage('')
      return
    }

    const reply = getSuggestionReply(userText)
    setNotes((prev) => [...prev, { role: 'user', text: userText }, { role: 'assistant', text: reply }])
    setMessage('')
  }

  return (
    <PixelShell title="Refine your plan" subtitle="Chat naturally to customize your recipe.">
      <PixelCard className="space-y-4">
        {recipe ? (
          <div className="rounded-md border-2 border-[#ca8aa2] bg-[#fff3f7] px-3 py-2 text-sm">
            [CURRENT] {recipe.name} | {recipe.protein ? `${Math.round(recipe.protein)}g protein` : 'protein n/a'} |{' '}
            {recipe.carbs ? `${Math.round(recipe.carbs)}g carbs` : 'carbs n/a'}
          </div>
        ) : null}

        <div className="max-h-[52vh] space-y-3 overflow-y-auto rounded-xl border-2 border-[#c8849c] bg-[#fff7fa] p-3">
          {notes.map((note, index) => (
            <div key={`${note.role}-${index}`} className={`flex ${note.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  note.role === 'user'
                    ? 'rounded-br-sm border-2 border-[#aa4d6f] bg-[#ffb5cb] text-[#3f1725]'
                    : 'rounded-bl-sm border-2 border-[#d2a0b4] bg-white text-[#5a2c3f]'
                }`}
              >
                {note.text}
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]">Quick Prompts</p>
          <div className="flex flex-wrap gap-2">
            {starterOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setMessage(option.replace(/^\[[^\]]+\]\s*/, ''))
                }}
                className="rounded-full border-2 border-[#c8849c] bg-[#ffeef3] px-3 py-1.5 text-xs font-semibold text-[#7e3f55]"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSend()
              }
            }}
            placeholder='Type a refinement (e.g. "make it low carb and dairy free")'
            className="w-full rounded-xl border-[3px] border-[#b46a83] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#ad7d8d] focus:border-[#8d4560]"
          />
          <PixelButton onClick={handleSend} className="shrink-0 px-5">
            Send
          </PixelButton>
        </div>

        <PixelButton className="w-full" onClick={onContinue}>
          View 1-2 day micro meals
        </PixelButton>
      </PixelCard>
    </PixelShell>
  )
}

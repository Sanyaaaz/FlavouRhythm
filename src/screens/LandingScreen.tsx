import { PixelButton, PixelCard, PixelShell } from '../components/PixelPrimitives'

type LandingRoutes = {
  login: string
  signup: string
  onboarding: string
  input: string
  result: string
  changes: string
  refine: string
  meals: string
}

type FlowRouteKey = 'onboarding' | 'input' | 'result' | 'changes' | 'refine' | 'meals'

type LandingScreenProps = {
  onNavigate: (path: string) => void
  routes: LandingRoutes
}

type PixelIconProps = {
  pixels: string[]
  size?: number
  className?: string
}

const palette: Record<string, string> = {
  r: '#ff6b6b',
  y: '#ffd93d',
  o: '#ffb46e',
  g: '#79d38c',
  p: '#ff8fb1',
  d: '#c77b9a',
  b: '#6b5b95',
  w: '#fff1f6',
  k: '#5d2b3a',
  '.': 'transparent',
}

function PixelIcon({ pixels, size = 6, className = '' }: PixelIconProps) {
  const width = pixels[0]?.length ?? 0
  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${width}, ${size}px)`,
        gap: '1px',
        imageRendering: 'pixelated',
      }}
    >
      {pixels.flatMap((row, rowIndex) =>
        row.split('').map((cell, colIndex) => (
          <span
            key={`${rowIndex}-${colIndex}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: palette[cell] ?? 'transparent',
              display: 'block',
            }}
          />
        ))
      )}
    </div>
  )
}

const foodIcons = [
  {
    id: 'pizza',
    pixels: [
      '....yyyy....',
      '...yyyyyy...',
      '..yyyoooyy..',
      '.yyyoogooyy.',
      'yyyooogoooyy',
      'yyyoogoooyy.',
      '.yyyoogooyy.',
      '..yyyyyyyy..',
      '...yyyyyy...',
      '....yyyy....',
    ],
  },
  {
    id: 'burger',
    pixels: [
      '....oooo....',
      '..oooooooo..',
      '.oooyyyyyoo.',
      'yyyyyyyyyyyy',
      'gggggggggggg',
      'yyyyyyyyyyyy',
      '.oooyyyyyoo.',
      '..oooooooo..',
      '....oooo....',
      '............',
    ],
  },
  {
    id: 'donut',
    pixels: [
      '..pppppppp..',
      '.pppppppppp.',
      'ppppwwwwpppp',
      'pppwwwwwwppp',
      'ppwwwwwwwwpp',
      'pppwwwwwwppp',
      'ppppwwwwpppp',
      '.pppppppppp.',
      '..pppppppp..',
      '............',
    ],
  },
  {
    id: 'salad',
    pixels: [
      '....gggg....',
      '..gggggggg..',
      '.ggggrrgggg.',
      'ggggrryrgggg',
      'ggggrryrgggg',
      '.ggggrrgggg.',
      '..gggggggg..',
      '...gggggg...',
      '....gggg....',
      '............',
    ],
  },
  {
    id: 'bento',
    pixels: [
      'bbbbbbbbbbbb',
      'bwwwwwwwwwwb',
      'bwgggwwrrwwb',
      'bwgggwwrrwwb',
      'bwwwwwwwwwwb',
      'bwyyywwppwwb',
      'bwyyywwppwwb',
      'bwwwwwwwwwwb',
      'bbbbbbbbbbbb',
      '............',
    ],
  },
]

const floatingIcons = [
  { id: 'pizza', top: '3%', left: '5%', rotate: '-8deg', opacity: 0.45, size: 8 },
  { id: 'burger', top: '12%', right: '8%', rotate: '8deg', opacity: 0.4, size: 8 },
  { id: 'donut', bottom: '20%', left: '8%', rotate: '12deg', opacity: 0.38, size: 8 },
  { id: 'salad', bottom: '8%', right: '8%', rotate: '-6deg', opacity: 0.4, size: 8 },
  { id: 'bento', top: '50%', left: '40%', rotate: '-2deg', opacity: 0.32, size: 7 },
]

const highlights = [
  {
    title: 'PCOS-friendly swaps',
    description: 'Turn comfort cravings into balanced, hormone-supportive plates.',
  },
  {
    title: 'Regional flavor focus',
    description: 'Start with South Indian classics and keep the comfort you love.',
  },
  {
    title: 'Pantry-first planning',
    description: 'Use what you already have and reduce last-minute stress.',
  },
  {
    title: 'Craving-aware micro meals',
    description: 'Gentle, snack-sized ideas for when energy dips.',
  },
]

const journeySteps: { id: FlowRouteKey; label: string; detail: string }[] = [
  { id: 'onboarding', label: 'Profile setup', detail: 'Tell us your region and focus.' },
  { id: 'input', label: 'Food input', detail: 'Describe a craving or dish.' },
  { id: 'result', label: 'Adapted results', detail: 'See PCOS-friendly ideas.' },
  { id: 'changes', label: 'What changed', detail: 'Understand the swaps.' },
  { id: 'refine', label: 'Refine chat', detail: 'Iterate on flavor and texture.' },
  { id: 'meals', label: 'Micro meals', detail: 'Pick small bites for later.' },
]

export default function LandingScreen({ onNavigate, routes }: LandingScreenProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_60%)]" />
        {floatingIcons.map((icon) => {
          const pixel = foodIcons.find((entry) => entry.id === icon.id)
          if (!pixel) return null
          return (
            <div
              key={icon.id}
              className="absolute hidden sm:block"
              style={{
                top: icon.top,
                left: icon.left,
                right: icon.right,
                bottom: icon.bottom,
                transform: `rotate(${icon.rotate})`,
                opacity: icon.opacity,
              }}
            >
              <PixelIcon pixels={pixel.pixels} size={icon.size} />
            </div>
          )
        })}
      </div>

      <PixelShell
        title="FlavourRhythm"
        subtitle="A playful, PCOS-friendly meal coach that keeps your cravings and comfort food in rhythm."
      >
        <div className="relative space-y-6">
          <div className="grid gap-6">
            <PixelCard className="flex min-h-[420px] flex-col justify-between gap-5 bg-[#fff1f6]/95">
              <p className="text-xs uppercase tracking-[0.35em] text-[#7e3f55]">[Welcome]</p>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#5d2b3a] sm:text-3xl">
                  Turn cravings into confident, PCOS-friendly meals.
                </h2>
                <p className="text-sm text-[#6b374b] sm:text-base">
                  FlavourRhythm helps you capture what you want to eat, understand the swaps that support hormone health,
                  and build a gentle, flexible plan that still tastes like home.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <PixelButton className="px-6 py-3 text-sm" onClick={() => onNavigate(routes.login)}>
                    Login
                  </PixelButton>
                  <button
                    className="rounded-lg border-[3px] border-[#7e3f55] bg-[#ffeef3] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#7e3f55] shadow-[4px_4px_0px_#7e3f55]"
                    onClick={() => onNavigate(routes.signup)}
                  >
                    Sign up
                  </button>
                  <button
                    className="rounded-lg border-[3px] border-[#c8849c] bg-[#fff7fa] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#7e3f55]"
                    onClick={() => onNavigate(routes.onboarding)}
                  >
                    Preview the flow
                  </button>
                </div>
                <p className="text-xs text-[#7e3f55]">
                  Note: FlavourRhythm provides nutrition guidance and is not a substitute for medical advice.
                </p>
              </div>
            </PixelCard>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <PixelCard key={highlight.title} className="space-y-2 bg-[#ffeef5]/95">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7e3f55]">[Feature]</p>
                <h3 className="text-base font-bold">{highlight.title}</h3>
                <p className="text-sm text-[#6b374b]">{highlight.description}</p>
              </PixelCard>
            ))}
          </div>

          <PixelCard className="space-y-3 bg-[#fff1f6]/95">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#7e3f55]">[Flow Map]</p>
              <button
                className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]"
                onClick={() => onNavigate(routes.login)}
              >
                Jump to login
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {journeySteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => onNavigate(routes[step.id])}
                  className="rounded-lg border-2 border-[#c8849c] bg-[#fff7fa] p-3 text-left text-sm font-semibold text-[#6b374b] transition hover:-translate-y-0.5 hover:border-[#7e3f55]"
                >
                  <span className="block text-xs uppercase tracking-[0.2em] text-[#a35d75]">[{step.id.toUpperCase()}]</span>
                  <span className="mt-1 block text-base font-bold text-[#5d2b3a]">{step.label}</span>
                  <span className="mt-1 block text-xs text-[#7e3f55]">{step.detail}</span>
                </button>
              ))}
            </div>
          </PixelCard>
        </div>
      </PixelShell>
    </div>
  )
}

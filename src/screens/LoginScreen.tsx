import { useEffect, useState } from 'react'
import { PixelButton, PixelCard, PixelShell } from '../components/PixelPrimitives'
import { login, signup } from '../lib/authApi'

type LoginScreenProps = {
  onAuthenticated: (payload: { email: string; token: string }) => void
  initialMode?: AuthMode
}

type AuthMode = 'login' | 'signup'

export default function LoginScreen({ onAuthenticated, initialMode = 'login' }: LoginScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit =
    email.trim() &&
    password.trim() &&
    (mode === 'login' || fullName.trim()) &&
    !isSubmitting

  useEffect(() => {
    setMode(initialMode)
    setError('')
  }, [initialMode])

  return (
    <PixelShell
      title="Welcome to FlavourRhythm"
      subtitle="Sign up or login to continue your PCOS-friendly food journey."
    >
      <PixelCard className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setMode('login')
              setError('')
            }}
            className={`rounded-md border-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
              mode === 'login'
                ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                : 'border-[#c8849c] bg-[#ffeef3] text-[#7e3f55]'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setMode('signup')
              setError('')
            }}
            className={`rounded-md border-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
              mode === 'signup'
                ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                : 'border-[#c8849c] bg-[#ffeef3] text-[#7e3f55]'
            }`}
          >
            Signup
          </button>
        </div>

        {mode === 'signup' ? (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7e3f55]">[SIGNUP] Full Name</p>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#ad7d8d] focus:border-[#8d4560]"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7e3f55]">[{mode.toUpperCase()}] Email</p>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#ad7d8d] focus:border-[#8d4560]"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7e3f55]">[{mode.toUpperCase()}] Password</p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#ad7d8d] focus:border-[#8d4560]"
          />
        </div>

        {error ? <p className="text-sm font-semibold text-[#8c1d40]">{error}</p> : null}

        <PixelButton
          className={`w-full py-4 text-base ${canSubmit ? '' : 'cursor-not-allowed opacity-60'}`}
          onClick={async () => {
            if (!canSubmit) return
            setError('')
            setIsSubmitting(true)

            try {
              const normalizedEmail = email.trim().toLowerCase()
              const response =
                mode === 'signup'
                  ? await signup({
                      email: normalizedEmail,
                      password: password.trim(),
                      full_name: fullName.trim(),
                    })
                  : await login({
                      email: normalizedEmail,
                      password: password.trim(),
                    })

              onAuthenticated({ email: response.user.email, token: response.access_token })
            } catch (caughtError) {
              setError(caughtError instanceof Error ? caughtError.message : 'Something went wrong. Try again.')
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          {isSubmitting ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Start Planning'}
        </PixelButton>
      </PixelCard>
    </PixelShell>
  )
}

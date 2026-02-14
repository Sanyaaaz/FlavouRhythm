import type { ReactNode } from 'react'

type PixelShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

// Shared page wrapper for the FlavourRhythm pink pixel theme.
export function PixelShell({ title, subtitle, children }: PixelShellProps) {
  return (
    <div>
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold tracking-wide sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mb-6 text-sm sm:text-base">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  )
}

type PixelCardProps = {
  children: ReactNode
  className?: string
}

export function PixelCard({ children, className = '' }: PixelCardProps) {
  return (
    <div
      className={`rounded-xl border-[3px] border-[#a95f77] bg-[#ffe4ec] p-4 shadow-[5px_5px_0px_#a95f77] ${className}`}
    >
      {children}
    </div>
  )
}

type PixelButtonProps = {
  children: ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

export function PixelButton({ children, onClick, className = '', type = 'button' }: PixelButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-lg border-[3px] border-[#7e3f55] bg-[#ff8fb1] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#3f1725] shadow-[4px_4px_0px_#7e3f55] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#7e3f55] ${className}`}
    >
      {children}
    </button>
  )
}

type PixelProgressProps = {
  label: string
  value: number
}

export function PixelProgress({ label, value }: PixelProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-4 overflow-hidden rounded-md border-2 border-[#b46a83] bg-[#ffd3df]">
        <div className="h-full bg-[#ff9fbc]" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

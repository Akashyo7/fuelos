'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ScoredMeal } from '@/lib/scoring'
import BottomNav from '../_components/BottomNav'

function ProteinRing({ consumed, target }: { consumed: number; target: number }) {
  const pct  = Math.min(1, consumed / target)
  const circ = 2 * Math.PI * 52
  const offset = circ * (1 - pct)

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r="52" fill="none" stroke="#2F2518" strokeWidth="10" />
        <circle
          cx="56" cy="56" r="52" fill="none" stroke="#F5820D" strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 56 56)"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-ink tabular-nums leading-none">
          {Math.round(pct * 100)}%
        </span>
        <span className="text-xs text-muted">done</span>
      </div>
    </div>
  )
}

const SIGNAL_STYLES: Record<string, string> = {
  'Strong Match': 'bg-green/15 text-green',
  'Good Match':   'bg-accent/15 text-accent',
  'Partial Match':'bg-s2 text-muted',
}

export default function Home() {
  const router = useRouter()
  const [meals,    setMeals]    = useState<ScoredMeal[]>([])
  const [consumed, setConsumed] = useState(0)
  const [target,   setTarget]   = useState(150)
  const [greeting, setGreeting] = useState('Good evening')

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')

    fetch('/api/daily-logs/open', { method: 'POST' })

    fetch('/api/recommendations')
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.replace('/onboarding'); return }
        setMeals(data.recommendations ?? [])
        setConsumed(data.protein_consumed ?? 0)
        setTarget(data.protein_target ?? 150)
      })
  }, [router])

  const remaining = Math.max(0, target - consumed)
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex flex-col flex-1 bg-ground overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-2 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">{greeting}.</h1>
          <p className="text-sm text-muted">{today}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-s2 border-2 border-accent flex items-center justify-center text-base font-bold text-accent">A</div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* Ring card */}
        <div className="bg-surface rounded-2xl p-4 flex items-center gap-5 border border-border mt-4 mb-5">
          <ProteinRing consumed={consumed} target={target} />
          <div className="flex flex-col gap-2">
            <div>
              <div className="text-xl font-extrabold text-ink tabular-nums leading-none">
                {consumed}<span className="text-sm text-muted font-medium">g</span>
              </div>
              <div className="text-xs text-muted uppercase tracking-wider">Eaten</div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-ink tabular-nums leading-none">
                {target}<span className="text-sm text-muted font-medium">g</span>
              </div>
              <div className="text-xs text-muted uppercase tracking-wider">Target</div>
            </div>
            <div className="inline-flex items-center gap-1 bg-accent/12 text-accent rounded-full px-3 py-1 text-xs font-bold mt-1">
              {remaining > 0 ? `↑ ${remaining}g to go` : '✓ Goal hit!'}
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-ink">What to order tonight</h2>
          <span className="text-xs text-muted">3 picks</span>
        </div>

        <div className="flex flex-col gap-3">
          {meals.map((meal, i) => (
            <button
              key={meal.id}
              onClick={() => router.push(`/meal/${meal.id}`)}
              className="w-full bg-surface rounded-2xl p-4 flex items-center gap-3 border border-border text-left active:bg-s2"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${
                i === 0 ? 'bg-accent/15 text-accent' : 'bg-s2 text-muted'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-ink text-sm truncate">{meal.name}</div>
                <div className="text-xs text-muted mb-1.5">{meal.restaurant}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-ink"><strong>{meal.protein_g}g</strong> <span className="text-muted font-normal">protein</span></span>
                  <span className="text-s2 text-xs">·</span>
                  <span className="text-xs text-muted">{meal.calories} kcal</span>
                  <span className="text-s2 text-xs">·</span>
                  <span className="text-xs text-muted">₹{meal.price_inr}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${SIGNAL_STYLES[meal.signal]}`}>
                  {meal.signal}
                </span>
                <span className="text-muted text-lg">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

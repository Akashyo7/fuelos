'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FOOD_DB } from '@/lib/food-data'
import { getRecommendations, toSignal, scoreMeal, type FoodItem, type ScoredMeal } from '@/lib/scoring'
import { getState, getTodayLog } from '@/lib/store'

const SIGNAL_STYLES: Record<string, string> = {
  'Strong Match': 'bg-green/15 text-green',
  'Good Match':   'bg-accent/15 text-accent',
  'Partial Match':'bg-s2 text-muted',
}

function buildSwiggyLink(query: string) {
  return `https://www.swiggy.com/search?query=${encodeURIComponent(query)}`
}

export default function MealDetail() {
  const router  = useRouter()
  const params  = useParams()
  const id      = params.id as string

  const [meal,    setMeal]    = useState<FoodItem | null>(null)
  const [alts,    setAlts]    = useState<ScoredMeal[]>([])
  const [ordered, setOrdered] = useState(false)
  const [newTotal, setNewTotal] = useState(0)
  const [target,  setTarget]  = useState(150)

  useEffect(() => {
    const found = FOOD_DB.find(m => m.id === id)
    if (!found) { router.push('/home'); return }
    setMeal(found)

    const state = getState()
    const log   = getTodayLog()
    setTarget(state.proteinTarget)
    const rem = Math.max(0, state.proteinTarget - log.proteinConsumed)

    const recs = getRecommendations(FOOD_DB, rem, state.dietType)
    setAlts(recs.filter(m => m.id !== id).slice(0, 2))
  }, [id, router])

  async function handleOrder() {
    if (!meal) return
    const res = await fetch('/api/meal-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food_item_id: meal.id }),
    })
    const data = await res.json()
    setNewTotal(data.new_total_protein ?? meal.protein_g)
    setOrdered(true)
  }

  if (!meal) return null

  const state = getState()
  const log   = getTodayLog()
  const rem   = Math.max(0, state.proteinTarget - log.proteinConsumed)
  const score = scoreMeal(meal, rem)
  const signal = toSignal(score)
  const confDots = Math.round(meal.confidence * 5)

  if (ordered) {
    const pct = Math.min(100, Math.round(newTotal / target * 100))
    return (
      <div className="flex flex-col flex-1 bg-ground items-center justify-center px-6 py-12 text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-green/15 flex items-center justify-center text-4xl">✓</div>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">Logged.</h1>
        <p className="text-muted">Adding this to your day.</p>

        <div className="flex gap-3 w-full my-2">
          <div className="flex-1 bg-surface rounded-2xl p-4 text-center border border-border">
            <div className="text-2xl font-extrabold text-accent tabular-nums">+{meal.protein_g}g</div>
            <div className="text-xs text-muted mt-1">Protein added</div>
          </div>
          <div className="flex-1 bg-surface rounded-2xl p-4 text-center border border-border">
            <div className="text-2xl font-extrabold text-green tabular-nums">{newTotal}g</div>
            <div className="text-xs text-muted mt-1">New total</div>
          </div>
        </div>

        <div className="w-full bg-surface rounded-2xl p-4 border border-border">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Today&apos;s protein</span>
            <strong className="text-ink tabular-nums">{newTotal} / {target}g</strong>
          </div>
          <div className="h-2 bg-s2 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-green to-green/70 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <p className="text-sm text-muted leading-relaxed">
          {pct >= 90
            ? 'Nearly there — great day for protein!'
            : `${target - newTotal}g remaining. Add a protein-rich snack to close the gap.`}
        </p>

        <button onClick={() => router.push('/home')} className="w-full py-4 bg-accent text-white font-bold rounded-2xl text-base mt-2">
          Back to home
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-ground overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-14 pb-2">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-ink text-lg flex-shrink-0">
            ←
          </button>
          <span className="text-sm text-muted">{meal.restaurant}</span>
        </div>

        <h1 className="text-2xl font-extrabold text-ink tracking-tight px-6 pt-3 pb-1 leading-tight">{meal.name}</h1>

        {/* Macro grid */}
        <div className="grid grid-cols-3 gap-3 px-6 py-3">
          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-3 text-center">
            <div className="text-2xl font-extrabold text-accent tabular-nums leading-none">{meal.protein_g}</div>
            <div className="text-xs text-muted">g protein</div>
          </div>
          <div className="bg-surface rounded-2xl p-3 text-center border border-border">
            <div className="text-2xl font-extrabold text-ink tabular-nums leading-none">{meal.calories}</div>
            <div className="text-xs text-muted">kcal</div>
          </div>
          <div className="bg-surface rounded-2xl p-3 text-center border border-border">
            <div className="text-2xl font-extrabold text-ink tabular-nums leading-none">₹{meal.price_inr}</div>
            <div className="text-xs text-muted">price</div>
          </div>
        </div>

        {/* Confidence + signal */}
        <div className="flex items-center gap-3 px-6 py-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${SIGNAL_STYLES[signal]}`}>{signal}</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < confDots ? 'bg-green' : 'bg-s2'}`} />
            ))}
          </div>
          <span className="text-xs text-muted ml-auto">Portions vary ±20%</span>
        </div>

        {/* Why this */}
        <div className="mx-6 mt-3 bg-surface rounded-2xl p-4 border border-border">
          <p className="text-xs font-bold tracking-widest uppercase text-accent mb-3">Why this meal?</p>
          <div className="flex flex-col gap-2">
            {meal.why.map((w, i) => (
              <div key={i} className="flex gap-2.5 text-sm text-ink">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alternatives */}
        {alts.length > 0 && (
          <>
            <p className="text-xs font-bold tracking-widest uppercase text-muted px-6 mt-5 mb-2">Alternatives</p>
            <div className="flex flex-col gap-2 px-6 mb-6">
              {alts.map(alt => (
                <button
                  key={alt.id}
                  onClick={() => router.push(`/meal/${alt.id}`)}
                  className="flex items-center justify-between bg-s2 rounded-2xl px-4 py-3 border border-border text-left"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink">{alt.name}</div>
                    <div className="text-xs text-muted">{alt.protein_g}g protein · ₹{alt.price_inr}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${SIGNAL_STYLES[alt.signal]}`}>{alt.signal}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 pt-3 flex flex-col gap-3 flex-shrink-0">
        <a
          href={buildSwiggyLink(meal.swiggy_query)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOrder}
          className="block w-full py-4 bg-accent text-white font-bold rounded-2xl text-base text-center"
        >
          Order on Swiggy →
        </a>
        <button
          onClick={handleOrder}
          className="w-full py-3 bg-surface text-muted font-semibold rounded-2xl text-sm border border-border"
        >
          I already ordered it — log protein
        </button>
      </div>
    </div>
  )
}

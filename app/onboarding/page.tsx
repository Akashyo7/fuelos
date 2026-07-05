'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Goal, ActivityLevel, DietType } from '@/lib/store'
import { suggestProteinTarget } from '@/lib/protein-calc'

type Step = 'goal' | 'setup' | 'plan'

const GOALS: { key: Goal; emoji: string; name: string; desc: string }[] = [
  { key: 'muscle_gain', emoji: '💪', name: 'Muscle gain', desc: 'Build strength, add size' },
  { key: 'fat_loss',    emoji: '🔥', name: 'Fat loss',    desc: 'Lean out, preserve muscle' },
  { key: 'maintain',   emoji: '⚡', name: 'Maintain',    desc: 'Hit macros, stay on track' },
]

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep]           = useState<Step>('goal')
  const [goal, setGoal]           = useState<Goal>('muscle_gain')
  const [dietType, setDietType]   = useState<DietType>('non_veg')
  const [proteinTarget, setPT]    = useState(150)
  const [weightKg, setWeight]     = useState('')
  const [heightCm, setHeight]     = useState('')
  const [activityLevel, setAct]   = useState<ActivityLevel>('medium')
  const [age, setAge]             = useState('')

  function handleGoalNext() {
    const wt = parseFloat(weightKg) || 75
    const suggested = suggestProteinTarget(wt, goal, activityLevel)
    setPT(suggested)
    setStep('setup')
  }

  function handleSetupNext() {
    const wt = parseFloat(weightKg) || 75
    const suggested = suggestProteinTarget(wt, goal, activityLevel)
    setPT(suggested)
    setStep('plan')
  }

  async function handleStart() {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal,
        protein_target:  proteinTarget,
        diet_type:       dietType,
        weight_kg:       parseFloat(weightKg) || undefined,
        height_cm:       parseFloat(heightCm) || undefined,
        activity_level:  activityLevel,
        age:             parseInt(age) || undefined,
      }),
    })
    router.push('/home')
  }

  const GOAL_LABELS: Record<Goal, string> = {
    muscle_gain: 'muscle gain',
    fat_loss:    'fat loss',
    maintain:    'maintenance',
  }

  return (
    <div className="flex flex-col flex-1 bg-ground">

      {/* GOAL STEP */}
      {step === 'goal' && (
        <div className="flex flex-col flex-1">
          <div className="px-6 pt-12 pb-4">
            <div className="flex gap-1.5 mb-8">
              <div className="h-1.5 w-8 rounded-full bg-accent" />
              <div className="h-1.5 w-2 rounded-full bg-s2" />
              <div className="h-1.5 w-2 rounded-full bg-s2" />
            </div>
            <p className="text-xs font-bold tracking-widest uppercase text-accent mb-2">FuelOS</p>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight mb-1">What&apos;s your goal?</h1>
            <p className="text-sm text-muted">We&apos;ll set your daily protein target.</p>
          </div>

          <div className="flex flex-col gap-3 px-6 flex-1">
            {GOALS.map(g => (
              <button
                key={g.key}
                onClick={() => setGoal(g.key)}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                  goal === g.key
                    ? 'border-accent bg-accent/8'
                    : 'border-transparent bg-surface'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  goal === g.key ? 'bg-accent/15' : 'bg-s2'
                }`}>
                  {g.emoji}
                </div>
                <div>
                  <div className="font-bold text-ink text-base">{g.name}</div>
                  <div className="text-sm text-muted">{g.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="px-6 pb-10 pt-4">
            <button onClick={handleGoalNext} className="w-full py-4 bg-accent text-white font-bold rounded-2xl text-base">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* SETUP STEP */}
      {step === 'setup' && (
        <div className="flex flex-col flex-1">
          <div className="px-6 pt-12 pb-4">
            <div className="flex gap-1.5 mb-8">
              <div className="h-1.5 w-2 rounded-full bg-s2" />
              <div className="h-1.5 w-8 rounded-full bg-accent" />
              <div className="h-1.5 w-2 rounded-full bg-s2" />
            </div>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight mb-1">Your protein target</h1>
            <p className="text-sm text-muted">Adjust or use our suggestion.</p>
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto px-6 gap-6">
            {/* Protein slider */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-accent mb-3">Daily protein goal</p>
              <div className="text-center py-4">
                <span className="text-6xl font-extrabold text-ink tracking-tighter tabular-nums">{proteinTarget}</span>
                <span className="text-2xl text-muted font-medium ml-1">g</span>
              </div>
              <input
                type="range" min={80} max={220} value={proteinTarget}
                onChange={e => setPT(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-muted mt-1.5">
                <span>80g</span><span>150g</span><span>220g</span>
              </div>
            </div>

            {/* Diet toggle */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-accent mb-3">Diet</p>
              <div className="flex bg-surface rounded-xl p-1 gap-1">
                {(['non_veg', 'veg'] as DietType[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDietType(d)}
                    className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      dietType === d ? 'bg-accent text-white' : 'text-muted'
                    }`}
                  >
                    {d === 'non_veg' ? 'Non-veg' : 'Vegetarian'}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-accent mb-3">Quick stats (optional)</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Weight (kg)</p>
                  <input type="number" placeholder="75" value={weightKg}
                    onChange={e => { setWeight(e.target.value); if (e.target.value) setPT(suggestProteinTarget(parseFloat(e.target.value), goal, activityLevel)) }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Height (cm)</p>
                  <input type="number" placeholder="175" value={heightCm}
                    onChange={e => setHeight(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Workouts/week</p>
                  <select value={activityLevel} onChange={e => { const v = e.target.value as ActivityLevel; setAct(v); if (weightKg) setPT(suggestProteinTarget(parseFloat(weightKg), goal, v)) }}>
                    <option value="low">1–2×</option>
                    <option value="medium">3–4×</option>
                    <option value="high">5–6×</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Age</p>
                  <input type="number" placeholder="28" value={age}
                    onChange={e => setAge(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-10 pt-4 flex flex-col gap-3">
            <button onClick={handleSetupNext} className="w-full py-4 bg-accent text-white font-bold rounded-2xl text-base">
              Calculate my plan →
            </button>
            <button onClick={() => setStep('goal')} className="w-full py-4 bg-surface text-ink font-semibold rounded-2xl text-base border border-border">
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* PLAN STEP */}
      {step === 'plan' && (
        <div className="flex flex-col flex-1 items-center justify-center px-6 py-12 text-center gap-4">
          <div className="flex gap-1.5 mb-2">
            <div className="h-1.5 w-2 rounded-full bg-s2" />
            <div className="h-1.5 w-2 rounded-full bg-s2" />
            <div className="h-1.5 w-8 rounded-full bg-accent" />
          </div>
          <div className="text-5xl mb-2">🎯</div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Your plan is ready.</h1>

          <div className="w-full bg-surface rounded-2xl p-6 border border-border mt-2">
            <div className="text-6xl font-extrabold text-accent tracking-tighter tabular-nums leading-none">{proteinTarget}</div>
            <div className="text-base text-muted mt-1">grams of protein per day</div>
            <div className="h-px bg-accent/15 my-4" />
            <p className="text-sm text-muted text-left leading-relaxed">
              Based on your goal of <strong className="text-ink">{GOAL_LABELS[goal]}</strong> · Every time you open the app we surface meals that fill your gap.
            </p>
          </div>

          <p className="text-sm text-muted leading-relaxed">Macros are estimates — restaurant portions vary. We learn as you order.</p>

          <div className="w-full mt-4">
            <button onClick={handleStart} className="w-full py-4 bg-accent text-white font-bold rounded-2xl text-base">
              Show me what to eat →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

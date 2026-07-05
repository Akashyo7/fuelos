'use client'
import { useEffect, useState } from 'react'
import BottomNav from '../_components/BottomNav'

type DayLog = { date: string; proteinConsumed: number }

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Progress() {
  const [logs,      setLogs]      = useState<DayLog[]>([])
  const [target,    setTarget]    = useState(150)
  const [weekScore, setWeekScore] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/users/me').then(r => r.json()),
      fetch('/api/daily-logs/week').then(r => r.json()),
    ]).then(([profile, days]) => {
      const t = profile.protein_target ?? 150
      setTarget(t)
      const mapped: DayLog[] = days.map((d: { log_date: string; protein_consumed: number }) => ({
        date: d.log_date,
        proteinConsumed: d.protein_consumed,
      }))
      setLogs(mapped)
      const active = mapped.filter(l => l.proteinConsumed > 0)
      if (active.length > 0) {
        const avg = active.reduce((s, l) => s + Math.min(1, l.proteinConsumed / t), 0) / active.length
        setWeekScore(Math.round(avg * 100))
      }
    })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const activeDays  = logs.filter(l => l.proteinConsumed > 0).length
  const goalHitDays = logs.filter(l => l.proteinConsumed >= target * 0.9).length
  const totalProtein = logs.reduce((s, l) => s + l.proteinConsumed, 0)

  return (
    <div className="flex flex-col flex-1 bg-ground overflow-hidden">
      <div className="px-6 pt-14 pb-2 flex-shrink-0">
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">This week</h1>
        <p className="text-sm text-muted">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* Week score */}
        <div className="bg-surface rounded-2xl p-5 flex items-center gap-5 border border-border mt-4">
          <div>
            <div className="text-5xl font-extrabold text-accent tabular-nums leading-none">{weekScore}</div>
            <div className="text-xs text-muted uppercase tracking-wider mt-1">/ 100</div>
          </div>
          <div>
            <div className="font-bold text-ink text-base">
              {weekScore >= 80 ? 'Protein on track' : weekScore >= 50 ? 'Getting there' : 'Room to improve'}
            </div>
            <div className="text-sm text-muted mt-1 leading-relaxed">
              {activeDays > 0
                ? `Hit your target ${goalHitDays} of ${activeDays} active day${activeDays !== 1 ? 's' : ''}.`
                : 'Start logging meals to see your progress here.'}
            </div>
          </div>
        </div>

        {/* Day bars */}
        <div className="mt-5">
          <p className="text-xs font-bold tracking-widest uppercase text-muted mb-3">Protein % of target</p>
          <div className="flex justify-between gap-2">
            {logs.map((log, i) => {
              const d       = new Date(log.date + 'T00:00:00')
              const pct     = Math.min(1, log.proteinConsumed > 0 ? log.proteinConsumed / target : 0)
              const isToday = log.date === today
              const isFuture = log.date > today
              const met     = !isFuture && pct >= 0.9

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full h-20 bg-surface rounded-lg overflow-hidden flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isFuture ? 'bg-s2' : met ? 'bg-green' : isToday ? 'bg-accent' : 'bg-accent/50'
                      }`}
                      style={{ height: isFuture ? '0%' : `${Math.max(4, pct * 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${isToday ? 'text-accent' : 'text-muted'}`}>
                    {DAY_NAMES[d.getDay()]}
                  </span>
                  <span className="text-xs font-bold text-ink tabular-nums">
                    {isFuture ? '—' : log.proteinConsumed > 0 ? `${Math.round(pct * 100)}%` : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Insight */}
        {activeDays > 0 && (
          <div className="mt-5 bg-surface rounded-2xl p-4 border-l-4 border-accent">
            <p className="text-xs font-bold tracking-widest uppercase text-accent mb-2">Insight</p>
            <p className="text-sm text-ink leading-relaxed">
              {goalHitDays === activeDays
                ? 'Perfect week so far — you\'ve hit your protein target every active day.'
                : `You hit your target ${goalHitDays} of ${activeDays} days. Check what you ordered on the days you missed.`}
            </p>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mt-5 mb-4">
          <div className="bg-surface rounded-2xl p-4 border border-border">
            <div className="text-3xl font-extrabold text-accent tabular-nums">{activeDays}</div>
            <div className="text-xs text-muted mt-1">Days tracked</div>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-border">
            <div className="text-3xl font-extrabold text-green tabular-nums">{goalHitDays}</div>
            <div className="text-xs text-muted mt-1">Goals hit</div>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-border">
            <div className="text-2xl font-extrabold text-ink tabular-nums">
              {activeDays > 0 ? Math.round(totalProtein / activeDays) : 0}g
            </div>
            <div className="text-xs text-muted mt-1">Avg protein/day</div>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-border">
            <div className="text-2xl font-extrabold text-ink tabular-nums">{target}g</div>
            <div className="text-xs text-muted mt-1">Your target</div>
          </div>
        </div>
      </div>

      <BottomNav active="progress" />
    </div>
  )
}

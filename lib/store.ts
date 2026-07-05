'use client'

export type Goal          = 'muscle_gain' | 'fat_loss' | 'maintain'
export type ActivityLevel = 'low' | 'medium' | 'high'
export type DietType      = 'veg' | 'non_veg'

export interface AppState {
  onboarded:     boolean
  goal:          Goal
  proteinTarget: number
  dietType:      DietType
  weightKg?:     number
  heightCm?:     number
  activityLevel?: ActivityLevel
  age?:          number
}

export interface MealLogEntry {
  foodItemId: string
  protein:    number
  calories:   number
  loggedAt:   string
}

export interface DayLog {
  date:             string
  proteinConsumed:  number
  caloriesConsumed: number
  mealsLogged:      MealLogEntry[]
}

const STATE_KEY = 'fuelos_state'
const DAY_KEY   = 'fuelos_day_'

const DEFAULTS: AppState = {
  onboarded:     false,
  goal:          'muscle_gain',
  proteinTarget: 150,
  dietType:      'non_veg',
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function getState(): AppState {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(STATE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch { return DEFAULTS }
}

export function setState(updates: Partial<AppState>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STATE_KEY, JSON.stringify({ ...getState(), ...updates }))
}

export function getTodayLog(): DayLog {
  const empty: DayLog = { date: today(), proteinConsumed: 0, caloriesConsumed: 0, mealsLogged: [] }
  if (typeof window === 'undefined') return empty
  try {
    const raw = localStorage.getItem(DAY_KEY + today())
    return raw ? JSON.parse(raw) : empty
  } catch { return empty }
}

export function logMeal(entry: MealLogEntry): DayLog {
  const log = getTodayLog()
  const updated: DayLog = {
    ...log,
    proteinConsumed:  log.proteinConsumed + entry.protein,
    caloriesConsumed: log.caloriesConsumed + entry.calories,
    mealsLogged:      [...log.mealsLogged, entry],
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(DAY_KEY + today(), JSON.stringify(updated))
  }
  return updated
}

// Returns last 7 days of logs for the progress screen
export function getWeekLogs(): DayLog[] {
  const logs: DayLog[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(DAY_KEY + dateStr) : null
      logs.push(raw ? JSON.parse(raw) : { date: dateStr, proteinConsumed: 0, caloriesConsumed: 0, mealsLogged: [] })
    } catch {
      logs.push({ date: dateStr, proteinConsumed: 0, caloriesConsumed: 0, mealsLogged: [] })
    }
  }
  return logs
}

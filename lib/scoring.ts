export type Signal = 'Strong Match' | 'Good Match' | 'Partial Match'

export interface FoodItem {
  id:          string
  name:        string
  restaurant:  string
  protein_g:   number
  calories:    number
  price_inr:   number
  diet_type:   'veg' | 'non_veg'
  swiggy_query: string
  tags:        string[]
  confidence:  number
  why:         string[]
}

export interface ScoredMeal extends FoodItem {
  score:  number
  signal: Signal
}

export function scoreMeal(meal: FoodItem, proteinRemaining: number): number {
  if (proteinRemaining <= 0) return 0
  const fill = meal.protein_g / proteinRemaining
  const proteinScore = fill <= 1 ? fill : Math.max(0, 2 - fill)
  const priceScore = Math.max(0, 1 - (meal.price_inr - 250) / 400)
  return 0.75 * proteinScore + 0.25 * priceScore
}

export function toSignal(score: number): Signal {
  if (score >= 0.60) return 'Strong Match'
  if (score >= 0.35) return 'Good Match'
  return 'Partial Match'
}

export function getRecommendations(
  meals: FoodItem[],
  proteinRemaining: number,
  dietType: 'veg' | 'non_veg',
  limit = 3
): ScoredMeal[] {
  return meals
    .filter(m => dietType === 'veg' ? m.diet_type === 'veg' : true)
    .map(m => {
      const score = scoreMeal(m, proteinRemaining)
      return { ...m, score, signal: toSignal(score) }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

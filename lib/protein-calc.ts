type Goal          = 'muscle_gain' | 'fat_loss' | 'maintain'
type ActivityLevel = 'low' | 'medium' | 'high'

const ACTIVITY: Record<ActivityLevel, number> = { low: 1.4, medium: 1.7, high: 2.0 }
const GOAL_ADJ: Record<Goal, number>           = { muscle_gain: 1.1, fat_loss: 0.9, maintain: 1.0 }

export function suggestProteinTarget(
  weightKg:      number,
  goal:          Goal,
  activityLevel: ActivityLevel
): number {
  return Math.round(weightKg * ACTIVITY[activityLevel] * GOAL_ADJ[goal])
}

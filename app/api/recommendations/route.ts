import { createServerSupabase } from '@/lib/supabase-server'
import { getRecommendations } from '@/lib/scoring'
import { NextResponse } from 'next/server'

function today() { return new Date().toISOString().split('T')[0] }

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: profile }, { data: foodItems }, { data: log }] = await Promise.all([
    supabase.from('users').select('protein_target, diet_type').eq('id', user.id).single(),
    supabase.from('food_items').select('*').eq('active', true),
    supabase.from('daily_logs').select('protein_consumed').eq('user_id', user.id).eq('log_date', today()).maybeSingle(),
  ])

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const consumed = log?.protein_consumed ?? 0
  const remaining = Math.max(0, profile.protein_target - consumed)
  const recs = getRecommendations(foodItems ?? [], remaining, profile.diet_type)

  return NextResponse.json({
    protein_consumed:  consumed,
    protein_target:    profile.protein_target,
    protein_remaining: remaining,
    recommendations:   recs,
  })
}

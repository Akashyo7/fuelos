import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

function today() { return new Date().toISOString().split('T')[0] }

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { food_item_id } = await request.json()

  // Resolve macros server-side — never trust client-provided values
  const { data: item, error: itemErr } = await supabase
    .from('food_items').select('protein_g, calories').eq('id', food_item_id).single()
  if (itemErr || !item) return NextResponse.json({ error: 'Food item not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('users').select('protein_target').eq('id', user.id).single()

  // Insert meal log
  await supabase.from('meal_logs').insert({
    user_id: user.id, food_item_id,
    log_date: today(), protein_g: item.protein_g, calories: item.calories,
  })

  // Upsert daily log — increment consumed totals
  const { data: existing } = await supabase
    .from('daily_logs').select('protein_consumed, calories_consumed, meals_logged')
    .eq('user_id', user.id).eq('log_date', today()).maybeSingle()

  const newProtein  = (existing?.protein_consumed  ?? 0) + item.protein_g
  const newCalories = (existing?.calories_consumed ?? 0) + item.calories
  const newMeals    = (existing?.meals_logged      ?? 0) + 1

  await supabase.from('daily_logs').upsert({
    user_id: user.id, log_date: today(),
    protein_consumed: newProtein, calories_consumed: newCalories, meals_logged: newMeals,
    opened_app: true,
  })

  return NextResponse.json({
    protein_g:         item.protein_g,
    new_total_protein: newProtein,
    goal_hit:          profile ? newProtein >= profile.protein_target * 0.9 : false,
  }, { status: 201 })
}

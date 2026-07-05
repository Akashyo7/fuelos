import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { goal, protein_target, diet_type, weight_kg, height_cm, activity_level, age } = body

  const { data, error } = await supabase
    .from('users')
    .upsert({ id: user.id, goal, protein_target, diet_type, weight_kg, height_cm, activity_level, age })
    .select('id, goal, protein_target, diet_type')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

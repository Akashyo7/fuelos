import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

function today() { return new Date().toISOString().split('T')[0] }

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: log } = await supabase
    .from('daily_logs')
    .select('protein_consumed, calories_consumed, meals_logged')
    .eq('user_id', user.id)
    .eq('log_date', today())
    .maybeSingle()

  return NextResponse.json({
    log_date:          today(),
    protein_consumed:  log?.protein_consumed  ?? 0,
    calories_consumed: log?.calories_consumed ?? 0,
    meals_logged:      log?.meals_logged      ?? 0,
  })
}

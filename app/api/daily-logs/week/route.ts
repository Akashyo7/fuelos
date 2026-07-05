import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 6)
  const from = weekAgo.toISOString().split('T')[0]

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('log_date, protein_consumed, calories_consumed, meals_logged')
    .eq('user_id', user.id)
    .gte('log_date', from)
    .order('log_date', { ascending: true })

  // Fill in missing days with zeros so the chart always shows 7 bars
  const filled = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const match = logs?.find(l => l.log_date === dateStr)
    filled.push(match ?? { log_date: dateStr, protein_consumed: 0, calories_consumed: 0, meals_logged: 0 })
  }

  return NextResponse.json(filled)
}

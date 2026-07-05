import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

function today() { return new Date().toISOString().split('T')[0] }

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nudge_required = false } = await request.json().catch(() => ({}))

  await supabase.from('daily_logs').upsert(
    { user_id: user.id, log_date: today(), opened_app: true, nudge_required },
    { onConflict: 'user_id,log_date', ignoreDuplicates: true }
  )

  // Count unprompted opens this week for the Day-14 metric
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { count } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('opened_app', true)
    .eq('nudge_required', false)
    .gte('log_date', weekAgo.toISOString().split('T')[0])

  return NextResponse.json({ unprompted_opens_this_week: count ?? 0 })
}

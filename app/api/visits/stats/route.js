// app/api/visits/stats/route.js — Statistiques visites
import { NextResponse } from 'next/server'
import { supabase }     from '../../../../lib/supabase'

export async function GET() {
  try {
    // Visites aujourd'hui
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todayCount } = await supabase
      .from('visit_details')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', today.toISOString())

    // Visites cette semaine
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { count: weekCount } = await supabase
      .from('visit_details')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', weekAgo.toISOString())

    // Visites par page
    const { data: byPage } = await supabase
      .from('visit_details')
      .select('page')
      .gte('visited_at', weekAgo.toISOString())

    const pages = byPage?.reduce((acc, v) => {
      acc[v.page] = (acc[v.page] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      today:  todayCount || 0,
      week:   weekCount  || 0,
      byPage: pages,
    })
  } catch(e) {
    return NextResponse.json({ today:0, week:0, byPage:{} })
  }
}

import { NextResponse } from 'next/server';
import { ensureDb, sql } from '@/lib/db';
export async function GET(){
  await ensureDb();
  const rows=await sql`SELECT to_char(date,'YYYY-MM-DD') as date FROM blocked_dates ORDER BY date`;
  const booked=await sql`SELECT to_char(visit_date,'YYYY-MM-DD') as date FROM bookings GROUP BY visit_date`;
  return NextResponse.json({blocked:rows.map(r=>r.date),booked:booked.map(r=>r.date)});
}

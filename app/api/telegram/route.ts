import { NextResponse } from 'next/server';
import { ensureDb, sql } from '@/lib/db';
import { adminIds, tg } from '@/lib/telegram';
export async function POST(req:Request){
  const update=await req.json();
  const msg=update.message;
  if(!msg?.text) return NextResponse.json({ok:true});
  const userId=String(msg.from?.id||'');
  if(!adminIds().includes(userId)) { await tg('sendMessage',{chat_id:msg.chat.id,text:'Нет доступа к командам управления.'}); return NextResponse.json({ok:true}); }
  await ensureDb();
  const text=msg.text.trim();
  const m=text.match(/^\/(занять|освободить)\s+(\d{4}-\d{2}-\d{2})$/i);
  if(!m){await tg('sendMessage',{chat_id:msg.chat.id,text:'Команды:\n/занять 2026-10-01\n/освободить 2026-10-01'});return NextResponse.json({ok:true});}
  const action=m[1].toLowerCase(), date=m[2];
  if(action==='занять'){await sql`INSERT INTO blocked_dates(date) VALUES(${date}) ON CONFLICT DO NOTHING`;await tg('sendMessage',{chat_id:msg.chat.id,text:`🔴 ${date} отмечен как занятый.`});}
  else {await sql`DELETE FROM blocked_dates WHERE date=${date}`;await tg('sendMessage',{chat_id:msg.chat.id,text:`🔵 ${date} снова свободен.`});}
  return NextResponse.json({ok:true});
}

import { NextResponse } from 'next/server';
import { ensureDb, sql } from '@/lib/db';
import { notify } from '@/lib/telegram';
export async function POST(req:Request){
  try{
    const b=await req.json();
    if(!b.name||!b.phone||!b.carMake||!b.plate||!b.date||!b.time||!Array.isArray(b.services)||!b.services.length) return NextResponse.json({error:'Заполните обязательные поля.'},{status:400});
    await ensureDb();
    const busy=await sql`SELECT 1 FROM blocked_dates WHERE date=${b.date} UNION ALL SELECT 1 FROM bookings WHERE visit_date=${b.date} LIMIT 1`;
    if(busy.length) return NextResponse.json({error:'Эта дата уже занята. Выберите другой день.'},{status:409});
    await sql`INSERT INTO bookings (name,phone,car_make,plate,visit_date,visit_time,services,extra) VALUES (${b.name},${b.phone},${b.carMake},${b.plate},${b.date},${b.time},${JSON.stringify(b.services)},${b.extra||''})`;
    const services=b.services.map((s:any)=>`• ${s.name} — ${s.price}`).join('\n');
    const text=`🚘 <b>Новая заявка — химчистка, Каспийск</b>\n\n<b>Клиент:</b> ${esc(b.name)}\n<b>Телефон:</b> ${esc(b.phone)}\n<b>Авто:</b> ${esc(b.carMake)}\n<b>Номер:</b> ${esc(b.plate)}\n<b>Дата:</b> ${esc(b.date)}\n<b>Время:</b> ${esc(b.time)}\n\n<b>Услуги:</b>\n${services}\n\n<b>Дополнительно:</b> ${esc(b.extra||'—')}\n\n⚠️ Цена может измениться после осмотра в зависимости от состояния автомобиля.`;
    await notify(text);
    return NextResponse.json({ok:true});
  }catch(e){console.error(e);return NextResponse.json({error:'Не удалось отправить заявку. Проверьте настройки сервера.'},{status:500})}
}
function esc(s:string){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

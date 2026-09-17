export async function tg(method:string, body:Record<string,unknown>={}){
  const token=process.env.TELEGRAM_BOT_TOKEN;
  if(!token) throw new Error('TELEGRAM_BOT_TOKEN is missing');
  const r=await fetch(`https://api.telegram.org/bot${token}/${method}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
export async function notify(text:string){
  const chat=process.env.TELEGRAM_CHAT_ID;
  if(!chat) throw new Error('TELEGRAM_CHAT_ID is missing');
  return tg('sendMessage',{chat_id:chat,text,parse_mode:'HTML'});
}
export function adminIds(){return (process.env.TELEGRAM_ADMIN_IDS||'').split(',').map(x=>x.trim()).filter(Boolean)}

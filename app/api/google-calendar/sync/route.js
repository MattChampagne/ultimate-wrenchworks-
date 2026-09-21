import { NextResponse } from 'next/server';
const SB='https://vxptgfnuxboprwhgcxpd.supabase.co';
async function sync(){
 try{
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('Missing server credential');
  const h={apikey:key,authorization:'Bearer '+key};
  const ir=await fetch(SB+'/rest/v1/calendar_integrations?provider=eq.google&enabled=eq.true&select=*',{headers:h});const a=await ir.json();const x=a?.[0];if(!x)throw new Error('Google calendar not connected');
  const b=new URLSearchParams({client_id:process.env.GOOGLE_CALENDAR_CLIENT_ID||'',client_secret:process.env.GOOGLE_CALENDAR_CLIENT_SECRET||'',refresh_token:x.refresh_token,grant_type:'refresh_token'});
  const tr=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:b});const t=await tr.json();if(!tr.ok)throw new Error('Token refresh failed');
  const now=new Date(), max=new Date(now.getTime()+90*86400000);
  const fr=await fetch('https://www.googleapis.com/calendar/v3/freeBusy',{method:'POST',headers:{authorization:'Bearer '+t.access_token,'content-type':'application/json'},body:JSON.stringify({timeMin:now.toISOString(),timeMax:max.toISOString(),items:[{id:x.calendar_id}]})});const f=await fr.json();if(!fr.ok)throw new Error('Free/busy failed');
  await fetch(SB+'/rest/v1/calendar_busy_blocks?source=eq.google',{method:'DELETE',headers:h});
  const busy=f.calendars?.[x.calendar_id]?.busy||[]; if(busy.length)await fetch(SB+'/rest/v1/calendar_busy_blocks',{method:'POST',headers:{...h,'content-type':'application/json'},body:JSON.stringify(busy.map((z,i)=>({source:'google',external_id:'google-'+z.start+'-'+z.end,calendar_id:x.calendar_id,starts_at:z.start,ends_at:z.end})))});
  return NextResponse.json({ok:true,busy_blocks:busy.length});
 }catch(e){return NextResponse.json({error:e.message},{status:500});}
}
export async function POST(){return sync();}
export async function GET(){return sync();}

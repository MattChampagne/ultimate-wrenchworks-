import { NextResponse } from 'next/server';
const SB='https://vxptgfnuxboprwhgcxpd.supabase.co';

function unfold(s){return s.replace(/\r?\n[ \t]/g,'');}
function icsDate(v){
 if(/^\d{8}$/.test(v)) return new Date(v.slice(0,4)+'-'+v.slice(4,6)+'-'+v.slice(6,8)+'T00:00:00-05:00');
 const m=v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
 if(!m)return null;
 return new Date(m[1]+'-'+m[2]+'-'+m[3]+'T'+m[4]+':'+m[5]+':'+m[6]+(m[7]?'Z':'-05:00'));
}
function parseIcs(text,now,max){
 const out=[]; const src=unfold(text);
 for(const block of src.split('BEGIN:VEVENT').slice(1)){
  const body=block.split('END:VEVENT')[0];
  if(/\nSTATUS:CANCELLED/i.test(body)||/\nTRANSP:TRANSPARENT/i.test(body))continue;
  const sm=body.match(/\nDTSTART(?:;[^:]*)?:(\d{8}(?:T\d{6}Z?)?)/i);
  const em=body.match(/\nDTEND(?:;[^:]*)?:(\d{8}(?:T\d{6}Z?)?)/i);
  if(!sm)continue; const s=icsDate(sm[1]); let e=em?icsDate(em[1]):null;
  if(!s)continue; if(!e)e=new Date(s.getTime()+86400000);
  if(e>now&&s<max)out.push({start:s.toISOString(),end:e.toISOString()});
 }
 return out;
}
async function sync(){
 try{
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('Missing server credential');
  const h={apikey:key,authorization:'Bearer '+key};
  const now=new Date(),max=new Date(now.getTime()+90*86400000); let all=[];

  const icloud=process.env.ICLOUD_787_HOMESTEAD_ICS_URL;
  if(!icloud)throw new Error('Missing iCloud calendar URL');
  const iu=icloud.replace(/^webcal:/i,'https:');
  const rr=await fetch(iu,{cache:'no-store'}); if(!rr.ok)throw new Error('iCloud calendar fetch failed');
  const ib=parseIcs(await rr.text(),now,max);
  all=ib.map(z=>({...z,source:'icloud',calendar_id:'787 Homestead'}));

  const ir=await fetch(SB+'/rest/v1/calendar_integrations?provider=eq.google&enabled=eq.true&select=*',{headers:h});const a=await ir.json();const x=a?.[0];
  if(x){
   const b=new URLSearchParams({client_id:process.env.GOOGLE_CALENDAR_CLIENT_ID||'',client_secret:process.env.GOOGLE_CALENDAR_CLIENT_SECRET||'',refresh_token:x.refresh_token,grant_type:'refresh_token'});
   const tr=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:b});const t=await tr.json();
   if(tr.ok){
    const fr=await fetch('https://www.googleapis.com/calendar/v3/freeBusy',{method:'POST',headers:{authorization:'Bearer '+t.access_token,'content-type':'application/json'},body:JSON.stringify({timeMin:now.toISOString(),timeMax:max.toISOString(),items:[{id:x.calendar_id}]})});const f=await fr.json();
    if(fr.ok)all.push(...(f.calendars?.[x.calendar_id]?.busy||[]).map(z=>({...z,source:'google',calendar_id:x.calendar_id})));
   }
  }
  await fetch(SB+'/rest/v1/calendar_busy_blocks?source=in.(google,icloud)',{method:'DELETE',headers:h});
  if(all.length){
   const rows=all.map((z,i)=>({source:z.source,external_id:z.source+'-'+i+'-'+z.start+'-'+z.end,calendar_id:z.calendar_id,starts_at:z.start,ends_at:z.end}));
   const ins=await fetch(SB+'/rest/v1/calendar_busy_blocks',{method:'POST',headers:{...h,'content-type':'application/json'},body:JSON.stringify(rows)});
   if(!ins.ok)throw new Error('Busy block save failed');
  }
  return NextResponse.json({ok:true,busy_blocks:all.length,icloud_busy_blocks:ib.length});
 }catch(e){return NextResponse.json({error:e.message},{status:500});}
}
export async function POST(){return sync();}
export async function GET(){return sync();}

const SB='https://vxptgfnuxboprwhgcxpd.supabase.co';
const WINDOWS=[['Morning 9-12',9,12],['Afternoon 12-4',12,16],['Evening 6-8',18,20]];
function centralUtc(date,hour){
 const probe=new Date(date+'T12:00:00Z');
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',timeZoneName:'shortOffset'}).formatToParts(probe);
 const z=parts.find(p=>p.type==='timeZoneName')?.value||'GMT-5';
 const m=z.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/); const off=(m?(m[1]==='-'?-1:1)*(+m[2]*60+(+m[3]||0)):-300);
 return new Date(Date.UTC(+date.slice(0,4),+date.slice(5,7)-1,+date.slice(8,10),hour,0)-off*60000);
}
export async function GET(req){
 try{
  const date=new URL(req.url).searchParams.get('date');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return Response.json({error:'Invalid date'},{status:400});
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)return Response.json({error:'Availability unavailable'},{status:500});
  const start=centralUtc(date,0),end=centralUtc(date,24);
  const h={apikey:key,authorization:'Bearer '+key};
  const [br,dr]=await Promise.all([
   fetch(SB+'/rest/v1/calendar_busy_blocks?starts_at=lt.'+encodeURIComponent(end.toISOString())+'&ends_at=gt.'+encodeURIComponent(start.toISOString())+'&select=starts_at,ends_at',{headers:h,cache:'no-store'}),
   fetch(SB+'/rest/v1/owner_unavailable_dates?date=eq.'+date+'&select=date',{headers:h,cache:'no-store'})
  ]);
  if(!br.ok||!dr.ok)return Response.json({error:'Availability unavailable'},{status:502});
  const blocks=await br.json(),blocked=(await dr.json()).length>0;
  const unavailable=blocked?WINDOWS.map(w=>w[0]):WINDOWS.filter(w=>{const s=centralUtc(date,w[1]),e=centralUtc(date,w[2]);return blocks.some(b=>new Date(b.starts_at)<e&&new Date(b.ends_at)>s)}).map(w=>w[0]);
  return Response.json({unavailable});
 }catch(e){console.error(e);return Response.json({error:'Availability unavailable'},{status:500});}
}
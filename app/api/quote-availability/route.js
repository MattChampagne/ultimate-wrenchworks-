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
  const url=new URL(req.url),date=url.searchParams.get('date'),mode=url.searchParams.get('mode');
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)return Response.json({error:'Availability unavailable'},{status:500});
  const h={apikey:key,authorization:'Bearer '+key};
  if(mode==='dates'){
   const days=Math.min(Math.max(Number(url.searchParams.get('days')||60),1),120);
   const first=new Date();first.setHours(12,0,0,0);first.setDate(first.getDate()+1);
   const dates=[];for(let i=0;i<days;i++){const d=new Date(first);d.setDate(first.getDate()+i);dates.push(d.toLocaleDateString('en-CA'));}
   const rangeStart=centralUtc(dates[0],0),rangeEnd=centralUtc(dates[dates.length-1],24);
   const [br,dr]=await Promise.all([
    fetch(SB+'/rest/v1/calendar_busy_blocks?starts_at=lt.'+encodeURIComponent(rangeEnd.toISOString())+'&ends_at=gt.'+encodeURIComponent(rangeStart.toISOString())+'&select=starts_at,ends_at',{headers:h,cache:'no-store'}),
    fetch(SB+'/rest/v1/owner_unavailable_dates?unavailable_date=gte.'+dates[0]+'&unavailable_date=lte.'+dates[dates.length-1]+'&select=unavailable_date',{headers:h,cache:'no-store'})
   ]);
   if(!br.ok||!dr.ok)return Response.json({error:'Availability unavailable'},{status:502});
   const blocks=await br.json(),blockedDates=new Set((await dr.json()).map(x=>x.unavailable_date));
   const unavailableDates=dates.filter(d=>blockedDates.has(d)||WINDOWS.every(w=>{const s=centralUtc(d,w[1]),e=centralUtc(d,w[2]);return blocks.some(b=>new Date(b.starts_at)<e&&new Date(b.ends_at)>s)}));
   return Response.json({dates,unavailableDates,availableDates:dates.filter(d=>!unavailableDates.includes(d))});
  }
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return Response.json({error:'Invalid date'},{status:400});
  const start=centralUtc(date,0),end=centralUtc(date,24);
  const [br,dr]=await Promise.all([
   fetch(SB+'/rest/v1/calendar_busy_blocks?starts_at=lt.'+encodeURIComponent(end.toISOString())+'&ends_at=gt.'+encodeURIComponent(start.toISOString())+'&select=starts_at,ends_at',{headers:h,cache:'no-store'}),
   fetch(SB+'/rest/v1/owner_unavailable_dates?unavailable_date=eq.'+date+'&select=unavailable_date',{headers:h,cache:'no-store'})
  ]);
  if(!br.ok||!dr.ok)return Response.json({error:'Availability unavailable'},{status:502});
  const blocks=await br.json(),blocked=(await dr.json()).length>0;
  const unavailable=blocked?WINDOWS.map(w=>w[0]):WINDOWS.filter(w=>{const s=centralUtc(date,w[1]),e=centralUtc(date,w[2]);return blocks.some(b=>new Date(b.starts_at)<e&&new Date(b.ends_at)>s)}).map(w=>w[0]);
  return Response.json({unavailable});
 }catch(e){console.error(e);return Response.json({error:'Availability unavailable'},{status:500});}
}
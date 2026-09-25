const SB='https://vxptgfnuxboprwhgcxpd.supabase.co';
const WINDOWS=[['Morning 9-12',9,12],['Afternoon 12-4',12,16],['Evening 6-8',18,20]];
const DAV='https://caldav.icloud.com';
function icloudAuth(){const u=String(process.env.ICLOUD_CALDAV_USERNAME||'').trim();const p=String(process.env.ICLOUD_CALDAV_APP_PASSWORD||'').trim().replace(/[\s-]+/g,'');if(!u||!p)throw Error('Missing iCloud calendar credentials');return 'Basic '+Buffer.from(u+':'+p).toString('base64');}
async function dav(url,method,body,headers={}){let current=url;for(let i=0;i<5;i++){const r=await fetch(current,{method,headers:{Authorization:icloudAuth(),...headers},body,redirect:'manual',cache:'no-store'});if(![301,302,303,307,308].includes(r.status))return r;const loc=r.headers.get('location');if(!loc)return r;current=new URL(loc,current).href;}throw Error('Too many CalDAV redirects');}
function href(xml,tag){return xml.match(new RegExp('<(?:[\\w.-]+:)?'+tag+'[^>]*>\\s*<(?:[\\w.-]+:)?href[^>]*>([^<]+)</','i'))?.[1]?.replace(/&amp;/g,'&');}
async function ultimateCalendarUrl(){let base=DAV+'/';let r=await dav(base,'PROPFIND','<d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>',{Depth:'0','Content-Type':'application/xml; charset=utf-8'});if(!r.ok)throw Error('principal '+r.status);let xml=await r.text();const principal=href(xml,'current-user-principal');if(!principal)throw Error('principal parse');const principalUrl=new URL(principal,r.url||base).href;r=await dav(principalUrl,'PROPFIND','<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><c:calendar-home-set/></d:prop></d:propfind>',{Depth:'0','Content-Type':'application/xml; charset=utf-8'});if(!r.ok)throw Error('home '+r.status);xml=await r.text();const home=href(xml,'calendar-home-set');if(!home)throw Error('home parse');const homeUrl=new URL(home,r.url||principalUrl).href;r=await dav(homeUrl,'PROPFIND','<d:propfind xmlns:d="DAV:"><d:prop><d:displayname/><d:resourcetype/></d:prop></d:propfind>',{Depth:'1','Content-Type':'application/xml; charset=utf-8'});if(!r.ok)throw Error('calendar list '+r.status);xml=await r.text();for(const part of xml.split(/<(?:[\\w.-]+:)?response[^>]*>/i).slice(1)){const name=(part.match(/<(?:[\\w.-]+:)?displayname[^>]*>([^<]*)</i)?.[1]||'').replace(/&amp;/g,'&').trim();const h=part.match(/<(?:[\\w.-]+:)?href[^>]*>([^<]+)</i)?.[1];if(name.toLowerCase()==='ultimate wrenchworks'&&h)return new URL(h.replace(/&amp;/g,'&'),r.url||homeUrl).href;}throw Error('Ultimate Wrenchworks calendar not found');}
async function ultimateCalendarBusy(start,end){const calendar=await ultimateCalendarUrl();const fmt=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const body='<?xml version="1.0" encoding="UTF-8"?><c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:getetag/><c:calendar-data/></d:prop><c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT"><c:time-range start="'+fmt(start)+'" end="'+fmt(end)+'"/></c:comp-filter></c:comp-filter></c:filter></c:calendar-query>';const r=await dav(calendar,'REPORT',body,{Depth:'1','Content-Type':'application/xml; charset=utf-8'});if(!r.ok)throw Error('calendar conflict check '+r.status);const xml=await r.text();return xml.split(/BEGIN:VEVENT/i).slice(1).some(chunk=>{const event=(chunk.split(/END:VEVENT/i)[0]||'');return !/STATUS:CANCELLED/i.test(event)&&!/TRANSP:TRANSPARENT/i.test(event);});}
function unfoldIcs(s){return s.replace(/\r?\n[ \t]/g,'');}
function parseIcsDate(v){if(/^\d{8}$/.test(v)){const d=v.slice(0,4)+'-'+v.slice(4,6)+'-'+v.slice(6,8);return centralUtc(d,0);}const m=v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);if(!m)return null;if(m[7])return new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]));const d=m[1]+'-'+m[2]+'-'+m[3];const base=centralUtc(d,+m[4]);return new Date(base.getTime()+(+m[5])*60000+(+m[6])*1000);}
async function homesteadCalendarBusy(start,end){const raw=process.env.ICLOUD_787_HOMESTEAD_ICS_URL;if(!raw)throw Error('Missing Homestead iCloud URL');const r=await fetch(raw.replace(/^webcal:/i,'https:'),{cache:'no-store'});if(!r.ok)throw Error('Homestead iCloud fetch '+r.status);const src=unfoldIcs(await r.text());for(const block of src.split('BEGIN:VEVENT').slice(1)){const body=block.split('END:VEVENT')[0]||'';if(/STATUS:CANCELLED/i.test(body)||/TRANSP:TRANSPARENT/i.test(body))continue;const sm=body.match(/(?:^|\n)DTSTART(?:;[^:]*)?:(\d{8}(?:T\d{6}Z?)?)/i);const em=body.match(/(?:^|\n)DTEND(?:;[^:]*)?:(\d{8}(?:T\d{6}Z?)?)/i);if(!sm)continue;const s=parseIcsDate(sm[1]);let e=em?parseIcsDate(em[1]):null;if(!s)continue;if(!e)e=new Date(s.getTime()+86400000);if(s<end&&e>start)return true;}return false;}

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
  const [br,dr,jr]=await Promise.all([
   fetch(SB+'/rest/v1/calendar_busy_blocks?starts_at=lt.'+encodeURIComponent(end.toISOString())+'&ends_at=gt.'+encodeURIComponent(start.toISOString())+'&select=starts_at,ends_at',{headers:h,cache:'no-store'}),
   fetch(SB+'/rest/v1/owner_unavailable_dates?unavailable_date=eq.'+date+'&select=unavailable_date',{headers:h,cache:'no-store'}),
   fetch(SB+'/rest/v1/public_jobs_v1?scheduled_date=eq.'+date+'&select=arrival_window,status',{headers:h,cache:'no-store'})
  ]);
  if(!br.ok||!dr.ok||!jr.ok)return Response.json({error:'Availability unavailable'},{status:502});
  const blocks=await br.json(),blocked=(await dr.json()).length>0,jobs=await jr.json();
  if(blocked)return Response.json({unavailable:WINDOWS.map(w=>w[0])});
  const unavailable=[];
  for(const w of WINDOWS){
    const s=centralUtc(date,w[1]),e=centralUtc(date,w[2]);
    let busy=jobs.some(j=>j.status!=='cancelled'&&j.arrival_window===w[0])||blocks.some(b=>new Date(b.starts_at)<e&&new Date(b.ends_at)>s);
    if(!busy){try{busy=await ultimateCalendarBusy(s,e);}catch(error){console.error('Ultimate Wrenchworks live availability check failed',error?.message||error);busy=true;}}
    if(!busy){try{busy=await homesteadCalendarBusy(s,e);}catch(error){console.error('Homestead live availability check failed',error?.message||error);busy=true;}}
    if(busy)unavailable.push(w[0]);
  }
  return Response.json({unavailable});
 }catch(e){console.error(e);return Response.json({error:'Availability unavailable'},{status:500});}
}
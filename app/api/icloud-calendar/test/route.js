const DAV='https://caldav.icloud.com';
function creds(){const u=String(process.env.ICLOUD_CALDAV_USERNAME||'').trim();const raw=String(process.env.ICLOUD_CALDAV_APP_PASSWORD||'').trim();const p=raw.replace(/[\\s-]+/g,'');if(!u||!p)throw new Error('Missing iCloud CalDAV credentials');return {u,p};}
function auth(){const {u,p}=creds();return 'Basic '+Buffer.from(u+':'+p).toString('base64');}
async function dav(url,body,depth='0'){
 let current=url;
 for(let i=0;i<5;i++){
  const r=await fetch(current,{method:'PROPFIND',headers:{Authorization:auth(),Depth:depth,'Content-Type':'application/xml; charset=utf-8'},body,redirect:'manual',cache:'no-store'});
  if(![301,302,303,307,308].includes(r.status))return r;
  const loc=r.headers.get('location');if(!loc)return r;
  current=new URL(loc,current).href;
 }
 throw new Error('Too many CalDAV redirects');
}
const principalBody='<?xml version="1.0" encoding="UTF-8"?><d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>';
const homeBody='<?xml version="1.0" encoding="UTF-8"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><c:calendar-home-set/></d:prop></d:propfind>';
const listBody='<?xml version="1.0" encoding="UTF-8"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:displayname/><d:resourcetype/></d:prop></d:propfind>';
function href(xml,tag){const re=new RegExp('<(?:[\\w.-]+:)?'+tag+'[^>]*>\\s*<(?:[\\w.-]+:)?href[^>]*>([^<]+)</','i');return xml.match(re)?.[1]?.replace(/&amp;/g,'&');}
function decode(s){return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"');}
function absolute(href,base){return new URL(href,base).href;}
export async function GET(req){try{
 const bearer=req.headers.get('authorization')||'';if(!bearer.startsWith('Bearer '))return Response.json({error:'Unauthorized'},{status:401});
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)return Response.json({error:'Server configuration error'},{status:500});
 const ar=await fetch('https://vxptgfnuxboprwhgcxpd.supabase.co/auth/v1/user',{headers:{apikey:key,Authorization:bearer},cache:'no-store'});if(!ar.ok)return Response.json({error:'Unauthorized'},{status:401});
 let base=DAV+'/';let r=await dav(base,principalBody);if(!r.ok)return Response.json({error:'iCloud connection failed',stage:'principal',status:r.status},{status:502});let x=await r.text();const principal=href(x,'current-user-principal');if(!principal)return Response.json({error:'iCloud principal not found',stage:'principal-parse'},{status:502});
 const principalUrl=absolute(principal,r.url||base);
 r=await dav(principalUrl,homeBody);if(!r.ok)return Response.json({error:'iCloud connection failed',stage:'home',status:r.status},{status:502});x=await r.text();const home=href(x,'calendar-home-set');if(!home)return Response.json({error:'iCloud calendar home not found',stage:'home-parse'},{status:502});
 const homeUrl=absolute(home,r.url||principalUrl);
 r=await dav(homeUrl,listBody,'1');if(!r.ok)return Response.json({error:'iCloud connection failed',stage:'calendars',status:r.status},{status:502});x=await r.text();
 const responses=x.split(/<(?:[\\w.-]+:)?response[^>]*>/i).slice(1);const names=responses.map(z=>decode(z.match(/<(?:[\\w.-]+:)?displayname[^>]*>([^<]*)</i)?.[1]||'')).filter(Boolean);const found=names.some(n=>n.trim().toLowerCase()==='ultimate wrenchworks');
 return Response.json({ok:true,connected:true,targetCalendarFound:found,calendarCount:names.length});
}catch(e){console.error('CalDAV test failed:',e?.message||'unknown');return Response.json({error:'iCloud calendar connection test failed.'},{status:500});}}